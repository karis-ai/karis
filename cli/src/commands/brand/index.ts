import { Command } from 'commander';
import { runBrandInit } from './init.js';
import { runBrandShow } from './show.js';
import { runBrandEdit } from './edit.js';
import { runCompetitorAdd, runCompetitorRemove } from './competitor.js';
import { runCommand } from '../../utils/run-command.js';
import { applyManifestHelp } from '../../utils/manifest-help.js';

export function registerBrandCommands(program: Command): void {
  const brand = program
    .command('brand')
    .description('Manage your brand profile on Karis Platform');

  applyManifestHelp(brand
    .command('init')
    .description('Interactive brand profile setup')
    .option('-d, --domain <domain>', 'Auto-detect from domain')
    .action(runCommand(runBrandInit)), 'brand.init');

  applyManifestHelp(brand
    .command('show')
    .description('Display current brand profile')
    .action(runCommand(runBrandShow)), 'brand.show');

  applyManifestHelp(brand
    .command('edit [field]')
    .description('Edit a specific field or full profile')
    .action(runCommand(runBrandEdit)), 'brand.edit');

  const competitor = brand
    .command('competitor')
    .description('Manage competitors');

  competitor
    .command('add <name:domain>')
    .description('Add a competitor (e.g. "Linear:linear.app")')
    .action(runCommand(runCompetitorAdd));

  competitor
    .command('remove <name>')
    .description('Remove a competitor by name')
    .action(runCommand(runCompetitorRemove));
}
