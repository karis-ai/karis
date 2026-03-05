import { Command } from 'commander';
import chalk from 'chalk';
import { executeSingleTurn } from '../../utils/agent-helper.js';

export function registerPromptsCommand(program: Command): void {
  program
    .command('prompts <topic>')
    .description('Research how users ask AI about a topic via Karis Platform')
    .action(async (topic: string) => {
      const prompt = `帮我研究用户如何向 AI 询问关于 "${topic}" 的问题，生成测试提示词`;

      console.log(chalk.bold(`Researching prompts for "${topic}"...\n`));
      await executeSingleTurn(prompt);
    });
}
