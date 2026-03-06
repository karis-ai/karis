import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { KarisClient } from '../../core/client.js';
import { createAuthRequiredError } from '../../core/errors.js';
import { isTextOutput } from '../../core/cli-context.js';
import { printCommandResult } from '../../utils/output.js';
import { runCommand } from '../../utils/run-command.js';
import { applyManifestHelp } from '../../utils/manifest-help.js';

export function registerDiscoverCommand(program: Command): void {
  applyManifestHelp(program
    .command('discover <domain>')
    .description('Find content opportunities from community signals via Karis Platform')
    .option('-c, --category <category>', 'Optional category filter')
    .option('-t, --timeout <seconds>', 'Timeout in seconds', '300')
    .action(runCommand(async (domain: string, options: { category?: string; timeout: string }) => {
      const client = await KarisClient.create();

      // Check API key
      if (!client.hasApiKey()) {
        throw createAuthRequiredError();
      }

      const timeout = parseInt(options.timeout, 10) * 1000; // Convert to milliseconds
      const startTime = Date.now();
      const spinner = isTextOutput()
        ? ora(`Starting content opportunity analysis for ${chalk.bold(domain)}...`).start()
        : null;

      // Start analysis
      const { task_id } = await client.startContentOpportunityAnalysis(domain, options.category);

      if (spinner) {
        spinner.text = 'Analyzing Reddit and X discussions... (this takes 1-3 minutes)';
      }

      // Poll for completion
      let lastProgress = 0;
      while (true) {
        // Check timeout
        if (Date.now() - startTime > timeout) {
          spinner?.fail('Analysis is taking longer than expected.');
          if (isTextOutput()) {
            console.log();
            console.log(chalk.dim(`  Check status with: ${chalk.cyan(`npx karis content result ${task_id}`)}`));
            console.log();
          }
          printCommandResult({
            task_id,
            status: 'timeout',
            domain,
          });
          return;
        }

        await new Promise(resolve => setTimeout(resolve, 3000)); // Poll every 3 seconds

        const status = await client.getContentOpportunityTaskStatus(task_id);

        if (status.progress_percent > lastProgress) {
          lastProgress = status.progress_percent;
          if (spinner) {
            spinner.text = `Analyzing... ${status.progress_percent}%`;
          }
        }

        if (status.status === 'completed') {
          spinner?.succeed('Analysis complete!');
          break;
        }

        if (status.status === 'failed') {
          spinner?.fail('Analysis failed.');
          if (status.error) {
            throw new Error(status.error);
          }
          throw new Error('Analysis failed.');
        }
      }

      const result = await client.getContentOpportunityResult(task_id);

      if (isTextOutput()) {
        console.log();
        console.log(chalk.bold(`Content Opportunity Analysis — ${domain}`));
        console.log('────────────────────────────────────────');
        console.log();

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

        console.log(chalk.dim(`View full report: ${chalk.cyan(`npx karis content result ${task_id}`)}`));
        console.log();
      }

      printCommandResult({
        task_id,
        domain,
        result,
      });
    })), 'content.discover');
}
