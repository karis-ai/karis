import chalk from 'chalk';
import * as readline from 'node:readline/promises';
import { Writable } from 'node:stream';
import { stdin as input, stdout as stdoutStream } from 'node:process';
import { emitStructuredEvent } from './output.js';
import { isTextOutput } from '../core/cli-context.js';

const silentOutput = new Writable({
  write(_chunk, _encoding, callback) {
    callback();
  },
});

export interface PromptRecord {
  prompt: string;
  default_value?: string;
  answer: string;
  used_default: boolean;
}

export interface AskOptions {
  defaultValue?: string;
}

export class InteractiveSession {
  private readonly rl: readline.Interface;
  private readonly prompts: PromptRecord[] = [];
  private closed = false;

  constructor() {
    this.rl = readline.createInterface({
      input,
      output: isTextOutput() ? stdoutStream : silentOutput,
    });
    this.rl.on('close', () => {
      this.closed = true;
    });
  }

  async ask(prompt: string, options: AskOptions = {}): Promise<string> {
    const defaultValue = options.defaultValue;
    emitStructuredEvent({
      type: 'prompt',
      prompt,
      default_value: defaultValue,
    });

    const suffix = defaultValue ? chalk.dim(` (${defaultValue})`) : '';
    const questionText = isTextOutput() ? `  ${prompt}${suffix}: ` : '';
    let rawAnswer = '';

    try {
      rawAnswer = (await this.rl.question(questionText)).trim();
      await new Promise((resolve) => setImmediate(resolve));
    } catch (error) {
      if (error instanceof Error && error.message.includes('closed')) {
        rawAnswer = '';
      } else {
        throw error;
      }
    }

    if (this.closed && rawAnswer.length === 0 && defaultValue === undefined) {
      throw new Error('readline was closed');
    }

    const answer = rawAnswer || defaultValue || '';

    const record: PromptRecord = {
      prompt,
      default_value: defaultValue,
      answer,
      used_default: rawAnswer.length === 0 && defaultValue !== undefined,
    };

    this.prompts.push(record);
    emitStructuredEvent({
      type: 'prompt_answer',
      prompt,
      answer,
      used_default: record.used_default,
    });

    return answer;
  }

  close(): void {
    this.rl.close();
  }

  getTranscript(): PromptRecord[] {
    return [...this.prompts];
  }
}
