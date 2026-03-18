export type OutputMode = 'text' | 'json' | 'jsonl' | 'yaml' | 'table' | 'csv' | 'md';

export interface CliContext {
  outputMode: OutputMode;
  commandPath?: string;
  compact?: boolean;
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

export function isYamlOutput(): boolean {
  return currentContext.outputMode === 'yaml';
}

export function isJsonLinesOutput(): boolean {
  return currentContext.outputMode === 'jsonl';
}

export function isStructuredOutput(): boolean {
  return currentContext.outputMode !== 'text';
}

export function isTableOutput(): boolean {
  return currentContext.outputMode === 'table';
}

export function isCsvOutput(): boolean {
  return currentContext.outputMode === 'csv';
}

export function isMdOutput(): boolean {
  return currentContext.outputMode === 'md';
}

export function isCompactOutput(): boolean {
  return currentContext.compact === true;
}
