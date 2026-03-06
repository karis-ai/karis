import { Command } from 'commander';
import chalk from 'chalk';
import { registerConfigCommand } from './commands/config.js';
import { registerChatCommand } from './commands/chat.js';
import { registerSetupCommand } from './commands/setup.js';
import { registerBrandCommands } from './commands/brand/index.js';
import { registerGeoCommands } from './commands/geo/index.js';
import { registerContentCommands } from './commands/content/index.js';
import { registerCompetitorCommands } from './commands/competitor/index.js';
import { registerDoctorCommand } from './commands/doctor.js';
import { registerMetaCommands } from './commands/meta.js';
import { AgentFactory } from './core/agent-factory.js';
import { RemoteAgent } from './core/remote-agent.js';
import type { StreamChunk } from './core/agent-interface.js';
import { isJsonOutput, isTextOutput, setCliContext, updateCliContext } from './core/cli-context.js';
import { printCommandError, printCommandResult, renderStreamChunk } from './utils/output.js';
import { createAuthRequiredError } from './core/errors.js';

const program = new Command();

program
  .name('karis')
  .version('0.1.0')
  .description('The open-source CMO for AI agents')
  .option('--json', 'Emit structured JSON output')
  .option('--jsonl', 'Emit newline-delimited JSON events');

program.hook('preAction', (_thisCommand, actionCommand) => {
  const globalOptions = actionCommand.optsWithGlobals();
  const outputMode = globalOptions.jsonl ? 'jsonl' : globalOptions.json ? 'json' : 'text';
  setCliContext({
    outputMode,
    commandPath: commandPathFor(actionCommand),
  });
});

// --- Core commands (top-level) ---

registerSetupCommand(program);
registerChatCommand(program);
registerConfigCommand(program);
registerDoctorCommand(program);
registerMetaCommands(program);

// --- Brand management ---

registerBrandCommands(program);

// --- Marketing commands (grouped) ---

registerGeoCommands(program);
registerContentCommands(program);
registerCompetitorCommands(program);

// --- Coming soon ---

const upcomingCommands = [
  { name: 'track', desc: 'Coming soon: track brand visibility changes over time' },
  { name: 'report', desc: 'Coming soon: generate CMO weekly/monthly report' },
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

program.on('command:*', async (operands: string[]) => {
  const input = operands.join(' ');
  updateCliContext({
    commandPath: 'agent.run',
  });

  const agent = await AgentFactory.create();

  if (!(await agent.isAvailable())) {
    printCommandError(createAuthRequiredError());
  }

  const brandContext = await agent.getBrandContext();

  if (isTextOutput()) {
    console.log();
    console.log(chalk.bold('CMO') + chalk.dim(` (${agent.getDescription()}) — "${input}"`));
    console.log();
  }

  const messages = brandContext ? [brandContext] : [];
  messages.push({ role: 'user', content: input });
  const chunks: StreamChunk[] = [];
  let response = '';

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
      chunks.push(chunk);
      if (chunk.type === 'content' && chunk.content) {
        response += chunk.content;
      }
      renderStreamChunk(chunk);
      if (chunk.type === 'error') {
        process.exit(1);
      }
    }

    if (isJsonOutput()) {
      printCommandResult({
        prompt: input,
        response,
        events: chunks,
        conversation_id: agent instanceof RemoteAgent ? agent.getConversationId() : undefined,
      }, {
        command: 'agent.run',
        meta: {
          runtime: agent.getDescription(),
        },
      });
    }
  } catch (error) {
    printCommandError(error);
  } finally {
    process.removeListener('SIGINT', sigintHandler);
  }
});

program.parse();

function commandPathFor(command: Command): string {
  const names: string[] = [];
  let current: Command | null = command;

  while (current) {
    const name = current.name();
    if (name && name !== 'karis') {
      names.push(name);
    }
    current = current.parent ?? null;
  }

  names.reverse();
  return names.join('.');
}
