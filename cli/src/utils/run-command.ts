import { printCommandError } from './output.js';
import { normalizeError } from '../core/errors.js';
import { autoLogin } from '../core/auth.js';

export function runCommand<T extends unknown[]>(
  handler: (...args: T) => Promise<void> | void,
): (...args: T) => Promise<void> {
  return async (...args: T) => {
    try {
      await handler(...args);
    } catch (error) {
      const normalized = normalizeError(error);

      // In interactive TTY sessions with no API key, auto-redirect to login
      // then retry the original command transparently.
      if (normalized.code === 'AUTH_REQUIRED' && process.stdout.isTTY) {
        const loggedIn = await autoLogin();
        if (loggedIn) {
          try {
            await handler(...args);
            return;
          } catch (retryError) {
            printCommandError(retryError);
            return;
          }
        }
      }

      printCommandError(error);
    }
  };
}
