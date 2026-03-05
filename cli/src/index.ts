import { Command } from 'commander';
import chalk from 'chalk';
import { registerConfigCommand } from './commands/config.js';
import { registerChatCommand } from './commands/chat.js';
import { registerSetupCommand } from './commands/setup.js';
import { registerBrandCommands } from './commands/brand/index.js';
import { registerGeoCommands } from './commands/geo/index.js';
import { registerContentCommands } from './commands/content/index.js';
import { registerCompetitorCommands } from './commands/competitor/index.js';
import { AgentFactory } from './core/agent-factory.js';
import { RemoteAgent } from './core/remote-agent.js';
import type { StreamChunk } from './core/agent-interface.js';

const program = new Command();

program
  .name('karis')
  .version('0.1.0')
  .description('The open-source CMO for AI agents');

// --- Core commands (top-level) ---

registerSetupCommand(program);
registerChatCommand(program);
registerConfigCommand(program);

// --- Brand management ---

registerBrandCommands(program);

// --- Marketing commands (grouped) ---

registerGeoCommands(program);
registerContentCommands(program);
registerCompetitorCommands(program);

// --- Coming soon ---

const upcomingCommands = [
  { name: 'track', desc: 'Track brand visibility changes over time' },
  { name: 'report', desc: 'Generate CMO weekly/monthly report' },
];

for (const cmd of upcomingCommands) {
  program
    .command(cmd.name)
    .description(cmd.desc)
    .action(() => {
      console.log(chalk.dim('Coming soon.'));
      console.log(chalk.dim('Follow https://github.com/karis-ai/karis for updates.'));
    });
}

// --- Default: Agent mode for unknown input ---

function renderChunk(chunk: StreamChunk): void {
  switch (chunk.type) {
    case 'content':
      if (chunk.content) process.stdout.write(chunk.content);
      break;
    case 'tool_start':
      process.stdout.write(chalk.yellow(`\n  [tool] ${chunk.tool ?? 'unknown'}...`));
      break;
    case 'tool_end':
      process.stdout.write(chalk.green(' done\n'));
      break;
    case 'done':
      console.log('\n');
      break;
    case 'error':
      console.log();
      console.log(chalk.red(`Error: ${chunk.error}`));
      console.log();
      break;
  }
}

program.on('command:*', async (operands: string[]) => {
  const input = operands.join(' ');

  const agent = await AgentFactory.create();

  if (!(await agent.isAvailable())) {
    console.log();
    console.log(chalk.bold('Agent mode') + chalk.dim(` — you said: "${input}"`));
    console.log();

    if (agent.getMode() === 'remote') {
      console.log(chalk.yellow('Remote Agent mode requires a Karis API key.'));
      console.log();
      console.log(`  Get your key: ${chalk.cyan('https://karis.im/settings/api-keys')}`);
      console.log(`  Set it:       ${chalk.cyan('npx karis config set api-key <your-key>')}`);
      console.log();
      console.log(chalk.dim('  Or switch to Local Agent mode:'));
      console.log(`    ${chalk.green('npx karis config set agent-mode local')}`);
    } else {
      console.log(chalk.yellow('Local Agent mode requires an LLM API key.'));
      console.log();
      console.log(`  Set OpenAI key:    ${chalk.cyan('npx karis config set openai-key sk-...')}`);
      console.log(`  Or Anthropic key:  ${chalk.cyan('npx karis config set anthropic-key sk-ant-...')}`);
    }

    console.log();
    console.log(chalk.dim('  Without Agent mode, you can still use:'));
    console.log(`    ${chalk.green('npx karis geo audit mybrand.com')}        — GEO audit`);
    console.log(`    ${chalk.green('npx karis content discover mybrand.com')}  — Content opportunities`);
    console.log();
    console.log(chalk.dim('  Or install Skills for your coding agent:'));
    console.log(`    ${chalk.green('npx skills add karis-ai/karis')}           — Works in Cursor/Claude Code/Codex`);
    console.log();
    process.exit(1);
  }

  const brandContext = await agent.getBrandContext();

  console.log();
  console.log(chalk.bold('CMO') + chalk.dim(` (${agent.getDescription()}) — "${input}"`));
  console.log();

  const messages = brandContext ? [brandContext] : [];
  messages.push({ role: 'user', content: input });

  // SIGINT: interrupt remote agent on Ctrl+C
  const sigintHandler = async () => {
    if (agent instanceof RemoteAgent) {
      await agent.interrupt();
    }
    console.log(chalk.dim('\n[interrupted]\n'));
    process.exit(0);
  };
  process.on('SIGINT', sigintHandler);

  try {
    for await (const chunk of agent.streamChat(messages)) {
      renderChunk(chunk);
      if (chunk.type === 'error') {
        process.exit(1);
      }
    }
  } catch (error) {
    console.log();
    console.log(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    console.log();
    process.exit(1);
  } finally {
    process.removeListener('SIGINT', sigintHandler);
  }
});

program.parse();
