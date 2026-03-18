import { Command } from 'commander';
import { KarisClient } from '../core/client.js';
import { renderToolResult } from '../utils/formatter.js';
import { runCommand } from '../utils/run-command.js';

export function registerMemoryCommand(program: Command): void {
  const memory = program.command('memory').description('Agent memory (saved facts)');

  memory
    .command('recall')
    .description('Search or browse saved facts')
    .argument('[query]', 'Optional keyword search')
    .action(runCommand(async (query?: string) => {
      const args: Record<string, unknown> = {};
      if (query) args.query = query;
      const client = await KarisClient.create();
      const result = await client.toolDirect('memory_recall', args);
      renderToolResult(result);
    }));
}
