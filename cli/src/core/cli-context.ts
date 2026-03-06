export type OutputMode = 'text' | 'json' | 'jsonl';

export interface CliContext {
  outputMode: OutputMode;
  commandPath?: string;
}

let currentContext: CliContext = {
  outputMode: 'text',
};

export function setCliContext(context: CliContext): void {
  currentContext = context;
}

export function updateCliContext(partial: Partial<CliContext>): void {
  currentContext = {
    ...currentContext,
    ...partial,
  };
}

export function getCliContext(): CliContext {
  return currentContext;
}

export function isTextOutput(): boolean {
  return currentContext.outputMode === 'text';
}

export function isJsonOutput(): boolean {
  return currentContext.outputMode === 'json';
}

export function isJsonLinesOutput(): boolean {
  return currentContext.outputMode === 'jsonl';
}

export function isStructuredOutput(): boolean {
  return currentContext.outputMode !== 'text';
}
