import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';

const KARIS_DIR = '.karis';
const CONFIG_FILE = 'config.json';

export interface KarisConfig {
  'api-key'?: string;
  [key: string]: string | undefined;
}

function globalConfigPath(): string {
  return join(homedir(), KARIS_DIR, CONFIG_FILE);
}

export async function ensureKarisDir(): Promise<string> {
  const dir = join(homedir(), KARIS_DIR);
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function loadConfig(): Promise<KarisConfig> {
  try {
    const raw = await readFile(globalConfigPath(), 'utf-8');
    return JSON.parse(raw) as KarisConfig;
  } catch {
    return {};
  }
}

export async function saveConfig(config: KarisConfig): Promise<void> {
  await ensureKarisDir();
  const configPath = globalConfigPath();
  await writeFile(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');

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

const SENSITIVE_KEYS = ['api-key'];

export function maskValue(key: string, value: string): string {
  if (SENSITIVE_KEYS.includes(key) && value.length > 8) {
    return value.slice(0, 5) + '...' + value.slice(-3);
  }
  return value;
}
