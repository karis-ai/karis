import { Command } from 'commander';
import { KarisClient } from '../core/client.js';
import { renderToolResult } from '../utils/formatter.js';
import { runCommand } from '../utils/run-command.js';

export function registerScheduleCommand(program: Command): void {
  const schedule = program.command('schedule').description('Scheduled tasks');

  schedule
    .command('list')
    .description('List all scheduled tasks')
    .action(runCommand(async () => {
      const client = await KarisClient.create();
      const result = await client.toolDirect('list_schedules', {});
      renderToolResult(result);
    }));
}
