import chalk from 'chalk';
import { getCliContext, isJsonLinesOutput, isStructuredOutput, isTextOutput } from '../core/cli-context.js';
import { CliError, normalizeError } from '../core/errors.js';
import type { StreamChunk } from '../core/agent-interface.js';

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
  command?: string;
  data: unknown;
  meta?: Record<string, unknown>;
}

export interface CommandErrorEnvelope {
  ok: false;
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

export function renderStreamChunk(chunk: StreamChunk): void {
  if (isTextOutput()) {
    renderTextChunk(chunk);
    return;
  }

  const event = {
    command: getCliContext().commandPath,
    ...chunk,
  };

  if (isJsonLinesOutput()) {
    process.stdout.write(`${JSON.stringify(event)}\n`);
    return;
  }
}

export function emitStructuredEvent(event: Record<string, unknown>): void {
  if (!isJsonLinesOutput()) {
    return;
  }

  process.stdout.write(`${JSON.stringify({
    command: getCliContext().commandPath,
    ...event,
  })}\n`);
}

function renderTextChunk(chunk: StreamChunk): void {
  switch (chunk.type) {
    case 'content':
      if (chunk.content) process.stdout.write(chunk.content);
      break;
    case 'tool_start':
      process.stdout.write(chalk.yellow(`\n  [tool] ${chunk.tool ?? 'unknown'}...`));
      break;
    case 'tool_end':
      process.stdout.write(chalk.green(' done\n'));
      break;
    case 'done':
      console.log('\n');
      break;
    case 'error':
      printHumanError(new CliError(chunk.error ?? 'Unknown error', { code: 'STREAM_ERROR' }));
      process.exit(1);
  }
}

function printStructured(payload: CommandSuccessEnvelope | CommandErrorEnvelope | Record<string, unknown>): void {
  if (isJsonLinesOutput()) {
    process.stdout.write(`${JSON.stringify(payload)}\n`);
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
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
