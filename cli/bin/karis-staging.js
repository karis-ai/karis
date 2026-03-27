#!/usr/bin/env node

process.env.KARIS_ENV ??= 'staging';
// Staging wrapper should be plug-and-play and not inherit local dev API URLs.
// Use a dedicated override var when a custom staging endpoint is needed.
process.env.KARIS_API_URL =
  process.env.KARIS_STAGING_API_URL || 'https://api-staging.sophiapro.ai';

await import('../dist/index.js');
