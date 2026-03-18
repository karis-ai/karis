import { Command } from 'commander';
import { KarisClient } from '../core/client.js';
import { renderToolResult } from '../utils/formatter.js';
import { runCommand } from '../utils/run-command.js';

export function registerRedditCommand(program: Command): void {
  const reddit = program.command('reddit').description('Reddit search and data');

  reddit
    .command('search')
    .description('Search Reddit for posts')
    .argument('<query>', 'Search query')
    .option('--subreddit <name>', 'Limit to a subreddit (without r/)')
    .action(runCommand(async (query: string, options) => {
      const args: Record<string, unknown> = { query };
      if (options.subreddit) args.subreddit = options.subreddit;
      const client = await KarisClient.create();
      const result = await client.toolDirect('search_reddit', args);
      renderToolResult(result);
    }));

  reddit
    .command('posts')
    .description('Browse a subreddit by sort order')
    .argument('<subreddit>', 'Subreddit name (without r/)')
    .option('--sort <order>', 'hot | new | top | rising (default: hot)')
    .option('--time-filter <range>', 'For top: hour | day | week | month | year | all')
    .option('--limit <n>', 'Number of posts, 1-50 (default: 10)', parseInt)
    .action(runCommand(async (subreddit: string, options) => {
      const args: Record<string, unknown> = { subreddit };
      if (options.sort) args.sort = options.sort;
      if (options.timeFilter) args.time_filter = options.timeFilter;
      if (options.limit) args.limit = options.limit;
      const client = await KarisClient.create();
      const result = await client.toolDirect('get_reddit_posts', args);
      renderToolResult(result);
    }));

  reddit
    .command('comments')
    .description('Get the comment tree for a post')
    .argument('<post_id>', 'Reddit post ID')
    .option('--limit <n>', 'Max comments (default: 30)', parseInt)
    .action(runCommand(async (postId: string, options) => {
      const args: Record<string, unknown> = { post_id: postId };
      if (options.limit) args.limit = options.limit;
      const client = await KarisClient.create();
      const result = await client.toolDirect('get_reddit_comments', args);
      renderToolResult(result);
    }));

  reddit
    .command('rules')
    .description('Get a subreddit\'s posting rules')
    .argument('<subreddit>', 'Subreddit name (without r/)')
    .action(runCommand(async (subreddit: string) => {
      const client = await KarisClient.create();
      const result = await client.toolDirect('get_subreddit_rules', { subreddit });
      renderToolResult(result);
    }));
}
