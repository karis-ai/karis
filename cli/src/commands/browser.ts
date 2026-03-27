import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import { Command, InvalidArgumentError } from 'commander';
import chalk from 'chalk';
import {
  BrowserActionResult,
  BrowserNavigateResult,
  BrowserScreenshotResult,
  BrowserStateResult,
  BrowserStatus,
  KarisClient,
  type RelayTokenResponse,
} from '../core/client.js';
import { isStructuredOutput, isTextOutput } from '../core/cli-context.js';
import { createInvalidArgumentError } from '../core/errors.js';
import { ensureConfirmed, renderActionResult, renderFollowResult } from '../utils/browser-action-output.js';
import { loadConfig } from '../utils/config.js';
import { printCommandResult, success } from '../utils/output.js';
import { runCommand } from '../utils/run-command.js';

const DEFAULT_CONNECT_TIMEOUT_SECONDS = 45;
const DEFAULT_SCROLL_AMOUNT = 600;
const DEFAULT_BROWSER_EXTENSION_ID = 'mfmmdckeamdchhlafedfiiinmngloiok';

function extensionInstallUrl(extensionId: string): string {
  return `https://chromewebstore.google.com/detail/${extensionId}`;
}

function timestampForFilename(date = new Date()): string {
  return date.toISOString().replace(/[:.]/g, '-');
}

function defaultScreenshotPath(): string {
  return path.resolve(process.cwd(), `karis-screenshot-${timestampForFilename()}.png`);
}

function defaultContentPath(): string {
  return path.resolve(process.cwd(), `karis-content-${timestampForFilename()}.md`);
}

function getScreenshotBase64(screenshot: BrowserScreenshotResult): string {
  const base64 = screenshot.image_base64 || screenshot.base64_png;
  if (!base64) {
    throw new Error('Screenshot response did not include image data.');
  }
  return base64;
}

async function saveScreenshot(
  screenshot: BrowserScreenshotResult,
  outputPath?: string,
): Promise<{ outputPath: string; bytes: number }> {
  const resolvedPath = path.resolve(outputPath || defaultScreenshotPath());
  const bytes = Buffer.from(getScreenshotBase64(screenshot), 'base64');
  await mkdir(path.dirname(resolvedPath), { recursive: true });
  await writeFile(resolvedPath, bytes);
  return { outputPath: resolvedPath, bytes: bytes.length };
}

async function saveContentMarkdown(
  content: string,
  outputPath?: string,
): Promise<{ outputPath: string; bytes: number }> {
  const resolvedPath = path.resolve(outputPath || defaultContentPath());
  await mkdir(path.dirname(resolvedPath), { recursive: true });
  await writeFile(resolvedPath, content, 'utf8');
  return { outputPath: resolvedPath, bytes: Buffer.byteLength(content, 'utf8') };
}

function parseIntegerOption(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    throw new InvalidArgumentError(`Expected an integer, got ${value}`);
  }
  return parsed;
}

function collectValues(value: string, previous: string[]): string[] {
  previous.push(value);
  return previous;
}

function renderStatusText(status: BrowserStatus): void {
  console.log();
  console.log(chalk.bold('Browser Relay Status'));
  console.log(chalk.dim('────────────────────────────────────────'));
  console.log();
  console.log(`${chalk.bold('User ID')}: ${status.user_id}`);
  console.log(`${chalk.bold('Auth')}: ${status.auth_type || 'unknown'}`);
  console.log(`${chalk.bold('Extension')}: ${status.extension_connected ? 'connected' : 'not connected'}`);
  console.log(`${chalk.bold('Can Execute')}: ${status.can_execute ? 'yes' : 'no'}`);
  console.log(`${chalk.bold('Connected Here')}: ${status.connected_here ? 'yes' : 'no'}`);
  console.log(`${chalk.bold('Owner Instance')}: ${status.owner_instance || '(local only / unknown)'}`);
  console.log(`${chalk.bold('Local Extension')}: ${status.local_extension_connected ? 'connected' : 'not connected'}`);
  console.log(`${chalk.bold('Local CDP Clients')}: ${status.local_cdp_clients}`);
  console.log(`${chalk.bold('Hostname')}: ${status.instance.hostname}`);
  console.log(`${chalk.bold('Instance ID')}: ${status.instance.instance_id}`);
  console.log();
}

