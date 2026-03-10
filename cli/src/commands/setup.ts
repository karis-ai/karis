import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { KarisClient, type APIKeyInfo, type BrandProfile } from '../core/client.js';
import { loadResolvedConfig, maskValue, setConfigValue } from '../utils/config.js';
import { InteractiveSession } from '../utils/interactive.js';
import { emitStructuredEvent, printCommandResult, section, success, warning } from '../utils/output.js';
import { isTextOutput } from '../core/cli-context.js';
import { runCommand } from '../utils/run-command.js';
import { executeSingleTurn } from '../utils/agent-helper.js';

const API_KEYS_URL = 'https://karis.im/settings/api-keys';

interface SetupOptions {
  apiKey?: string;
  baseUrl?: string;
  domain?: string;
  skipBrand?: boolean;
}

type SetupApiKeySource = 'flag' | 'prompt' | 'config' | 'env' | 'unset';

export async function runSetup(options: SetupOptions = {}): Promise<void> {
  const resolved = await loadResolvedConfig();
  const apiUrl = options.baseUrl || resolved.apiUrl.value || 'https://api.karis.im';
  const session = new InteractiveSession();
  let apiKeySource: SetupApiKeySource =
    options.apiKey ? 'flag' : resolved.apiKey.value ? toSetupApiKeySource(resolved.apiKey.source) : 'unset';
  let apiKey = options.apiKey || resolved.apiKey.value;
  let keyInfo: APIKeyInfo | undefined;
  let baseUrlSaved = false;
  let apiKeySaved = false;
  let brandStatus: 'created' | 'existing' | 'skipped' | 'deferred' = 'skipped';
  let brandProfile: BrandProfile | undefined;

  if (isTextOutput()) {
    console.log();
    console.log(chalk.bold.cyan('Welcome to Karis'));
    console.log();
    console.log(chalk.dim('We will set up your API access and optionally create a brand profile.'));
    console.log();
  }

  if (options.baseUrl) {
    await setConfigValue('base-url', options.baseUrl);
    baseUrlSaved = true;
    if (isTextOutput()) {
      console.log(success(`Saved base URL: ${options.baseUrl}`));
      console.log();
    } else {
      emitStructuredEvent({
        type: 'status',
        stage: 'base_url_saved',
        base_url: options.baseUrl,
      });
    }
  }

  if (isTextOutput()) {
    section('Step 1: API Key');
  }

  if (apiKey) {
    if (isTextOutput()) {
      console.log(chalk.dim(`Using API key from ${apiKeySource}: ${maskValue('api-key', apiKey)}`));
      console.log(chalk.dim(`Create or manage keys at ${API_KEYS_URL}`));
      console.log();
    }

    keyInfo = await verifyApiKey(apiKey, apiUrl);
    if (apiKeySource === 'flag') {
      await setConfigValue('api-key', apiKey);
      apiKeySaved = true;
    }
    if (isTextOutput()) {
      console.log(success(`API key verified: ${keyInfo.name} (${keyInfo.key_prefix}...)`));
      console.log();
    }
  } else {
    if (isTextOutput()) {
      console.log(chalk.dim(`Paste an API key below, or leave it blank and create one at:`));
      console.log(chalk.dim(`  ${API_KEYS_URL}`));
      console.log();
    }

    const enteredApiKey = await session.ask('Enter your Karis API key (leave blank to set it up later)');
    if (!enteredApiKey) {
      session.close();

      if (isTextOutput()) {
        console.log();
        console.log(warning('Setup paused. No API key was provided.'));
        console.log(chalk.dim(`Create one at: ${API_KEYS_URL}`));
        console.log(chalk.dim(`Then run: ${chalk.cyan('npx karis setup')}`));
        console.log();
      }

      printCommandResult({
        action: 'setup',
        configured: false,
        api_key: {
          provided: false,
          source: 'unset',
          create_url: API_KEYS_URL,
        },
        base_url: {
          value: apiUrl,
          saved: baseUrlSaved,
        },
        brand: {
          status: 'deferred',
        },
        prompts: session.getTranscript(),
      });
      return;
    }

    apiKey = enteredApiKey;
    apiKeySource = 'prompt';
    keyInfo = await verifyApiKey(apiKey, apiUrl);
    await setConfigValue('api-key', apiKey);
    apiKeySaved = true;

    if (isTextOutput()) {
      console.log();
      console.log(success(`API key verified and saved: ${keyInfo.name} (${keyInfo.key_prefix}...)`));
      console.log();
    }
  }

  const client = new KarisClient({ apiKey, apiUrl });

  if (options.skipBrand) {
    brandStatus = 'skipped';
  } else {
    if (isTextOutput()) {
      section('Step 2: Brand Profile');
    }

    const existingBrand = await client.getBrand();
    if (existingBrand) {
      brandProfile = existingBrand;
      brandStatus = 'existing';

      if (isTextOutput()) {
        console.log(success(`Brand profile already exists: ${chalk.bold(existingBrand.name || existingBrand.domain)}`));
        console.log();
      }

      const shouldCreate = await session.ask('Create or replace the brand profile now? (y/N)', {
        defaultValue: 'N',
      });

      if (shouldCreate.toLowerCase() === 'y') {
        brandProfile = await createBrandProfile(client, session, options.domain);
        brandStatus = 'created';
      }
    } else {
      brandProfile = await createBrandProfile(client, session, options.domain);
      brandStatus = brandProfile ? 'created' : 'deferred';
    }
  }

  session.close();

  if (isTextOutput()) {
    printSetupComplete(brandProfile);
  }

  printCommandResult({
    action: 'setup',
    configured: true,
    api_key: {
      provided: true,
      source: apiKeySource,
      saved: apiKeySaved || apiKeySource === 'config',
      verified: true,
      key_name: keyInfo?.name,
      key_prefix: keyInfo?.key_prefix,
    },
    base_url: {
      value: apiUrl,
      saved: baseUrlSaved,
    },
    brand: {
      status: brandStatus,
      name: brandProfile?.name,
      domain: brandProfile?.domain,
    },
    prompts: session.getTranscript(),
  });

  if (brandProfile && isTextOutput() && process.stdin.isTTY) {
    const quickAuditSession = new InteractiveSession();
      const runAudit = await quickAuditSession.ask(
        'Run a quick audit now? (Y/n)',
        { defaultValue: 'Y' },
      );
      quickAuditSession.close();

      if (runAudit.toLowerCase() !== 'n') {
        console.log();
        console.log(chalk.bold('Running audit...\n'));
        const domain = brandProfile.domain;
        await executeSingleTurn(
          `Run a comprehensive audit of my brand for ${domain} (visibility in AI search, presence, and key metrics)`,
        );
    }
  }
}

