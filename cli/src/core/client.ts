import { loadResolvedConfig } from '../utils/config.js';

const EXIT_AUTH = 78;
const EXIT_RUNTIME = 1;

export interface AgentEvent {
  type: 'text' | 'tool_start' | 'tool_end' | 'done' | 'error' | 'hitl_request' | 'working_summary' | 'progress' | 'output_artifact';
  data?: Record<string, unknown>;
}

export interface ChatOptions {
  conversationId?: string;
  mode?: 'lite' | 'full';
  skillHint?: string;
  toolHint?: string;
  toolArgs?: Record<string, unknown>;
  direct?: boolean;
  tz?: string;
  interactionMode?: 'interactive' | 'headless' | 'automated';
  extensionRelayConnected?: boolean;
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

export interface BrowserStatus {
  success: boolean;
  user_id: string;
  auth_type?: string;
  extension_connected: boolean;
  connected_here: boolean;
  can_execute: boolean;
  owner_instance: string | null;
  local_extension_connected: boolean;
  local_cdp_clients: number;
  instance: {
    hostname: string;
    instance_id: string;
  };
}

export interface RelayTokenResponse {
  token: string;
  expires_in: number;
  user_id: string;
}

export interface BrowserNavigateResult {
  success?: boolean;
  title?: string;
  url?: string;
  [key: string]: unknown;
}

export interface BrowserStateResult {
  url: string;
  title: string;
  viewport: {
    width: number;
    height: number;
  };
  scroll: {
    x: number;
    y: number;
    pageHeight: number;
  };
  dpr: number;
  elements: string;
  accessibility_tree?: string;
  [key: string]: unknown;
}

export interface BrowserContentResult {
  success?: boolean;
  url?: string;
  title?: string;
  content_markdown?: string;
  [key: string]: unknown;
}

export interface BrowserScreenshotResult {
  success?: boolean;
  image_base64?: string;
  base64_png?: string;
  mime_type?: string;
  base64_length?: number;
  [key: string]: unknown;
}

export type BrowserActionResult = Record<string, unknown>;

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


export interface ToolInfo {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
  timeout?: number;
}

export interface SkillInfo {
  slug: string;
  description: string;
}

export interface ToolsResponse {
  status: string;
  data: {
    tools: ToolInfo[];
    skills: SkillInfo[];
    layers: Record<string, string>;
  };
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

interface RequestOptions {
  timeoutMs?: number;
}

export class KarisClient {
  private apiKey: string;
  private apiUrl: string;
  private static readonly HTTP_REQUEST_TIMEOUT_MS = 30000;
  private static readonly BROWSER_STATUS_TIMEOUT_MS = 5000;
  private static readonly CHAT_CONNECT_TIMEOUT_MS = 30000;
  private static readonly CHAT_FIRST_EVENT_TIMEOUT_MS = 30000;

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
    const body = await this.apiGet<{ data?: APIKeyInfo }>('/api/api-keys/me');
    if (!body.data) {
      throw new KarisApiError('Unexpected response', 'INVALID_RESPONSE', 500, EXIT_RUNTIME);
    }
    return body.data;
  }

  async getBrowserStatus(timeoutMs = KarisClient.BROWSER_STATUS_TIMEOUT_MS): Promise<BrowserStatus> {
    return this.apiGet<BrowserStatus>('/api/browser-actions/status', { timeoutMs });
  }

  async getRelayToken(): Promise<RelayTokenResponse> {
    return this.apiGet<RelayTokenResponse>('/api/browser-relay/relay-token');
  }

  async navigateBrowser(url: string): Promise<BrowserNavigateResult> {
    return this.apiPost<BrowserNavigateResult>('/api/browser-actions/navigate', { url });
  }

  async getBrowserState(): Promise<BrowserStateResult> {
    return this.apiGet<BrowserStateResult>('/api/browser-actions/get-state');
  }

  async getBrowserContent(): Promise<BrowserContentResult> {
    return this.apiGet<BrowserContentResult>('/api/browser-actions/get-content');
  }

