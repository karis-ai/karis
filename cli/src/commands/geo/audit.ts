import { Command } from 'commander';
import chalk from 'chalk';
import { executeSingleTurn } from '../../utils/agent-helper.js';
import { isTextOutput } from '../../core/cli-context.js';
import { runCommand } from '../../utils/run-command.js';
import { applyManifestHelp } from '../../utils/manifest-help.js';

export function registerAuditCommand(program: Command): void {
  applyManifestHelp(program
    .command('audit [domain]')
    .description('Run professional GEO audit via Karis Platform')
    .action(runCommand(async (domain?: string) => {
      const prompt = domain
        ? `Run a GEO audit for ${domain} to measure AI search visibility`
        : 'Run a GEO audit to measure my brand visibility in AI search engines';

      if (isTextOutput()) {
        console.log(chalk.bold('Running professional GEO audit...\n'));
      }
      await executeSingleTurn(prompt);
    })), 'geo.audit');
}
