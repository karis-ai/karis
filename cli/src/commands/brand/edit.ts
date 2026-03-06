import chalk from 'chalk';
import { KarisClient, BrandCustomizations } from '../../core/client.js';
import { createAuthRequiredError, createInvalidArgumentError, createNoBrandError } from '../../core/errors.js';
import { emitStructuredEvent, printCommandResult, success } from '../../utils/output.js';
import { isTextOutput } from '../../core/cli-context.js';
import { InteractiveSession } from '../../utils/interactive.js';
import ora from 'ora';

async function ask(session: InteractiveSession, question: string, current?: string): Promise<string> {
  return session.ask(question, { defaultValue: current });
}

async function askList(session: InteractiveSession, question: string, current?: string[]): Promise<string[]> {
  const currentStr = current?.join(', ');
  const raw = await ask(session, question, currentStr);
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function askCompetitors(session: InteractiveSession, current?: Array<{ name: string; domain: string }>): Promise<Array<{ name: string; domain: string }>> {
  const currentStr = current?.map(c => `${c.name}:${c.domain}`).join(', ');
  if (isTextOutput()) {
    console.log(chalk.dim('  Enter competitors (name:domain), comma-separated.'));
  } else {
    emitStructuredEvent({
      type: 'status',
      stage: 'competitors_help',
      message: 'Enter competitors as comma-separated name:domain pairs',
    });
  }
  const raw = await ask(session, 'Competitors', currentStr);
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
    throw createAuthRequiredError();
  }

  const profile = await client.getBrand();

  if (!profile) {
    throw createNoBrandError();
  }

  const session = new InteractiveSession();

  if (isTextOutput()) {
    console.log();
    console.log(chalk.bold(`Editing Brand Profile — ${profile.name || profile.domain}`));
    console.log();
    console.log(chalk.dim('  Note: Only customizable fields can be edited (category, industries, audience, etc.)'));
    console.log(chalk.dim('  Brand assets (colors, logos, fonts) are fetched from Brandfetch.'));
    console.log();
  } else {
    emitStructuredEvent({
      type: 'status',
      stage: 'editing',
      brand_name: profile.name || profile.domain,
      field: field ?? null,
    });
  }

  let customizations: BrandCustomizations = {};

  // Edit specific field
  if (field) {
    switch (field) {
      case 'category':
        customizations.category = await ask(session, 'Category', profile.category);
        break;
      case 'industries':
        customizations.industries = await askList(session, 'Industries (comma-separated)', profile.industries);
        break;
      case 'audience':
      case 'audience.primary':
        customizations.audience = {
          primary: await ask(session, 'Primary audience', profile.audience?.primary),
          secondary: profile.audience?.secondary
        };
        break;
      case 'audience.secondary':
        customizations.audience = {
          primary: profile.audience?.primary,
          secondary: await ask(session, 'Secondary audience', profile.audience?.secondary)
        };
        break;
      case 'value_propositions':
        customizations.value_propositions = await askList(session, 'Value propositions (comma-separated)', profile.value_propositions);
        break;
      case 'competitors':
        customizations.competitors = await askCompetitors(session, profile.competitors);
        break;
      case 'keywords':
        customizations.keywords = await askList(session, 'Keywords (comma-separated)', profile.keywords);
        break;
      case 'channels':
        customizations.channels = await askList(session, 'Channels (comma-separated)', profile.channels);
        break;
      case 'tone':
        customizations.tone = await ask(session, 'Brand tone', profile.tone);
        break;
      default:
        session.close();
        throw createInvalidArgumentError(`Unknown field: ${field}`, [
          'Available fields: category, industries, audience, value_propositions, competitors, keywords, channels, tone',
        ]);
    }
  } else {
    // Edit all customizable fields
    customizations = {
        category: await ask(session, 'Category', profile.category),
        industries: await askList(session, 'Industries (comma-separated)', profile.industries),
        audience: {
          primary: await ask(session, 'Primary audience', profile.audience?.primary),
          secondary: await ask(session, 'Secondary audience', profile.audience?.secondary),
        },
        value_propositions: await askList(session, 'Value propositions (comma-separated)', profile.value_propositions),
        competitors: await askCompetitors(session, profile.competitors),
        keywords: await askList(session, 'Keywords (comma-separated)', profile.keywords),
        channels: await askList(session, 'Channels (comma-separated)', profile.channels),
        tone: await ask(session, 'Brand tone', profile.tone),
      };
  }

  session.close();

  if (!isTextOutput()) {
    emitStructuredEvent({
      type: 'status',
      stage: 'updating',
      field: field ?? 'all',
    });
  } else {
    console.log();
  }

  const spinner = isTextOutput() ? ora('Updating brand customizations...').start() : null;
  const updatedProfile = await client.updateBrand(customizations);

  spinner?.succeed('Brand profile updated.');
  if (isTextOutput()) {
    console.log();
    console.log(success('Your customizations have been saved.'));
    console.log();
    console.log(chalk.dim(`  View: ${chalk.cyan('npx karis brand show')}`));
    console.log();
  } else {
    emitStructuredEvent({
      type: 'status',
      stage: 'completed',
      field: field ?? 'all',
    });
  }

  printCommandResult({
    action: 'brand.edit',
    field: field ?? null,
    prompts: session.getTranscript(),
    customizations,
    profile: updatedProfile,
  });
}
