import { Command } from 'commander';
import chalk from 'chalk';
import { KarisClient } from '../core/client.js';
import { isTextOutput } from '../core/cli-context.js';
import { printCommandResult } from '../utils/output.js';
import { runCommand } from '../utils/run-command.js';

export function registerToolsCommand(program: Command): void {
  const tools = program.command('tools').description('Discover available tools and skills');

  tools
    .command('list')
    .description('List available tools and skills')
    .option('--tools-only', 'Show only tools')
    .option('--skills-only', 'Show only skills')
    .action(runCommand(async (options: { toolsOnly?: boolean; skillsOnly?: boolean }) => {
      const client = await KarisClient.create();
      const result = await client.listTools();

      if (isTextOutput()) {
        if (!options.skillsOnly) {
          console.log();
          console.log(chalk.bold.underline('Tools (Layer 1: Tool Runtime)'));
          console.log();
          for (const t of result.data.tools) {
            const desc = t.description ? t.description.slice(0, 80) : '';
            console.log(`  ${chalk.cyan(t.name.padEnd(28))} ${chalk.dim(desc)}`);
          }
          console.log();
          console.log(chalk.dim(`  ${result.data.tools.length} tools available`));
        }

        if (!options.toolsOnly) {
          console.log();
          console.log(chalk.bold.underline('Skills (Layer 2: Domain)'));
          console.log();
          for (const s of result.data.skills) {
            const desc = s.description ? s.description.slice(0, 80) : '';
            console.log(`  ${chalk.cyan(s.slug.padEnd(28))} ${chalk.dim(desc)}`);
          }
          console.log();
          console.log(chalk.dim(`  ${result.data.skills.length} skills available`));
        }

        console.log();
      } else {
        printCommandResult(result.data);
      }
    }));
}
