import { Command } from 'commander';
import chalk from 'chalk';
import { executeSingleTurn } from '../../utils/agent-helper.js';
import { isTextOutput } from '../../core/cli-context.js';
import { runCommand } from '../../utils/run-command.js';
import { applyManifestHelp } from '../../utils/manifest-help.js';

export function registerClustersCommand(program: Command): void {
  applyManifestHelp(program
    .command('clusters [domain]')
    .description('Generate topic cluster architecture via Karis Platform')
    .action(runCommand(async (domain?: string) => {
      const prompt = domain
        ? `Generate a topic cluster architecture and content strategy for ${domain}`
        : 'Generate a topic cluster architecture and content strategy';

      if (isTextOutput()) {
        console.log(chalk.bold('Generating topic clusters...\n'));
      }
      await executeSingleTurn(prompt);
    })), 'content.clusters');
}
