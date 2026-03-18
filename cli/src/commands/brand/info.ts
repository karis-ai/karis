import { Command } from 'commander';
import { KarisClient } from '../../core/client.js';
import { renderToolResult } from '../../utils/formatter.js';
import { runCommand } from '../../utils/run-command.js';

export function registerBrandInfoCommand(program: Command): void {
  program
    .command('info')
    .description('Get brand info via agent tool (Layer 1)')
    .action(runCommand(async () => {
      const client = await KarisClient.create();
      const result = await client.toolDirect('get_brand_info', {});
      renderToolResult(result);
    }));
}
