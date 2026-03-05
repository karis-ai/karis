/**
 * Unified Agent interface for both Remote (Karis Platform) and Local (Skills) modes
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamChunk {
  type: 'content' | 'tool_start' | 'tool_end' | 'error' | 'done';
  content?: string;
  tool?: string;
  result?: string;
  error?: string;
}

export type AgentMode = 'remote' | 'local';

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
    onChunk?: (chunk: StreamChunk) => void
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
