import { Command } from 'commander';
import chalk from 'chalk';
import { executeSingleTurn } from '../../utils/agent-helper.js';

export function registerOptimizeCommand(program: Command): void {
  program
    .command('optimize <url>')
    .description('Optimize content for AI search visibility via Karis Platform')
    .action(async (url: string) => {
      const prompt = `帮我优化这个内容以提升 AI 搜索可见度：${url}`;

      console.log(chalk.bold(`Optimizing content for AI search...\n`));
      await executeSingleTurn(prompt);
    });
}