function renderNavigateText(result: BrowserNavigateResult): void {
  console.log();
  console.log(success('Browser navigation completed'));
  console.log();
  console.log(`${chalk.bold('URL')}: ${String(result.url || '(unknown)')}`);
  console.log(`${chalk.bold('Title')}: ${String(result.title || '(unknown)')}`);
  console.log();
}

function renderStateText(result: BrowserStateResult): void {
  console.log();
  console.log(success('Browser state loaded'));
  console.log();
  console.log(`${chalk.bold('URL')}: ${result.url}`);
  console.log(`${chalk.bold('Title')}: ${result.title}`);
  console.log(`${chalk.bold('Viewport')}: ${result.viewport.width} x ${result.viewport.height}`);
  console.log(
    `${chalk.bold('Scroll')}: x=${result.scroll.x}, y=${result.scroll.y}, pageHeight=${result.scroll.pageHeight}`,
  );
  console.log(`${chalk.bold('DPR')}: ${result.dpr}`);
  console.log();
  console.log(result.elements || result.accessibility_tree || '(no elements)');
  console.log();
}

function resolveExtensionId(override?: string): string | null {
  const value = override?.trim();
  if (value) return value;

  return (
    process.env.KARIS_BROWSER_EXTENSION_ID ||
    process.env.SOPHIA_BROWSER_EXTENSION_ID ||
    process.env.NEXT_PUBLIC_BROWSER_EXTENSION_ID ||
    process.env.NEXT_PUBLIC_EXTENSION_ID
  ) || null;
}

async function resolveConfiguredExtensionId(override?: string): Promise<string | null> {
  const direct = resolveExtensionId(override);
  if (direct) return direct;

  const config = await loadConfig();
  return config['browser-extension-id'] || DEFAULT_BROWSER_EXTENSION_ID;
}

