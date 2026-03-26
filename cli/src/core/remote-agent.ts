import { AgentInterface, ChatMessage, StreamChunk, AgentMode } from './agent-interface.js';
import { KarisClient, KarisApiError } from './client.js';
import type { AgentEvent } from './client.js';

export interface RemoteAgentOptions {
  apiKey: string;
  apiUrl?: string;
}

/**
 * Remote Agent — connects to Karis Platform via SSE for enhanced CMO features.
 *
 * The backend manages conversation history, so we only send the latest
 * user message and let the server handle context.
 */
export class RemoteAgent implements AgentInterface {
  private client: KarisClient;
  private conversationId = '';

  getClient(): KarisClient {
    return this.client;
  }

  constructor(options: RemoteAgentOptions) {
    this.client = new KarisClient({
      apiKey: options.apiKey,
      apiUrl: options.apiUrl,
    });
  }

  getConversationId(): string {
    return this.conversationId;
  }

  setConversationId(id: string): void {
    this.conversationId = id;
  }

  clearConversationId(): void {
    this.conversationId = '';
  }

  async ensureConversationId(): Promise<string> {
    if (!this.conversationId) {
      this.conversationId = await this.client.ensureConversation();
    }
    return this.conversationId;
  }

  async isAvailable(): Promise<boolean> {
    return this.client.hasApiKey();
  }

  async getBrandContext(): Promise<ChatMessage | null> {
    const brandProfile = await this.client.getBrand();
    if (!brandProfile) return null;

    const industries = brandProfile.industries?.join(', ') || 'N/A';
    const primaryAudience = brandProfile.audience?.primary || 'N/A';
    const valueProps = brandProfile.value_propositions?.join('; ') || 'N/A';
    const keywords = brandProfile.keywords?.join(', ') || 'N/A';

    return {
      role: 'system',
      content: `Brand Context:
- Name: ${brandProfile.name || brandProfile.domain}
- Domain: ${brandProfile.domain}
- Category: ${brandProfile.category || 'N/A'}
- Industries: ${industries}
- Primary Audience: ${primaryAudience}
- Value Propositions: ${valueProps}
- Keywords: ${keywords}

You are the CMO for ${brandProfile.name || brandProfile.domain}. Use this context to provide strategic marketing advice.`,
    };
  }

  async *streamChat(
    messages: ChatMessage[],
    onChunk?: (chunk: StreamChunk) => void,
    skillHint?: string,
    toolHint?: string,
  ): AsyncGenerator<StreamChunk, void, unknown> {
    if (!(await this.isAvailable())) {
      const chunk: StreamChunk = {
        type: 'error',
        error: 'No Karis API key found. Set KARIS_API_KEY or run: npx karis config set api-key <key>',
      };
      if (onChunk) onChunk(chunk);
      yield chunk;
      return;
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMessage) {
      const chunk: StreamChunk = { type: 'error', error: 'No user message provided.' };
      if (onChunk) onChunk(chunk);
      yield chunk;
      return;
    }

    try {
      yield* this.streamWithConversationRecovery(lastUserMessage.content, onChunk, skillHint, toolHint);
    } catch (error) {
      const message =
        error instanceof KarisApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : String(error);
      const chunk: StreamChunk = { type: 'error', error: message };
      if (onChunk) onChunk(chunk);
      yield chunk;
    }
  }

  /**
   * Interrupt a running conversation (e.g. on Ctrl+C).
   */
  async interrupt(): Promise<void> {
    if (!this.conversationId) {
      return;
    }
    try {
      await this.client.interrupt(this.conversationId);
    } catch {
      // best-effort
    }
  }

  getMode(): AgentMode {
    return 'remote';
  }

  getDescription(): string {
    return 'Karis Platform (Enhanced CMO)';
  }

