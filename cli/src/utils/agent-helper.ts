import chalk from 'chalk';
import { AgentFactory } from '../core/agent-factory.js';
import type { AgentInterface, StreamChunk } from '../core/agent-interface.js';

/**
 * Create and validate agent
 */
export async function createAgent(): Promise<AgentInterface> {
  const agent = await AgentFactory.create();

  if (!(await agent.isAvailable())) {
    showApiKeyError();
    process.exit(1);
  }

  return agent;
}

/**
 * Show API key error message
 */
function showApiKeyError(): void {
  console.log();
  console.log(chalk.yellow('Karis API key required.'));
  console.log();
  console.log(`  Get your key: ${chalk.cyan('https://karis.im/settings/api-keys')}`);
  console.log(`  Set it:       ${chalk.cyan('npx karis config set api-key <your-key>')}`);
  console.log();
  console.log(chalk.dim('  Or use environment variable:'));
  console.log(`    ${chalk.green('export KARIS_API_KEY=sk-ka-v1-...')}`);
  console.log();
  console.log(chalk.dim('  Free tier available'));
  console.log();
}

/**
 * Execute a single-turn chat with Karis Platform
 */
export async function executeSingleTurn(prompt: string): Promise<void> {
  const agent = await createAgent();

  for await (const chunk of agent.streamChat([
    { role: 'user', content: prompt }
  ])) {
    renderChunk(chunk);
  }
}

/**
 * Render stream chunk
 */
export function renderChunk(chunk: StreamChunk): void {
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
      process.exit(1);
  }
}