  async clickBrowser(params: {
    element_index?: number;
    text?: string;
    css_selector?: string;
  }): Promise<BrowserActionResult> {
    return this.apiPost<BrowserActionResult>('/api/browser-actions/click', params);
  }

  async typeBrowser(params: {
    text: string;
    clear?: boolean;
  }): Promise<BrowserActionResult> {
    return this.apiPost<BrowserActionResult>('/api/browser-actions/type', params);
  }

  async scrollBrowser(params?: {
    direction?: string;
    amount?: number;
  }): Promise<BrowserActionResult> {
    return this.apiPost<BrowserActionResult>('/api/browser-actions/scroll', params ?? {});
  }

  async takeBrowserScreenshot(): Promise<BrowserScreenshotResult> {
    return this.apiGet<BrowserScreenshotResult>('/api/browser-actions/screenshot');
  }

  async postToX(params: {
    text: string;
    social_account_id?: string;
    signal_id?: string;
  }): Promise<BrowserActionResult> {
    return this.apiPost<BrowserActionResult>('/api/browser-actions/post-to-x', params);
  }

  async replyToX(params: {
    tweet_url: string;
    text: string;
    social_account_id?: string;
    signal_id?: string;
  }): Promise<BrowserActionResult> {
    return this.apiPost<BrowserActionResult>('/api/browser-actions/reply-to-x', params);
  }

  async followOnX(params: {
    profile?: string;
    profiles?: string[];
  }): Promise<BrowserActionResult> {
    return this.apiPost<BrowserActionResult>('/api/browser-actions/follow-on-x', params);
  }

  async postToReddit(params: {
    subreddit: string;
    title: string;
    body?: string;
  }): Promise<BrowserActionResult> {
    return this.apiPost<BrowserActionResult>('/api/browser-actions/post-to-reddit', params);
  }

  async commentOnReddit(params: {
    post_url: string;
    text: string;
  }): Promise<BrowserActionResult> {
    return this.apiPost<BrowserActionResult>('/api/browser-actions/comment-on-reddit', params);
  }

