import { Command } from 'commander';
import { registerAuditCommand } from './audit.js';
import { registerPromptsCommand } from './prompts.js';
import { registerOptimizeCommand } from './optimize.js';

export function registerGeoCommands(program: Command): void {
  const geo = program
    .command('geo')
    .description('GEO optimization — measure and improve AI search visibility');

  registerAuditCommand(geo);
  registerPromptsCommand(geo);
  registerOptimizeCommand(geo);
}
