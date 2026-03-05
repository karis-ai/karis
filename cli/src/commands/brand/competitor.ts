import chalk from 'chalk';
import { KarisClient } from '../../core/client.js';
import { success, warning } from '../../utils/output.js';

export async function runCompetitorAdd(nameAndDomain: string): Promise<void> {
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

    // Parse "name:domain" format
    const parts = nameAndDomain.split(':');
    if (parts.length < 2) {
      console.log();
      console.log(chalk.yellow('Invalid format. Use: name:domain'));
      console.log();
      console.log(chalk.dim('  Example: npx karis brand competitor add "Linear:linear.app"'));
      console.log();
      return;
    }

    const name = parts[0]?.trim() || '';
    const domain = parts.slice(1).join(':').trim();

    if (!name || !domain) {
      console.log();
      console.log(chalk.yellow('Both name and domain are required.'));
      console.log();
      return;
    }

    // Check if already exists
    const exists = profile.competitors.some(c => c.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      console.log();
      console.log(warning(`Competitor "${name}" already exists.`));
      console.log();
      return;
    }

    const newCompetitor = { name, domain };
    const updatedCompetitors = [...profile.competitors, newCompetitor];

    await client.updateBrand({ competitors: updatedCompetitors });

    console.log();
    console.log(success(`Added competitor: ${chalk.bold(name)} (${domain})`));
    console.log();
    console.log(chalk.dim(`  View all: ${chalk.cyan('npx karis brand show')}`));
    console.log();
  } catch (error) {
    console.log();
    console.log(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    console.log();
  }
}

export async function runCompetitorRemove(name: string): Promise<void> {
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

    const index = profile.competitors.findIndex(c => c.name.toLowerCase() === name.toLowerCase());

    if (index === -1) {
      console.log();
      console.log(chalk.yellow(`Competitor "${name}" not found.`));
      console.log();
      console.log(chalk.dim('  Current competitors:'));
      for (const comp of profile.competitors) {
        console.log(chalk.dim(`    • ${comp.name}`));
      }
      console.log();
      return;
    }

    const removed = profile.competitors[index];
    const updatedCompetitors = profile.competitors.filter((_, i) => i !== index);

    await client.updateBrand({ competitors: updatedCompetitors });

    console.log();
    console.log(success(`Removed competitor: ${chalk.bold(removed.name)}`));
    console.log();
  } catch (error) {
    console.log();
    console.log(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    console.log();
  }
}
