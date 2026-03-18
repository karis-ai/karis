import { Command } from 'commander';
import { KarisClient } from '../core/client.js';
import { renderToolResult } from '../utils/formatter.js';
import { runCommand } from '../utils/run-command.js';

export function registerXCommand(program: Command): void {
  const x = program.command('x').description('X / Twitter search and data');

  x
    .command('search')
    .description('Search X for posts matching a query')
    .argument('<query>', 'Search query')
    .option('--max-results <n>', 'Max results (1-10, default 5)', parseInt)
    .action(runCommand(async (query: string, options) => {
      const args: Record<string, unknown> = { query };
      if (options.maxResults) args.max_results = options.maxResults;
      const client = await KarisClient.create();
      const result = await client.toolDirect('search_x', args);
      renderToolResult(result);
    }));

  x
    .command('tweets')
    .description('Get recent tweets from a user')
    .argument('<username>', 'Username (without @)')
    .action(runCommand(async (username: string) => {
      const client = await KarisClient.create();
      const result = await client.toolDirect('get_user_tweets', { username });
      renderToolResult(result);
    }));
}
