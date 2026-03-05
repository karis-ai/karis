import { Command } from 'commander';
import chalk from 'chalk';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { createAgent, renderChunk } from '../utils/agent-helper.js';
import { RemoteAgent } from '../core/remote-agent.js';

export function registerChatCommand(program: Command): void {
  program
    .command('chat')
    .description('Interactive multi-turn conversation with CMO Agent')
    .option('-c, --conversation <id>', 'Continue an existing conversation')
    .action(async (options) => {
      try {
        const agent = await createAgent();

        // Resume existing conversation if --conversation provided
        if (options.conversation && agent instanceof RemoteAgent) {
          agent.setConversationId(options.conversation);
        }

        const brandContext = await agent.getBrandContext();

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

        const rl = readline.createInterface({ input, output });
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
          }
          console.log(chalk.dim('\n[interrupted]\n'));
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
              userInput = await rl.question(chalk.cyan('You: '));

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
              console.log();
              console.log(chalk.dim('Session ended. Run `npx karis chat` to start a new conversation.'));
              console.log();
              break;
            }

            messages.push({ role: 'user', content: userInput });

            process.stdout.write(chalk.green('CMO: '));

            let fullResponse = '';
            let hasError = false;

            for await (const chunk of agent.streamChat(messages)) {
              renderChunk(chunk);

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
          }
        } finally {
          process.removeListener('SIGINT', sigintHandler);
          rl.close();
        }
      } catch (error) {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });
}
