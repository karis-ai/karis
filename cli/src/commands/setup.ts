import chalk from 'chalk';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { KarisClient } from '../core/client.js';
import { getConfigValue, setConfigValue } from '../utils/config.js';
import { runBrandInit } from './brand/init.js';

async function ask(rl: readline.Interface, question: string): Promise<string> {
  const answer = (await rl.question(`  ${question}: `)).trim();
  return answer;
}

export async function runSetup(): Promise<void> {
  console.log();
  console.log(chalk.bold.cyan('Welcome to Karis! 🚀'));
  console.log();
  console.log('Let\'s get you set up in 2 steps:');
  console.log(chalk.dim('  1. Configure your Karis API key'));
  console.log(chalk.dim('  2. Create your brand profile'));
  console.log();

  const rl = readline.createInterface({ input, output });

  // Step 1: Check API key
  let apiKey = await getConfigValue('api-key');

  if (apiKey) {
    console.log(chalk.green('✓ API key already configured'));
    console.log();
    const change = await ask(rl, 'Use a different API key? (y/N)');
    if (change.toLowerCase() === 'y') {
      apiKey = undefined;
    }
  }

  if (!apiKey) {
    console.log(chalk.bold('Step 1: API Key'));
    console.log();
    console.log(chalk.dim('  Get your API key at: https://karis.im/settings/api-keys'));
    console.log();

    apiKey = await ask(rl, 'Enter your Karis API key');

    if (!apiKey) {
      console.log();
      console.log(chalk.yellow('API key is required to continue.'));
      console.log();
      console.log(chalk.dim('  Run setup again when you have your key:'));
      console.log(chalk.dim(`    ${chalk.cyan('npx karis setup')}`));
      console.log();
      rl.close();
      return;
    }

    // Verify the key
    console.log();
    console.log(chalk.dim('Verifying API key...'));

    const client = new KarisClient({ apiKey });

    try {
      const keyInfo = await client.verifyKey();
      await setConfigValue('api-key', apiKey);

      console.log();
      console.log(chalk.green('✓ API key verified and saved'));
      console.log(chalk.dim(`  Key: ${keyInfo.name} (${keyInfo.key_prefix}...)`));
      console.log();
    } catch (error) {
      console.log();
      console.log(chalk.red('✗ Invalid API key'));
      console.log();
      console.log(chalk.dim('  Please check your key and try again:'));
      console.log(chalk.dim(`    ${chalk.cyan('npx karis setup')}`));
      console.log();
      rl.close();
      return;
    }
  }

  // Step 2: Check brand profile
  const client = await KarisClient.create();
  const existingBrand = await client.getBrand();

  if (existingBrand) {
    console.log(chalk.green(`✓ Brand profile already exists: ${chalk.bold(existingBrand.name)}`));
    console.log();
    const recreate = await ask(rl, 'Create a new brand profile? (y/N)');
    if (recreate.toLowerCase() !== 'y') {
      rl.close();
      console.log();
      console.log(chalk.bold.green('Setup complete! 🎉'));
      console.log();
      console.log(chalk.dim('Next steps:'));
      console.log(chalk.dim(`  View your brand:  ${chalk.cyan('npx karis brand show')}`));
      console.log(chalk.dim(`  Run GEO audit:    ${chalk.cyan('npx karis geo audit')}`));
      console.log(chalk.dim(`  Chat with CMO:    ${chalk.cyan('npx karis chat')}`));
      console.log();
      return;
    }
  }

  rl.close();

  console.log();
  console.log(chalk.bold('Step 2: Brand Profile'));
  console.log();

  // Run brand init
  await runBrandInit({});

  console.log();
  console.log(chalk.bold.green('Setup complete! 🎉'));
  console.log();
  console.log(chalk.dim('Next steps:'));
  console.log(chalk.dim(`  View your brand:  ${chalk.cyan('npx karis brand show')}`));
  console.log(chalk.dim(`  Run GEO audit:    ${chalk.cyan('npx karis geo audit')}`));
  console.log(chalk.dim(`  Chat with CMO:    ${chalk.cyan('npx karis chat')}`));
  console.log();
}

export function registerSetupCommand(program: any): void {
  program
    .command('setup')
    .description('Interactive setup wizard for first-time users')
    .action(runSetup);
}
