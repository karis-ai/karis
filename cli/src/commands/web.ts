import { Command } from 'commander';
import { KarisClient } from '../core/client.js';
import { renderToolResult } from '../utils/formatter.js';
import { runCommand } from '../utils/run-command.js';

export function registerWebCommand(program: Command): void {
  const web = program.command('web').description('Web search and page reading');

  web
    .command('search')
    .description('Search the web for current information')
    .argument('<query>', 'Search query')
    .action(runCommand(async (query: string) => {
      const client = await KarisClient.create();
      const result = await client.toolDirect('search_web', { query });
      renderToolResult(result);
    }));

  web
    .command('read')
    .description('Fetch and extract text from a URL')
    .argument('<url>', 'URL to read')
    .option('--focus <keyword>', 'Extract only sections relevant to keyword')
    .action(runCommand(async (url: string, options) => {
      const args: Record<string, unknown> = { url };
      if (options.focus) args.focus = options.focus;
      const client = await KarisClient.create();
      const result = await client.toolDirect('read_webpage', args);
      renderToolResult(result);
    }));
}
