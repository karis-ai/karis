import { Command } from 'commander';
import chalk from 'chalk';
import * as readline from 'node:readline/promises';
import { Writable } from 'node:stream';
import { stdin as input, stdout as output } from 'node:process';
import { createAgent, renderChunk } from '../utils/agent-helper.js';
import { RemoteAgent } from '../core/remote-agent.js';
import { createUnsupportedModeError } from '../core/errors.js';
import { isJsonLinesOutput, isJsonOutput, isTextOutput } from '../core/cli-context.js';
import { printCommandResult } from '../utils/output.js';
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
    .description('Talk to your CMO')
    .option('-c, --conversation <id>', 'Continue an existing conversation')
    .action(runCommand(async (options) => {
        const agent = await createAgent();
        const transcript: Array<{
          user: string;
          assistant: string;
          events: Array<{ type: string; tool?: string; error?: string; content?: string }>;
        }> = [];

        // Resume existing conversation if --conversation provided, otherwise try last conversation
        if (options.conversation && agent instanceof RemoteAgent) {
          agent.setConversationId(options.conversation);
        } else if (agent instanceof RemoteAgent) {
          // Try to resume last conversation
          const lastConversationId = await getLastConversationId();
          if (lastConversationId) {
            agent.setConversationId(lastConversationId);
          }
        }

        const brandContext = await agent.getBrandContext();
        const promptOutput = isTextOutput() ? output : silentOutput;

        if (isTextOutput()) {
          console.log();
          console.log(chalk.bold('CMO ready.') + chalk.dim(` Mode: ${agent.getDescription()}`));

          if (agent instanceof RemoteAgent) {
            console.log(chalk.dim(`Conversation: ${agent.getConversationId()}`));
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

        if (isJsonOutput() && process.stdin.isTTY) {
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

            for await (const chunk of agent.streamChat(messages)) {
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

            if (fullResponse) {
              messages.push({ role: 'assistant', content: fullResponse });
            }

            if (isJsonOutput() || isJsonLinesOutput()) {
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

        if (isJsonOutput()) {
          printCommandResult({
            conversation_id: agent instanceof RemoteAgent ? agent.getConversationId() : undefined,
            mode: agent.getMode(),
            transcript,
          });
        }
    }));
}
