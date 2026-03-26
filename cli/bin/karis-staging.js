#!/usr/bin/env node

process.env.KARIS_ENV ??= 'staging';
process.env.KARIS_API_URL ??= 'https://api-staging.sophiapro.ai';

await import('../dist/index.js');
