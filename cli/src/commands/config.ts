import { Command } from 'commander';
import chalk from 'chalk';
import {
  getConfigValue,
  setConfigValue,
  listConfig,
  maskValue,
} from '../utils/config.js';
import { success, error, section } from '../utils/output.js';

export function registerConfigCommand(program: Command): void {
  const configCmd = program
    .command('config')
    .description('Manage API keys and settings');

  configCmd
    .command('set <key> <value>')
    .description('Set a config value (e.g., api-key, openai-key, anthropic-key, agent-mode)')
    .action(async (key: string, value: string) => {
      // Validate agent-mode value
      if (key === 'agent-mode' && value !== 'local' && value !== 'remote') {
        console.log(error(`Invalid agent-mode value: ${value}. Must be 'local' or 'remote'.`));
        return;
      }

      await setConfigValue(key, value);
      console.log(success(`Set ${chalk.bold(key)} = ${maskValue(key, value)}`));

      // Show helpful message for agent-mode
      if (key === 'agent-mode') {
        console.log();
        if (value === 'local') {
          console.log(chalk.dim('Local Agent mode uses Skills + your LLM (OpenAI or Anthropic).'));
          console.log(chalk.dim('Make sure you have set openai-key or anthropic-key.'));
        } else {
          console.log(chalk.dim('Remote Agent mode uses Karis Platform with enhanced features.'));
          console.log(chalk.dim('Make sure you have set api-key from https://karis.im/settings/api-keys'));
        }
      }
    });

  configCmd
    .command('get <key>')
    .description('Get a config value')
    .action(async (key: string) => {
      const value = await getConfigValue(key);
      if (value === undefined) {
        console.log(error(`Key ${chalk.bold(key)} is not set.`));
      } else {
        console.log(`${chalk.bold(key)} = ${maskValue(key, value)}`);
      }
    });

  configCmd
    .command('list')
    .description('List all config values')
    .action(async () => {
      const config = await listConfig();
      const entries = Object.entries(config).filter(
        (entry): entry is [string, string] => entry[1] !== undefined,
      );
      if (entries.length === 0) {
        console.log(chalk.dim('No config values set.'));
        console.log();
        console.log(chalk.dim('Get started:'));
        console.log(`  ${chalk.cyan('npx karis config set openai-key sk-...')}`);
        console.log(`  ${chalk.cyan('npx karis config set api-key sk-ka-...')}`);
        return;
      }
      section('Karis Config');
      for (const [key, value] of entries) {
        console.log(`  ${chalk.bold(key)}: ${maskValue(key, value)}`);
      }
      console.log();
    });
}
