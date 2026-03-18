import Table from 'cli-table3';
import { getCliContext } from '../core/cli-context.js';
import { printCommandResult } from './output.js';

type Row = Record<string, unknown>;

/**
 * Render tool-direct result in the current output format.
 * For structured modes (json/yaml/jsonl) delegates to printCommandResult.
 * For human-readable modes (text/table/csv/md) auto-detects tabular data.
 */
export function renderToolResult(result: unknown): void {
  const mode = getCliContext().outputMode;

  if (mode === 'json' || mode === 'yaml' || mode === 'jsonl') {
    printCommandResult(result);
    return;
  }

  const rows = extractRows(result);

  switch (mode) {
    case 'table':
      renderTable(rows, result);
      break;
    case 'csv':
      renderCsv(rows, result);
      break;
    case 'md':
      renderMarkdownTable(rows, result);
      break;
    case 'text':
    default:
      if (rows.length > 0) {
        renderTable(rows, result);
      } else {
        console.log(JSON.stringify(result, null, 2));
      }
      break;
  }
}

function extractRows(result: unknown): Row[] {
  if (Array.isArray(result)) return result.filter(isRow);

  if (result && typeof result === 'object') {
    const obj = result as Record<string, unknown>;
    if (obj.data && Array.isArray(obj.data)) return (obj.data as unknown[]).filter(isRow);
    if (obj.results && Array.isArray(obj.results)) return (obj.results as unknown[]).filter(isRow);
    if (obj.items && Array.isArray(obj.items)) return (obj.items as unknown[]).filter(isRow);

    if (isRow(result)) return [result as Row];
  }

  return [];
}

function isRow(v: unknown): v is Row {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function pickColumns(rows: Row[]): string[] {
  if (rows.length === 0) return [];
  const freq = new Map<string, number>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      const val = row[key];
      if (val !== null && val !== undefined && typeof val !== 'object') {
        freq.set(key, (freq.get(key) ?? 0) + 1);
      }
    }
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([k]) => k);
}

function cellStr(val: unknown, maxLen = 60): string {
  if (val === null || val === undefined) return '';
  const s = String(val);
  return s.length > maxLen ? s.slice(0, maxLen - 1) + '…' : s;
}

function renderTable(rows: Row[], fallback: unknown): void {
  if (rows.length === 0) {
    console.log(JSON.stringify(fallback, null, 2));
    return;
  }
  const cols = pickColumns(rows);
  if (cols.length === 0) {
    console.log(JSON.stringify(fallback, null, 2));
    return;
  }

  const table = new Table({ head: cols, style: { head: ['cyan'] } });
  for (const row of rows) {
    table.push(cols.map(c => cellStr(row[c])));
  }
  console.log(table.toString());
}

function renderCsv(rows: Row[], fallback: unknown): void {
  if (rows.length === 0) {
    console.log(JSON.stringify(fallback, null, 2));
    return;
  }
  const cols = pickColumns(rows);
  if (cols.length === 0) {
    console.log(JSON.stringify(fallback, null, 2));
    return;
  }

  console.log(cols.map(csvEscape).join(','));
  for (const row of rows) {
    console.log(cols.map(c => csvEscape(cellStr(row[c], 200))).join(','));
  }
}

function csvEscape(val: string): string {
  if (/[",\n\r]/.test(val)) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function renderMarkdownTable(rows: Row[], fallback: unknown): void {
  if (rows.length === 0) {
    console.log(JSON.stringify(fallback, null, 2));
    return;
  }
  const cols = pickColumns(rows);
  if (cols.length === 0) {
    console.log(JSON.stringify(fallback, null, 2));
    return;
  }

  console.log('| ' + cols.join(' | ') + ' |');
  console.log('| ' + cols.map(() => '---').join(' | ') + ' |');
  for (const row of rows) {
    console.log('| ' + cols.map(c => cellStr(row[c], 80).replace(/\|/g, '\\|')).join(' | ') + ' |');
  }
}
