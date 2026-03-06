import { Command } from 'commander';
import chalk from 'chalk';
import { KarisClient } from '../../core/client.js';
import { createAuthRequiredError } from '../../core/errors.js';
import { isTextOutput } from '../../core/cli-context.js';
import { printCommandResult } from '../../utils/output.js';
import { runCommand } from '../../utils/run-command.js';
import { applyManifestHelp } from '../../utils/manifest-help.js';

export function registerResultCommand(program: Command): void {
  applyManifestHelp(program
    .command('result <task-id>')
    .description('View full results of a content opportunity analysis')
    .action(runCommand(async (taskId: string) => {
      const client = await KarisClient.create();

      if (!client.hasApiKey()) {
        throw createAuthRequiredError();
      }

      const result = await client.getContentOpportunityResult(taskId);
      if (isTextOutput()) {
        console.log();
        console.log(chalk.bold('Content Opportunity Analysis — Full Report'));
        console.log('────────────────────────────────────────');
        console.log();

        // Topic Clusters
        if (result.topic_clusters && result.topic_clusters.length > 0) {
          console.log(chalk.bold(`Topic Clusters (${result.topic_clusters.length} total)`));
          console.log();

          result.topic_clusters.forEach((cluster, index) => {
            console.log(`${index + 1}. ${chalk.bold(cluster.cluster_name)}  ${chalk.dim(`(${cluster.post_count} discussions)`)}`);

            if (cluster.top_posts && cluster.top_posts.length > 0) {
              cluster.top_posts.slice(0, 3).forEach(post => {
                console.log(`   ${chalk.dim('•')} ${post.title} ${chalk.dim(`(score: ${post.score})`)}`);
                console.log(`     ${chalk.dim(post.url)}`);
              });
            }
            console.log();
          });
        }

        // Opportunity Cards
        if (result.content_opportunities && result.content_opportunities.length > 0) {
          console.log(chalk.bold(`Opportunity Cards (${result.content_opportunities.length} total)`));
          console.log();

          result.content_opportunities.forEach(card => {
            console.log(`${chalk.cyan('●')} ${chalk.bold(card.title)}`);
            console.log(`  ${card.description}`);

            const meta: string[] = [];
            if (card.journey_stage) meta.push(`Stage: ${card.journey_stage}`);
            if (card.aspect) meta.push(`Aspect: ${card.aspect}`);
            if (card.priority) meta.push(`Priority: ${card.priority}`);
            if (meta.length > 0) {
              console.log(`  ${chalk.dim(meta.join('  |  '))}`);
            }
            console.log();
          });
        }

        // Report
        if (result.report) {
          console.log(chalk.dim('────────────────────────────────────────'));
          console.log();
          console.log(chalk.bold('Detailed Report'));
          console.log();
          console.log(result.report);
          console.log();
        }
        console.log();
      }

      printCommandResult({
        task_id: taskId,
        result,
      });
    })), 'content.result');
}
