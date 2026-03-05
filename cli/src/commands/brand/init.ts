import { Command } from 'commander';
import chalk from 'chalk';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { KarisClient } from '../../core/client.js';
import type { BrandProfile } from '../../core/client.js';
import { success, warning, section } from '../../utils/output.js';

async function ask(rl: readline.Interface, question: string, fallback?: string): Promise<string> {
  const suffix = fallback ? chalk.dim(` (${fallback})`) : '';
  const answer = (await rl.question(`  ${question}${suffix}: `)).trim();
  return answer || fallback || '';
}

async function askList(rl: readline.Interface, question: string, fallback?: string): Promise<string[]> {
  const raw = await ask(rl, question, fallback);
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function askCompetitors(rl: readline.Interface): Promise<Array<{ name: string; domain: string }>> {
  console.log(chalk.dim('  Enter competitors (name:domain), comma-separated.'));
  const raw = await ask(rl, 'Competitors', 'e.g. Linear:linear.app, Jira:atlassian.com/jira');
  if (!raw || raw.startsWith('e.g.')) return [];
  return raw.split(',').map((entry) => {
    const parts = entry.trim().split(':');
    const name = parts[0]?.trim() || '';
    const domain = parts.slice(1).join(':').trim() || '';
    return { name, domain };
  }).filter((c) => c.name);
}

export async function runBrandInit(options: { domain?: string }): Promise<void> {
  const client = await KarisClient.create();

  if (!client.hasApiKey()) {
    console.log();
    console.log(chalk.yellow('Karis API key required.'));
    console.log();
    console.log(chalk.dim(`  Set your key: ${chalk.cyan('npx karis config set api-key sk-ka-...')}`));
    console.log(chalk.dim(`  Get a key at: ${chalk.cyan('https://karis.im/settings/api-keys')}`));
    console.log();
    return;
  }

  // Check if brand already exists
  const existing = await client.getBrand();
  if (existing) {
    console.log(warning(`Brand profile already exists for ${chalk.bold(existing.name)}.`));
    const rl = readline.createInterface({ input, output });
    const overwrite = await ask(rl, 'Overwrite? (y/N)', 'N');
    if (overwrite.toLowerCase() !== 'y') {
      rl.close();
      return;
    }
    rl.close();
  }

  const rl = readline.createInterface({ input, output });

  section('Brand Profile Setup');
  console.log();

  const name = await ask(rl, 'Brand name');
  const domain = await ask(rl, 'Domain', options.domain || name.toLowerCase().replace(/\s+/g, '') + '.com');
  const category = await ask(rl, 'Category (e.g., "project management software")');
  const industries = await askList(rl, 'Industries (comma-separated)');
  const primaryAudience = await ask(rl, 'Primary audience');
  const secondaryAudience = await ask(rl, 'Secondary audience');
  const competitors = await askCompetitors(rl);
  const keywords = await askList(rl, 'Keywords (comma-separated)');
  const channels = await askList(rl, 'Channels (comma-separated)', 'blog, twitter, linkedin');
  const tone = await ask(rl, 'Brand tone', 'professional but approachable');

  rl.close();

  const profile: BrandProfile = {
    name,
    domain,
    category,
    industries,
    audience: { primary: primaryAudience, secondary: secondaryAudience },
    value_propositions: [],
    competitors,
    keywords,
    channels,
    tone,
  };

  console.log();
  console.log(chalk.dim('Creating brand profile on Karis Platform...'));

  try {
    await client.createBrand(profile);

    console.log();
    console.log(success(chalk.bold('Brand profile created.')));
    console.log();
    console.log(chalk.dim(`  View:   ${chalk.cyan('npx karis brand show')}`));
    console.log(chalk.dim(`  Next:   ${chalk.cyan('npx karis geo audit ' + domain)}`));
    console.log();
  } catch (error) {
    console.log();
    console.log(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    console.log();
  }
}
