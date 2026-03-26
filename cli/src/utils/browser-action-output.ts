import chalk from 'chalk';
import { isStructuredOutput, isTextOutput } from '../core/cli-context.js';
import { CliError, createInvalidArgumentError } from '../core/errors.js';
import { printCommandResult, success } from './output.js';

type ActionResult = Record<string, unknown>;

export function ensureConfirmed(confirmed: boolean | undefined, actionDescription: string): void {
  if (confirmed) return;
  throw createInvalidArgumentError(`Refusing to ${actionDescription} without --confirm.`, [
    'Re-run the command with `--confirm` if you want to execute this browser action.',
  ]);
}

export function renderActionResult(
  title: string,
  result: ActionResult,
  options: {
    preferredKeys?: string[];
    omitKeys?: string[];
    failureMessage?: string;
  } = {},
): void {
  ensureActionSucceeded(result, options.failureMessage);

  if (isStructuredOutput()) {
    printCommandResult(result);
    return;
  }

  const omit = new Set<string>(['success', ...(options.omitKeys ?? [])]);
  const printed = new Set<string>();

  if (isTextOutput()) {
    console.log();
    console.log(success(title));
    console.log();
  }

  for (const key of options.preferredKeys ?? []) {
    if (!(key in result) || omit.has(key)) continue;
    printed.add(key);
    console.log(`${chalk.bold(humanizeKey(key))}: ${formatValue(result[key])}`);
  }

  for (const key of Object.keys(result)) {
    if (printed.has(key) || omit.has(key)) continue;
    console.log(`${chalk.bold(humanizeKey(key))}: ${formatValue(result[key])}`);
  }

  console.log();
}

export function renderFollowResult(
  title: string,
  result: ActionResult,
  options: {
    failureMessage?: string;
  } = {},
): void {
  ensureActionSucceeded(result, options.failureMessage);

  if (isStructuredOutput()) {
    printCommandResult(result);
    return;
  }

  const results = Array.isArray(result.results)
    ? result.results.filter((item): item is ActionResult => typeof item === 'object' && item !== null)
    : [];

  if (results.length === 0) {
    renderActionResult(title, result, { failureMessage: options.failureMessage });
    return;
  }

  console.log();
  console.log(success(title));
  console.log();
  console.log(`${chalk.bold('Total')}: ${formatValue(result.total)}`);
  console.log(`${chalk.bold('Succeeded')}: ${formatValue(result.succeeded)}`);
  console.log(`${chalk.bold('Failed')}: ${formatValue(result.failed)}`);
  console.log(`${chalk.bold('Message')}: ${formatValue(result.message)}`);
  console.log();

  for (const item of results) {
    const profile = formatValue(item.profile);
    const state = item.success ? 'ok' : 'failed';
    const detail = formatValue(item.message || item.error || '');
    console.log(`- ${profile}: ${state}${detail ? ` (${detail})` : ''}`);
  }

  console.log();
}

function ensureActionSucceeded(result: ActionResult, fallbackMessage = 'Browser action failed.'): void {
  if (result.success !== false) {
    return;
  }

  throw new CliError(extractFailureMessage(result, fallbackMessage), {
    code: 'ACTION_FAILED',
    exitCode: 1,
    details: result,
  });
}

function extractFailureMessage(result: ActionResult, fallbackMessage: string): string {
  const message = firstNonEmptyString(
    result.message,
    result.error,
    result.detail,
    typeof result.data === 'object' && result.data !== null
      ? (result.data as Record<string, unknown>).message
      : undefined,
  );

  return message ?? fallbackMessage;
}

function firstNonEmptyString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function formatValue(value: unknown): string {
  if (value == null) return '(none)';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, char => char.toUpperCase());
}
