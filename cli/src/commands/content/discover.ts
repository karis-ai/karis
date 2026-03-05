import { Command } from 'commander';
import chalk from 'chalk';
import { executeSingleTurn } from '../../utils/agent-helper.js';

export function registerDiscoverCommand(program: Command): void {
  program
    .command('discover [domain]')
    .description('Find content opportunities from community signals via Karis Platform')
    .action(async (domain?: string) => {
      const prompt = domain
        ? `帮我发现 ${domain} 的内容机会，从社区信号（Reddit、X、HN）分析`
        : `帮我发现内容机会，从社区信号（Reddit、X、HN）分析`;

      console.log(chalk.bold('Discovering content opportunities...\n'));
      await executeSingleTurn(prompt);
    });
}
