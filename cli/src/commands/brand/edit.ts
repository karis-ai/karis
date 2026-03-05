import chalk from 'chalk';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { KarisClient } from '../../core/client.js';
import type { BrandProfile } from '../../core/client.js';
import { success } from '../../utils/output.js';

async function ask(rl: readline.Interface, question: string, current?: string): Promise<string> {
  const suffix = current ? chalk.dim(` (current: ${current})`) : '';
  const answer = (await rl.question(`  ${question}${suffix}: `)).trim();
  return answer || current || '';
}

async function askList(rl: readline.Interface, question: string, current?: string[]): Promise<string[]> {
  const currentStr = current?.join(', ');
  const raw = await ask(rl, question, currentStr);
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function runBrandEdit(field?: string): Promise<void> {
  const client = await KarisClient.create();

  if (!client.hasApiKey()) {
    console.log();
    console.log(chalk.yellow('Karis API key required.'));
    console.log();
    console.log(chalk.dim(`  Set your key: ${chalk.cyan('npx karis config set api-key sk-ka-...')}`));
    console.log();
    return;
  }

  try {
    const profile = await client.getBrand();

    if (!profile) {
      console.log();
      console.log(chalk.yellow('No brand profile found.'));
      console.log();
      console.log(chalk.dim(`  Create one: ${chalk.cyan('npx karis brand init')}`));
      console.log();
      return;
    }

    const rl = readline.createInterface({ input, output });

    console.log();
    console.log(chalk.bold(`Editing Brand Profile — ${profile.name}`));
    console.log();

    let updated: Partial<BrandProfile> = {};

    // Edit specific field
    if (field) {
      switch (field) {
        case 'name':
          updated.name = await ask(rl, 'Brand name', profile.name);
          break;
        case 'domain':
          updated.domain = await ask(rl, 'Domain', profile.domain);
          break;
        case 'category':
          updated.category = await ask(rl, 'Category', profile.category);
          break;
        case 'industries':
          updated.industries = await askList(rl, 'Industries (comma-separated)', profile.industries);
          break;
        case 'audience':
        case 'audience.primary':
          updated.audience = { ...profile.audience, primary: await ask(rl, 'Primary audience', profile.audience.primary) };
          break;
        case 'audience.secondary':
          updated.audience = { ...profile.audience, secondary: await ask(rl, 'Secondary audience', profile.audience.secondary) };
          break;
        case 'keywords':
          updated.keywords = await askList(rl, 'Keywords (comma-separated)', profile.keywords);
          break;
        case 'channels':
          updated.channels = await askList(rl, 'Channels (comma-separated)', profile.channels);
          break;
        case 'tone':
          updated.tone = await ask(rl, 'Brand tone', profile.tone);
          break;
        default:
          console.log(chalk.yellow(`Unknown field: ${field}`));
          console.log();
          console.log(chalk.dim('Available fields:'));
          console.log(chalk.dim('  name, domain, category, industries, audience, keywords, channels, tone'));
          console.log();
          rl.close();
          return;
      }
    } else {
      // Edit all fields
      updated = {
        name: await ask(rl, 'Brand name', profile.name),
        domain: await ask(rl, 'Domain', profile.domain),
        category: await ask(rl, 'Category', profile.category),
        industries: await askList(rl, 'Industries (comma-separated)', profile.industries),
        audience: {
          primary: await ask(rl, 'Primary audience', profile.audience.primary),
          secondary: await ask(rl, 'Secondary audience', profile.audience.secondary),
        },
        keywords: await askList(rl, 'Keywords (comma-separated)', profile.keywords),
        channels: await askList(rl, 'Channels (comma-separated)', profile.channels),
        tone: await ask(rl, 'Brand tone', profile.tone),
      };
    }

    rl.close();

    console.log();
    console.log(chalk.dim('Updating brand profile on Karis Platform...'));

    await client.updateBrand(updated);

    console.log();
    console.log(success('Brand profile updated.'));
    console.log();
    console.log(chalk.dim(`  View: ${chalk.cyan('npx karis brand show')}`));
    console.log();
  } catch (error) {
    console.log();
    console.log(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    console.log();
  }
}
