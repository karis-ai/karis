import { Command } from 'commander';
import chalk from 'chalk';
import { executeSingleTurn } from '../../utils/agent-helper.js';

export function registerAnalyzeCommand(program: Command): void {
  program
    .command('analyze [domain]')
    .description('Analyze competitor AI search performance via Karis Platform')
    .action(async (domain?: string) => {
      const prompt = domain
        ? `帮我分析 ${domain} 的竞品在 AI 搜索中的表现`
        : `帮我分析竞品在 AI 搜索中的表现`;

      console.log(chalk.bold('Analyzing competitors...\n'));
      await executeSingleTurn(prompt);
    });
}
