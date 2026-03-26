import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';

const DEFAULT_KARIS_DIR = '.karis';
const STAGING_KARIS_DIR = '.karis-staging';
const CONFIG_FILE = 'config.json';
export const SUPPORTED_CONFIG_KEYS = [
  'api-key',
  'base-url',
  'last-conversation-id',
  'browser-extension-id',
] as const;

export interface KarisConfig {
  'api-key'?: string;
  'base-url'?: string;
  'last-conversation-id'?: string;
  [key: string]: string | undefined;
}

export interface ResolvedConfigEntry {
  value?: string;
  source: 'env' | 'config' | 'default' | 'unset';
}

export interface ResolvedConfig {
  apiKey: ResolvedConfigEntry;
  apiUrl: ResolvedConfigEntry;
}

function globalConfigPath(): string {
  return join(getKarisHomeDir(), CONFIG_FILE);
}

export async function ensureKarisDir(): Promise<string> {
  const dir = getKarisHomeDir();
  await mkdir(dir, { recursive: true });
  return dir;
}

export function getKarisHomeDir(): string {
  const explicitDir = process.env.KARIS_CONFIG_DIR?.trim();
  if (explicitDir) {
    return explicitDir;
  }

  if (process.env.KARIS_ENV?.trim().toLowerCase() === 'staging') {
    return join(homedir(), STAGING_KARIS_DIR);
  }

  return join(homedir(), DEFAULT_KARIS_DIR);
}

export async function loadConfig(): Promise<KarisConfig> {
  try {
    const raw = await readFile(globalConfigPath(), 'utf-8');
    return sanitizeConfig(JSON.parse(raw) as KarisConfig);
  } catch {
    return {};
  }
}

export async function saveConfig(config: KarisConfig): Promise<void> {
  await ensureKarisDir();
  const configPath = globalConfigPath();
  const sanitizedConfig = sanitizeConfig(config);
  await writeFile(configPath, JSON.stringify(sanitizedConfig, null, 2) + '\n', 'utf-8');

  // Set restrictive permissions (600 = owner read/write only)
  try {
    const { chmod } = await import('node:fs/promises');
    await chmod(configPath, 0o600);
  } catch {
    // Ignore permission errors on Windows
  }
}

export async function getConfigValue(key: string): Promise<string | undefined> {
  const config = await loadConfig();
  return config[key];
}

export async function setConfigValue(key: string, value: string): Promise<void> {
  const config = await loadConfig();
  config[key] = value;
  await saveConfig(config);
}

export async function listConfig(): Promise<KarisConfig> {
  return loadConfig();
}

export async function getLastConversationId(): Promise<string | undefined> {
  const config = await loadConfig();
  return config['last-conversation-id'];
}

export async function setLastConversationId(conversationId: string): Promise<void> {
  await setConfigValue('last-conversation-id', conversationId);
}

let _resolvedConfigCache: ResolvedConfig | null = null;

export async function loadResolvedConfig(): Promise<ResolvedConfig> {
  if (_resolvedConfigCache) return _resolvedConfigCache;
  const config = await loadConfig();

  _resolvedConfigCache = {
    apiKey: resolveValue(process.env.KARIS_API_KEY, config['api-key']),
    apiUrl: resolveValue(process.env.KARIS_API_URL, config['base-url'], 'https://api.karis.im'),
  };
  return _resolvedConfigCache;
}

function resolveValue(
  envValue: string | undefined,
  configValue: string | undefined,
  defaultValue?: string,
): ResolvedConfigEntry {
  if (envValue) {
    return { value: envValue, source: 'env' };
  }

  if (configValue) {
    return { value: configValue, source: 'config' };
  }

  if (defaultValue !== undefined) {
    return { value: defaultValue, source: 'default' };
  }

  return { source: 'unset' };
}

const SENSITIVE_KEYS = ['api-key'];

export function maskValue(key: string, value: string): string {
  if (SENSITIVE_KEYS.includes(key) && value.length > 8) {
    return value.slice(0, 5) + '...' + value.slice(-3);
  }
  return value;
}

function sanitizeConfig(config: KarisConfig): KarisConfig {
  return Object.fromEntries(
    Object.entries(config).filter(
      (entry): entry is [string, string] => entry[1] !== undefined && isSupportedConfigKey(entry[0]),
    ),
  );
}

function isSupportedConfigKey(key: string): key is typeof SUPPORTED_CONFIG_KEYS[number] {
  return SUPPORTED_CONFIG_KEYS.includes(key as typeof SUPPORTED_CONFIG_KEYS[number]);
}
