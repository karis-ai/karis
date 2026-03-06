import chalk from 'chalk';
import { KarisClient } from '../../core/client.js';
import { createAuthRequiredError, createNoBrandError } from '../../core/errors.js';
import { isTextOutput } from '../../core/cli-context.js';
import { printCommandResult } from '../../utils/output.js';

export async function runBrandShow(): Promise<void> {
  const client = await KarisClient.create();

  if (!client.hasApiKey()) {
    throw createAuthRequiredError();
  }

  const profile = await client.getBrand();

  if (!profile) {
    throw createNoBrandError();
  }

  if (isTextOutput()) {
    console.log();
    console.log(chalk.bold(`Brand Profile — ${profile.name || profile.domain}`));
    console.log();

    // Basic Info
    console.log(`  ${chalk.dim('Name:')}       ${chalk.bold(profile.name || 'N/A')}`);
    console.log(`  ${chalk.dim('Domain:')}     ${profile.domain}`);
    if (profile.claimed !== undefined) {
      console.log(`  ${chalk.dim('Claimed:')}    ${profile.claimed ? chalk.green('Yes') : chalk.yellow('No')}`);
    }

    if (profile.description) {
      console.log();
      console.log(`  ${chalk.dim('Description:')}`);
      console.log(`    ${profile.description}`);
    }

    if (profile.longDescription) {
      console.log();
      console.log(`  ${chalk.dim('Long Description:')}`);
      const lines = profile.longDescription.split('\n');
      lines.forEach(line => console.log(`    ${line}`));
    }

    // LLM-generated fields
    if (profile.category) {
      console.log();
      console.log(`  ${chalk.dim('Category:')}   ${profile.category}`);
    }

    if (profile.industries && profile.industries.length > 0) {
      console.log(`  ${chalk.dim('Industries:')} ${profile.industries.join(', ')}`);
    }

    if (profile.audience) {
      if (profile.audience.primary) {
        console.log(`  ${chalk.dim('Audience:')}   ${profile.audience.primary}`);
        if (profile.audience.secondary) {
          console.log(`  ${chalk.dim('            ')} ${chalk.dim('(secondary: ' + profile.audience.secondary + ')')}`);
        }
      }
    }

    if (profile.value_propositions && profile.value_propositions.length > 0) {
      console.log();
      console.log(`  ${chalk.dim('Value Propositions:')}`);
      profile.value_propositions.forEach(vp => {
        console.log(`    ${chalk.cyan('•')} ${vp}`);
      });
    }

    if (profile.keywords && profile.keywords.length > 0) {
      console.log();
      console.log(`  ${chalk.dim('Keywords:')}   ${profile.keywords.join(', ')}`);
    }

    if (profile.competitors && profile.competitors.length > 0) {
      console.log();
      console.log(`  ${chalk.dim('Competitors:')}`);
      for (const comp of profile.competitors) {
        console.log(`    ${chalk.cyan('•')} ${comp.name.padEnd(20)} ${chalk.dim(comp.domain)}`);
      }
    }

    if (profile.channels && profile.channels.length > 0) {
      console.log();
      console.log(`  ${chalk.dim('Channels:')}   ${profile.channels.join(', ')}`);
    }

    if (profile.tone) {
      console.log(`  ${chalk.dim('Tone:')}       ${profile.tone}`);
    }

    // Brand Assets
    if (profile.colors && profile.colors.length > 0) {
      console.log();
      console.log(`  ${chalk.dim('Brand Colors:')}`);
      profile.colors.slice(0, 5).forEach(color => {
        console.log(`    ${chalk.hex(color.hex)('█')} ${color.hex.padEnd(10)} ${chalk.dim(color.type)}`);
      });
      if (profile.colors.length > 5) {
        console.log(`    ${chalk.dim(`... and ${profile.colors.length - 5} more`)}`);
      }
    }

    if (profile.logos && profile.logos.length > 0) {
      console.log();
      console.log(`  ${chalk.dim('Logos:')}      ${profile.logos.length} available`);
    }

    if (profile.fonts && profile.fonts.length > 0) {
      console.log(`  ${chalk.dim('Fonts:')}      ${profile.fonts.map(f => f.name).join(', ')}`);
    }

    if (profile.links && profile.links.length > 0) {
      console.log();
      console.log(`  ${chalk.dim('Links:')}`);
      profile.links.slice(0, 5).forEach(link => {
        console.log(`    ${chalk.cyan('•')} ${link.name.padEnd(15)} ${chalk.dim(link.url)}`);
      });
      if (profile.links.length > 5) {
        console.log(`    ${chalk.dim(`... and ${profile.links.length - 5} more`)}`);
      }
    }

    console.log();
    console.log(chalk.dim('  ── Synced across your team via Karis Platform'));
    console.log();
    console.log(chalk.dim(`  Edit: ${chalk.cyan('npx karis brand edit')}`));
    console.log();
  }

  printCommandResult(profile);
}
