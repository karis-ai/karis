import { loadResolvedConfig } from '../utils/config.js';

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
  scopes?: string[];
  expires_at: string | null;
  created_at: string;
}

// Brand Assets API Types (based on actual API response)
export interface BrandAssetsSelection {
  brand_id: string;
  canonical_domain: string;
  display_name: string;
  aliases: string[];
  domains: string[];
  is_selected: boolean;
  binding_status: string;
  binding_created_at: string;
  has_customization: boolean;
  public_updated_at: string;
  last_ack_public_at: string | null;
  has_public_update: boolean;
  previous_available: boolean;
  public_profile_hash: string;
  public_clusters_hash: string;
  brand_profile: {
    profile: {
      name: string;
      tagline?: string;
      one_liner?: string;
      categories?: string[];
      brand_aliases?: string[];
      core_offerings?: string[];
      core_value_props?: string[];
      primary_audiences?: string[];
      positioning_angles?: string[];
      primary_brand_jobs?: string[];
      inferred_industries?: string[];
      personas?: string[];
      linkage?: any;
      competitive_landscape?: {
        summary?: string;
        segments?: any[];
        direct_competitor?: Array<{
          name: string;
          domain: string;
          confidence: string;
        }>;
      };
    };
    data_sources?: string[];
    model?: string;
  };
  topic_clusters?: {
    clusters?: any[];
    data_sources?: string[];
    model?: string;
  };
  brand_assets_kit_payload: any | null;
  brand_assets_kit_sources: any | null;
  brand_kit: any | null;
  generation_status?: {
    profile?: {
      status: string;
      started_at: string;
      duration_ms: number;
      model: string;
      last_updated_by_user_email: string | null;
      progress_percent: number;
    };
    clusters?: {
      status: string;
      started_at: string;
      duration_ms: number;
      model: string;
      last_updated_by_user_email: string | null;
      progress_percent: number;
    };
    overall_progress_percent?: number;
    stage?: string;
  };
}

// Simplified view for CLI display
export interface BrandProfile {
  id: string;
  domain: string;
  name: string;
  description?: string;
  longDescription?: string;
  claimed?: boolean;
  // From brand_profile.profile
  tagline?: string;
  one_liner?: string;
  category?: string; // First category
  categories?: string[];
  industries?: string[];
  audience?: {
    primary?: string;
    secondary?: string;
  };
  value_propositions?: string[];
  competitors?: Array<{ name: string; domain: string }>;
  keywords?: string[];
  channels?: string[];
  tone?: string;
  // Brand assets (if available)
  colors?: any[];
  logos?: any[];
  fonts?: any[];
  links?: any[];
}

export interface BrandCustomizations {
  category?: string;
  categories?: string[];
  industries?: string[];
  audience?: {
    primary?: string;
    secondary?: string;
  };
  value_propositions?: string[];
  competitors?: Array<{ name: string; domain: string }>;
  keywords?: string[];
  channels?: string[];
  tone?: string;
}

