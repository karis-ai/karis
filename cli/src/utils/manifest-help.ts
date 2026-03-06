import type { Command } from 'commander';
import chalk from 'chalk';
import { getCommandManifest } from '../commands/manifest.js';

export function applyManifestHelp(command: Command, commandId: string): Command {
  const manifest = getCommandManifest(commandId);
  if (!manifest) {
    return command;
  }

  command.addHelpText('after', () => {
    const lines: string[] = [];

    lines.push('');
    lines.push(chalk.bold('Manifest'));
    lines.push(`  id: ${manifest.id}`);
    lines.push(`  output: ${manifest.output}`);
    lines.push(`  requires auth: ${manifest.requiresAuth ? 'yes' : 'no'}`);
    lines.push(`  requires brand: ${manifest.requiresBrand ? 'yes' : 'no'}`);

    if (manifest.examples.length > 0) {
      lines.push('');
      lines.push(chalk.bold('Examples'));
      for (const example of manifest.examples) {
        lines.push(`  ${example.description}`);
        lines.push(`  ${example.command}`);
      }
    }

    return `\n${lines.join('\n')}\n`;
  });

  return command;
}
