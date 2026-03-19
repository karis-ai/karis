import { Command } from 'commander';
import chalk from 'chalk';
import { KarisClient } from '../core/client.js';
import { isJsonOutput, isTextOutput, isYamlOutput } from '../core/cli-context.js';
import { printCommandResult } from '../utils/output.js';
import { runCommand } from '../utils/run-command.js';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Influencer {
  platform: string;
  username: string;
  fullName?: string;
  profileUrl?: string;
  followerCount?: number;
  engagementRate?: number;
  biography?: string;
}

interface SearchPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface SearchSessionData {
  sessionId: string;
  searchRecordId: string;
  influencers: Influencer[];
  pagination: SearchPagination;
  excludedCount: number;
}

interface SearchRecordItem {
  id: string;
  name: string;
  mode: string;
  platforms: string[];
  keywords?: string[];
  brandName?: string;
  resultCount?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatFollowers(n?: number): string {
  if (n == null) return '-';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function formatEngagement(rate?: number): string {
  if (rate == null) return '-';
  return `${(rate * 100).toFixed(2)}%`;
}

function renderInfluencers(data: SearchSessionData): void {
  if (!isTextOutput()) {
    printCommandResult({
      search_record_id: data.searchRecordId,
      session_id: data.sessionId,
      influencers: data.influencers,
      pagination: data.pagination,
      excluded_count: data.excludedCount,
    });
    return;
  }

  const { influencers, pagination, searchRecordId, sessionId, excludedCount } = data;
  const pct = pagination.total > 0 ? Math.round((influencers.length / pagination.total) * 100) : 0;

  console.log();
  console.log(
    chalk.bold(`Influencer Results`) +
      chalk.dim(
        ` — page ${pagination.page}/${pagination.totalPages} (${influencers.length} of ${pagination.total} results${excludedCount > 0 ? `, ${excludedCount} excluded` : ''})`
      )
  );
  console.log(chalk.dim(`Record: ${searchRecordId}  Session: ${sessionId}`));
  console.log();

  if (influencers.length === 0) {
    console.log(chalk.yellow('  No influencers found for this page.'));
    console.log();
    return;
  }

  // Column widths
  const COL = { num: 4, name: 28, platform: 12, followers: 10, er: 8, url: 0 };
  const header =
    chalk.dim('#'.padStart(COL.num)) +
    '  ' +
    chalk.bold('Name'.padEnd(COL.name)) +
    chalk.dim('Platform'.padEnd(COL.platform)) +
    chalk.dim('Followers'.padStart(COL.followers)) +
    '  ' +
    chalk.dim('ER'.padStart(COL.er)) +
    '  ' +
    chalk.dim('URL');
  console.log(header);
  console.log(chalk.dim('─'.repeat(90)));

  influencers.forEach((inf, i) => {
    const num = chalk.dim(String((pagination.page - 1) * pagination.pageSize + i + 1).padStart(COL.num));
    const name = (inf.fullName || inf.username).slice(0, COL.name - 1).padEnd(COL.name);
    const platform = chalk.dim(inf.platform.padEnd(COL.platform));
    const followers = chalk.cyan(formatFollowers(inf.followerCount).padStart(COL.followers));
    const er = chalk.green(formatEngagement(inf.engagementRate).padStart(COL.er));
    const url = inf.profileUrl ? chalk.dim(inf.profileUrl) : chalk.dim(`@${inf.username}`);
    console.log(`${num}  ${name}${platform}${followers}  ${er}  ${url}`);
  });

  console.log();
  if (pagination.page < pagination.totalPages) {
    console.log(
      chalk.dim(
        `  Next page: karis influencer results --record-id ${searchRecordId} --session-id ${sessionId} --page ${pagination.page + 1}`
      )
    );
  }
  console.log();
}

async function apiPost<T>(client: KarisClient, path: string, body: unknown): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseUrl = (client as any).apiUrl as string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiKey = (client as any).apiKey as string;
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let msg = '';
    try {
      const j = (await res.json()) as { message?: string };
      msg = j.message || '';
    } catch { /* empty */ }
    throw new Error(`API error ${res.status}${msg ? ': ' + msg : ''}`);
  }
  const j = (await res.json()) as { data?: T };
  return j.data as T;
}

async function apiGet<T>(client: KarisClient, path: string): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseUrl = (client as any).apiUrl as string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiKey = (client as any).apiKey as string;
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    let msg = '';
    try {
      const j = (await res.json()) as { message?: string };
      msg = j.message || '';
    } catch { /* empty */ }
    throw new Error(`API error ${res.status}${msg ? ': ' + msg : ''}`);
  }
  const j = (await res.json()) as { data?: T };
  return j.data as T;
}

// ─── Command ──────────────────────────────────────────────────────────────────

