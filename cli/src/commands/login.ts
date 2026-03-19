import { Command } from 'commander';
import chalk from 'chalk';
import { loadResolvedConfig } from '../utils/config.js';
import { isTextOutput } from '../core/cli-context.js';
import { printCommandResult } from '../utils/output.js';
import { runCommand } from '../utils/run-command.js';
import { KarisClient } from '../core/client.js';
import { browserLogin, performLogin } from '../core/auth.js';

export { browserLogin };

async function tryExistingKey(apiUrl: string): Promise<{ valid: boolean; name?: string }> {
  const resolved = await loadResolvedConfig();
  const existingKey = resolved.apiKey.value;
  if (!existingKey) return { valid: false };

  try {
    const client = new KarisClient({ apiKey: existingKey, apiUrl });
    const info = await client.verifyKey();
    return { valid: true, name: info.name || info.key_prefix || '' };
  } catch {
    return { valid: false };
  }
}

export function registerLoginCommand(program: Command): void {
  program
    .command('login')
    .description('Log in to Karis via browser')
    .option('--force', 'Re-login even if already authenticated')
    .action(runCommand(async (options: { force?: boolean }) => {
      const resolved = await loadResolvedConfig();
      const apiUrl = resolved.apiUrl.value || 'https://api.karis.im';

      if (isTextOutput()) {
        console.log();
        console.log(chalk.bold('Log in to Karis'));
        console.log();
      }

      if (!options.force) {
        const existing = await tryExistingKey(apiUrl);
        if (existing.valid) {
          if (isTextOutput()) {
            const label = existing.name ? ` (key: ${existing.name})` : '';
            console.log(chalk.green(`  Already logged in${label}`));
            console.log(chalk.dim(`  Use ${chalk.cyan('karis login --force')} to re-authenticate.`));
            console.log();
          }
          printCommandResult({ action: 'login', success: true, already_authenticated: true, key_name: existing.name });
          return;
        }
      }

      if (isTextOutput()) {
        console.log(chalk.dim('  Opening browser...'));
        console.log();
      }

      const name = await performLogin(apiUrl);

      if (isTextOutput()) {
        const label = name ? ` (key: ${name})` : '';
        console.log(chalk.green(`  API key saved${label}`));
        console.log();
      }

      printCommandResult({
        action: 'login',
        success: true,
        key_name: name || undefined,
      });
    }));
}
