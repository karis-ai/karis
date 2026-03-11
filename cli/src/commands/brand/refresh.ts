import { Command } from 'commander';
import chalk from 'chalk';
import { KarisClient } from '../../core/client.js';
import { createAuthRequiredError } from '../../core/errors.js';
import { runCommand } from '../../utils/run-command.js';
import ora from 'ora';

export function registerBrandRefreshCommand(program: Command): void {
  program
    .command('refresh')
    .description('Refresh brand data from source (re-fetch from Brandfetch)')
    .argument('[brand]', 'Brand name, domain, or ID to refresh (default: current)')
    .option('-s, --scope <scope>', 'Refresh scope: profile, clusters, kit, all', 'all')
    .action(runCommand(async (brand?: string, options?: { scope?: string }) => {
      await runBrandRefresh({ brand, scope: options?.scope });
    }));
}

export async function runBrandRefresh(options: { brand?: string; scope?: string }): Promise<void> {
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
      console.log(chalk.yellow('No brand selected. Specify a brand to refresh.'));
      return;
    }
    brandId = current.id;
  }

  const spinner = ora(`Refreshing brand data...`).start();

  try {
    const scopes = options.scope ? [options.scope] : ['all'];
    const profile = await client.refreshBrand(brandId, scopes);
    spinner.succeed('Brand refreshed.');
    console.log();
    console.log(chalk.bold(`Updated: ${profile.name || profile.domain}`));
    console.log(chalk.dim('Run: npx karis brand show to view details'));
    console.log();
  } catch (error) {
    spinner.fail('Failed to refresh brand.');
    throw error;
  }
}
