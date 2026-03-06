export interface CommandExample {
  description: string;
  command: string;
}

export interface CommandManifest {
  id: string;
  summary: string;
  description: string;
  args?: Array<{ name: string; required?: boolean; description: string }>;
  options?: Array<{ flags: string; description: string }>;
  requiresAuth?: boolean;
  requiresBrand?: boolean;
  output:
    | 'text'
    | 'json'
    | 'jsonl'
    | 'text|json'
    | 'text|jsonl'
    | 'text|json|jsonl';
  examples: CommandExample[];
}

const manifests: CommandManifest[] = [
  {
    id: 'config.set',
    summary: 'Set a config value',
    description: 'Set a supported CLI config value. Currently supports api-key and base-url.',
    args: [
      { name: 'key', required: true, description: 'Config key, such as api-key or base-url' },
      { name: 'value', required: true, description: 'Config value' },
    ],
    output: 'text|json',
    examples: [
      { description: 'Set the API key', command: 'npx karis config set api-key sk-ka-...' },
      { description: 'Set the base URL', command: 'npx karis config set base-url https://api-staging.sophiapro.ai' },
    ],
  },
  {
    id: 'config.list',
    summary: 'Show current CLI config',
    description: 'List the config values currently set for Karis CLI, with structured output available for scripts.',
    output: 'text|json',
    examples: [
      { description: 'Show the current config', command: 'npx karis config list' },
      { description: 'Output config as JSON', command: 'npx karis --json config list' },
    ],
  },
  {
    id: 'config.get',
    summary: 'Read a config value',
    description: 'Read a specific config key for auth or environment debugging.',
    args: [{ name: 'key', required: true, description: 'Config key, such as api-key or base-url' }],
    output: 'text|json',
    examples: [
      { description: 'Read the API key', command: 'npx karis config get api-key' },
      { description: 'Read the base URL', command: 'npx karis config get base-url' },
    ],
  },
  {
    id: 'brand.init',
    summary: 'Initialize a brand profile',
    description: 'Collect or confirm the brand domain interactively and create a brand profile on Karis Platform.',
    options: [
      { flags: '-d, --domain <domain>', description: 'Provide the domain directly and skip the prompt' },
    ],
    requiresAuth: true,
    output: 'text|json|jsonl',
    examples: [
      { description: 'Create a brand profile interactively', command: 'npx karis brand init' },
      { description: 'Pass the domain directly', command: 'npx karis brand init --domain karis.im' },
      { description: 'Get the creation result as JSON', command: 'npx karis --json brand init --domain karis.im' },
    ],
  },
  {
    id: 'brand.edit',
    summary: 'Edit a brand profile',
    description: 'Interactively edit customizable fields in the brand profile, either one field or the full profile.',
    args: [{ name: 'field', description: 'Optional field name, such as category, audience, or tone' }],
    requiresAuth: true,
    requiresBrand: true,
    output: 'text|json|jsonl',
    examples: [
      { description: 'Edit all fields interactively', command: 'npx karis brand edit' },
      { description: 'Edit only category', command: 'npx karis brand edit category' },
      { description: 'Return the edit result as JSON', command: 'npx karis --json brand edit category' },
    ],
  },
  {
    id: 'brand.show',
    summary: 'Show the current brand profile',
    description: 'Read the brand profile linked to the current account, including audience, competitors, and value propositions.',
    requiresAuth: true,
    requiresBrand: true,
    output: 'text|json',
    examples: [
      { description: 'Show the brand profile', command: 'npx karis brand show' },
      { description: 'Get the brand profile as JSON', command: 'npx karis --json brand show' },
    ],
  },
  {
    id: 'content.discover',
    summary: 'Discover content opportunities',
    description: 'Start a content opportunity analysis task, poll its status, and return topic clusters, opportunity cards, and the task id.',
    args: [{ name: 'domain', required: true, description: 'Brand domain' }],
    options: [
      { flags: '-c, --category <category>', description: 'Optional category filter' },
      { flags: '-t, --timeout <seconds>', description: 'Polling timeout in seconds, default 300' },
    ],
    requiresAuth: true,
    output: 'text|json',
    examples: [
      { description: 'Analyze content opportunities for a domain', command: 'npx karis content discover karis.im' },
      { description: 'Get the result summary as JSON', command: 'npx karis --json content discover karis.im' },
    ],
  },
  {
    id: 'content.result',
    summary: 'Show content opportunity results',
    description: 'Read the full result of a completed task, including topic clusters, opportunity cards, and the detailed report.',
    args: [{ name: 'task-id', required: true, description: 'Analysis task ID' }],
    requiresAuth: true,
    output: 'text|json',
    examples: [
      { description: 'Show the full analysis result', command: 'npx karis content result <task-id>' },
    ],
  },
  {
    id: 'content.clusters',
    summary: 'Generate topic clusters',
    description: 'Use the agent to generate a topic cluster architecture for brand content strategy.',
    args: [{ name: 'domain', description: 'Optional domain; uses current brand context when omitted' }],
    requiresAuth: true,
    output: 'text|json|jsonl',
    examples: [
      { description: 'Generate topic clusters', command: 'npx karis content clusters karis.im' },
    ],
  },
  {
    id: 'geo.audit',
    summary: 'Run a GEO audit',
    description: 'Use the Karis agent to run a GEO audit, with support for both interactive use and JSON/JSONL structured events.',
    args: [{ name: 'domain', description: 'Optional domain; uses current brand context when omitted' }],
    requiresAuth: true,
    output: 'text|json|jsonl',
    examples: [
      { description: 'Audit a specific domain', command: 'npx karis geo audit karis.im' },
      { description: 'Observe streaming events as JSONL', command: 'npx karis --jsonl geo audit karis.im' },
    ],
  },
  {
    id: 'geo.prompts',
    summary: 'Research GEO prompts',
    description: 'Research how users ask AI about a topic and generate test prompts.',
    args: [{ name: 'topic', required: true, description: 'Topic to research' }],
    requiresAuth: true,
    output: 'text|json|jsonl',
    examples: [
      { description: 'Research prompts about project management', command: 'npx karis geo prompts \"project management\"' },
    ],
  },
  {
    id: 'geo.optimize',
    summary: 'Optimize content',
    description: 'Ask the agent to provide GEO optimization recommendations for a specific URL.',
    args: [{ name: 'url', required: true, description: 'Content URL' }],
    requiresAuth: true,
    output: 'text|json|jsonl',
    examples: [
      { description: 'Optimize a single article', command: 'npx karis geo optimize https://karis.im/blog/post' },
    ],
  },
  {
    id: 'competitor.analyze',
    summary: 'Analyze competitors',
    description: 'Use the agent to analyze competitor performance in AI search.',
    args: [{ name: 'domain', description: 'Optional domain; uses current brand context when omitted' }],
    requiresAuth: true,
    output: 'text|json|jsonl',
    examples: [
      { description: 'Analyze competitor GEO performance', command: 'npx karis competitor analyze karis.im' },
    ],
  },
  {
    id: 'chat',
    summary: 'Chat with the CMO agent',
    description: 'Enter interactive multi-turn CMO chat mode. Text mode is for people; JSONL mode is for agents and automation.',
    options: [
      { flags: '-c, --conversation <id>', description: 'Continue an existing conversation' },
    ],
    requiresAuth: true,
    output: 'text|json|jsonl',
    examples: [
      { description: 'Start an interactive chat session', command: 'npx karis chat' },
      { description: 'Consume stream events as JSONL', command: 'printf \"What is my visibility?\\nexit\\n\" | npx karis --jsonl chat' },
    ],
  },
  {
    id: 'doctor',
    summary: 'Diagnose CLI configuration and runtime',
    description: 'Check config sources, API key, current runtime, connectivity, and brand profile status for CI or troubleshooting.',
    output: 'text|json',
    examples: [
      { description: 'Run diagnostics', command: 'npx karis doctor' },
      { description: 'Get diagnostics as JSON', command: 'npx karis --json doctor' },
    ],
  },
];

const manifestMap = new Map(manifests.map((manifest) => [manifest.id, manifest]));

export function getCommandManifest(id: string): CommandManifest | undefined {
  return manifestMap.get(id);
}

export function listCommandManifests(): CommandManifest[] {
  return manifests;
}
