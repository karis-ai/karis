import { Command } from 'commander';
import chalk from 'chalk';
import { loadResolvedConfig, maskValue } from '../utils/config.js';
import { BrowserStatus, KarisClient } from '../core/client.js';
import { printCommandResult } from '../utils/output.js';
import { runCommand } from '../utils/run-command.js';
import { isTextOutput } from '../core/cli-context.js';

interface DoctorCheck {
  id: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details?: Record<string, unknown>;
}

type OptionalBrowserCheck =
  | {
    ok: true;
    status: BrowserStatus;
  }
  | {
    ok: false;
    error: {
      code: string;
      message: string;
      statusCode?: number;
    };
  };

export function registerDoctorCommand(program: Command): void {
  program
    .command('doctor')
    .description('Check if everything is set up correctly')
    .action(runCommand(async () => {
      const resolved = await loadResolvedConfig();
      const checks: DoctorCheck[] = [];

      checks.push({
        id: 'config.api-url',
        status: 'pass',
        message: `Using API URL from ${resolved.apiUrl.source}`,
        details: { value: resolved.apiUrl.value },
      });

      checks.push({
        id: 'config.api-key',
        status: resolved.apiKey.value ? 'pass' : 'fail',
        message: resolved.apiKey.value
          ? `API key configured via ${resolved.apiKey.source}`
          : 'API key is not configured',
        details: resolved.apiKey.value
          ? { masked: maskValue('api-key', resolved.apiKey.value) }
          : undefined,
      });

      checks.push({
        id: 'runtime.adapter',
        status: 'pass',
        message: 'CLI is configured to use Karis Platform remote runtime',
      });

      checks.push(await checkConnectivity(resolved.apiUrl.value || 'https://api.karis.im'));

      if (resolved.apiKey.value) {
        const client = await KarisClient.create();
        checks.push(await checkAuth(client));
        checks.push(await checkBrand(client));
        checks.push(await checkBrowser(client));
      }

      const hasFailure = checks.some((check) => check.status === 'fail');

      if (isTextOutput()) {
        printDoctorText(checks);
      }
      printCommandResult({
        checks,
        summary: {
          total: checks.length,
          passed: checks.filter((check) => check.status === 'pass').length,
          warnings: checks.filter((check) => check.status === 'warn').length,
          failed: checks.filter((check) => check.status === 'fail').length,
        },
      });

      if (hasFailure) {
        process.exit(1);
      }
    }));
}

async function checkConnectivity(apiUrl: string): Promise<DoctorCheck> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(apiUrl, { method: 'HEAD', signal: controller.signal });
    clearTimeout(timer);

    return {
      id: 'connectivity.api-url',
      status: 'pass',
      message: 'API URL is reachable',
      details: {
        api_url: apiUrl,
        status: response.status,
      },
    };
  } catch (error) {
    return {
      id: 'connectivity.api-url',
      status: 'fail',
      message: error instanceof Error ? `API URL is not reachable: ${error.message}` : 'API URL is not reachable',
      details: { api_url: apiUrl },
    };
  }
}

async function checkAuth(client: KarisClient): Promise<DoctorCheck> {
  try {
    const info = await client.verifyKey();
    return {
      id: 'auth.api-key',
      status: 'pass',
      message: `API key is valid (${info.name})`,
      details: {
        expires_at: info.expires_at,
        key_prefix: info.key_prefix,
      },
    };
  } catch (error) {
    return {
      id: 'auth.api-key',
      status: 'fail',
      message: error instanceof Error ? error.message : 'API key verification failed',
    };
  }
}

async function checkBrand(client: KarisClient): Promise<DoctorCheck> {
  try {
    const brand = await client.getBrand();
    if (!brand) {
      return {
        id: 'brand.profile',
        status: 'warn',
        message: 'No brand profile found for the current account',
      };
    }

    return {
      id: 'brand.profile',
      status: 'pass',
      message: `Brand profile available: ${brand.name || brand.domain}`,
      details: {
        domain: brand.domain,
        claimed: brand.claimed,
      },
    };
  } catch (error) {
    return {
      id: 'brand.profile',
      status: 'fail',
      message: error instanceof Error ? error.message : 'Unable to read brand profile',
    };
  }
}

async function checkBrowser(client: KarisClient): Promise<DoctorCheck> {
  const browserCheck = await getBrowserCheck(client);

  if (!browserCheck.ok) {
    return {
      id: 'browser.relay',
      status: 'warn',
      message: `Browser relay unavailable (optional): ${browserCheck.error.message}`,
      details: browserCheck.error,
    };
  }

  if (browserCheck.status.extension_connected && browserCheck.status.can_execute) {
    return {
      id: 'browser.relay',
      status: 'pass',
      message: 'Browser relay connected and ready',
      details: {
        user_id: browserCheck.status.user_id,
        auth_type: browserCheck.status.auth_type,
        connected_here: browserCheck.status.connected_here,
        owner_instance: browserCheck.status.owner_instance,
      },
    };
  }

  return {
    id: 'browser.relay',
    status: 'warn',
    message: 'Browser relay reachable but not ready (optional)',
    details: {
      extension_connected: browserCheck.status.extension_connected,
      can_execute: browserCheck.status.can_execute,
      auth_type: browserCheck.status.auth_type,
      owner_instance: browserCheck.status.owner_instance,
    },
  };
}

async function getBrowserCheck(client: KarisClient): Promise<OptionalBrowserCheck> {
  try {
    const status = await client.getBrowserStatus();
    return { ok: true, status };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: error instanceof Error && 'code' in error ? String(error.code) : 'RUNTIME_ERROR',
        message: error instanceof Error ? error.message : 'Unknown browser status error',
        statusCode: error instanceof Error && 'statusCode' in error ? Number(error.statusCode) : undefined,
      },
    };
  }
}

function printDoctorText(checks: DoctorCheck[]): void {
  console.log();
  console.log(chalk.bold('Karis Doctor'));
  console.log(chalk.dim('────────────────────────────────────────'));
  console.log();

  for (const check of checks) {
    const marker =
      check.status === 'pass'
        ? chalk.green('PASS')
        : check.status === 'warn'
          ? chalk.yellow('WARN')
          : chalk.red('FAIL');
    console.log(`${marker} ${check.id}  ${check.message}`);
  }

  console.log();
}
