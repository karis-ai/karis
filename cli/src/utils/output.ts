import chalk from 'chalk';

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
