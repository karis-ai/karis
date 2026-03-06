import { AgentInterface } from './agent-interface.js';
import { RemoteAgent } from './remote-agent.js';
import { loadResolvedConfig } from '../utils/config.js';

/**
 * Factory for creating Remote Agent (only mode)
 */
export class AgentFactory {
  /**
   * Create a Remote Agent
   *
   * Priority for API key:
   * 1. KARIS_API_KEY env var
   * 2. api-key in config
   *
   * Priority for API URL:
   * 1. KARIS_API_URL env var
   * 2. base-url in config
   * 3. Default: https://api.karis.im
   */
  static async create(): Promise<AgentInterface> {
    const resolved = await loadResolvedConfig();
    const apiKey = resolved.apiKey.value || '';
    const apiUrl = resolved.apiUrl.value || 'https://api.karis.im';

    return new RemoteAgent({ apiKey, apiUrl });
  }
}
