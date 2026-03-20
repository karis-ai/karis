import chalk from 'chalk';
import { getCliContext, isCompactOutput, isJsonLinesOutput, isStructuredOutput, isTextOutput, isYamlOutput } from '../core/cli-context.js';
import { CliError, normalizeError } from '../core/errors.js';
import type { StreamChunk } from '../core/agent-interface.js';

const SCHEMA_VERSION = '1';

let activeStatusLine = '';
let pendingAssistantContent = '';

function clearStatusLine(): void {
  if (!activeStatusLine) return;
  process.stderr.write(`\r\x1b[2K`);
  activeStatusLine = '';
}

function writeStatusLine(text: string): void {
  clearStatusLine();
  const truncated = text.length > (process.stderr.columns || 80) - 4
    ? text.slice(0, (process.stderr.columns || 80) - 5) + '…'
    : text;
  activeStatusLine = truncated;
  process.stderr.write(`\r${truncated}`);
}

function formatAssistantStatus(text: string): string {
  return `${chalk.green('Karis: ')}${chalk.dim(text)}`;
}

export function showAssistantStatus(text: string): void {
  if (!isTextOutput()) return;
  writeStatusLine(formatAssistantStatus(text));
}

export function clearAssistantStatus(): void {
  if (!isTextOutput()) return;
  clearStatusLine();
}

export function heading(text: string): string {
  return chalk.bold.cyan(text);
}

export function success(text: string): string {
  return chalk.green('✔ ') + text;
}

export function warning(text: string): string {
  return chalk.yellow('⚠️  ') + text;
}

export function error(text: string): string {
  return chalk.red('✖ ') + text;
}

export function dim(text: string): string {
  return chalk.dim(text);
}

export function label(key: string, value: string): string {
  return `${chalk.bold(key)}: ${value}`;
}

export function section(title: string): void {
  console.log();
  console.log(heading(title));
  console.log(chalk.dim('─'.repeat(40)));
}

export function hookMessage(text: string): void {
  console.log();
  console.log(chalk.dim('─'.repeat(40)));
  console.log(chalk.dim(text));
}

export interface CommandSuccessEnvelope {
  ok: true;
  schema_version: string;
  command?: string;
  data: unknown;
  meta?: Record<string, unknown>;
}

export interface CommandErrorEnvelope {
  ok: false;
  schema_version: string;
  command?: string;
  error: {
    code: string;
    message: string;
    next_steps: string[];
    details?: unknown;
  };
  meta?: Record<string, unknown>;
}

export function printCommandResult(
  data: unknown,
  meta: {
    command?: string;
    meta?: Record<string, unknown>;
  } = {},
): void {
  if (isTextOutput()) {
    return;
  }

  const payload: CommandSuccessEnvelope = {
    ok: true,
    schema_version: SCHEMA_VERSION,
    command: meta.command ?? getCliContext().commandPath,
    data,
    meta: meta.meta,
  };
  printStructured(payload);
}

export function printCommandError(
  error: unknown,
  meta: {
    command?: string;
    meta?: Record<string, unknown>;
  } = {},
): never {
  const cliError = normalizeError(error);

  if (isTextOutput()) {
    printHumanError(cliError);
  } else {
    const payload: CommandErrorEnvelope = {
      ok: false,
      schema_version: SCHEMA_VERSION,
      command: meta.command ?? getCliContext().commandPath,
      error: {
        code: cliError.code,
        message: cliError.message,
        next_steps: cliError.nextSteps,
        details: cliError.details,
      },
      meta: meta.meta,
    };
    printStructured(payload);
  }

  process.exit(cliError.exitCode);
}

// --- Numbered tool-call progress (Feature 4) ---

let toolCallCounter = 0;

export function resetToolCallCounter(): void {
  toolCallCounter = 0;
  pendingAssistantContent = '';
}

export function renderStreamChunk(chunk: StreamChunk): void {
  if (isTextOutput()) {
    renderTextChunk(chunk);
    return;
  }

  const event: Record<string, unknown> = {
    schema_version: SCHEMA_VERSION,
    command: getCliContext().commandPath,
    ...chunk,
  };

  if (chunk.type === 'tool_start') {
    ++toolCallCounter;
    event.step = toolCallCounter;
  }

  if (isJsonLinesOutput()) {
    process.stdout.write(`${JSON.stringify(compactify(event))}\n`);
    return;
  }
}

export function emitStructuredEvent(event: Record<string, unknown>): void {
  if (!isJsonLinesOutput()) {
    return;
  }

  process.stdout.write(`${JSON.stringify(compactify({
    schema_version: SCHEMA_VERSION,
    command: getCliContext().commandPath,
    ...event,
  }))}\n`);
}

