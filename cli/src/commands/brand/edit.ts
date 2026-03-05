import chalk from 'chalk';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { KarisClient, BrandCustomizations } from '../../core/client.js';
import { success } from '../../utils/output.js';
import ora from 'ora';

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

async function askCompetitors(rl: readline.Interface, current?: Array<{ name: string; domain: string }>): Promise<Array<{ name: string; domain: string }>> {
  const currentStr = current?.map(c => `${c.name}:${c.domain}`).join(', ');
  console.log(chalk.dim('  Enter competitors (name:domain), comma-separated.'));
  const raw = await ask(rl, 'Competitors', currentStr);
  if (!raw) return current || [];
  return raw.split(',').map((entry) => {
    const parts = entry.trim().split(':');
    const name = parts[0]?.trim() || '';
    const domain = parts.slice(1).join(':').trim() || '';
    return { name, domain };
  }).filter((c) => c.name);
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
    console.log(chalk.bold(`Editing Brand Profile — ${profile.name || profile.domain}`));
    console.log();
    console.log(chalk.dim('  Note: Only customizable fields can be edited (category, industries, audience, etc.)'));
    console.log(chalk.dim('  Brand assets (colors, logos, fonts) are fetched from Brandfetch.'));
    console.log();

    let customizations: BrandCustomizations = {};

    // Edit specific field
    if (field) {
      switch (field) {
        case 'category':
          customizations.category = await ask(rl, 'Category', profile.category);
          break;
        case 'industries':
          customizations.industries = await askList(rl, 'Industries (comma-separated)', profile.industries);
          break;
        case 'audience':
        case 'audience.primary':
          customizations.audience = {
            primary: await ask(rl, 'Primary audience', profile.audience?.primary),
            secondary: profile.audience?.secondary
          };
          break;
        case 'audience.secondary':
          customizations.audience = {
            primary: profile.audience?.primary,
            secondary: await ask(rl, 'Secondary audience', profile.audience?.secondary)
          };
          break;
        case 'value_propositions':
          const vpStr = profile.value_propositions?.join(', ');
          customizations.value_propositions = await askList(rl, 'Value propositions (comma-separated)', profile.value_propositions);
          break;
        case 'competitors':
          customizations.competitors = await askCompetitors(rl, profile.competitors);
          break;
        case 'keywords':
          customizations.keywords = await askList(rl, 'Keywords (comma-separated)', profile.keywords);
          break;
        case 'channels':
          customizations.channels = await askList(rl, 'Channels (comma-separated)', profile.channels);
          break;
        case 'tone':
          customizations.tone = await ask(rl, 'Brand tone', profile.tone);
          break;
        default:
          console.log(chalk.yellow(`Unknown field: ${field}`));
          console.log();
          console.log(chalk.dim('Available fields:'));
          console.log(chalk.dim('  category, industries, audience, value_propositions, competitors, keywords, channels, tone'));
          console.log();
          rl.close();
          return;
      }
    } else {
      // Edit all customizable fields
      customizations = {
        category: await ask(rl, 'Category', profile.category),
        industries: await askList(rl, 'Industries (comma-separated)', profile.industries),
        audience: {
          primary: await ask(rl, 'Primary audience', profile.audience?.primary),
          secondary: await ask(rl, 'Secondary audience', profile.audience?.secondary),
        },
        value_propositions: await askList(rl, 'Value propositions (comma-separated)', profile.value_propositions),
        competitors: await askCompetitors(rl, profile.competitors),
        keywords: await askList(rl, 'Keywords (comma-separated)', profile.keywords),
        channels: await askList(rl, 'Channels (comma-separated)', profile.channels),
        tone: await ask(rl, 'Brand tone', profile.tone),
      };
    }

    rl.close();

    console.log();
    const spinner = ora('Updating brand customizations...').start();

    await client.updateBrand(customizations);

    spinner.succeed('Brand profile updated.');
    console.log();
    console.log(success('Your customizations have been saved.'));
    console.log();
    console.log(chalk.dim(`  View: ${chalk.cyan('npx karis brand show')}`));
    console.log();
  } catch (error) {
    console.log();
    console.log(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    console.log();
  }
}
