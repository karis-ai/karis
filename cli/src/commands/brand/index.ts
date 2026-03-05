import { Command } from 'commander';
import { runBrandInit } from './init.js';
import { runBrandShow } from './show.js';
import { runBrandEdit } from './edit.js';
import { runCompetitorAdd, runCompetitorRemove } from './competitor.js';

export function registerBrandCommands(program: Command): void {
  const brand = program
    .command('brand')
    .description('Manage your brand profile (.karis/brand.json)');

  brand
    .command('init')
    .description('Interactive brand profile setup')
    .option('-d, --domain <domain>', 'Auto-detect from domain')
    .action(runBrandInit);

  brand
    .command('show')
    .description('Display current brand profile')
    .action(runBrandShow);

  brand
    .command('edit [field]')
    .description('Edit a specific field or full profile')
    .action(runBrandEdit);

  const competitor = brand
    .command('competitor')
    .description('Manage competitors');

  competitor
    .command('add <name:domain>')
    .description('Add a competitor (e.g. "Linear:linear.app")')
    .action(runCompetitorAdd);

  competitor
    .command('remove <name>')
    .description('Remove a competitor by name')
    .action(runCompetitorRemove);
}
