import { AgentFactory } from '../core/agent-factory.js';
import type { AgentInterface, StreamChunk } from '../core/agent-interface.js';
import { createAuthRequiredError } from '../core/errors.js';
import { getCliContext, isJsonOutput, isYamlOutput } from '../core/cli-context.js';
import { printCommandResult, renderStreamChunk, resetToolCallCounter } from './output.js';
import { RemoteAgent } from '../core/remote-agent.js';

/**
 * Create and validate agent
 */
export async function createAgent(): Promise<AgentInterface> {
  const agent = await AgentFactory.create();

  if (!(await agent.isAvailable())) {
    throw createAuthRequiredError();
  }

  return agent;
}

/**
 * Execute a single-turn chat with Karis Platform
 */
export async function executeSingleTurn(prompt: string): Promise<void> {
  const agent = await createAgent();
  const chunks: StreamChunk[] = [];
  let response = '';

  resetToolCallCounter();
  for await (const chunk of agent.streamChat([
    { role: 'user', content: prompt }
  ])) {
    chunks.push(chunk);
    if (chunk.type === 'content' && chunk.content) {
      response += chunk.content;
    }
    renderChunk(chunk);
  }

  if (isJsonOutput() || isYamlOutput()) {
    printCommandResult({
      prompt,
      response,
      events: chunks,
      conversation_id: agent instanceof RemoteAgent ? (agent.getConversationId() || undefined) : undefined,
      mode: agent.getMode(),
    }, {
      command: getCliContext().commandPath,
      meta: {
        runtime: agent.getDescription(),
      },
    });
  }
}

/**
 * Render stream chunk
 */
export function renderChunk(chunk: StreamChunk): void {
  renderStreamChunk(chunk);
}
