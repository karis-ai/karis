import { Command } from 'commander';
import { registerAnalyzeCommand } from './analyze.js';

export function registerCompetitorCommands(program: Command): void {
  const competitor = program
    .command('competitor')
    .description('Competitive intelligence — analyze competitor performance');

  registerAnalyzeCommand(competitor);
}
