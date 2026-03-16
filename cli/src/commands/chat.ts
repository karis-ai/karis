import { Command } from 'commander';
import chalk from 'chalk';
import * as readline from 'node:readline/promises';
import { Writable } from 'node:stream';
import { stdin as input, stdout as output } from 'node:process';
import type { AgentInterface, StreamChunk } from '../core/agent-interface.js';
import { createAgent, renderChunk } from '../utils/agent-helper.js';
import { RemoteAgent } from '../core/remote-agent.js';
import { createUnsupportedModeError } from '../core/errors.js';
import { isJsonLinesOutput, isJsonOutput, isTextOutput, isYamlOutput } from '../core/cli-context.js';
import { printCommandResult, resetToolCallCounter } from '../utils/output.js';
import { runCommand } from '../utils/run-command.js';
import { getLastConversationId, setLastConversationId } from '../utils/config.js';

const silentOutput = new Writable({
  write(_chunk, _encoding, callback) {
    callback();
  },
});

export function registerChatCommand(program: Command): void {
  program
    .command('chat')
    .description('Talk to your CMO interactively or with a single prompt')
    .argument('[prompt...]', 'Run a single prompt instead of interactive chat')
    .option('-c, --conversation <id>', 'Continue an existing conversation')
    .option('--skill <name>', 'Hint which skill to use, e.g. aeo-geo, reddit-listening')
    .action(runCommand(async (promptParts: string[] = [], options) => {
        const agent = await createAgent();
        const prompt = promptParts.join(' ').trim();

        if (prompt) {
          await initializeInteractiveConversation(agent, options);
          await runSingleTurnChat(agent, prompt, options);
          return;
        }

        await initializeInteractiveConversation(agent, options);
        const transcript: Array<{
          user: string;
          assistant: string;
          events: Array<{ type: string; tool?: string; error?: string; content?: string }>;
        }> = [];

        const brandContext = await agent.getBrandContext();
        const promptOutput = isTextOutput() ? output : silentOutput;

        if (isTextOutput()) {
          console.log();
          console.log(chalk.bold('CMO ready.') + chalk.dim(` Mode: ${agent.getDescription()}`));

          if (agent instanceof RemoteAgent) {
            console.log(chalk.dim(`Conversation: ${agent.getConversationId() || 'pending'}`));
          }

          if (brandContext) {
            const brandMatch = brandContext.content.match(/Name: (.+)/);
            const domainMatch = brandContext.content.match(/Domain: (.+)/);
            const brandName = brandMatch?.[1] || 'Unknown';
            const domain = domainMatch?.[1] || 'unknown.com';
            console.log(chalk.dim(`Brand: ${brandName} (${domain})`));
          } else {
            console.log(chalk.dim('(No brand context loaded)'));
          }
          console.log(chalk.dim('Type your message or "exit" to quit.\n'));
        }

        if ((isJsonOutput() || isYamlOutput()) && process.stdin.isTTY) {
          throw createUnsupportedModeError('`karis chat --json` does not support interactive TTY sessions.', [
            'For interactive use, run `npx karis chat`',
            'For automation, consume stream events with `npx karis --jsonl chat`',
          ]);
        }

        const rl = readline.createInterface({ input, output: promptOutput });
        const messages = brandContext ? [brandContext] : [];

        // Handle readline close event
        let readlineClosed = false;
        rl.on('close', () => {
          readlineClosed = true;
        });

        // SIGINT handler for remote agent interrupt
        const sigintHandler = async () => {
          if (agent instanceof RemoteAgent) {
            await agent.interrupt();
            // Save conversation ID before exiting
            const convId = agent.getConversationId();
            if (convId) {
              await setLastConversationId(convId);
            }
          }
          if (isTextOutput()) {
            console.log(chalk.dim('\n[interrupted]\n'));
          }
          rl.close();
          process.exit(0);
        };
        process.on('SIGINT', sigintHandler);

        try {
          while (true) {
            // Check if readline is closed before attempting to read
            if (readlineClosed) {
              break;
            }

            let userInput: string;
            try {
              userInput = await rl.question(isTextOutput() ? chalk.cyan('You: ') : '');

              // Give time for close event to fire if stdin reached EOF
              await new Promise(resolve => setImmediate(resolve));

              if (readlineClosed) {
                break;
              }
            } catch (error) {
              // Handle readline closure error
              if (error instanceof Error && error.message.includes('closed')) {
                break;
              }
              throw error;
            }

            if (!userInput.trim()) {
              // If input is empty and stdin is not a TTY, likely EOF reached
              if (!process.stdin.isTTY) {
                break;
              }
              continue;
            }

            if (userInput.toLowerCase() === 'exit') {
              // Save conversation ID for next session
              if (agent instanceof RemoteAgent) {
                const convId = agent.getConversationId();
                if (convId) {
                  await setLastConversationId(convId);
                }
              }
              if (isTextOutput()) {
                console.log();
                console.log(chalk.dim(`Session ended. Conversation saved. Run \`npx karis chat\` to continue.`));
                console.log();
              }
              break;
            }

            messages.push({ role: 'user', content: userInput });

            if (isTextOutput()) {
              process.stdout.write(chalk.green('CMO: '));
            }

            let fullResponse = '';
            let hasError = false;
            const events: Array<{ type: string; tool?: string; error?: string; content?: string }> = [];

            resetToolCallCounter();
            for await (const chunk of agent.streamChat(messages, undefined, options.skill)) {
              renderChunk(chunk);
              events.push(chunk);

              if (chunk.type === 'content' && chunk.content) {
                fullResponse += chunk.content;
              }
              if (chunk.type === 'error') {
                hasError = true;
              }
            }

            if (hasError) {
              rl.close();
              process.exit(1);
            }

            if (agent instanceof RemoteAgent) {
              const convId = agent.getConversationId();
              if (convId) {
                await setLastConversationId(convId);
              }
            }

            if (fullResponse) {
              messages.push({ role: 'assistant', content: fullResponse });
            }

            if (isJsonOutput() || isJsonLinesOutput() || isYamlOutput()) {
              transcript.push({
                user: userInput,
                assistant: fullResponse,
                events,
              });
            }
          }
        } finally {
          process.removeListener('SIGINT', sigintHandler);
          rl.close();
        }

        if (isJsonOutput() || isYamlOutput()) {
          printCommandResult({
            conversation_id: agent instanceof RemoteAgent ? (agent.getConversationId() || undefined) : undefined,
            mode: agent.getMode(),
            transcript,
          });
        }
    }));
}

