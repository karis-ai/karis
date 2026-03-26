import { Command } from 'commander';
import { KarisClient } from '../core/client.js';
import { renderToolResult } from '../utils/formatter.js';
import { ensureConfirmed, renderActionResult, renderFollowResult } from '../utils/browser-action-output.js';
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

  x
    .command('post')
    .description('Post to X/Twitter through the browser relay')
    .argument('<text>', 'Tweet text')
    .option('--social-account-id <id>', 'Optional Karis Social account ID')
    .option('--signal-id <id>', 'Optional related signal ID')
    .option('--confirm', 'Confirm that you want to post')
    .action(runCommand(async (
      text: string,
      options: {
        socialAccountId?: string;
        signalId?: string;
        confirm?: boolean;
      },
    ) => {
      ensureConfirmed(options.confirm, 'post to X');
      const client = await KarisClient.create();
      const result = await client.postToX({
        text,
        social_account_id: options.socialAccountId,
        signal_id: options.signalId,
      });
      renderActionResult('X post completed', result, {
        preferredKeys: ['message', 'external_post_url', 'url', 'toast', 'text'],
        failureMessage: 'Failed to post to X.',
      });
    }));

  x
    .command('reply')
    .description('Reply to a tweet on X/Twitter through the browser relay')
    .requiredOption('--url <tweetUrl>', 'Full tweet URL')
    .option('--social-account-id <id>', 'Optional Karis Social account ID')
    .option('--signal-id <id>', 'Optional related signal ID')
    .option('--confirm', 'Confirm that you want to reply')
    .argument('<text>', 'Reply text')
    .action(runCommand(async (
      text: string,
      options: {
        url: string;
        socialAccountId?: string;
        signalId?: string;
        confirm?: boolean;
      },
    ) => {
      ensureConfirmed(options.confirm, 'reply on X');
      const client = await KarisClient.create();
      const result = await client.replyToX({
        tweet_url: options.url,
        text,
        social_account_id: options.socialAccountId,
        signal_id: options.signalId,
      });
      renderActionResult('X reply completed', result, {
        preferredKeys: ['message', 'external_post_url', 'url', 'tweet_url', 'toast', 'text'],
        failureMessage: 'Failed to reply on X.',
      });
    }));

  x
    .command('follow')
    .description('Follow one or more X/Twitter profiles through the browser relay')
    .argument('<profiles...>', 'Username(s), @handle(s), or full profile URL(s)')
    .option('--confirm', 'Confirm that you want to follow the profile(s)')
    .action(runCommand(async (profiles: string[], options: { confirm?: boolean }) => {
      ensureConfirmed(options.confirm, 'follow on X');
      const client = await KarisClient.create();
      const result = await client.followOnX(
        profiles.length === 1 ? { profile: profiles[0] } : { profiles },
      );
      renderFollowResult('X follow completed', result, {
        failureMessage: 'Failed to follow on X.',
      });
    }));
}