export function registerInfluencerCommand(program: Command): void {
  const inf = program.command('influencer').description('Find and browse influencers');

  // ── search ──────────────────────────────────────────────────────────────────
  inf
    .command('search')
    .description('Search for influencers by keyword')
    .option('-k, --keywords <kw>', 'Comma-separated keywords, e.g. "fitness,workout"')
    .option(
      '-p, --platform <platform>',
      'Platform: instagram | tiktok | youtube | twitter (default: instagram)'
    )
    .option('--min-followers <n>', 'Minimum follower count', parseInt)
    .option('--max-followers <n>', 'Maximum follower count', parseInt)
    .option('--min-engagement <rate>', 'Minimum engagement rate 0-1, e.g. 0.03 for 3%', parseFloat)
    .option('--location <cc>', 'Comma-separated country codes, e.g. "US,GB"')
    .option('--language <lang>', 'Language code, e.g. en')
    .option('--count <n>', 'Number of results per page (default: 20)', parseInt)
    .action(
      runCommand(async (options) => {
        const platform = options.platform || 'instagram';
        const keywords: string[] = options.keywords
          ? options.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
          : [];

        if (keywords.length === 0) {
          throw new Error('--keywords is required. Example: --keywords "fitness,workout"');
        }

        const platformsConfig: Record<string, unknown>[] = [{ platform, matchingMode: 'has' }];
        const body: Record<string, unknown> = {
          mode: 'keyword',
          platformsConfig,
          keywords,
        };

        if (options.minFollowers != null || options.maxFollowers != null) {
          body.followerRange = {
            ...(options.minFollowers != null && { min: options.minFollowers }),
            ...(options.maxFollowers != null && { max: options.maxFollowers }),
          };
        }
        if (options.minEngagement != null) body.minEngagementRate = options.minEngagement;
        if (options.location) body.locations = options.location.split(',').map((c: string) => c.trim());
        if (options.language) body.language = options.language;
        if (options.count != null) body.pageSize = options.count;

        if (isTextOutput()) {
          process.stdout.write(chalk.dim(`  Searching ${platform} for "${keywords.join(', ')}"...`));
        }

        const client = await KarisClient.create();
        const data = await apiPost<SearchSessionData>(
          client,
          '/api/influencer/search-records',
          body
        );

        if (isTextOutput()) {
          process.stdout.write('\r\x1b[2K');
        }

        renderInfluencers(data);
      })
    );

  // ── results ─────────────────────────────────────────────────────────────────
  inf
    .command('results')
    .description('Browse a page of results from an existing search record')
    .requiredOption('--record-id <id>', 'Search record ID (from a previous search)')
    .option('--session-id <id>', 'Session ID for pagination (required for page > 1)')
    .option('--page <n>', 'Page number (default: 1)', parseInt)
    .option('--count <n>', 'Results per page (default: 20)', parseInt)
    .action(
      runCommand(async (options) => {
        const client = await KarisClient.create();
        const page = options.page ?? 1;

        if (page === 1) {
          // restore: creates a new session and returns page 1
          const data = await apiPost<SearchSessionData>(
            client,
            `/api/influencer/search-records/${options.recordId}/restore`,
            { pageSize: options.count ?? 20 }
          );
          renderInfluencers(data);
        } else {
          if (!options.sessionId) {
            throw new Error(
              '--session-id is required for page > 1. Run page 1 first to get a session ID.'
            );
          }
          const data = await apiPost<SearchSessionData>(
            client,
            `/api/influencer/search-records/${options.recordId}/page`,
            {
              sessionId: options.sessionId,
              page,
              pageSize: options.count ?? 20,
            }
          );
          renderInfluencers(data);
        }
      })
    );

  // ── list ─────────────────────────────────────────────────────────────────────
  inf
    .command('list')
    .description('List your recent influencer searches')
    .option('--limit <n>', 'Number of records to show (default: 10)', parseInt)
    .action(
      runCommand(async (options) => {
        const limit = options.limit ?? 10;
        const client = await KarisClient.create();
        const data = await apiGet<{ items: SearchRecordItem[]; total: number }>(
          client,
          `/api/influencer/search-records?page=1&pageSize=${limit}`
        );
        const items = data?.items ?? (data as unknown as SearchRecordItem[]) ?? [];

        if (!isTextOutput()) {
          printCommandResult({ records: items, total: data?.total ?? items.length });
          return;
        }

        console.log();
        if (items.length === 0) {
          console.log(chalk.dim('  No searches yet. Run: karis influencer search --keywords ...'));
          console.log();
          return;
        }

        console.log(chalk.bold(`Recent Searches`) + chalk.dim(` (${items.length} shown)`));
        console.log();
        const COL = { id: 38, name: 30, platform: 14, count: 8 };
        console.log(
          chalk.dim('Record ID'.padEnd(COL.id)) +
            chalk.bold('Name'.padEnd(COL.name)) +
            chalk.dim('Platform'.padEnd(COL.platform)) +
            chalk.dim('Results'.padStart(COL.count))
        );
        console.log(chalk.dim('─'.repeat(95)));

        for (const rec of items) {
          const id = chalk.dim(rec.id.padEnd(COL.id));
          const name = rec.name.slice(0, COL.name - 1).padEnd(COL.name);
          const platform = chalk.dim((rec.platforms ?? []).join(',').padEnd(COL.platform));
          const count = chalk.cyan(
            rec.resultCount != null ? String(rec.resultCount).padStart(COL.count) : '-'.padStart(COL.count)
          );
          console.log(`${id}${name}${platform}${count}`);
        }
        console.log();
        console.log(
          chalk.dim('  Tip: karis influencer results --record-id <id>  to browse results')
        );
        console.log();
      })
    );
}
