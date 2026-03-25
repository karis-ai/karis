import { Command } from 'commander';
import chalk from 'chalk';
import { KarisClient } from '../core/client.js';
import { isStructuredOutput, isTextOutput } from '../core/cli-context.js';
import { createInvalidArgumentError } from '../core/errors.js';
import { renderToolResult } from '../utils/formatter.js';
import { printCommandResult, success } from '../utils/output.js';
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

  reddit
    .command('post')
    .description('Create a Reddit text post through the browser relay')
    .requiredOption('--subreddit <name>', 'Subreddit name without r/')
    .requiredOption('--title <text>', 'Post title')
    .option('--body <text>', 'Optional post body')
    .option('--confirm', 'Confirm that you want to post to Reddit')
    .action(runCommand(async (options: {
      subreddit: string;
      title: string;
      body?: string;
      confirm?: boolean;
    }) => {
      ensureConfirmed(options.confirm, 'post to Reddit');
      const client = await KarisClient.create();
      const result = await client.postToReddit({
        subreddit: options.subreddit,
        title: options.title,
        body: options.body,
      });
      renderActionResult('Reddit post completed', result, [
        'message',
        'post_url',
        'subreddit',
        'title',
      ]);
    }));

  reddit
    .command('comment')
    .description('Comment on a Reddit post through the browser relay')
    .requiredOption('--url <postUrl>', 'Full Reddit post URL')
    .option('--confirm', 'Confirm that you want to comment on Reddit')
    .argument('<text>', 'Comment text')
    .action(runCommand(async (
      text: string,
      options: { url: string; confirm?: boolean },
    ) => {
      ensureConfirmed(options.confirm, 'comment on Reddit');
      const client = await KarisClient.create();
      const result = await client.commentOnReddit({
        post_url: options.url,
        text,
      });
      renderActionResult('Reddit comment completed', result, [
        'message',
        'post_url',
        'text',
      ]);
    }));
}

function ensureConfirmed(confirmed: boolean | undefined, actionDescription: string): void {
  if (confirmed) return;
  throw createInvalidArgumentError(`Refusing to ${actionDescription} without --confirm.`, [
    'Re-run the command with `--confirm` if you want to execute this browser action.',
  ]);
}

function formatValue(value: unknown): string {
  if (value == null) return '(none)';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function renderActionResult(title: string, result: Record<string, unknown>, preferredKeys: string[] = []): void {
  if (isStructuredOutput()) {
    printCommandResult(result);
    return;
  }

  const printed = new Set<string>();
  if (isTextOutput()) {
    console.log();
    console.log(success(title));
    console.log();
  }

  for (const key of preferredKeys) {
    if (!(key in result) || key === 'success') continue;
    printed.add(key);
    console.log(`${chalk.bold(humanizeKey(key))}: ${formatValue(result[key])}`);
  }

  for (const key of Object.keys(result)) {
    if (key === 'success' || printed.has(key)) continue;
    console.log(`${chalk.bold(humanizeKey(key))}: ${formatValue(result[key])}`);
  }

  console.log();
}
