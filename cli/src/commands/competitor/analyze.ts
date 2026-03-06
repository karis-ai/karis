import { Command } from 'commander';
import chalk from 'chalk';
import { executeSingleTurn } from '../../utils/agent-helper.js';
import { isTextOutput } from '../../core/cli-context.js';
import { runCommand } from '../../utils/run-command.js';
import { applyManifestHelp } from '../../utils/manifest-help.js';

export function registerAnalyzeCommand(program: Command): void {
  applyManifestHelp(program
    .command('analyze [domain]')
    .description('Analyze competitor AI search performance via Karis Platform')
    .action(runCommand(async (domain?: string) => {
      const prompt = domain
        ? `Analyze how competitors of ${domain} perform in AI search`
        : 'Analyze competitor performance in AI search';

      if (isTextOutput()) {
        console.log(chalk.bold('Analyzing competitors...\n'));
      }
      await executeSingleTurn(prompt);
    })), 'competitor.analyze');
}