async function initializeInteractiveConversation(
  agent: AgentInterface,
  options: { conversation?: string },
): Promise<void> {
  if (!(agent instanceof RemoteAgent)) {
    return;
  }

  if (options.conversation) {
    agent.setConversationId(options.conversation);
    return;
  }

  const lastConversationId = await getLastConversationId();
  if (lastConversationId) {
    agent.setConversationId(lastConversationId);
    return;
  }

  const conversationId = await agent.ensureConversationId();
  await setLastConversationId(conversationId);
}

async function runSingleTurnChat(
  agent: AgentInterface,
  prompt: string,
  options: { conversation?: string; skill?: string },
): Promise<void> {
  const brandContext = await agent.getBrandContext();
  const messages = brandContext ? [brandContext] : [];
  messages.push({ role: 'user', content: prompt });

  if (isTextOutput()) {
    console.log();
  }

  const chunks: StreamChunk[] = [];
  let response = '';

  const sigintHandler = async () => {
    if (agent instanceof RemoteAgent && options.conversation) {
      await agent.interrupt();
      const convId = agent.getConversationId();
      if (convId) {
        await setLastConversationId(convId);
      }
    }
    if (isTextOutput()) {
      console.log(chalk.dim('\n[interrupted]\n'));
    }
    process.exit(0);
  };
  process.on('SIGINT', sigintHandler);

  try {
    resetToolCallCounter();
    for await (const chunk of agent.streamChat(messages, undefined, options.skill)) {
      renderChunk(chunk);
      chunks.push(chunk);

      if (chunk.type === 'content' && chunk.content) {
        response += chunk.content;
      }
      if (chunk.type === 'error') {
        process.exit(1);
      }
    }
  } finally {
    process.removeListener('SIGINT', sigintHandler);
  }

  if (agent instanceof RemoteAgent && options.conversation) {
    const convId = agent.getConversationId();
    if (convId) {
      await setLastConversationId(convId);
    }
  }

  if (isJsonOutput() || isYamlOutput()) {
    printCommandResult({
      prompt,
      response,
      events: chunks,
      conversation_id: agent instanceof RemoteAgent ? (agent.getConversationId() || undefined) : undefined,
      mode: agent.getMode(),
    }, {
      meta: {
        runtime: agent.getDescription(),
      },
    });
  }
}
