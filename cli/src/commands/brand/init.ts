import { Command } from 'commander';
import chalk from 'chalk';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { KarisClient } from '../../core/client.js';
import { success, warning, section } from '../../utils/output.js';
import ora from 'ora';

async function ask(rl: readline.Interface, question: string, fallback?: string): Promise<string> {
  const suffix = fallback ? chalk.dim(` (${fallback})`) : '';
  const answer = (await rl.question(`  ${question}${suffix}: `)).trim();
  return answer || fallback || '';
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
    console.log(warning(`Brand profile already exists for ${chalk.bold(existing.name || existing.domain)}.`));
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
  console.log(chalk.dim('  We\'ll analyze your domain using Brandfetch + AI to generate a complete brand profile.'));
  console.log();

  const domain = options.domain || await ask(rl, 'Domain (e.g., karis.im)');

  if (!domain) {
    console.log();
    console.log(chalk.red('Domain is required.'));
    console.log();
    rl.close();
    return;
  }

  rl.close();

  console.log();
  const spinner = ora('Analyzing brand assets and generating profile...').start();

  try {
    const profile = await client.createBrand(domain);

    spinner.succeed('Brand profile created.');
    console.log();
    console.log(success(chalk.bold(`Brand profile for ${profile.name || domain} is ready.`)));
    console.log();

    // Show quick summary
    console.log(chalk.dim('Quick Summary:'));
    if (profile.name) console.log(chalk.dim(`  Name: ${profile.name}`));
    if (profile.description) console.log(chalk.dim(`  Description: ${profile.description}`));
    if (profile.category) console.log(chalk.dim(`  Category: ${profile.category}`));
    if (profile.industries && profile.industries.length > 0) {
      console.log(chalk.dim(`  Industries: ${profile.industries.join(', ')}`));
    }
    console.log();

    console.log(chalk.dim(`  View full profile: ${chalk.cyan('npx karis brand show')}`));
    console.log(chalk.dim(`  Customize: ${chalk.cyan('npx karis brand edit')}`));
    console.log(chalk.dim(`  Run GEO audit: ${chalk.cyan('npx karis geo audit ' + domain)}`));
    console.log();
  } catch (error) {
    spinner.fail('Failed to create brand profile.');
    console.log();
    console.log(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    console.log();
  }
}
