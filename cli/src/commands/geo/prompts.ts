import { Command } from 'commander';
import chalk from 'chalk';
import { executeSingleTurn } from '../../utils/agent-helper.js';
import { isTextOutput } from '../../core/cli-context.js';
import { runCommand } from '../../utils/run-command.js';
import { applyManifestHelp } from '../../utils/manifest-help.js';

export function registerPromptsCommand(program: Command): void {
  applyManifestHelp(program
    .command('prompts <topic>')
    .description('Research how users ask AI about a topic via Karis Platform')
    .action(runCommand(async (topic: string) => {
      const prompt = `Research how users ask AI about "${topic}" and generate test prompts`;

      if (isTextOutput()) {
        console.log(chalk.bold(`Researching prompts for "${topic}"...\n`));
      }
      await executeSingleTurn(prompt);
    })), 'geo.prompts');
}
