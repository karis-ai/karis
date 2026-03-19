import { KarisApiError } from './client.js';

export class CliError extends Error {
  readonly code: string;
  readonly exitCode: number;
  readonly nextSteps: string[];
  readonly details?: unknown;

  constructor(
    message: string,
    options: {
      code: string;
      exitCode?: number;
      nextSteps?: string[];
      details?: unknown;
    },
  ) {
    super(message);
    this.name = 'CliError';
    this.code = options.code;
    this.exitCode = options.exitCode ?? 1;
    this.nextSteps = options.nextSteps ?? [];
    this.details = options.details;
  }
}

export function createAuthRequiredError(): CliError {
  return new CliError('Karis API key required.', {
    code: 'AUTH_REQUIRED',
    exitCode: 78,
    nextSteps: [
      'Run `karis login` to authenticate',
      'Or set your key directly: `karis config set api-key <your-key>`',
      'Or use the `KARIS_API_KEY` environment variable',
    ],
  });
}

export function createNoBrandError(): CliError {
  return new CliError('No brand profile found.', {
    code: 'NO_BRAND',
    exitCode: 1,
    nextSteps: [
      'Run `npx karis brand init` to create a brand profile',
    ],
  });
}

export function createInvalidArgumentError(message: string, nextSteps: string[] = []): CliError {
  return new CliError(message, {
    code: 'INVALID_ARGUMENT',
    exitCode: 2,
    nextSteps,
  });
}

export function createUnsupportedModeError(message: string, nextSteps: string[] = []): CliError {
  return new CliError(message, {
    code: 'UNSUPPORTED_MODE',
    exitCode: 2,
    nextSteps,
  });
}

export function normalizeError(error: unknown): CliError {
  if (error instanceof CliError) {
    return error;
  }

  if (error instanceof KarisApiError) {
    return new CliError(error.message, {
      code: error.code,
      exitCode: error.exitCode,
      nextSteps: nextStepsForApiCode(error.code),
      details: {
        statusCode: error.statusCode,
      },
    });
  }

  if (error instanceof Error) {
    return new CliError(error.message, {
      code: 'UNEXPECTED_ERROR',
      exitCode: 1,
    });
  }

  return new CliError(String(error), {
    code: 'UNEXPECTED_ERROR',
    exitCode: 1,
  });
}

function nextStepsForApiCode(code: string): string[] {
  switch (code) {
    case 'INVALID_KEY':
      return [
        'Run `karis login` to re-authenticate',
        'Or set a valid key: `karis config set api-key <your-key>`',
      ];
    case 'KEY_EXPIRED':
      return [
        'Run `karis login` to get a new key',
      ];
    case 'KEY_DISABLED':
      return [
        'Run `karis login` to re-authenticate',
        'Or re-enable your key at https://karis.im/settings/api-keys',
      ];
    case 'INSUFFICIENT_CREDITS':
      return [
        'Check the current API key credit balance or limit',
        'Retry with an API key that has available credits',
      ];
    case 'MISSING_SCOPE':
      return [
        'Create or update an API key that includes the required scope for this command',
        'For `karis chat`, verify the key includes `conversations:create`',
      ];
    case 'NO_BRAND':
      return [
        'Run `npx karis brand init` to create a brand profile',
      ];
    case 'REQUEST_TIMEOUT':
      return [
        'Retry the command to rule out a transient backend delay',
        'If this happens only when resuming chat, clear the saved conversation with `npx karis config set last-conversation-id ""`',
      ];
    default:
      return [];
  }
}
