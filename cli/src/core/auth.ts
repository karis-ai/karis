import http from 'node:http';
import crypto from 'node:crypto';
import chalk from 'chalk';
import ora from 'ora';
import { setConfigValue, loadResolvedConfig } from '../utils/config.js';
import { isTextOutput } from './cli-context.js';
import { KarisClient } from './client.js';

const LOGIN_TIMEOUT_MS = 5 * 60 * 1000;
const STAGING_APP_URL = 'https://sophia-ide-staging.jingyueyusen.workers.dev';

function deriveAppUrl(apiUrl: string): string {
  if (apiUrl.includes('api-staging')) return STAGING_APP_URL;
  if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
    const port = new URL(apiUrl).port || '8000';
    return `http://localhost:${port === '8000' ? '3000' : port}`;
  }
  return 'https://app.karis.im';
}

export function resultPage(success: boolean, errorMessage?: string): string {
  const title = success ? 'Logged in to Karis' : 'Login failed';
  const body = success
    ? '<p style="color:#22c55e;font-size:1.2em;">&#10003; You can close this tab and return to the terminal.</p>'
    : `<p style="color:#ef4444;font-size:1.2em;">&#10007; ${errorMessage || 'Unknown error'}</p>`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#09090b;color:#fafafa;}
.card{text-align:center;padding:3rem;border-radius:1rem;background:#18181b;max-width:400px;}</style>
</head><body><div class="card"><h2>${title}</h2>${body}</div></body></html>`;
}

/**
 * Start a localhost HTTP server, open the browser to the CLI auth page,
 * and wait for the callback with the API key.
 */
export async function browserLogin(apiUrl: string): Promise<string> {
  const state = crypto.randomBytes(16).toString('hex');
  const appUrl = deriveAppUrl(apiUrl);

  return new Promise<string>((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url!, `http://localhost`);

      if (url.pathname !== '/callback') {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const key = url.searchParams.get('key');
      const returnedState = url.searchParams.get('state');
      const error = url.searchParams.get('error');

      if (error) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(resultPage(false, error));
        server.close();
        reject(new Error(`Authorization failed: ${error}`));
        return;
      }

      if (returnedState !== state) {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(resultPage(false, 'State mismatch — possible CSRF attack.'));
        server.close();
        reject(new Error('State mismatch'));
        return;
      }

      if (!key) {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(resultPage(false, 'No API key received.'));
        server.close();
        reject(new Error('No API key in callback'));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(resultPage(true));
      server.close();
      resolve(key);
    });

    server.listen(0, '127.0.0.1', async () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      const authUrl = `${appUrl}/cli/auth?port=${port}&state=${state}`;

      try {
        const openModule = await import('open');
        await openModule.default(authUrl);
      } catch {
        if (isTextOutput()) {
          console.log(chalk.yellow(`\n  Could not open browser. Please visit:`));
          console.log(chalk.cyan(`  ${authUrl}\n`));
        }
      }
    });

    const timeout = setTimeout(() => {
      server.close();
      reject(new Error('Login timed out. Please try again.'));
    }, LOGIN_TIMEOUT_MS);

    server.on('close', () => clearTimeout(timeout));
  });
}

/**
 * Run the full browser login flow: open browser, wait for key, save it.
 * Returns the key name on success, throws on failure.
 */
export async function performLogin(apiUrl: string): Promise<string> {
  const apiKey = await browserLogin(apiUrl);
  await setConfigValue('api-key', apiKey);

  let name = '';
  try {
    const client = new KarisClient({ apiKey, apiUrl });
    const info = await client.verifyKey();
    name = info.name || '';
  } catch {
    // non-critical
  }

  return name;
}

/**
 * Auto-login flow triggered when AUTH_REQUIRED is detected in a TTY session.
 * Shows a prompt, runs browser login, saves the key.
 * Returns true if login succeeded, false if it failed or was skipped.
 */
export async function autoLogin(): Promise<boolean> {
  if (!process.stdout.isTTY) return false;

  if (isTextOutput()) {
    console.log();
    console.log(chalk.yellow('  No API key configured.'));
    console.log(chalk.dim('  Opening browser to log in to Karis...'));
    console.log();
  }

  const resolved = await loadResolvedConfig();
  const apiUrl = resolved.apiUrl.value || 'https://api.karis.im';

  const spinner = isTextOutput() ? ora('Waiting for authorization...').start() : undefined;

  try {
    const name = await performLogin(apiUrl);
    if (spinner) spinner.succeed(chalk.green(`Logged in${name ? ` (key: ${name})` : ''}`));
    if (isTextOutput()) console.log();
    return true;
  } catch (error) {
    if (spinner) spinner.fail('Login failed');
    if (isTextOutput()) {
      const msg = error instanceof Error ? error.message : String(error);
      console.log(chalk.dim(`  ${msg}`));
      console.log();
    }
    return false;
  }
}