  private mapEvent(event: AgentEvent): StreamChunk | null {
    switch (event.type) {
      case 'text':
        return { type: 'content', content: String(event.data?.text ?? '') };
      case 'tool_start': {
        const args = event.data?.args as Record<string, unknown> | undefined;
        return {
          type: 'tool_start',
          tool: String(event.data?.tool ?? 'unknown'),
          title: event.data?.title ? String(event.data.title) : undefined,
          args,
        };
      }
      case 'tool_end':
        return {
          type: 'tool_end',
          tool: String(event.data?.tool ?? 'unknown'),
          result: String(event.data?.result ?? ''),
          latency_ms: typeof event.data?.latency_ms === 'number' ? event.data.latency_ms : undefined,
        };
      case 'hitl_request': {
        const d = event.data ?? {};
        return {
          type: 'hitl_request',
          hitl_id: String(d.hitl_id ?? ''),
          hitl_type: String(d.hitl_type ?? 'confirm'),
          prompt: d.prompt ? String(d.prompt) : undefined,
          form_data: d.form_data as StreamChunk['form_data'],
          auth_url: d.auth_url ? String(d.auth_url) : undefined,
        };
      }
      case 'working_summary':
        return { type: 'working_summary', summary_text: String(event.data?.text ?? '') };
      case 'progress': {
        const rawSteps = event.data?.steps;
        const steps = Array.isArray(rawSteps)
          ? rawSteps.map((s: Record<string, unknown>) => ({ label: String(s.label ?? ''), status: String(s.status ?? '') }))
          : [];
        return { type: 'progress', steps };
      }
      case 'output_artifact': {
        const rawItems = event.data?.items;
        const artifacts = Array.isArray(rawItems)
          ? rawItems.map((item: Record<string, unknown>) => ({
              name: item.name ? String(item.name) : undefined,
              url: item.url ? String(item.url) : undefined,
              file_id: item.file_id ? String(item.file_id) : undefined,
              file_extension: item.file_extension ? String(item.file_extension) : undefined,
            }))
          : [];
        return { type: 'output_artifact', artifacts };
      }
      case 'done':
        return { type: 'done' };
      case 'error':
        if (event.data?.recoverable === true) {
          return null;
        }
        return { type: 'error', error: String(event.data?.message ?? 'Unknown error') };
      default:
        return null;
    }
  }

  private async *streamWithConversationRecovery(
    message: string,
    onChunk?: (chunk: StreamChunk) => void,
    skillHint?: string,
    toolHint?: string,
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const originalConversationId = this.conversationId;
    const retryableConversation = Boolean(originalConversationId);

    try {
      yield* this.streamForConversation(message, onChunk, skillHint, toolHint);
      return;
    } catch (error) {
      if (!this.shouldRetryWithFreshConversation(error, retryableConversation)) {
        throw error;
      }
    }

    this.clearConversationId();
    yield* this.streamForConversation(message, onChunk, skillHint, toolHint);
  }

  private async *streamForConversation(
    message: string,
    onChunk?: (chunk: StreamChunk) => void,
    skillHint?: string,
    toolHint?: string,
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const conversationId = await this.ensureConversationId();
    let extensionRelayConnected = false;
    try {
      const status = await this.client.getBrowserStatus(5000);
      extensionRelayConnected = !!status.extension_connected && !!status.can_execute;
    } catch {
      // Best-effort only. Chat should still work when browser relay status is unavailable.
    }
    const stream = this.client.chat(message, {
      conversationId,
      skillHint,
      toolHint,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      interactionMode: 'headless',
      extensionRelayConnected,
    });

    for await (const event of stream) {
      const chunk = this.mapEvent(event);
      if (chunk) {
        if (onChunk) onChunk(chunk);
        yield chunk;
      }
    }
  }

  private shouldRetryWithFreshConversation(error: unknown, retryableConversation: boolean): boolean {
    if (!(error instanceof KarisApiError) || !retryableConversation) {
      return false;
    }

    return error.code === 'REQUEST_TIMEOUT' || error.statusCode === 404;
  }
}