async function openUrlInBrowser(url: string): Promise<boolean> {
  let command = '';
  let args: string[] = [];

  if (process.platform === 'darwin') {
    command = 'open';
    args = [url];
  } else if (process.platform === 'win32') {
    command = 'cmd';
    args = ['/c', 'start', '', url];
  } else {
    command = 'xdg-open';
    args = [url];
  }

  return await new Promise(resolve => {
    let settled = false;
    const child = spawn(command, args, {
      detached: true,
      stdio: 'ignore',
    });

    const finish = (opened: boolean): void => {
      if (settled) return;
      settled = true;
      child.removeListener('error', onError);
      child.removeListener('spawn', onSpawn);
      clearTimeout(fallbackTimer);
      if (opened) {
        child.unref();
      }
      resolve(opened);
    };

    const onError = (): void => finish(false);
    const onSpawn = (): void => finish(true);
    const fallbackTimer = setTimeout(() => finish(false), 250);

    child.once('error', onError);
    child.once('spawn', onSpawn);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildPairingPage(extensionId: string, relay: RelayTokenResponse): string {
  const payload = JSON.stringify({
    extensionId,
    installUrl: extensionInstallUrl(extensionId),
    relayToken: relay.token,
    activate: true,
    profile: {
      id: 'cli',
      label: 'CLI',
      source: 'cli',
    },
    userId: relay.user_id,
    expiresIn: relay.expires_in,
  });

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Karis Browser Connect</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #0f172a;
        --panel: #111827;
        --panel-strong: #0b1220;
        --border: #334155;
        --border-soft: #1e293b;
        --text: #f8fafc;
        --muted: #94a3b8;
        --accent: #f59e0b;
        --accent-strong: #fbbf24;
        --success: #22c55e;
        --error: #f97316;
      }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: var(--bg);
        color: var(--text);
      }
      main {
        max-width: 760px;
        margin: 0 auto;
        padding: 56px 24px;
      }
      .card {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 24px;
        padding: 28px;
        box-shadow: 0 20px 45px rgba(2, 6, 23, 0.35);
      }
      .eyebrow {
        display: inline-flex;
        align-items: center;
        padding: 6px 10px;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: var(--panel-strong);
        color: var(--accent-strong);
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
      }
      .headline {
        margin-top: 18px;
      }
      h1 {
        font-size: 30px;
        line-height: 1.1;
        margin: 0 0 12px;
        text-wrap: balance;
      }
      p {
        color: var(--muted);
        line-height: 1.65;
        margin: 0;
        text-wrap: pretty;
      }
      code {
        background: rgba(15, 23, 42, 0.95);
        padding: 2px 8px;
        border-radius: 8px;
        color: var(--text);
      }
      .meta {
        margin-top: 24px;
        display: grid;
        gap: 12px;
      }
      .meta-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        padding: 12px 14px;
        border-radius: 14px;
        border: 1px solid var(--border-soft);
        background: var(--panel-strong);
      }
      .meta-label {
        min-width: 124px;
        color: var(--muted);
        font-size: 13px;
        text-transform: uppercase;
      }
      .status-card {
        margin-top: 20px;
        padding: 16px 18px;
        border-radius: 16px;
        border: 1px solid var(--border);
        background: var(--panel-strong);
      }
      #status {
        margin: 0;
        font-size: 15px;
        line-height: 1.6;
      }
      .ok { color: #86efac; }
      .warn { color: #fde68a; }
      .err { color: #fdba74; }
      #actions {
        margin-top: 18px;
        display: none;
      }
      #actions.visible {
        display: block;
      }
      .button-row {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }
      .button {
        display: inline-block;
        padding: 12px 16px;
        border-radius: 12px;
        background: var(--accent);
        color: #1f2937;
        text-decoration: none;
        font-weight: 600;
        border: 1px solid transparent;
      }
      .button.secondary {
        background: transparent;
        color: var(--text);
        border-color: var(--border);
      }
      .subtle {
        margin-top: 12px;
        font-size: 14px;
        color: var(--muted);
      }
      .helper {
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid var(--border-soft);
        font-size: 14px;
        color: var(--muted);
      }
    </style>
  </head>
  <body>
    <main>
      <div class="card">
        <div class="eyebrow">Browser Pairing</div>
        <div class="headline">
          <h1>Karis Browser Connect</h1>
          <p>
            This page sends a short-lived relay token to the Karis browser extension so CLI commands can
            control the browser without the IDE.
          </p>
        </div>
        <div class="meta">
          <div class="meta-row">
            <div class="meta-label">Target Extension</div>
            <code id="ext"></code>
          </div>
          <div class="meta-row">
            <div class="meta-label">User ID</div>
            <code id="user"></code>
          </div>
        </div>
        <div class="status-card">
          <div id="status" class="warn">Connecting to extension...</div>
        </div>
        <div id="actions">
          <div class="button-row">
            <a id="install-link" class="button" href="#" target="_blank" rel="noreferrer">Download Extension</a>
            <button id="retry-link" class="button secondary" type="button">Try Again</button>
          </div>
          <div class="subtle">Install the extension in this Chrome profile, then come back and retry pairing.</div>
        </div>
        <div class="helper">Keep this tab open until the connection succeeds.</div>
      </div>
    </main>
    <script>
      const state = ${payload};
      const STATUS_POLL_INTERVAL_MS = 1000;
      const STATUS_POLL_TIMEOUT_MS = 30000;
      let statusPollTimer = null;
      let pollStartedAt = 0;

      document.getElementById('ext').textContent = state.extensionId;
      document.getElementById('user').textContent = state.userId;
      document.getElementById('install-link').href = state.installUrl;
      document.getElementById('retry-link').addEventListener('click', () => {
        setStatus('warn', 'Retrying extension connection...');
        pair();
      });

      function setStatus(kind, text) {
        const el = document.getElementById('status');
        el.className = kind;
        el.textContent = text;
      }

      function hideInstallFlow() {
        document.getElementById('actions').className = '';
      }

      function showInstallFlow(message) {
        setStatus('err', message);
        document.getElementById('actions').className = 'visible';
      }

      function stopStatusPolling() {
        if (statusPollTimer) {
          clearTimeout(statusPollTimer);
          statusPollTimer = null;
        }
      }

      function scheduleStatusCheck() {
        stopStatusPolling();
        statusPollTimer = setTimeout(sendStatusCheck, STATUS_POLL_INTERVAL_MS);
      }

      function startStatusPolling() {
        pollStartedAt = Date.now();
        stopStatusPolling();
        sendStatusCheck();
      }

      function pollingTimedOut() {
        return pollStartedAt > 0 && Date.now() - pollStartedAt >= STATUS_POLL_TIMEOUT_MS;
      }

      function sendStatusCheck() {
        if (!globalThis.chrome?.runtime?.sendMessage) {
          showInstallFlow('Open this page in Chrome with the Karis extension installed.');
          stopStatusPolling();
          return;
        }

        chrome.runtime.sendMessage(
          state.extensionId,
          { type: 'CHECK_EXTENSION_STATUS' },
          response => {
            const lastError = chrome.runtime.lastError;
            if (lastError) {
              if (lastError.message && lastError.message.includes('Receiving end does not exist')) {
                showInstallFlow('Karis browser extension is not installed in this Chrome profile.');
                stopStatusPolling();
                return;
              }
              if (pollingTimedOut()) {
                showInstallFlow('Extension relay status check timed out. You can retry pairing.');
                return;
              }
              hideInstallFlow();
              setStatus('warn', 'Token sent, waiting for extension relay connection...');
              scheduleStatusCheck();
              return;
            }
            if (response?.success && response?.data?.relayConnected) {
              stopStatusPolling();
              hideInstallFlow();
              setStatus('ok', 'Extension connected to relay. You can return to the CLI.');
              return;
            }

            if (pollingTimedOut()) {
              showInstallFlow('Token sent, but the extension did not report relay readiness in time.');
              return;
            }

            hideInstallFlow();
            setStatus('warn', 'Token sent, waiting for extension relay connection...');
            scheduleStatusCheck();
          }
        );
      }

      function pair() {
        if (!globalThis.chrome?.runtime?.sendMessage) {
          showInstallFlow('Open this page in Chrome with the Karis extension installed.');
          stopStatusPolling();
          return;
        }

        stopStatusPolling();
        hideInstallFlow();

        chrome.runtime.sendMessage(
          state.extensionId,
          {
            type: 'SET_RELAY_TOKEN',
            payload: {
              token: state.relayToken,
              activate: state.activate === true,
              profile: state.profile,
            },
          },
          response => {
            const lastError = chrome.runtime.lastError;
            if (lastError) {
              if (lastError.message && lastError.message.includes('Receiving end does not exist')) {
                showInstallFlow('Karis browser extension is not installed in this Chrome profile.');
                stopStatusPolling();
                return;
              }
              hideInstallFlow();
              setStatus('err', 'Failed to reach extension: ' + lastError.message);
              stopStatusPolling();
              return;
            }
            if (!response?.success) {
              hideInstallFlow();
              setStatus('err', 'Extension rejected token update.');
              stopStatusPolling();
              return;
            }
            hideInstallFlow();
            setStatus('warn', 'Token sent. Checking relay connection...');
            startStatusPolling();
          }
        );
      }

      pair();
    </script>
  </body>
</html>`;
}

async function waitForConnection(
  client: KarisClient,
  timeoutMs: number,
): Promise<{ status: BrowserStatus | null; lastError: Error | null }> {
  const deadline = Date.now() + timeoutMs;
  let lastError: Error | null = null;

  while (Date.now() < deadline) {
    try {
      const status = await client.getBrowserStatus();
      lastError = null;
      if (status.extension_connected && status.can_execute) {
        return { status, lastError: null };
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
    await sleep(1000);
  }

  return { status: null, lastError };
}

function getPairingInstructions(pairingUrl: string, extensionId: string): string {
  return [
    'Install the Karis Chrome extension first if you have not already:',
    extensionInstallUrl(extensionId),
    '',
    `Pairing URL: ${pairingUrl}`,
    `Extension ID: ${extensionId}`,
    'Open the pairing URL in the Chrome profile where the browser extension is installed.',
  ].join('\n');
}

function printStructured(data: unknown): void {
  if (!isStructuredOutput()) return;
  printCommandResult(data);
}

export function registerBrowserCommand(program: Command): void {
  const browser = program.command('browser').description('Inspect and execute browser extension actions');

  browser
    .command('status')
    .description('Show browser relay status for the current user')
    .action(runCommand(async () => {
      const client = await KarisClient.create();
      const status = await client.getBrowserStatus();

      if (isTextOutput()) {
        renderStatusText(status);
      }
      printStructured(status);
    }));

  browser
    .command('connect')
    .description('Bootstrap the browser extension connection without the IDE')
    .option('--extension-id <id>', 'Target browser extension ID (defaults to config/env)')
    .option('--force', 'Force a fresh pairing page even if the extension is already connected')
    .option('--timeout <seconds>', 'How long to wait for the extension to connect', String(DEFAULT_CONNECT_TIMEOUT_SECONDS))
    .option('--no-open', 'Do not auto-open the local pairing page')
    .action(runCommand(async (opts: {
      extensionId?: string;
      force?: boolean;
      timeout: string;
      open?: boolean;
    }) => {
      const extensionId = await resolveConfiguredExtensionId(opts.extensionId);
      if (!extensionId) {
        throw createInvalidArgumentError(
          'Browser extension ID not configured. Pass --extension-id or set `karis config set browser-extension-id <id>`.',
        );
      }

      const timeoutSeconds = Number(opts.timeout);
      if (!Number.isFinite(timeoutSeconds) || timeoutSeconds <= 0) {
        throw createInvalidArgumentError('Timeout must be a positive number of seconds.');
      }

      let server: ReturnType<typeof createServer> | undefined;

      try {
        const client = await KarisClient.create();
        const existing = await client.getBrowserStatus();
        const alreadyConnectedHere =
          existing.extension_connected &&
          existing.can_execute &&
          existing.connected_here &&
          existing.local_extension_connected;
        if (!opts.force && alreadyConnectedHere) {
          if (isTextOutput()) {
            console.log();
            console.log(success('Browser extension is already connected for this user.'));
            renderStatusText(existing);
          }
          printStructured({ paired: true, already_connected: true, status: existing });
          return;
        }

        const repairingLocalPairing =
          !opts.force &&
          existing.extension_connected &&
          existing.can_execute &&
          !alreadyConnectedHere;

        const relay = await client.getRelayToken();
        const page = buildPairingPage(extensionId, relay);

        server = createServer((req, res) => {
          if (req.url === '/' || req.url?.startsWith('/pair')) {
            res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
            res.end(page);
            return;
          }
          res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
          res.end('Not found');
        });

        await new Promise<void>((resolve, reject) => {
          server!.once('error', reject);
          server!.listen(0, '127.0.0.1', () => resolve());
        });

        const address = server.address() as AddressInfo | null;
        if (!address) {
          throw new Error('Failed to determine local pairing server address');
        }

        const pairingUrl = `http://localhost:${address.port}/pair`;

        if (isTextOutput()) {
          console.log();
          console.log(success('Browser connect flow started'));
          console.log();
          if (repairingLocalPairing) {
            console.log(
              chalk.dim(
                'A browser relay is already connected for this user, but this local extension needs to be paired again.'
              )
            );
            console.log();
          }
          console.log(`${chalk.bold('User ID')}: ${relay.user_id}`);
          console.log(`${chalk.bold('Extension ID')}: ${extensionId}`);
          console.log(`${chalk.bold('Install Extension')}: ${extensionInstallUrl(extensionId)}`);
          console.log(`${chalk.bold('Pairing URL')}: ${pairingUrl}`);
          if (opts.force) {
            console.log(`${chalk.bold('Mode')}: forced re-pair`);
          }
          console.log();
          console.log(chalk.dim('If the extension is not installed yet, install it first, then open the pairing URL in Chrome.'));
          console.log();
        }

        const opened = opts.open !== false && await openUrlInBrowser(pairingUrl);
        if (isTextOutput() && !opened) {
          console.log(getPairingInstructions(pairingUrl, extensionId));
          console.log();
        }

        const { status: connected, lastError } = await waitForConnection(client, timeoutSeconds * 1000);
        if (!connected) {
          const suffix = lastError ? `\nLast status error: ${lastError.message}` : '';
          throw new Error(
            `Extension did not connect before timeout.${suffix}\n${getPairingInstructions(pairingUrl, extensionId)}`,
          );
        }

        if (isTextOutput()) {
          console.log();
          console.log(success('Browser extension connected'));
          renderStatusText(connected);
        }
        printStructured({
          paired: true,
          pairing_url: pairingUrl,
          extension_id: extensionId,
          forced: opts.force === true,
          status: connected,
        });
      } finally {
        server?.close();
      }
    }));

  browser
    .command('navigate')
    .description('Navigate the connected browser to a URL')
    .requiredOption('--url <url>', 'Target URL')
    .action(runCommand(async (opts: { url: string }) => {
      const client = await KarisClient.create();
      const result = await client.navigateBrowser(opts.url);
      if (isTextOutput()) {
        renderNavigateText(result);
      }
      printStructured(result);
    }));

  browser
    .command('get-state')
    .description('Read the current page state and accessibility tree')
    .action(runCommand(async () => {
      const client = await KarisClient.create();
      const result = await client.getBrowserState();
      if (isTextOutput()) {
        renderStateText(result);
      }
      printStructured(result);
    }));

  browser
    .command('get-content')
    .description('Extract readable page content as Markdown')
    .option('-o, --output <path>', 'Write Markdown to this file')
    .action(runCommand(async (opts: { output?: string }) => {
      const client = await KarisClient.create();
      const result = await client.getBrowserContent();
      let structuredOutput: unknown = result;

      if (opts.output) {
        const content = result.content_markdown || '(no content extracted)';
        const saved = await saveContentMarkdown(content, opts.output);
        structuredOutput = { ...result, output_path: saved.outputPath, bytes: saved.bytes };
      }

      if (isTextOutput()) {
        console.log();
        console.log(success('Browser content extracted'));
        console.log();
        console.log(`${chalk.bold('URL')}: ${String(result.url || '(unknown)')}`);
        console.log(`${chalk.bold('Title')}: ${String(result.title || '(unknown)')}`);
        if (opts.output) {
          const saved = structuredOutput as { output_path: string; bytes: number };
          console.log(`${chalk.bold('File')}: ${saved.output_path}`);
          console.log(`${chalk.bold('Bytes')}: ${saved.bytes}`);
          console.log();
        } else {
          console.log();
          console.log(result.content_markdown || '(no content extracted)');
          console.log();
        }
      }

      printStructured(structuredOutput);
    }));

  browser
    .command('click')
    .description('Click an element via accessibility index, text, or CSS selector')
    .option('--element-index <number>', 'Index from browser get-state', parseIntegerOption)
    .option('--text <label>', 'Button/link/textbox label to click')
    .option('--selector <css>', 'CSS selector fallback')
    .action(runCommand(async (opts: {
      elementIndex?: number;
      text?: string;
      selector?: string;
    }) => {
      if (opts.elementIndex == null && !opts.text?.trim() && !opts.selector?.trim()) {
        throw createInvalidArgumentError('Provide --element-index, --text, or --selector for browser click.');
      }

      const client = await KarisClient.create();
      const result = await client.clickBrowser({
        element_index: opts.elementIndex,
        text: opts.text?.trim() || undefined,
        css_selector: opts.selector?.trim() || undefined,
      });
      renderActionResult('Browser click completed', result, {
        preferredKeys: ['method', 'text', 'matched', 'selector', 'index', 'coords'],
        failureMessage: 'Browser click failed.',
      });
    }));

  browser
    .command('type')
    .description('Type text into the currently focused element')
    .requiredOption('--text <text>', 'Text to insert')
    .option('--clear', 'Clear existing content first')
    .action(runCommand(async (opts: { text: string; clear?: boolean }) => {
      const client = await KarisClient.create();
      const result = await client.typeBrowser({
        text: opts.text,
        clear: opts.clear === true,
      });
      renderActionResult('Browser typing completed', result, {
        preferredKeys: ['typed', 'message'],
        failureMessage: 'Browser typing failed.',
      });
    }));

  browser
    .command('scroll')
    .description('Scroll the current page')
    .option('--direction <direction>', 'up or down', 'down')
    .option('--amount <pixels>', 'Scroll distance in pixels', parseIntegerOption, DEFAULT_SCROLL_AMOUNT)
    .action(runCommand(async (opts: { direction: string; amount: number }) => {
      const client = await KarisClient.create();
      const result = await client.scrollBrowser({
        direction: opts.direction,
        amount: opts.amount,
      });
      renderActionResult('Browser scroll completed', result, {
        preferredKeys: ['direction', 'pixels', 'scroll_y', 'page_height'],
        failureMessage: 'Browser scroll failed.',
      });
    }));

  browser
    .command('screenshot')
    .description('Capture a screenshot from the connected browser')
    .option('-o, --output <path>', 'Write PNG to this path (defaults to ./karis-screenshot-<timestamp>.png)')
    .action(runCommand(async (opts: { output?: string }) => {
      const client = await KarisClient.create();
      const screenshot = await client.takeBrowserScreenshot();
      const saved = await saveScreenshot(screenshot, opts.output);
      const structuredOutput = {
        ...screenshot,
        output_path: saved.outputPath,
        bytes: saved.bytes,
      };

      if (isTextOutput()) {
        console.log();
        console.log(success('Browser screenshot captured'));
        console.log();
        console.log(`${chalk.bold('File')}: ${saved.outputPath}`);
        console.log(`${chalk.bold('Bytes')}: ${saved.bytes}`);
        console.log(`${chalk.bold('Base64 Length')}: ${screenshot.base64_length ?? getScreenshotBase64(screenshot).length}`);
        console.log(`${chalk.bold('Mime Type')}: ${String(screenshot.mime_type || 'image/png')}`);
        console.log();
      }

      printStructured(structuredOutput);
    }));

  browser
    .command('post-x')
    .description('Post to X/Twitter via the connected browser')
    .requiredOption('--text <text>', 'Tweet text')
    .option('--social-account-id <id>', 'Optional Karis Social account ID')
    .option('--signal-id <id>', 'Optional related signal ID')
    .option('--confirm', 'Confirm that you want to post')
    .action(runCommand(async (opts: {
      text: string;
      socialAccountId?: string;
      signalId?: string;
      confirm?: boolean;
    }) => {
      ensureConfirmed(opts.confirm, 'post to X');
      const client = await KarisClient.create();
      const result = await client.postToX({
        text: opts.text,
        social_account_id: opts.socialAccountId,
        signal_id: opts.signalId,
      });
      renderActionResult('X post completed', result, {
        preferredKeys: ['message', 'external_post_url', 'url', 'toast', 'text'],
        failureMessage: 'Failed to post to X.',
      });
    }));

  browser
    .command('reply-x')
    .description('Reply to a tweet on X/Twitter via the connected browser')
    .requiredOption('--url <tweetUrl>', 'Full tweet URL')
    .requiredOption('--text <text>', 'Reply text')
    .option('--social-account-id <id>', 'Optional Karis Social account ID')
    .option('--signal-id <id>', 'Optional related signal ID')
    .option('--confirm', 'Confirm that you want to reply')
    .action(runCommand(async (opts: {
      url: string;
      text: string;
      socialAccountId?: string;
      signalId?: string;
      confirm?: boolean;
    }) => {
      ensureConfirmed(opts.confirm, 'reply on X');
      const client = await KarisClient.create();
      const result = await client.replyToX({
        tweet_url: opts.url,
        text: opts.text,
        social_account_id: opts.socialAccountId,
        signal_id: opts.signalId,
      });
      renderActionResult('X reply completed', result, {
        preferredKeys: ['message', 'external_post_url', 'url', 'tweet_url', 'toast', 'text'],
        failureMessage: 'Failed to reply on X.',
      });
    }));

  browser
    .command('follow-x')
    .description('Follow one or more X/Twitter profiles via the connected browser')
    .option('--profile <value>', 'Username, @handle, or profile URL; repeat for multiple profiles', collectValues, [] as string[])
    .option('--confirm', 'Confirm that you want to follow the profile(s)')
    .action(runCommand(async (opts: { profile: string[]; confirm?: boolean }) => {
      ensureConfirmed(opts.confirm, 'follow on X');
      const profiles = opts.profile.map(value => value.trim()).filter(Boolean);
      if (profiles.length === 0) {
        throw createInvalidArgumentError('Provide at least one --profile for browser follow-x.');
      }

      const client = await KarisClient.create();
      const result = await client.followOnX(profiles.length === 1 ? { profile: profiles[0] } : { profiles });
      renderFollowResult('X follow completed', result, {
        failureMessage: 'Failed to follow on X.',
      });
    }));

  browser
    .command('post-reddit')
    .description('Create a Reddit text post via the connected browser')
    .requiredOption('--subreddit <name>', 'Subreddit name without r/')
    .requiredOption('--title <text>', 'Post title')
    .option('--body <text>', 'Optional post body')
    .option('--confirm', 'Confirm that you want to post to Reddit')
    .action(runCommand(async (opts: {
      subreddit: string;
      title: string;
      body?: string;
      confirm?: boolean;
    }) => {
      ensureConfirmed(opts.confirm, 'post to Reddit');
      const client = await KarisClient.create();
      const result = await client.postToReddit({
        subreddit: opts.subreddit,
        title: opts.title,
        body: opts.body,
      });
      renderActionResult('Reddit post completed', result, {
        preferredKeys: ['message', 'post_url', 'subreddit', 'title'],
        failureMessage: 'Failed to post to Reddit.',
      });
    }));

  browser
    .command('comment-reddit')
    .description('Comment on a Reddit post via the connected browser')
    .requiredOption('--url <postUrl>', 'Full Reddit post URL')
    .requiredOption('--text <text>', 'Comment text')
    .option('--confirm', 'Confirm that you want to comment on Reddit')
    .action(runCommand(async (opts: { url: string; text: string; confirm?: boolean }) => {
      ensureConfirmed(opts.confirm, 'comment on Reddit');
      const client = await KarisClient.create();
      const result = await client.commentOnReddit({
        post_url: opts.url,
        text: opts.text,
      });
      renderActionResult('Reddit comment completed', result, {
        preferredKeys: ['message', 'post_url', 'text'],
        failureMessage: 'Failed to comment on Reddit.',
      });
    }));
}
