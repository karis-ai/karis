import { Command } from 'commander';
import chalk from 'chalk';
import { KarisClient } from '../../core/client.js';
import { emitStructuredEvent, printCommandResult, success, warning, section } from '../../utils/output.js';
import { createAuthRequiredError } from '../../core/errors.js';
import { isTextOutput } from '../../core/cli-context.js';
import { InteractiveSession } from '../../utils/interactive.js';
import { runCommand } from '../../utils/run-command.js';
import ora from 'ora';

export function registerBrandInitCommand(program: Command): void {
  program
    .command('init')
    .description('Create brand profile from domain')
    .argument('[domain]', 'Domain to analyze')
    .option('-f, --force', 'Overwrite existing brand profile without prompting')
    .action(runCommand(async (domain?: string, options?: { force?: boolean }) => {
      await runBrandInit({ domain, force: options?.force });
    }));
}

export async function runBrandInit(options: { domain?: string; force?: boolean }): Promise<void> {
  const client = await KarisClient.create();

  if (!client.hasApiKey()) {
    throw createAuthRequiredError();
  }

  const session = new InteractiveSession();

  // Check if brand already exists
  const existing = await client.getBrand();
  if (existing && !options.force) {
    if (isTextOutput()) {
      console.log(warning(`Brand profile already exists for ${chalk.bold(existing.name || existing.domain)}.`));
    } else {
      emitStructuredEvent({
        type: 'status',
        stage: 'brand_exists',
        name: existing.name || existing.domain,
        domain: existing.domain,
      });
    }

    const overwrite = await session.ask('Overwrite? (y/N)', { defaultValue: 'N' });
    if (overwrite.toLowerCase() !== 'y') {
      session.close();
      printCommandResult({
        action: 'brand.init',
        cancelled: true,
        reason: 'overwrite_declined',
        prompts: session.getTranscript(),
        existing_brand: {
          name: existing.name,
          domain: existing.domain,
        },
      });
      return;
    }
  }

  if (isTextOutput()) {
    section('Brand Profile Setup');
    console.log();
    console.log(chalk.dim('  We\'ll analyze your domain using Brandfetch + AI to generate a complete brand profile.'));
    console.log();
  } else {
    emitStructuredEvent({
      type: 'status',
      stage: 'setup',
      message: 'Collecting brand init inputs',
    });
  }

  const domain = options.domain || await session.ask('Domain (e.g., karis.im)');

  if (!domain) {
    session.close();
    throw new Error('Domain is required.');
  }

  session.close();

  if (isTextOutput()) {
    console.log();
  } else {
    emitStructuredEvent({
      type: 'status',
      stage: 'analyzing',
      domain,
      message: 'Analyzing brand assets and generating profile',
    });
  }

  const spinner = isTextOutput()
    ? ora('Analyzing brand assets and generating profile...').start()
    : null;

  try {
    const profile = await client.createBrand(domain);

    spinner?.succeed('Brand profile created.');
    if (isTextOutput()) {
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
      console.log(chalk.dim(`  Chat with CMO:    ${chalk.cyan('npx karis chat')}`));
      console.log();
    } else {
      emitStructuredEvent({
        type: 'status',
        stage: 'completed',
        domain,
        brand_name: profile.name || domain,
      });
    }

    printCommandResult({
      action: 'brand.init',
      cancelled: false,
      domain,
      prompts: session.getTranscript(),
      profile,
    });
    return;
  } catch (error) {
    spinner?.fail('Failed to create brand profile.');
    throw error;
  }
}
