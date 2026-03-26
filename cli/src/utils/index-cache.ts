import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { getKarisHomeDir } from './config.js';

function cachePath(): string {
  return join(getKarisHomeDir(), 'last-index.json');
}

export interface IndexEntry {
  id: string;
  label: string;
  type: string;
  [key: string]: unknown;
}

export async function saveIndex(entries: IndexEntry[]): Promise<void> {
  const karisDir = getKarisHomeDir();
  await mkdir(karisDir, { recursive: true });
  await writeFile(cachePath(), JSON.stringify(entries), 'utf-8');
}

export async function loadIndex(): Promise<IndexEntry[]> {
  try {
    const raw = await readFile(cachePath(), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function getIndexEntry(n: number): Promise<IndexEntry | undefined> {
  const entries = await loadIndex();
  return entries[n - 1]; // 1-based index
}
