import { Command } from 'commander';
import { KarisClient } from '../core/client.js';
import { renderToolResult } from '../utils/formatter.js';
import { runCommand } from '../utils/run-command.js';

export function registerYoutubeCommand(program: Command): void {
  const yt = program.command('youtube').description('YouTube search');

  yt
    .command('search')
    .description('Search YouTube for videos')
    .argument('<query>', 'Search query')
    .action(runCommand(async (query: string) => {
      const client = await KarisClient.create();
      const result = await client.toolDirect('search_youtube', { query });
      renderToolResult(result);
    }));
}
