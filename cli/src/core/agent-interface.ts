/**
 * Agent interface for the current Karis Platform runtime.
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface HitlFormItem {
  type: string;
  label: string;
  value?: unknown;
  default?: unknown[];
  options?: Array<{ label: string; value: string } | string>;
  description?: string;
  placeholder?: string;
}

export interface HitlFormSection {
  subtitle?: string;
  description?: string;
  items: HitlFormItem[];
}

export interface HitlFormData {
  title?: string;
  passthrough?: boolean;
  sections?: HitlFormSection[];
}

export interface ArtifactItem {
  name?: string;
  url?: string;
  file_id?: string;
  file_extension?: string;
}

export interface StreamChunk {
  type:
    | 'content'
    | 'tool_start'
    | 'tool_end'
    | 'error'
    | 'done'
    | 'hitl_request'
    | 'working_summary'
    | 'progress'
    | 'output_artifact';
  content?: string;
  tool?: string;
  title?: string;
  args?: Record<string, unknown>;
  result?: string;
  latency_ms?: number;
  error?: string;
  hitl_id?: string;
  hitl_type?: string;
  form_data?: HitlFormData;
  prompt?: string;
  auth_url?: string;
  summary_text?: string;
  steps?: Array<{ label?: string; status?: string }>;
  artifacts?: ArtifactItem[];
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
    toolHint?: string,
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
