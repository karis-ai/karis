import { Command } from 'commander';
import chalk from 'chalk';
import { registerConfigCommand } from './commands/config.js';
import { registerChatCommand } from './commands/chat.js';
import { registerSetupCommand } from './commands/setup.js';
import { registerLoginCommand } from './commands/login.js';
import { registerBrandInitCommand } from './commands/brand/init.js';
import { registerBrandShowCommand } from './commands/brand/show.js';
import { registerBrandListCommand } from './commands/brand/list.js';
import { registerBrandSelectCommand } from './commands/brand/select.js';
import { registerBrandRefreshCommand } from './commands/brand/refresh.js';
import { registerBrandCustomizeCommand } from './commands/brand/customize.js';
import { registerBrandInfoCommand } from './commands/brand/info.js';
import { registerDoctorCommand } from './commands/doctor.js';
import { registerShowCommand } from './commands/show.js';
import { registerToolsCommand } from './commands/tools.js';
import { registerCapabilitiesCommand } from './commands/capabilities.js';
import { registerBrowserCommand } from './commands/browser.js';
import { registerWebCommand } from './commands/web.js';
import { registerXCommand } from './commands/x.js';
import { registerRedditCommand } from './commands/reddit.js';
import { registerYoutubeCommand } from './commands/youtube.js';
import { registerGeoCommand } from './commands/geo.js';
import { registerScheduleCommand } from './commands/schedule.js';
import { registerMemoryCommand } from './commands/memory.js';
import { registerInfluencerCommand } from './commands/influencer.js';
import { AgentFactory } from './core/agent-factory.js';
import { RemoteAgent } from './core/remote-agent.js';
import type { StreamChunk } from './core/agent-interface.js';
import type { OutputMode } from './core/cli-context.js';
import { isJsonOutput, isTextOutput, isYamlOutput, setCliContext } from './core/cli-context.js';
import { printCommandError, printCommandResult, renderStreamChunk, resetToolCallCounter } from './utils/output.js';
import { createAuthRequiredError } from './core/errors.js';
import { autoLogin } from './core/auth.js';

const FORMAT_ALIASES: Record<string, OutputMode> = {
  text: 'text', table: 'table', json: 'json', yaml: 'yaml', csv: 'csv', md: 'md',
  jsonl: 'jsonl', markdown: 'md',
};

function resolveOutputMode(opts: Record<string, unknown>): OutputMode {
  if (opts.format && typeof opts.format === 'string') {
    const mapped = FORMAT_ALIASES[opts.format.toLowerCase()];
    if (mapped) return mapped;
  }
  if (opts.jsonl) return 'jsonl';
  if (opts.json) return 'json';
  if (opts.yaml) return 'yaml';

  const envOutput = process.env.OUTPUT?.toLowerCase();
  if (envOutput && FORMAT_ALIASES[envOutput]) return FORMAT_ALIASES[envOutput];
  if (!process.stdout.isTTY) return 'yaml';
  return 'text';
}

const program = new Command();

program
  .name('karis')
  .version('0.1.0')
  .description('Your AI-powered CMO')
  .option('--json', 'Emit structured JSON output')
  .option('--jsonl', 'Emit newline-delimited JSON events')
  .option('--yaml', 'Emit YAML output')
  .option('-f, --format <fmt>', 'Output format: table, json, yaml, csv, md')
  .option('--compact', 'Strip meta fields from structured output');

program.hook('preAction', (_thisCommand, actionCommand) => {
  const globalOptions = actionCommand.optsWithGlobals();

  // Output mode priority: -f flag > legacy flags > OUTPUT env > TTY auto-detection
  const outputMode = resolveOutputMode(globalOptions);

  setCliContext({
    outputMode,
    commandPath: commandPathFor(actionCommand),
    compact: globalOptions.compact === true,
  });
});

// --- Primary commands ---

registerLoginCommand(program);
registerSetupCommand(program);
registerChatCommand(program);

// --- Brand commands ---

const brandCmd = program.command('brand').description('Manage brand profile');
registerBrandInitCommand(brandCmd);
registerBrandShowCommand(brandCmd);
registerBrandListCommand(brandCmd);
registerBrandSelectCommand(brandCmd);
registerBrandRefreshCommand(brandCmd);
registerBrandCustomizeCommand(brandCmd);
registerBrandInfoCommand(brandCmd);

// --- Site-namespaced tool commands (Layer 1) ---

registerWebCommand(program);
registerBrowserCommand(program);
registerXCommand(program);
registerRedditCommand(program);
registerYoutubeCommand(program);
registerGeoCommand(program);
registerScheduleCommand(program);
registerMemoryCommand(program);
registerInfluencerCommand(program);

// --- Infrastructure ---

registerConfigCommand(program);
registerDoctorCommand(program);
registerShowCommand(program);
registerToolsCommand(program);
registerCapabilitiesCommand(program);

// --- Natural language fallback ---

if (process.argv.length <= 2) {
  process.argv.push('chat');
}

program.on('command:*', async (operands: string[]) => {
  const input = operands.join(' ');

  const globalOptions = program.opts();
  const outputMode = resolveOutputMode(globalOptions);

  setCliContext({
    outputMode,
    commandPath: 'agent.run',
    compact: globalOptions.compact === true,
  });

  let agent = await AgentFactory.create();

  if (!(await agent.isAvailable())) {
    if (process.stdout.isTTY) {
      const loggedIn = await autoLogin();
      if (!loggedIn) {
        printCommandError(createAuthRequiredError());
        return;
      }
      // Recreate agent so it picks up the newly saved API key
      agent = await AgentFactory.create();
    } else {
      printCommandError(createAuthRequiredError());
      return;
    }
  }

  const brandContext = await agent.getBrandContext();

  if (isTextOutput()) {
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
    resetToolCallCounter();
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

    if (isJsonOutput() || isYamlOutput()) {
      printCommandResult({
        prompt: input,
        response,
        events: chunks,
        conversation_id: agent instanceof RemoteAgent ? (agent.getConversationId() || undefined) : undefined,
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
