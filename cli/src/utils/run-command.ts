import { printCommandError } from './output.js';

export function runCommand<T extends unknown[]>(
  handler: (...args: T) => Promise<void> | void,
): (...args: T) => Promise<void> {
  return async (...args: T) => {
    try {
      await handler(...args);
    } catch (error) {
      printCommandError(error);
    }
  };
}
