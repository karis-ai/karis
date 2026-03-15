import { Command } from 'commander';
import chalk from 'chalk';
import { KarisClient } from '../../core/client.js';
import { createAuthRequiredError } from '../../core/errors.js';
import { runCommand } from '../../utils/run-command.js';
import { saveIndex } from '../../utils/index-cache.js';

export function registerBrandListCommand(program: Command): void {
  program
    .command('list')
    .description('List all brands')
    .action(runCommand(async () => {
      await runBrandList();
    }));
}

export async function runBrandList(): Promise<void> {
  const client = await KarisClient.create();

  if (!client.hasApiKey()) {
    throw createAuthRequiredError();
  }

  const brands = await client.listBrands();

  if (brands.length === 0) {
    console.log(chalk.yellow('No brands found. Run: npx karis brand init <domain>'));
    return;
  }

  // Get current selection
  const current = await client.getBrand();
  const currentId = current?.id;

  console.log(chalk.bold('\nYour Brands:\n'));
  brands.forEach((brand, i) => {
    const isSelected = brand.id === currentId;
    const marker = isSelected ? chalk.green('✓') : ' ';
    const name = isSelected ? chalk.bold(brand.name || brand.domain) : brand.name || brand.domain;
    console.log(`  ${marker} ${name} (${brand.domain})`);
  });
  console.log();

  // Save index cache for `karis show <n>`
  await saveIndex(brands.map(b => ({
    id: b.id,
    label: b.name || b.domain,
    type: 'brand',
    domain: b.domain,
  })));

  if (!current) {
    console.log(chalk.dim('No brand selected. Run: npx karis brand select <name>'));
  }
}
