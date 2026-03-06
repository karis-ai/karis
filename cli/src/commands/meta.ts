import { Command } from 'commander';
import chalk from 'chalk';
import { getCommandManifest, listCommandManifests } from './manifest.js';
import { createInvalidArgumentError } from '../core/errors.js';
import { printCommandResult } from '../utils/output.js';
import { runCommand } from '../utils/run-command.js';
import { isTextOutput } from '../core/cli-context.js';

export function registerMetaCommands(program: Command): void {
  program
    .command('schema <command-id>')
    .description('Show machine-readable command metadata')
    .action(runCommand(async (commandId: string) => {
      const manifest = requireManifest(commandId);
      if (isTextOutput()) {
        printSchemaText(manifest);
      }
      printCommandResult(manifest);
    }));

  program
    .command('explain <command-id>')
    .description('Explain what a command does and when to use it')
    .action(runCommand(async (commandId: string) => {
      const manifest = requireManifest(commandId);
      if (isTextOutput()) {
        printExplainText(manifest);
      }
      printCommandResult({
        id: manifest.id,
        summary: manifest.summary,
        description: manifest.description,
        requires_auth: manifest.requiresAuth ?? false,
        requires_brand: manifest.requiresBrand ?? false,
        output: manifest.output,
      });
    }));

  program
    .command('examples [command-id]')
    .description('Show command examples')
    .action(runCommand(async (commandId?: string) => {
      if (commandId) {
        const manifest = requireManifest(commandId);
        if (isTextOutput()) {
          printExamplesText([manifest]);
        }
        printCommandResult({
          commands: [manifest],
        });
        return;
      }

      const manifests = listCommandManifests();
      if (isTextOutput()) {
        printExamplesText(manifests);
      }
      printCommandResult({
        commands: manifests,
      });
    }));
}

function requireManifest(commandId: string) {
  const manifest = getCommandManifest(commandId);
  if (!manifest) {
    throw createInvalidArgumentError(`Unknown command id: ${commandId}`, [
      'Run `npx karis examples` to see available command examples',
    ]);
  }
  return manifest;
}

function printSchemaText(manifest: ReturnType<typeof requireManifest>): void {
  console.log();
  console.log(chalk.bold(`Schema — ${manifest.id}`));
  console.log();
  console.log(JSON.stringify(manifest, null, 2));
  console.log();
}

function printExplainText(manifest: ReturnType<typeof requireManifest>): void {
  console.log();
  console.log(chalk.bold(manifest.id));
  console.log(chalk.dim(manifest.summary));
  console.log();
  console.log(manifest.description);
  console.log();
  console.log(chalk.dim(`Output: ${manifest.output}`));
  console.log(chalk.dim(`Requires auth: ${manifest.requiresAuth ? 'yes' : 'no'}`));
  console.log(chalk.dim(`Requires brand: ${manifest.requiresBrand ? 'yes' : 'no'}`));
  console.log();
}

function printExamplesText(manifests: ReturnType<typeof listCommandManifests>): void {
  console.log();
  console.log(chalk.bold('Karis CLI Examples'));
  console.log(chalk.dim('────────────────────────────────────────'));
  console.log();

  for (const manifest of manifests) {
    console.log(chalk.bold(manifest.id));
    for (const example of manifest.examples) {
      console.log(`  ${chalk.dim(example.description)}`);
      console.log(`  ${chalk.cyan(example.command)}`);
    }
    console.log();
  }
}
