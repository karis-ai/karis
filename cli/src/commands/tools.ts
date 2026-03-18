import { Command } from 'commander';
import chalk from 'chalk';
import { KarisClient } from '../core/client.js';
import { isTextOutput } from '../core/cli-context.js';
import { printCommandResult } from '../utils/output.js';
import { runCommand } from '../utils/run-command.js';

interface ToolEntry {
  cli: string;
  description: string;
}

interface NamespaceGroup {
  label: string;
  tools: ToolEntry[];
}

const TOOL_GROUPS: NamespaceGroup[] = [
  {
    label: 'Web',
    tools: [
      { cli: 'karis web search <query>', description: 'Search the web' },
      { cli: 'karis web read <url> [--focus <kw>]', description: 'Read a webpage' },
    ],
  },
  {
    label: 'X / Twitter',
    tools: [
      { cli: 'karis x search <query>', description: 'Search X posts' },
      { cli: 'karis x tweets <username>', description: "Get user's tweets" },
    ],
  },
  {
    label: 'Reddit',
    tools: [
      { cli: 'karis reddit search <query>', description: 'Search Reddit' },
      { cli: 'karis reddit posts <subreddit>', description: 'Browse subreddit' },
      { cli: 'karis reddit comments <post_id>', description: 'Get comment tree' },
      { cli: 'karis reddit rules <subreddit>', description: 'Get subreddit rules' },
    ],
  },
  {
    label: 'YouTube',
    tools: [
      { cli: 'karis youtube search <query>', description: 'Search YouTube' },
    ],
  },
  {
    label: 'Brand & GEO',
    tools: [
      { cli: 'karis brand info', description: 'Brand profile' },
      { cli: 'karis geo data --domain <domain>', description: 'GEO visibility' },
    ],
  },
  {
    label: 'Utility',
    tools: [
      { cli: 'karis schedule list', description: 'List scheduled tasks' },
      { cli: 'karis memory recall [query]', description: 'Search saved facts' },
    ],
  },
];

const PUBLIC_SKILLS = new Set([
  'ab-test-setup',
  'aeo-geo',
  'analytics-tracking',
  'brand-intel',
  'competitor-alternatives',
  'content-strategy',
  'copy-editing',
  'copywriting',
  'deep-research',
  'elonmusk-repost',
  'email-sequence',
  'find-influencer',
  'find-opportunity',
  'form-cro',
  'free-tool-strategy',
  'launch-strategy',
  'marketing-ideas',
  'marketing-psychology',
  'onboarding-cro',
  'page-cro',
  'page-seo',
  'paid-ads',
  'paywall-upgrade-cro',
  'popup-cro',
  'pricing-strategy',
  'programmatic-seo',
  'reddit-growth',
  'reddit-listening',
  'referral-program',
  'schema-markup',
  'seo-article',
  'seo-audit',
  'signup-flow-cro',
  'social-content-repurpose',
  'social-content-strategy',
  'social-signal',
  'youtube-insights',
]);

export function registerToolsCommand(program: Command): void {
  const tools = program.command('tools').description('Discover available tools and skills');

  tools
    .command('list')
    .description('List available tools and skills')
    .option('--tools-only', 'Show only tools')
    .option('--skills-only', 'Show only skills')
    .option('--all', 'Include internal/builder skills')
    .action(runCommand(async (options: { toolsOnly?: boolean; skillsOnly?: boolean; all?: boolean }) => {
      const client = await KarisClient.create();
      const result = await client.listTools();

      const skills = options.all
        ? result.data.skills
        : result.data.skills.filter((s: { slug: string }) => PUBLIC_SKILLS.has(s.slug));

      if (isTextOutput()) {
        if (!options.skillsOnly) {
          console.log();
          console.log(chalk.bold.underline('Tools (Layer 1)'));

          for (const group of TOOL_GROUPS) {
            console.log();
            console.log(chalk.bold(`  ${group.label}`));
            for (const t of group.tools) {
              console.log(`    ${chalk.cyan(t.cli.padEnd(42))} ${chalk.dim(t.description)}`);
            }
          }

          console.log();
          console.log(chalk.dim(`  ${result.data.tools.length} tools available`));
        }

        if (!options.toolsOnly) {
          console.log();
          console.log(chalk.bold.underline('Skills (Layer 2 — use via karis chat --skill <name>)'));
          console.log();
          for (const s of skills) {
            const desc = s.description ? s.description.slice(0, 80) : '';
            console.log(`  ${chalk.cyan(s.slug.padEnd(28))} ${chalk.dim(desc)}`);
          }
          console.log();
          console.log(chalk.dim(`  ${skills.length} skills available`));
          if (!options.all && result.data.skills.length > skills.length) {
            console.log(chalk.dim(`  (${result.data.skills.length - skills.length} internal skills hidden — use --all to show)`));
          }
        }

        console.log();
      } else {
        printCommandResult({ ...result.data, skills });
      }
    }));
}
