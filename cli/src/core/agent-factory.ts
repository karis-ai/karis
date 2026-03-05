import { AgentInterface } from './agent-interface.js';
import { RemoteAgent } from './remote-agent.js';
import { loadConfig } from '../utils/config.js';

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
   */
  static async create(): Promise<AgentInterface> {
    const config = await loadConfig();

    const apiKey = process.env.KARIS_API_KEY || config['api-key'] || '';
    const apiUrl = process.env.KARIS_API_URL || 'https://api.karis.im';

    return new RemoteAgent({ apiKey, apiUrl });
  }
}
