import { loadConfig } from '../utils/config.js';

const EXIT_AUTH = 78;
const EXIT_RUNTIME = 1;

export interface AgentEvent {
  type: 'text' | 'tool_start' | 'tool_end' | 'done' | 'error';
  data?: Record<string, unknown>;
}

export interface ChatOptions {
  conversationId?: string;
  mode?: 'lite' | 'full';
  tz?: string;
}

export interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export interface ConversationHistory {
  messages: HistoryMessage[];
  has_more: boolean;
  summary?: string | null;
}

export interface HistoryOptions {
  before?: number;
  limit?: number;
}

export interface APIKeyInfo {
  id: string;
  name: string;
  key_prefix: string;
  status: string;
  credit_limit: number | null;
  credits_consumed: number | null;
  scopes: string[];
  expires_at: string | null;
  created_at: string;
}

export interface BrandProfile {
  name: string;
  domain: string;
  category: string;
  industries: string[];
  audience: {
    primary: string;
    secondary: string;
  };
  value_propositions: string[];
  competitors: Array<{ name: string; domain: string }>;
  keywords: string[];
  channels: string[];
  tone: string;
}

export class KarisApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly exitCode: number,
  ) {
    super(message);
    this.name = 'KarisApiError';
  }
}

export interface KarisClientOptions {
  apiKey?: string;
  apiUrl?: string;
}

export class KarisClient {
  private apiKey: string;
  private apiUrl: string;

  constructor(options: KarisClientOptions = {}) {
    this.apiKey = options.apiKey || '';
    this.apiUrl = options.apiUrl || 'https://api.karis.im';
  }

  static async create(): Promise<KarisClient> {
    const config = await loadConfig();
    const apiKey = process.env.KARIS_API_KEY || config['api-key'] || '';
    const apiUrl = process.env.KARIS_API_URL || config['base-url'] || 'https://api.karis.im';
    return new KarisClient({ apiKey, apiUrl });
  }

  hasApiKey(): boolean {
    return this.apiKey.length > 0;
  }

  async verifyKey(): Promise<APIKeyInfo> {
    const response = await fetch(`${this.apiUrl}/api/api-keys/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });

    if (!response.ok) {
      throw this.buildError(response.status, await this.extractMessage(response));
    }

    const body = (await response.json()) as { data?: APIKeyInfo };
    if (!body.data) {
      throw new KarisApiError('Unexpected response', 'INVALID_RESPONSE', 500, EXIT_RUNTIME);
    }
    return body.data;
  }

  async *chat(message: string, options: ChatOptions = {}): AsyncGenerator<AgentEvent> {
    const conversationId = options.conversationId ?? crypto.randomUUID();
    const url = `${this.apiUrl}/api/v1/agent/convs/${conversationId}/message`;

    const payload: Record<string, unknown> = {
      message,
      conversation_id: conversationId,
    };
    if (options.mode) payload.mode_hint = options.mode;
    if (options.tz) payload.tz = options.tz;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw this.buildError(response.status, await this.extractMessage(response));
    }

    if (!response.body) {
      throw new KarisApiError('No response body', 'NO_BODY', 500, EXIT_RUNTIME);
    }

    yield* this.consumeSSE(response.body);
  }

  async *resumeEvents(conversationId: string, since?: string): AsyncGenerator<AgentEvent> {
    const url = `${this.apiUrl}/api/v1/agent/convs/${conversationId}/events`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(since ? { since } : {}),
    });

    if (!response.ok) {
      throw this.buildError(response.status, await this.extractMessage(response));
    }
    if (!response.body) {
      throw new KarisApiError('No response body', 'NO_BODY', 500, EXIT_RUNTIME);
    }
    yield* this.consumeSSE(response.body);
  }

  async getHistory(conversationId: string, options: HistoryOptions = {}): Promise<ConversationHistory> {
    const params = new URLSearchParams();
    if (options.before != null) params.set('before', String(options.before));
    if (options.limit != null) params.set('limit', String(options.limit));

    const url = `${this.apiUrl}/api/v1/agent/convs/${conversationId}/history?${params}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });

    if (!response.ok) {
      throw this.buildError(response.status, await this.extractMessage(response));
    }

