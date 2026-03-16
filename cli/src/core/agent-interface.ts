/**
 * Agent interface for the current Karis Platform runtime.
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamChunk {
  type: 'content' | 'tool_start' | 'tool_end' | 'error' | 'done';
  content?: string;
  tool?: string;
  title?: string;
  args?: Record<string, unknown>;
  result?: string;
  latency_ms?: number;
  error?: string;
}

export type AgentMode = 'remote';

export interface AgentInterface {
  /**
   * Check if the agent is properly configured
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get brand context as a system message
   */
  getBrandContext(): Promise<ChatMessage | null>;

  /**
   * Stream chat responses
   */
  streamChat(
    messages: ChatMessage[],
    onChunk?: (chunk: StreamChunk) => void,
    skillHint?: string,
  ): AsyncGenerator<StreamChunk, void, unknown>;

  /**
   * Get the agent mode
   */
  getMode(): AgentMode;

  /**
   * Get a description of the agent
   */
  getDescription(): string;
}
