import chalk from 'chalk';
import { getCliContext, isCompactOutput, isJsonLinesOutput, isStructuredOutput, isTextOutput, isYamlOutput } from '../core/cli-context.js';
import { CliError, normalizeError } from '../core/errors.js';
import type { StreamChunk } from '../core/agent-interface.js';

const SCHEMA_VERSION = '1';

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
      if (chunk.content) process.stdout.write(chunk.content);
      break;
    case 'tool_start': {
      ++toolCallCounter;
      const toolName = chunk.tool ?? 'unknown';
      const hint = formatToolHint(toolName, chunk.title, chunk.args);
      process.stdout.write(chalk.yellow(`\n  [${toolCallCounter}] ${toolName}`) + (hint ? chalk.dim(` ${hint}`) : '') + chalk.yellow('...'));
      break;
    }
    case 'tool_end': {
      const suffix = chunk.latency_ms != null ? chalk.dim(` ${formatLatency(chunk.latency_ms)}`) : '';
      process.stdout.write(chalk.green(' done') + suffix + '\n');
      break;
    }
    case 'done':
      console.log('\n');
      break;
    case 'error':
      printHumanError(new CliError(chunk.error ?? 'Unknown error', { code: 'STREAM_ERROR' }));
      process.exit(1);
  }
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
