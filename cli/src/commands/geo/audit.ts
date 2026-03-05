import { Command } from 'commander';
import chalk from 'chalk';
import { executeSingleTurn } from '../../utils/agent-helper.js';

export function registerAuditCommand(program: Command): void {
  program
    .command('audit [domain]')
    .description('Run professional GEO audit via Karis Platform')
    .action(async (domain?: string) => {
      const prompt = domain
        ? `帮我对 ${domain} 做一个 GEO audit，测量 AI 搜索可见度`
        : `帮我做一个 GEO audit，测量我的品牌在 AI 搜索引擎中的可见度`;

      console.log(chalk.bold('Running professional GEO audit...\n'));
      await executeSingleTurn(prompt);
    });
}
