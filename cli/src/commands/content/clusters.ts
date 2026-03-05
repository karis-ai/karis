import { Command } from 'commander';
import chalk from 'chalk';
import { executeSingleTurn } from '../../utils/agent-helper.js';

export function registerClustersCommand(program: Command): void {
  program
    .command('clusters [domain]')
    .description('Generate topic cluster architecture via Karis Platform')
    .action(async (domain?: string) => {
      const prompt = domain
        ? `帮我为 ${domain} 生成主题集群架构，规划内容策略`
        : `帮我生成主题集群架构，规划内容策略`;

      console.log(chalk.bold('Generating topic clusters...\n'));
      await executeSingleTurn(prompt);
    });
}
