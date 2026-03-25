import { Command } from 'commander';
import chalk from 'chalk';
import {
  getConfigValue,
  setConfigValue,
  listConfig,
  maskValue,
  loadResolvedConfig,
  SUPPORTED_CONFIG_KEYS,
} from '../utils/config.js';
import { success, section, printCommandResult } from '../utils/output.js';
import { createInvalidArgumentError } from '../core/errors.js';
import { runCommand } from '../utils/run-command.js';
import { isTextOutput } from '../core/cli-context.js';

export function registerConfigCommand(program: Command): void {
  const configCmd = program
    .command('config')
    .description('Manage API keys and settings');

  configCmd
    .command('set <key> <value>')
    .description('Set a config value (supported: api-key, base-url, browser-extension-id)')
    .action(runCommand(async (key: string, value: string) => {
      if (!isSupportedConfigKey(key)) {
        throw createInvalidArgumentError(
          `Unsupported config key: ${key}. Supported keys: ${SUPPORTED_CONFIG_KEYS.join(', ')}.`,
        );
      }

      await setConfigValue(key, value);
      if (isTextOutput()) {
        console.log(success(`Set ${chalk.bold(key)} = ${maskValue(key, value)}`));
      }
      printCommandResult({
        key,
        value: maskValue(key, value),
      });
    }));

  configCmd
    .command('get <key>')
    .description('Get a config value')
    .action(runCommand(async (key: string) => {
      if (!isSupportedConfigKey(key)) {
        throw createInvalidArgumentError(
          `Unsupported config key: ${key}. Supported keys: ${SUPPORTED_CONFIG_KEYS.join(', ')}.`,
        );
      }

      const value = await getConfigValue(key);
      if (value === undefined) {
        throw createInvalidArgumentError(`Key ${chalk.bold(key)} is not set.`);
      } else {
        if (isTextOutput()) {
          console.log(`${chalk.bold(key)} = ${maskValue(key, value)}`);
        }
        printCommandResult({ key, value: maskValue(key, value) });
      }
    }));

  configCmd
    .command('list')
    .description('List all config values')
    .action(runCommand(async () => {
      const config = await listConfig();
      const resolved = await loadResolvedConfig();
      const entries = Object.entries(config).filter(
        (entry): entry is [string, string] => entry[1] !== undefined && isSupportedConfigKey(entry[0]),
      );
      if (entries.length === 0) {
        if (isTextOutput()) {
          console.log(chalk.dim('No config values set.'));
          console.log();
          console.log(chalk.dim('Get started:'));
          console.log(`  ${chalk.cyan('npx karis config set api-key sk-ka-...')}`);
          console.log(`  ${chalk.cyan('npx karis config set base-url https://api.karis.im')}`);
        }
        printCommandResult({
          config: {},
          resolved: maskResolvedConfig(resolved),
        });
        return;
      }
      if (isTextOutput()) {
        section('Karis Config');
        for (const [key, value] of entries) {
          console.log(`  ${chalk.bold(key)}: ${maskValue(key, value)}`);
        }
        console.log();
      }
      printCommandResult({
        config: Object.fromEntries(entries.map(([key, value]) => [key, maskValue(key, value)])),
        resolved: maskResolvedConfig(resolved),
      });
    }));
}

function maskResolvedConfig(resolved: Awaited<ReturnType<typeof loadResolvedConfig>>) {
  return {
    apiKey: {
      ...resolved.apiKey,
      value: resolved.apiKey.value ? maskValue('api-key', resolved.apiKey.value) : undefined,
    },
    apiUrl: resolved.apiUrl,
  };
}

function isSupportedConfigKey(key: string): key is typeof SUPPORTED_CONFIG_KEYS[number] {
  return SUPPORTED_CONFIG_KEYS.includes(key as typeof SUPPORTED_CONFIG_KEYS[number]);
}
