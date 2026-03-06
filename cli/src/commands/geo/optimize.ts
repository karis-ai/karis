import { Command } from 'commander';
import chalk from 'chalk';
import { executeSingleTurn } from '../../utils/agent-helper.js';
import { isTextOutput } from '../../core/cli-context.js';
import { runCommand } from '../../utils/run-command.js';
import { applyManifestHelp } from '../../utils/manifest-help.js';

export function registerOptimizeCommand(program: Command): void {
  applyManifestHelp(program
    .command('optimize <url>')
    .description('Optimize content for AI search visibility via Karis Platform')
    .action(runCommand(async (url: string) => {
      const prompt = `Optimize this content to improve AI search visibility: ${url}`;

      if (isTextOutput()) {
        console.log(chalk.bold('Optimizing content for AI search...\n'));
      }
      await executeSingleTurn(prompt);
    })), 'geo.optimize');
}
