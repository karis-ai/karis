import { Command } from 'commander';
import { KarisClient } from '../core/client.js';
import { renderToolResult } from '../utils/formatter.js';
import { runCommand } from '../utils/run-command.js';

export function registerGeoCommand(program: Command): void {
  const geo = program.command('geo').description('GEO (Generative Engine Optimization) data');

  geo
    .command('data')
    .description('Get brand visibility metrics from AI search engines')
    .option('--domain <domain>', 'Brand domain (e.g. cursor.com)')
    .option('--time-range <range>', 'Time window: 7d, 14d, or 30d (default: 7d)')
    .action(runCommand(async (options) => {
      const args: Record<string, unknown> = {};
      if (options.domain) args.domain = options.domain;
      if (options.timeRange) args.time_range = options.timeRange;
      const client = await KarisClient.create();
      const result = await client.toolDirect('get_geo_data', args);
      renderToolResult(result);
    }));
}
