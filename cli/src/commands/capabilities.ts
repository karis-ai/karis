import { Command } from 'commander';
import chalk from 'chalk';
import { isTextOutput } from '../core/cli-context.js';
import { printCommandResult } from '../utils/output.js';
import { runCommand } from '../utils/run-command.js';

const CAPABILITIES = {
  name: 'karis',
  version: '0.1.0',
  description: 'Your AI-powered CMO — agent-first CLI for marketing automation',
  layers: {
    atomic: {
      layer: 1,
      description: 'Direct tool execution — bypass LLM, get JSON results instantly',
      usage: 'karis chat -t <tool> --tool-args \'{"key":"value"}\'',
      response: 'JSON',
    },
    guided: {
      layer: 1.5,
      description: 'Agent nudged toward a specific tool — LLM reasons but prefers given tool',
      usage: 'karis chat -t <tool> "your message"',
      response: 'SSE stream',
    },
    domain: {
      layer: 2,
      description: 'Skill-guided agent — LLM guided by a specific domain skill',
      usage: 'karis chat --skill <slug> "your message"',
      response: 'SSE stream',
    },
    cmo: {
      layer: 3,
      description: 'Full CMO autonomy — LLM plans and executes with all tools and skills',
      usage: 'karis chat "your message"',
      response: 'SSE stream',
    },
  },
  commands: {
    chat: {
      description: 'Chat with your CMO (default command)',
      options: {
        '-c, --conversation <id>': 'Continue existing conversation',
        '--skill <name>': 'Layer 2: guide agent with a specific skill',
        '-t, --tool <name>': 'Layer 1/1.5: use a specific tool',
        '--tool-args <json>': 'Layer 1: JSON args for direct tool execution',
      },
    },
    'tools list': {
      description: 'List available tools and skills',
      options: {
        '--tools-only': 'Show only tools',
        '--skills-only': 'Show only skills',
      },
    },
    'brand init': { description: 'Initialize brand profile from domain' },
    'brand show': { description: 'Show current brand profile' },
    'brand list': { description: 'List all brands' },
    capabilities: { description: 'Show this capabilities descriptor' },
  },
  examples: [
    '# Layer 3: CMO (full autonomy)',
    'karis chat "Help me grow my SaaS product"',
    '',
    '# Layer 2: Domain skill',
    'karis chat --skill reddit-growth "Write a post about my AI tool"',
    '',
    '# Layer 1.5: Guided tool use',
    'karis chat -t search_reddit "Find discussions about AI agents"',
    '',
    '# Layer 1: Atomic tool (direct execution, JSON output)',
    'karis chat -t search_reddit --tool-args \'{"query":"AI agents","subreddit":"SaaS"}\'',
    '',
    '# Discovery',
    'karis tools list',
  ],
};

export function registerCapabilitiesCommand(program: Command): void {
  program
    .command('capabilities')
    .description('Show agent capabilities and Layer Cake architecture')
    .action(runCommand(async () => {
      if (isTextOutput()) {
        console.log();
        console.log(chalk.bold.underline('Karis — Layer Cake Architecture'));
        console.log();

        for (const [key, layer] of Object.entries(CAPABILITIES.layers)) {
          const l = layer as { layer: number; description: string; usage: string; response: string };
          console.log(
            `  ${chalk.cyan(`Layer ${l.layer}`)} ${chalk.bold(key.padEnd(10))} ${chalk.dim(l.description)}`
          );
          console.log(`  ${' '.repeat(18)} ${chalk.dim('Usage:')} ${l.usage}`);
          console.log();
        }

        console.log(chalk.bold.underline('Examples'));
        console.log();
        for (const line of CAPABILITIES.examples) {
          if (line.startsWith('#')) {
            console.log(`  ${chalk.dim(line)}`);
          } else if (line === '') {
            console.log();
          } else {
            console.log(`  ${chalk.cyan(line)}`);
          }
        }
        console.log();
      } else {
        printCommandResult(CAPABILITIES);
      }
    }));
}