    const body = (await response.json()) as { data?: ConversationHistory };
    return body.data ?? { messages: [], has_more: false };
  }

  async clearHistory(conversationId: string): Promise<void> {
    const url = `${this.apiUrl}/api/v1/agent/convs/${conversationId}/history`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!response.ok) {
      throw this.buildError(response.status, await this.extractMessage(response));
    }
  }

  async interrupt(conversationId: string): Promise<void> {
    const url = `${this.apiUrl}/api/v1/agent/convs/${conversationId}/interrupt`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!response.ok) {
      throw this.buildError(response.status, await this.extractMessage(response));
    }
  }

  // --- Brand API ---

  async getBrand(): Promise<BrandProfile | null> {
    const url = `${this.apiUrl}/api/v1/brand`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });

    if (response.status === 404) {
      return null; // No brand profile yet
    }

    if (!response.ok) {
      throw this.buildError(response.status, await this.extractMessage(response));
    }

    const body = (await response.json()) as { data?: BrandProfile };
    return body.data ?? null;
  }

  async createBrand(profile: BrandProfile): Promise<BrandProfile> {
    const url = `${this.apiUrl}/api/v1/brand`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      throw this.buildError(response.status, await this.extractMessage(response));
    }

    const body = (await response.json()) as { data?: BrandProfile };
    if (!body.data) {
      throw new KarisApiError('Unexpected response', 'INVALID_RESPONSE', 500, EXIT_RUNTIME);
    }
    return body.data;
  }

  async updateBrand(profile: Partial<BrandProfile>): Promise<BrandProfile> {
    const url = `${this.apiUrl}/api/v1/brand`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      throw this.buildError(response.status, await this.extractMessage(response));
    }

    const body = (await response.json()) as { data?: BrandProfile };
    if (!body.data) {
      throw new KarisApiError('Unexpected response', 'INVALID_RESPONSE', 500, EXIT_RUNTIME);
    }
    return body.data;
  }

  // --- SSE parsing ---

  private async *consumeSSE(body: ReadableStream<Uint8Array>): AsyncGenerator<AgentEvent> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split('\n\n');
      buffer = chunks.pop() || '';

      for (const chunk of chunks) {
        if (!chunk.trim()) continue;

        let eventType = '';
        let dataStr = '';

        for (const line of chunk.split('\n')) {
          if (line.startsWith('event: ')) eventType = line.slice(7).trim();
          else if (line.startsWith('data: ')) dataStr = line.slice(6).trim();
        }

        if (!eventType || !dataStr) continue;
        if (eventType === 'heartbeat') continue;
        if (eventType === 'done') {
          yield { type: 'done' };
          return;
        }

        try {
          yield this.parseEvent(eventType, JSON.parse(dataStr));
        } catch {
          // skip malformed JSON
        }
      }
    }
  }

  private parseEvent(eventType: string, data: Record<string, unknown>): AgentEvent {
    switch (eventType) {
      case 'text':
        return { type: 'text', data: { text: data.text ?? '' } };
      case 'tool_start':
        return { type: 'tool_start', data: { tool: data.tool } };
      case 'tool_end':
        return { type: 'tool_end', data: { tool: data.tool, result: data.result_summary } };
      case 'error':
        return { type: 'error', data: { message: data.message } };
      default:
        return { type: 'text', data: { text: '' } };
    }
  }

  // --- Error classification ---

  private async extractMessage(response: Response): Promise<string> {
    try {
      const body = (await response.json()) as { message?: string };
      return body?.message || '';
    } catch {
      return '';
    }
  }

  private buildError(status: number, msg: string): KarisApiError {
    if (status === 401) {
      if (/revoked|disabled/i.test(msg) && !/invalid/i.test(msg)) {
        return new KarisApiError(
          'API key has been disabled. Enable it at https://karis.im/settings/api-keys',
          'KEY_DISABLED',
          status,
          EXIT_AUTH,
        );
      }
      if (/\bexpired\b/i.test(msg) && !/invalid/i.test(msg)) {
        return new KarisApiError(
          'API key has expired. Create a new key at https://karis.im/settings/api-keys',
          'KEY_EXPIRED',
          status,
          EXIT_AUTH,
        );
      }
      return new KarisApiError(
        'Invalid API key. Check your key or create a new one at https://karis.im/settings/api-keys',
        'INVALID_KEY',
        status,
        EXIT_AUTH,
      );
    }

    if (status === 403) {
      if (/insufficient.?credits/i.test(msg)) {
        return new KarisApiError(
          'Insufficient credits. Your API key has reached its credit limit.',
          'INSUFFICIENT_CREDITS',
          status,
          EXIT_AUTH,
        );
      }
      return new KarisApiError(
        `Access denied: ${msg || 'insufficient permissions'}`,
        'ACCESS_DENIED',
        status,
        EXIT_AUTH,
      );
    }

    return new KarisApiError(`API error ${status}: ${msg || 'unknown'}`, 'API_ERROR', status, EXIT_RUNTIME);
  }
}
