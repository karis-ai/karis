import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';

const CACHE_PATH = join(homedir(), '.karis', 'last-index.json');

export interface IndexEntry {
  id: string;
  label: string;
  type: string;
  [key: string]: unknown;
}

export async function saveIndex(entries: IndexEntry[]): Promise<void> {
  await mkdir(join(homedir(), '.karis'), { recursive: true });
  await writeFile(CACHE_PATH, JSON.stringify(entries), 'utf-8');
}

export async function loadIndex(): Promise<IndexEntry[]> {
  try {
    const raw = await readFile(CACHE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function getIndexEntry(n: number): Promise<IndexEntry | undefined> {
  const entries = await loadIndex();
  return entries[n - 1]; // 1-based index
}