function renderTextChunk(chunk: StreamChunk): void {
  switch (chunk.type) {
    case 'content':
      if (chunk.content) {
        clearStatusLine();
        pendingAssistantContent += chunk.content;
        flushAssistantContent();
      }
      break;
    case 'tool_start': {
      flushAssistantContent(true);
      clearStatusLine();
      ++toolCallCounter;
      const toolName = chunk.tool ?? 'unknown';
      const hint = formatToolHint(toolName, chunk.title, chunk.args);
      process.stdout.write(chalk.yellow(`\n  [${toolCallCounter}] ${toolName}`) + (hint ? chalk.dim(` ${hint}`) : '') + chalk.yellow('...'));
      showAssistantStatus(describeToolActivity(toolName, chunk.args));
      break;
    }
    case 'tool_end': {
      flushAssistantContent(true);
      const suffix = chunk.latency_ms != null ? chalk.dim(` ${formatLatency(chunk.latency_ms)}`) : '';
      process.stdout.write(chalk.green(' done') + suffix + '\n');
      break;
    }
    case 'working_summary': {
      const text = chunk.summary_text;
      if (text) {
        showAssistantStatus(text);
      }
      break;
    }
    case 'progress': {
      const steps = chunk.steps;
      if (steps && steps.length > 0) {
        const latest = steps[steps.length - 1];
        if (latest?.label) {
          showAssistantStatus(latest.label);
        }
      }
      break;
    }
    case 'output_artifact': {
      flushAssistantContent(true);
      clearStatusLine();
      const items = chunk.artifacts;
      if (items && items.length > 0) {
        process.stdout.write('\n');
        for (const item of items) {
          const name = item.name || 'file';
          const url = item.url || '';
          process.stdout.write(chalk.cyan(`  ⬡ ${name}`) + '\n');
          if (url) {
            process.stdout.write(chalk.dim(`    ${url}`) + '\n');
          }
        }
      }
      break;
    }
    case 'done':
      flushAssistantContent(true);
      clearStatusLine();
      console.log('\n');
      break;
    case 'error':
      flushAssistantContent(true);
      clearStatusLine();
      printHumanError(new CliError(chunk.error ?? 'Unknown error', { code: 'STREAM_ERROR' }));
      process.exit(1);
  }
}

function flushAssistantContent(flushAll = false): void {
  const lines = pendingAssistantContent.split('\n');
  const completeLines = flushAll ? lines : lines.slice(0, -1);

  pendingAssistantContent = flushAll ? '' : (lines.at(-1) ?? '');

  for (const line of completeLines) {
    process.stdout.write(`${formatAssistantContentLine(line)}\n`);
  }

  if (flushAll && pendingAssistantContent) {
    process.stdout.write(formatAssistantContentLine(pendingAssistantContent));
    pendingAssistantContent = '';
  }
}

function formatAssistantContentLine(line: string): string {
  const trimmed = line.trim();

  if (trimmed.length === 0) {
    return '';
  }

  const headingMatch = trimmed.match(/^\*\*(.+?)\*\*:?\s*$/);
  if (headingMatch) {
    return chalk.bold.hex('#2563eb')(headingMatch[1]);
  }

  const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/);
  if (bulletMatch) {
    return wrapText(stripInlineMarkdown(bulletMatch[1]), {
      firstIndent: `${chalk.cyan('•')} `,
      restIndent: '  ',
    }).join('\n');
  }

  const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
  if (numberedMatch) {
    const prefix = `${numberedMatch[1]}. `;
    return wrapText(stripInlineMarkdown(numberedMatch[2]), {
      firstIndent: prefix,
      restIndent: ' '.repeat(prefix.length),
    }).join('\n');
  }

  return wrapText(stripInlineMarkdown(trimmed), {
    firstIndent: '',
    restIndent: '',
  }).join('\n');
}

function printStructured(payload: CommandSuccessEnvelope | CommandErrorEnvelope | Record<string, unknown>): void {
  const out = compactify(payload);

  if (isJsonLinesOutput()) {
    process.stdout.write(`${JSON.stringify(out)}\n`);
    return;
  }

  if (isYamlOutput()) {
    process.stdout.write(formatYaml(out));
    return;
  }

  console.log(JSON.stringify(out, null, 2));
}

// --- Compact mode (Feature 3) ---

const COMPACT_STRIP_KEYS = new Set(['meta', 'command', 'latency_ms', 'args', 'next_steps']);

function compactify<T>(obj: T): T {
  if (!isCompactOutput()) return obj;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(compactify) as T;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (COMPACT_STRIP_KEYS.has(key)) continue;
    result[key] = compactify(value);
  }
  return result as T;
}

// --- YAML serialization (Feature 1) ---

