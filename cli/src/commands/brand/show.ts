import chalk from 'chalk';
import { KarisClient } from '../../core/client.js';

export async function runBrandShow(): Promise<void> {
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

    console.log();
    console.log(chalk.bold(`Brand Profile — ${profile.domain}`));
    console.log();

    console.log(`  ${chalk.dim('Name:')}       ${chalk.bold(profile.name)}`);
    console.log(`  ${chalk.dim('Domain:')}     ${profile.domain}`);
    console.log(`  ${chalk.dim('Category:')}   ${profile.category}`);

    if (profile.industries.length > 0) {
      console.log(`  ${chalk.dim('Industries:')} ${profile.industries.join(', ')}`);
    }

    if (profile.audience.primary) {
      console.log(`  ${chalk.dim('Audience:')}   ${profile.audience.primary}`);
      if (profile.audience.secondary) {
        console.log(`  ${chalk.dim('            ')} ${chalk.dim('(secondary: ' + profile.audience.secondary + ')')}`);
      }
    }

    if (profile.keywords.length > 0) {
      console.log(`  ${chalk.dim('Keywords:')}   ${profile.keywords.join(', ')}`);
    }

    if (profile.competitors.length > 0) {
      console.log();
      console.log(`  ${chalk.dim('Competitors:')}`);
      for (const comp of profile.competitors) {
        console.log(`    ${chalk.cyan('•')} ${comp.name.padEnd(20)} ${chalk.dim(comp.domain)}`);
      }
    }

    if (profile.channels.length > 0) {
      console.log();
      console.log(`  ${chalk.dim('Channels:')}   ${profile.channels.join(', ')}`);
    }

    if (profile.tone) {
      console.log(`  ${chalk.dim('Tone:')}       ${profile.tone}`);
    }

    console.log();
    console.log(chalk.dim('  ── Synced across your team via Karis Platform'));
    console.log();
  } catch (error) {
    console.log();
    console.log(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    console.log();
  }
}