async function verifyApiKey(apiKey: string, apiUrl: string): Promise<APIKeyInfo> {
  const spinner = isTextOutput() ? ora('Verifying API key...').start() : null;
  const client = new KarisClient({ apiKey, apiUrl });

  try {
    const info = await client.verifyKey();
    spinner?.succeed('API key is valid.');
    return info;
  } catch (error) {
    spinner?.fail('API key verification failed.');
    throw error;
  }
}

async function createBrandProfile(
  client: KarisClient,
  session: InteractiveSession,
  providedDomain?: string,
): Promise<BrandProfile | undefined> {
  if (isTextOutput()) {
    console.log(chalk.dim('You can skip this step and run `npx karis brand init` later.'));
    console.log();
  }

  const domain = providedDomain || await session.ask('Brand domain (leave blank to skip)');
  if (!domain) {
    if (isTextOutput()) {
      console.log(warning('Skipped brand profile creation.'));
      console.log();
    }
    return undefined;
  }

  if (!isTextOutput()) {
    emitStructuredEvent({
      type: 'status',
      stage: 'brand_analyzing',
      domain,
    });
  }

  const spinner = isTextOutput() ? ora('Analyzing brand assets and creating profile...').start() : null;

  try {
    const profile = await client.createBrand(domain);
    spinner?.succeed('Brand profile created.');

    if (isTextOutput()) {
      console.log(success(`Brand profile for ${profile.name || domain} is ready.`));
      console.log();
    }

    return profile;
  } catch (error) {
    spinner?.fail('Failed to create brand profile.');
    throw error;
  }
}

function printSetupComplete(profile?: BrandProfile): void {
  console.log();
  console.log(chalk.bold.green('Setup complete.'));
  console.log();
  if (!profile) {
    console.log(chalk.dim('Next steps:'));
    console.log(chalk.dim(`  Create a brand:   ${chalk.cyan('npx karis brand init')}`));
    console.log(chalk.dim(`  Chat with CMO:    ${chalk.cyan('npx karis chat')}`));
    console.log();
  }
}

export function registerSetupCommand(program: Command): void {
  program
    .command('setup')
    .description('First-time setup — API key and brand profile')
    .option('-k, --api-key <key>', 'Provide the API key directly')
    .option('--base-url <url>', 'Persist a custom API base URL')
    .option('-d, --domain <domain>', 'Provide the brand domain directly')
    .option('--skip-brand', 'Skip brand profile creation')
    .action(runCommand(async (options: SetupOptions) => {
      await runSetup(options);
    }));
}

function toSetupApiKeySource(source: string): SetupApiKeySource {
  if (source === 'env' || source === 'config') {
    return source;
  }
  return 'unset';
}