function formatYaml(value: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);

  if (value === null || value === undefined) return `${pad}null\n`;
  if (typeof value === 'boolean') return `${pad}${value}\n`;
  if (typeof value === 'number') return `${pad}${value}\n`;

  if (typeof value === 'string') {
    if (value.includes('\n')) {
      const lines = value.split('\n');
      return `${pad}|\n${lines.map(l => `${pad}  ${l}`).join('\n')}\n`;
    }
    if (/[:#{}[\],&*?|>!'"%@`]/.test(value) || value === '' || value === 'true' || value === 'false' || value === 'null' || !isNaN(Number(value))) {
      return `${pad}"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"\n`;
    }
    return `${pad}${value}\n`;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return `${pad}[]\n`;
    let out = '';
    for (const item of value) {
      if (item !== null && typeof item === 'object') {
        out += `${pad}-\n${formatYaml(item, indent + 1)}`;
      } else {
        out += `${pad}- ${formatYaml(item, 0).trimStart()}`;
      }
    }
    return out;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return `${pad}{}\n`;
    let out = '';
    for (const [key, val] of entries) {
      if (val === undefined) continue;
      if (val !== null && typeof val === 'object') {
        out += `${pad}${key}:\n${formatYaml(val, indent + 1)}`;
      } else {
        out += `${pad}${key}: ${formatYaml(val, 0).trimStart()}`;
      }
    }
    return out;
  }

  return `${pad}${String(value)}\n`;
}

function printHumanError(error: CliError): void {
  console.log();
  console.log(chalk.red(`Error: ${error.message}`));

  if (error.nextSteps.length > 0) {
    console.log();
    console.log(chalk.dim('Next steps:'));
    for (const step of error.nextSteps) {
      console.log(chalk.dim(`  - ${step}`));
    }
  }

  console.log();
}

export function printInfoLine(text: string): void {
  if (isStructuredOutput()) {
    return;
  }
  console.log(text);
}

function formatToolHint(
  toolName: string,
  title?: string,
  args?: Record<string, unknown>,
): string {
  if (title) return `"${truncate(title, 60)}"`;
  if (!args || Object.keys(args).length === 0) return '';

  const key = pickArgKey(toolName, args);
  if (!key) return '';
  const val = args[key];
  if (typeof val === 'string' && val.length > 0) return `"${truncate(val, 60)}"`;
  return '';
}

function pickArgKey(
  toolName: string,
  args: Record<string, unknown>,
): string | undefined {
  const preferred = ['query', 'url', 'subreddit', 'username', 'keyword', 'search_query', 'topic'];
  for (const k of preferred) {
    if (k in args) return k;
  }
  const keys = Object.keys(args);
  return keys.length > 0 ? keys[0] : undefined;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + '…';
}

function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1');
}

function wrapText(
  text: string,
  options: {
    firstIndent: string;
    restIndent: string;
  },
): string[] {
  const width = getContentWidth();
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [options.firstIndent.trimEnd()];
  }

  const lines: string[] = [];
  let currentIndent = options.firstIndent;
  let currentLine = currentIndent;

  for (const word of words) {
    const separator = currentLine === currentIndent ? '' : ' ';
    const candidate = `${currentLine}${separator}${word}`;
    if (visibleLength(candidate) <= width) {
      currentLine = candidate;
      continue;
    }

    lines.push(currentLine);
    currentIndent = options.restIndent;
    currentLine = `${currentIndent}${word}`;
  }

  lines.push(currentLine);
  return lines;
}

function getContentWidth(): number {
  const terminalWidth = process.stdout.columns || 80;
  return Math.max(48, Math.min(88, terminalWidth - 2));
}

function visibleLength(text: string): number {
  return text.replace(/\x1B\[[0-9;]*m/g, '').length;
}

function describeToolActivity(
  toolName: string,
  args?: Record<string, unknown>,
): string {
  const normalized = toolName.toLowerCase();

  if (normalized.includes('search_web')) return 'searching the web...';
  if (normalized.includes('read_webpage')) return 'reading sources...';
  if (normalized.includes('search_reddit')) return 'scanning Reddit...';
  if (normalized.includes('get_reddit_comments')) return 'reading Reddit replies...';
  if (normalized.includes('get_reddit_posts')) return 'reviewing Reddit threads...';
  if (normalized.includes('search_youtube')) return 'searching YouTube...';
  if (normalized.includes('search_x') || normalized.includes('tweet') || normalized.includes('tweets')) return 'scanning X...';
  if (normalized.includes('brand')) return 'analyzing your brand...';
  if (normalized.includes('geo')) return 'auditing AI visibility...';
  if (normalized.includes('memory')) return 'checking memory...';
  if (normalized.includes('schedule')) return 'checking schedules...';
  if (normalized.startsWith('search_')) return 'searching...';
  if (normalized.startsWith('read_') || normalized.includes('read')) return 'reading...';
  if (normalized.startsWith('get_') || normalized.startsWith('list_')) return 'gathering context...';

  const primaryArgKey = pickArgKey(toolName, args ?? {});
  if (primaryArgKey) {
    return 'working...';
  }

  return 'working...';
}