  async ensureConversation(): Promise<string> {
    const body = await this.apiPost<{ data?: { conversation_id?: string } }>('/api/v1/agent/conversation');
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
    if (options.skillHint) payload.skill_hint = options.skillHint;
    if (options.toolHint) payload.tool_hint = options.toolHint;
    if (options.toolArgs) payload.tool_args = options.toolArgs;
    if (options.direct) payload.direct = true;
    if (options.tz) payload.tz = options.tz;
    if (options.interactionMode) payload.interaction_mode = options.interactionMode;
    if (typeof options.extensionRelayConnected === 'boolean') {
      payload.extension_relay_connected = options.extensionRelayConnected;
    }

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
          'Timed out waiting for the chat backend to start streaming. The saved conversation may be stale, or the agent runtime may be delayed.',
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

  async respondHitl(
    conversationId: string,
    hitlId: string,
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const url = `${this.apiUrl}/api/v1/agent/convs/${conversationId}/hitl`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ hitl_id: hitlId, payload }),
    });
    if (!response.ok) {
      throw this.buildError(response.status, await this.extractMessage(response));
    }
    const body = (await response.json()) as Record<string, unknown>;
    return body;
  }

  async toolDirect(
    toolName: string,
    args: Record<string, unknown>,
    conversationId?: string,
  ): Promise<unknown> {
    const convId = conversationId ?? crypto.randomUUID();
    const url = `${this.apiUrl}/api/v1/agent/convs/${convId}/message`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        tool_hint: toolName,
        tool_args: args,
        direct: true,
        conversation_id: convId,
      }),
    });

    if (!response.ok) {
      throw this.buildError(response.status, await this.extractMessage(response));
    }

    return response.json();
  }

  async listTools(): Promise<ToolsResponse> {
    const url = `${this.apiUrl}/api/v1/agent/tools`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });

    if (!response.ok) {
      throw this.buildError(response.status, await this.extractMessage(response));
    }

    return response.json() as Promise<ToolsResponse>;
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
    let receivedEvent = false;

    while (true) {
      const { done, value } = await this.readWithTimeout(
        reader,
        receivedEvent ? null : KarisClient.CHAT_FIRST_EVENT_TIMEOUT_MS,
      );
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
          receivedEvent = true;
          yield { type: 'done' };
          return;
        }

        try {
          receivedEvent = true;
          yield this.parseEvent(eventType, JSON.parse(dataStr));
        } catch {
          // skip malformed JSON
        }
      }
    }
  }

  private async readWithTimeout(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    timeoutMs: number | null,
  ): Promise<ReadableStreamReadResult<Uint8Array>> {
    if (timeoutMs == null) {
      return reader.read();
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const pendingRead = reader.read();
    try {
      return await Promise.race([
        pendingRead,
        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            void reader.cancel().catch(() => {});
            reject(
              new KarisApiError(
                'Connected to the chat backend, but it did not produce any events. The agent runtime may be stalled.',
                'STREAM_TIMEOUT',
                504,
                EXIT_RUNTIME,
              ),
            );
          }, timeoutMs);
        }),
      ]);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
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
      case 'hitl_request':
        return {
          type: 'hitl_request',
          data: {
            hitl_id: data.hitl_id,
            hitl_type: data.type,
            prompt: data.prompt,
            form_data: data.form_data,
            options: data.options,
            auth_url: (data.form_data as Record<string, unknown>)?.authUrl
              ?? (data.form_data as Record<string, unknown>)?.auth_url,
          },
        };
      case 'working_summary':
        return { type: 'working_summary', data: { text: data.text ?? '' } };
      case 'progress':
        return { type: 'progress', data: { steps: data.steps, header_text: data.header_text, done: data.done } };
      case 'output_artifact':
        return { type: 'output_artifact', data: { items: data.items, artifact_id: data.artifact_id } };
      case 'error':
        return { type: 'error', data: { message: data.message, recoverable: data.recoverable } };
      default:
        return { type: 'text', data: { text: '' } };
    }
  }

  // --- Error classification ---

  private async apiGet<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.requestJson<T>(path, { method: 'GET', timeoutMs: options.timeoutMs });
  }

  private async apiPost<T>(path: string, body?: Record<string, unknown>, options: RequestOptions = {}): Promise<T> {
    return this.requestJson<T>(path, { method: 'POST', body, timeoutMs: options.timeoutMs });
  }

  private async requestJson<T>(
    path: string,
    options: {
      method: 'GET' | 'POST';
      body?: Record<string, unknown>;
      timeoutMs?: number;
    },
  ): Promise<T> {
    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, options.timeoutMs ?? KarisClient.HTTP_REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${this.apiUrl}${path}`, {
        method: options.method,
        headers: {
          ...(options.method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: options.method === 'POST' ? JSON.stringify(options.body ?? {}) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw this.buildError(response.status, await this.extractMessage(response));
      }

      return (await response.json()) as T;
    } catch (error) {
      if (timedOut || this.isTimeoutError(error)) {
        throw new KarisApiError(
          'Timed out waiting for the Karis API response.',
          'REQUEST_TIMEOUT',
          504,
          EXIT_RUNTIME,
        );
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async extractMessage(response: Response): Promise<string> {
    try {
      const body = (await response.json()) as {
        message?: string;
        detail?: string;
        error?: { message?: string };
      };
      return body?.message || body?.detail || body?.error?.message || '';
    } catch {
      return '';
    }
  }

  private buildError(status: number, msg: string): KarisApiError {
    if (status === 401) {
      if (/revoked|disabled/i.test(msg) && !/invalid/i.test(msg)) {
        return new KarisApiError(
          'API key has been disabled. Run `karis login` to re-authenticate.',
          'KEY_DISABLED',
          status,
          EXIT_AUTH,
        );
      }
      if (/\bexpired\b/i.test(msg) && !/invalid/i.test(msg)) {
        return new KarisApiError(
          'API key has expired. Run `karis login` to get a new key.',
          'KEY_EXPIRED',
          status,
          EXIT_AUTH,
        );
      }
      return new KarisApiError(
        'Invalid API key. Run `karis login` to re-authenticate.',
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
