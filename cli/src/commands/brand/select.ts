import { Command } from 'commander';
import chalk from 'chalk';
import { KarisClient } from '../../core/client.js';
import { emitStructuredEvent, printCommandResult, success, warning, section } from '../../utils/output.js';
import { createAuthRequiredError } from '../../core/errors.js';
import { isTextOutput } from '../../core/cli-context.js';
import { InteractiveSession } from '../../utils/interactive.js';
import { runCommand } from '../../utils/run-command.js';
import ora from 'ora';

export function registerBrandSelectCommand(program: Command): void {
  program
    .command('select')
    .description('Switch to a different brand')
    .argument('[brand]', 'Brand name or domain to select')
    .action(runCommand(async (brand?: string) => {
      await runBrandSelect({ brand });
    }));
}

export async function runBrandSelect(options: { brand?: string }): Promise<void> {
  const client = await KarisClient.create();

  if (!client.hasApiKey()) {
    throw createAuthRequiredError();
  }

  const session = new InteractiveSession();

  // Get all brands
  const brands = await client.listBrands();

  if (brands.length === 0) {
    session.close();
    console.log(chalk.yellow('No brands found. Run: npx karis brand init <domain>'));
    return;
  }

  // Get current selection
  const current = await client.getBrand();
  const currentId = current?.id;

  let selectedBrand = options.brand;

  if (!selectedBrand) {
    // Show list and prompt
    console.log(chalk.bold('\nSelect a brand:\n'));
    brands.forEach((brand, i) => {
      const isSelected = brand.id === currentId;
      const marker = isSelected ? chalk.green('✓') : ' ';
      const name = isSelected ? chalk.bold(brand.name || brand.domain) : brand.name || brand.domain;
      console.log(`  ${chalk.gray(`${i + 1}.`)} ${name} (${brand.domain})${isSelected ? ' (current)' : ''}`);
    });
    console.log();

    const idx = await session.ask('Enter number or name', { defaultValue: '' });
    if (!idx) {
      session.close();
      return;
    }

    // Parse input - could be number or name
    const num = parseInt(idx, 10);
    if (!isNaN(num) && num > 0 && num <= brands.length) {
      selectedBrand = brands[num - 1].id;
    } else {
      // Try to match by name or domain
      const match = brands.find(b =>
        b.name?.toLowerCase() === idx.toLowerCase() ||
        b.domain?.toLowerCase() === idx.toLowerCase()
      );
      if (match) {
        selectedBrand = match.id;
      } else {
        session.close();
        console.log(warning(`Brand not found: ${idx}`));
        return;
      }
    }
  } else if (selectedBrand) {
    // Check if input is brand ID or name
    const input = selectedBrand;
    const match = brands.find(b =>
      b.id === input ||
      b.name?.toLowerCase() === input.toLowerCase() ||
      b.domain?.toLowerCase() === input.toLowerCase()
    );
    if (!match) {
      session.close();
      console.log(warning(`Brand not found: ${input}`));
      return;
    }
    selectedBrand = match.id;
  }

  session.close();

  if (!selectedBrand) {
    console.log(chalk.yellow('No brand selected.'));
    return;
  }

  if (selectedBrand === currentId) {
    console.log(chalk.yellow('Already using this brand.'));
    return;
  }

  const spinner = isTextOutput() ? ora('Switching brand...').start() : null;

  try {
    const profile = await client.setBrandSelection(selectedBrand);
    spinner?.succeed('Brand switched.');
    console.log();
    console.log(success(chalk.bold(`Now using: ${profile.name || profile.domain}`)));
    console.log();
  } catch (error) {
    spinner?.fail('Failed to switch brand.');
    throw error;
  }
}
