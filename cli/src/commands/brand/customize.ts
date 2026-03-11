import { Command } from 'commander';
import chalk from 'chalk';
import { KarisClient } from '../../core/client.js';
import { createAuthRequiredError } from '../../core/errors.js';
import { isTextOutput } from '../../core/cli-context.js';
import { InteractiveSession } from '../../utils/interactive.js';
import { runCommand } from '../../utils/run-command.js';
import ora from 'ora';

export function registerBrandCustomizeCommand(program: Command): void {
  program
    .command('customize')
    .description('Customize brand profile (override AI-generated data)')
    .argument('[brand]', 'Brand name, domain, or ID to customize (default: current)')
    .option('-n, --name <name>', 'Override brand name')
    .option('-d, --description <desc>', 'Override one-liner description')
    .option('-c, --category <category>', 'Override category')
    .option('-i, --industries <industries>', 'Override industries (comma-separated)')
    .option('-a, --audience <audience>', 'Override primary audience')
    .action(runCommand(async (brand?: string, options?: {
      name?: string;
      description?: string;
      category?: string;
      industries?: string;
      audience?: string;
    }) => {
      await runBrandCustomize({ brand, ...options });
    }));
}

export async function runBrandCustomize(options: {
  brand?: string;
  name?: string;
  description?: string;
  category?: string;
  industries?: string;
  audience?: string;
}): Promise<void> {
  const client = await KarisClient.create();

  if (!client.hasApiKey()) {
    throw createAuthRequiredError();
  }

  const brands = await client.listBrands();
  if (brands.length === 0) {
    console.log(chalk.yellow('No brands found. Run: npx karis brand init <domain>'));
    return;
  }

  // Find target brand
  let targetBrand = options.brand;
  let brandId: string;

  if (targetBrand) {
    const match = brands.find(b =>
      b.id === targetBrand ||
      b.name?.toLowerCase() === targetBrand.toLowerCase() ||
      b.domain.toLowerCase() === targetBrand.toLowerCase()
    );
    if (!match) {
      console.log(chalk.red(`Brand not found: ${targetBrand}`));
      return;
    }
    brandId = match.id;
  } else {
    // Use current selection
    const current = await client.getBrand();
    if (!current) {
      console.log(chalk.yellow('No brand selected. Specify a brand to customize.'));
      return;
    }
    brandId = current.id;
  }

  // Collect customizations from CLI options or prompt
  const customizations: {
    name?: string;
    category?: string;
    categories?: string[];
    industries?: string[];
    audience?: { primary?: string; secondary?: string };
  } = {};

  if (options.name) customizations.name = options.name;
  if (options.category) customizations.category = options.category;
  if (options.industries) {
    customizations.industries = options.industries.split(',').map(s => s.trim());
  }
  if (options.audience) {
    customizations.audience = { primary: options.audience };
  }
  if (options.description) {
    // Store in a way that updateBrand can use
    customizations.name = options.description; // This is a hack, need proper field
  }

  // If no CLI options, prompt interactively
  if (Object.keys(customizations).length === 0 && isTextOutput()) {
    const session = new InteractiveSession();

    console.log(chalk.bold('\nCustomize Brand\n'));

    const name = await session.ask('Brand name (leave empty to skip)');
    if (name) customizations.name = name;

    const category = await session.ask('Category (e.g., SaaS, AI)');
    if (category) customizations.category = category;

    const industries = await session.ask('Industries (comma-separated, e.g., AI, SaaS)');
    if (industries) {
      customizations.industries = industries.split(',').map(s => s.trim());
    }

    const audience = await session.ask('Primary audience');
    if (audience) {
      customizations.audience = { primary: audience };
    }

    session.close();
  }

  if (Object.keys(customizations).length === 0) {
    console.log(chalk.yellow('No customizations provided.'));
    return;
  }

  const spinner = ora(`Applying customizations...`).start();

  try {
    const profile = await client.updateBrand({
      ...customizations,
      // Map to expected format
      category: customizations.category,
      categories: customizations.categories,
      industries: customizations.industries,
      audience: customizations.audience,
    } as any);
    spinner.succeed('Brand customized.');
    console.log();
    console.log(chalk.bold(`Updated: ${profile.name || profile.domain}`));
    console.log(chalk.dim('Run: npx karis brand show to view details'));
    console.log();
  } catch (error) {
    spinner.fail('Failed to customize brand.');
    throw error;
  }
}