// Legacy type for backward compatibility
export type BrandAssetsSnapshot = BrandProfile;


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
  private static readonly CHAT_CONNECT_TIMEOUT_MS = 30000;

  constructor(options: KarisClientOptions = {}) {
    this.apiKey = options.apiKey || '';
    this.apiUrl = options.apiUrl || 'https://api.karis.im';
  }

  static async create(): Promise<KarisClient> {
    const resolved = await loadResolvedConfig();
    return new KarisClient({
      apiKey: resolved.apiKey.value || '',
      apiUrl: resolved.apiUrl.value || 'https://api.karis.im',
    });
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

  async ensureConversation(): Promise<string> {
    const response = await fetch(`${this.apiUrl}/api/v1/agent/conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw this.buildError(response.status, await this.extractMessage(response));
    }

    const body = (await response.json()) as { data?: { conversation_id?: string } };
    const conversationId = body.data?.conversation_id;
    if (!conversationId) {
      throw new KarisApiError('Unexpected response', 'INVALID_RESPONSE', 500, EXIT_RUNTIME);
    }
    return conversationId;
  }

  async *chat(message: string, options: ChatOptions = {}): AsyncGenerator<AgentEvent> {
    const conversationId = options.conversationId;
    if (!conversationId) {
      throw new KarisApiError(
        'conversationId is required. Call ensureConversation() before chat().',
        'MISSING_CONVERSATION',
        500,
        EXIT_RUNTIME,
      );
    }
    const url = `${this.apiUrl}/api/v1/agent/convs/${conversationId}/message`;

    const payload: Record<string, unknown> = {
      message,
      conversation_id: conversationId,
    };
    if (options.mode) payload.mode_hint = options.mode;
    if (options.tz) payload.tz = options.tz;

    const connectController = new AbortController();
    const connectTimer = setTimeout(
      () => connectController.abort(),
      KarisClient.CHAT_CONNECT_TIMEOUT_MS,
    );

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: connectController.signal,
      });
      clearTimeout(connectTimer);
    } catch (error) {
      clearTimeout(connectTimer);
      if (this.isTimeoutError(error)) {
        throw new KarisApiError(
          'Timed out waiting for the chat response. The saved conversation may be stale, or the backend may be delayed.',
          'REQUEST_TIMEOUT',
          504,
          EXIT_RUNTIME,
        );
      }
      throw error;
    }

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

  // --- Brand Assets API ---

  async getBrand(): Promise<BrandProfile | null> {
    const url = `${this.apiUrl}/api/v1/brand-assets/selection`;
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

    const body = (await response.json()) as { data?: BrandAssetsSelection };
    if (!body.data) return null;

    const data = body.data;
    const profile = data.brand_profile?.profile;

    // Transform API response to BrandProfile
    return {
      id: data.brand_id,
      domain: data.canonical_domain,
      name: data.display_name || profile?.name || data.canonical_domain,
      description: profile?.one_liner,
      longDescription: profile?.tagline,
      claimed: data.binding_status === 'active',
      tagline: profile?.tagline,
      one_liner: profile?.one_liner,
      category: profile?.categories?.[0],
      categories: profile?.categories,
      industries: profile?.inferred_industries,
      audience: profile?.primary_audiences ? {
        primary: profile.primary_audiences[0],
        secondary: profile.primary_audiences[1],
      } : undefined,
      value_propositions: profile?.core_value_props,
      competitors: profile?.competitive_landscape?.direct_competitor?.map(c => ({
        name: c.name,
        domain: c.domain,
      })),
      keywords: profile?.categories, // Using categories as keywords for now
      channels: undefined, // Not in current API response
      tone: undefined, // Not in current API response
    };
  }

  async createBrand(domain: string): Promise<BrandProfile> {
    const url = `${this.apiUrl}/api/v1/brand-assets/analyze`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ domain }),
    });

    if (!response.ok) {
      throw this.buildError(response.status, await this.extractMessage(response));
    }

    const body = (await response.json()) as { data?: BrandAssetsSelection };
    if (!body.data) {
      throw new KarisApiError('Unexpected response', 'INVALID_RESPONSE', 500, EXIT_RUNTIME);
    }

    const data = body.data;
    const profile = data.brand_profile?.profile;

    return {
      id: data.brand_id,
      domain: data.canonical_domain,
      name: data.display_name || profile?.name || data.canonical_domain,
      description: profile?.one_liner,
      longDescription: profile?.tagline,
      claimed: data.binding_status === 'active',
      tagline: profile?.tagline,
      one_liner: profile?.one_liner,
      category: profile?.categories?.[0],
      categories: profile?.categories,
      industries: profile?.inferred_industries,
      audience: profile?.primary_audiences ? {
        primary: profile.primary_audiences[0],
        secondary: profile.primary_audiences[1],
      } : undefined,
      value_propositions: profile?.core_value_props,
      competitors: profile?.competitive_landscape?.direct_competitor?.map(c => ({
        name: c.name,
        domain: c.domain,
      })),
      keywords: profile?.categories,
      channels: undefined,
      tone: undefined,
    };
  }

  /** List all brands for the current user */
  async listBrands(): Promise<BrandProfile[]> {
    const url = `${this.apiUrl}/api/v1/brand-assets`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });

    if (!response.ok) {
      throw this.buildError(response.status, await this.extractMessage(response));
    }

    const body = (await response.json()) as { data?: BrandAssetsSelection[] };
    if (!body.data) return [];

    return body.data.map(data => {
      const profile = data.brand_profile?.profile;
      return {
        id: data.brand_id,
        domain: data.canonical_domain,
        name: data.display_name || profile?.name || data.canonical_domain,
        description: profile?.one_liner,
        longDescription: profile?.tagline,
        claimed: data.binding_status === 'active',
        tagline: profile?.tagline,
        one_liner: profile?.one_liner,
        category: profile?.categories?.[0],
        categories: profile?.categories,
        industries: profile?.inferred_industries,
        audience: profile?.primary_audiences ? {
          primary: profile.primary_audiences[0],
          secondary: profile.primary_audiences[1],
        } : undefined,
        value_propositions: profile?.core_value_props,
        competitors: profile?.competitive_landscape?.direct_competitor?.map(c => ({
          name: c.name,
          domain: c.domain,
        })),
        keywords: profile?.categories,
        channels: undefined,
        tone: undefined,
      };
    });
  }

  /** Set the selected brand (switch active brand) */
  async setBrandSelection(brandId: string): Promise<BrandProfile> {
    const url = `${this.apiUrl}/api/v1/brand-assets/selection`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ brand_id: brandId }),
    });

    if (!response.ok) {
      throw this.buildError(response.status, await this.extractMessage(response));
    }

    const body = (await response.json()) as { data?: BrandAssetsSelection };
    if (!body.data) {
      throw new KarisApiError('Unexpected response', 'INVALID_RESPONSE', 500, EXIT_RUNTIME);
    }

    const data = body.data;
    const profile = data.brand_profile?.profile;

    return {
      id: data.brand_id,
      domain: data.canonical_domain,
      name: data.display_name || profile?.name || data.canonical_domain,
      description: profile?.one_liner,
      longDescription: profile?.tagline,
      claimed: data.binding_status === 'active',
      tagline: profile?.tagline,
      one_liner: profile?.one_liner,
      category: profile?.categories?.[0],
      categories: profile?.categories,
      industries: profile?.inferred_industries,
      audience: profile?.primary_audiences ? {
        primary: profile.primary_audiences[0],
        secondary: profile.primary_audiences[1],
      } : undefined,
      value_propositions: profile?.core_value_props,
      competitors: profile?.competitive_landscape?.direct_competitor?.map(c => ({
        name: c.name,
        domain: c.domain,
      })),
      keywords: profile?.categories,
      channels: undefined,
      tone: undefined,
    };
  }

  async updateBrand(customizations: BrandCustomizations): Promise<BrandProfile> {
    // Get current brand to obtain brand_id
    const currentBrand = await this.getBrand();
    if (!currentBrand) {
      throw new KarisApiError('No brand profile found', 'NO_BRAND', 404, EXIT_RUNTIME);
    }

    // Build override_profile by mapping CLI field names to API profile field names
    const overrideProfile: Record<string, unknown> = {};

    if (customizations.category !== undefined) {
      overrideProfile['categories'] = [customizations.category];
    }
    if (customizations.categories !== undefined) {
      overrideProfile['categories'] = customizations.categories;
    }
    if (customizations.industries !== undefined) {
      overrideProfile['inferred_industries'] = customizations.industries;
    }
    if (customizations.audience !== undefined) {
      const audiences: string[] = [];
      if (customizations.audience.primary) audiences.push(customizations.audience.primary);
      if (customizations.audience.secondary) audiences.push(customizations.audience.secondary);
      if (audiences.length > 0) overrideProfile['primary_audiences'] = audiences;
    }
    if (customizations.value_propositions !== undefined) {
      overrideProfile['core_value_props'] = customizations.value_propositions;
    }
    if (customizations.competitors !== undefined) {
      overrideProfile['competitive_landscape'] = {
        direct_competitor: customizations.competitors.map((c) => ({
          name: c.name,
          domain: c.domain,
          confidence: 'high',
        })),
      };
    }

    const url = `${this.apiUrl}/api/v1/brand-assets/customizations`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        brand_id: currentBrand.id,
        override_profile: overrideProfile,
      }),
    });

    if (!response.ok) {
      throw this.buildError(response.status, await this.extractMessage(response));
    }

    const body = (await response.json()) as { data?: BrandAssetsSelection };
    if (!body.data) {
      throw new KarisApiError('Unexpected response', 'INVALID_RESPONSE', 500, EXIT_RUNTIME);
    }

    const data = body.data;
    const profile = data.brand_profile?.profile;

    return {
      id: data.brand_id,
      domain: data.canonical_domain,
      name: data.display_name || profile?.name || data.canonical_domain,
      description: profile?.one_liner,
      longDescription: profile?.tagline,
      claimed: data.binding_status === 'active',
      tagline: profile?.tagline,
      one_liner: profile?.one_liner,
      category: profile?.categories?.[0],
      categories: profile?.categories,
      industries: profile?.inferred_industries,
      audience: profile?.primary_audiences ? {
        primary: profile.primary_audiences[0],
        secondary: profile.primary_audiences[1],
      } : undefined,
      value_propositions: profile?.core_value_props,
      competitors: profile?.competitive_landscape?.direct_competitor?.map(c => ({
        name: c.name,
        domain: c.domain,
      })),
      keywords: profile?.categories,
      channels: undefined,
      tone: undefined,
    };
  }

  /** Refresh brand data from source (Brandfetch) */
  async refreshBrand(brandId: string, scopes?: string[]): Promise<BrandProfile> {
    const url = `${this.apiUrl}/api/v1/brand-assets/refresh`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        brand_id: brandId,
        scopes: scopes || ['all'],
      }),
    });

    if (!response.ok) {
      throw this.buildError(response.status, await this.extractMessage(response));
    }

    const body = (await response.json()) as { data?: BrandAssetsSelection };
    if (!body.data) {
      throw new KarisApiError('Unexpected response', 'INVALID_RESPONSE', 500, EXIT_RUNTIME);
    }

    const data = body.data;
    const profile = data.brand_profile?.profile;

    return {
      id: data.brand_id,
      domain: data.canonical_domain,
      name: data.display_name || profile?.name || data.canonical_domain,
      description: profile?.one_liner,
      longDescription: profile?.tagline,
      claimed: data.binding_status === 'active',
      tagline: profile?.tagline,
      one_liner: profile?.one_liner,
      category: profile?.categories?.[0],
      categories: profile?.categories,
      industries: profile?.inferred_industries,
      audience: profile?.primary_audiences ? {
        primary: profile.primary_audiences[0],
        secondary: profile.primary_audiences[1],
      } : undefined,
      value_propositions: profile?.core_value_props,
      competitors: profile?.competitive_landscape?.direct_competitor?.map(c => ({
        name: c.name,
        domain: c.domain,
      })),
      keywords: profile?.categories,
      channels: undefined,
      tone: undefined,
    };
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
      case 'text_delta':
        return { type: 'text', data: { text: data.text ?? '' } };
      case 'tool_start':
        return { type: 'tool_start', data: { tool: data.tool, title: data.title, args: data.args } };
      case 'tool_end':
        return { type: 'tool_end', data: { tool: data.tool, result: data.result_summary, latency_ms: data.latency_ms } };
      case 'error':
        return { type: 'error', data: { message: data.message, recoverable: data.recoverable } };
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
      const missingScope = msg.match(/required scope:\s*([a-z0-9:_-]+)/i)?.[1];
      if (missingScope) {
        return new KarisApiError(
          `API key is missing required scope: ${missingScope}`,
          'MISSING_SCOPE',
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

  private isTimeoutError(error: unknown): error is Error {
    return error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
  }
}
