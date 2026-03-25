import { Command } from 'commander';
import chalk from 'chalk';
import { KarisClient } from '../core/client.js';
import { isStructuredOutput, isTextOutput } from '../core/cli-context.js';
import { createInvalidArgumentError } from '../core/errors.js';
import { renderToolResult } from '../utils/formatter.js';
import { printCommandResult, success } from '../utils/output.js';
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
      renderActionResult('X post completed', result, [
        'message',
        'external_post_url',
        'url',
        'toast',
        'text',
      ]);
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
      renderActionResult('X reply completed', result, [
        'message',
        'external_post_url',
        'url',
        'tweet_url',
        'toast',
        'text',
      ]);
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
      renderFollowResult(result);
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

function renderFollowResult(result: Record<string, unknown>): void {
  if (isStructuredOutput()) {
    printCommandResult(result);
    return;
  }

  const results = Array.isArray(result.results)
    ? result.results.filter(
      (item): item is Record<string, unknown> => typeof item === 'object' && item !== null,
    )
    : [];

  if (results.length === 0) {
    renderActionResult('X follow completed', result);
    return;
  }

  console.log();
  console.log(success('X follow completed'));
  console.log();
  console.log(`${chalk.bold('Total')}: ${formatValue(result.total)}`);
  console.log(`${chalk.bold('Succeeded')}: ${formatValue(result.succeeded)}`);
  console.log(`${chalk.bold('Failed')}: ${formatValue(result.failed)}`);
  console.log(`${chalk.bold('Message')}: ${formatValue(result.message)}`);
  console.log();

  for (const item of results) {
    const profile = formatValue(item.profile);
    const state = item.success ? 'ok' : 'failed';
    const detail = formatValue(item.message || item.error || '');
    console.log(`- ${profile}: ${state}${detail ? ` (${detail})` : ''}`);
  }

  console.log();
}
