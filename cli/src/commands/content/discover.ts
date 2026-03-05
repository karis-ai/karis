import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { KarisClient } from '../../core/client.js';

export function registerDiscoverCommand(program: Command): void {
  program
    .command('discover <domain>')
    .description('Find content opportunities from community signals via Karis Platform')
    .option('-c, --category <category>', 'Optional category filter')
    .option('-t, --timeout <seconds>', 'Timeout in seconds', '300')
    .action(async (domain: string, options: { category?: string; timeout: string }) => {
      const client = await KarisClient.create();

      // Check API key
      if (!client.hasApiKey()) {
        console.log();
        console.log(chalk.yellow('Karis API key required.'));
        console.log();
        console.log(chalk.dim(`  Set your key: ${chalk.cyan('npx karis config set api-key sk-ka-...')}`));
        console.log(chalk.dim(`  Get a key at: ${chalk.cyan('https://karis.im/settings/api-keys')}`));
        console.log();
        return;
      }

      const timeout = parseInt(options.timeout, 10) * 1000; // Convert to milliseconds
      const startTime = Date.now();

      try {
        // Start analysis
        let spinner = ora(`Starting content opportunity analysis for ${chalk.bold(domain)}...`).start();
        const { task_id } = await client.startContentOpportunityAnalysis(domain, options.category);

        spinner.text = 'Analyzing Reddit and X discussions... (this takes 1-3 minutes)';

        // Poll for completion
        let lastProgress = 0;
        while (true) {
          // Check timeout
          if (Date.now() - startTime > timeout) {
            spinner.fail('Analysis is taking longer than expected.');
            console.log();
            console.log(chalk.dim(`  Check status with: ${chalk.cyan(`npx karis content result ${task_id}`)}`));
            console.log();
            return;
          }

          await new Promise(resolve => setTimeout(resolve, 3000)); // Poll every 3 seconds

          const status = await client.getContentOpportunityTaskStatus(task_id);

          if (status.progress_percent > lastProgress) {
            lastProgress = status.progress_percent;
            spinner.text = `Analyzing... ${status.progress_percent}%`;
          }

          if (status.status === 'completed') {
            spinner.succeed('Analysis complete!');
            break;
          }

          if (status.status === 'failed') {
            spinner.fail('Analysis failed.');
            if (status.error) {
              console.log();
              console.log(chalk.red(`Error: ${status.error}`));
            }
            console.log();
            return;
          }
        }

        // Fetch results
        console.log();
        const result = await client.getContentOpportunityResult(task_id);

        // Display results
        console.log(chalk.bold(`Content Opportunity Analysis — ${domain}`));
        console.log('────────────────────────────────────────');
        console.log();

        // Topic Clusters
        if (result.topic_clusters && result.topic_clusters.length > 0) {
          console.log(chalk.bold(`Topic Clusters (${result.topic_clusters.length} found)`));
          console.log();

          const topClusters = result.topic_clusters.slice(0, 5);
          topClusters.forEach((cluster, index) => {
            console.log(`${index + 1}. ${chalk.bold(cluster.cluster_name)}  ${chalk.dim(`(${cluster.post_count} discussions)`)}`);
          });

          if (result.topic_clusters.length > 5) {
            console.log(chalk.dim(`   ... and ${result.topic_clusters.length - 5} more`));
          }
          console.log();
        }

        // Opportunity Cards
        if (result.content_opportunities && result.content_opportunities.length > 0) {
          console.log(chalk.bold(`Opportunity Cards (${result.content_opportunities.length} found)`));
          console.log();

          const topCards = result.content_opportunities.slice(0, 5);
          topCards.forEach(card => {
            console.log(`${chalk.cyan('●')} ${chalk.bold(card.title)}`);
            console.log(`  ${card.description}`);

            const meta: string[] = [];
            if (card.journey_stage) meta.push(`Stage: ${card.journey_stage}`);
            if (card.priority) meta.push(`Priority: ${card.priority}`);
            if (meta.length > 0) {
              console.log(`  ${chalk.dim(meta.join('  |  '))}`);
            }
            console.log();
          });

          if (result.content_opportunities.length > 5) {
            console.log(chalk.dim(`... and ${result.content_opportunities.length - 5} more`));
            console.log();
          }
        }

        // Footer
        console.log(chalk.dim(`View full report: ${chalk.cyan(`npx karis content result ${task_id}`)}`));
        console.log();

      } catch (error) {
        console.log();
        console.log(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
        console.log();
      }
    });
}
