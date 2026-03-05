import { Command } from 'commander';
import { registerDiscoverCommand } from './discover.js';
import { registerClustersCommand } from './clusters.js';
import { registerResultCommand } from './result.js';

export function registerContentCommands(program: Command): void {
  const content = program
    .command('content')
    .description('Content strategy — discover opportunities and plan topics');

  registerDiscoverCommand(content);
  registerClustersCommand(content);
  registerResultCommand(content);
}
