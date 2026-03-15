import { Command } from 'commander';
import chalk from 'chalk';
import { getIndexEntry, loadIndex } from '../utils/index-cache.js';
import { isTextOutput } from '../core/cli-context.js';
import { printCommandResult, printCommandError } from '../utils/output.js';
import { runCommand } from '../utils/run-command.js';

export function registerShowCommand(program: Command): void {
  program
    .command('show')
    .description('Show details for an item from the last list')
    .argument('<index>', 'Index number from the last list output')
    .action(runCommand(async (indexStr: string) => {
      const index = parseInt(indexStr, 10);

      if (isNaN(index) || index < 1) {
        printCommandError(new Error('Index must be a positive number'), {
          command: 'show',
        });
      }

      const entry = await getIndexEntry(index);

      if (!entry) {
        const all = await loadIndex();
        if (all.length === 0) {
          printCommandError(new Error('No index cache found. Run a list command first (e.g. `npx karis brand list`).'), {
            command: 'show',
          });
        } else {
          printCommandError(new Error(`Index ${index} out of range. Last list had ${all.length} item(s).`), {
            command: 'show',
          });
        }
      }

      if (isTextOutput()) {
        console.log();
        console.log(chalk.bold(`[${index}] ${entry!.label}`));
        console.log();
        for (const [key, value] of Object.entries(entry!)) {
          if (key === 'label') continue;
          console.log(`  ${chalk.dim(key + ':')} ${value}`);
        }
        console.log();
      }

      printCommandResult(entry, { command: 'show' });
    }));
}
