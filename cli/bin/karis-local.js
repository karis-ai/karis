#!/usr/bin/env node

import { homedir } from 'node:os';
import { join } from 'node:path';

process.env.KARIS_ENV ??= 'local';
process.env.KARIS_API_URL ??= 'http://localhost:8000';
process.env.KARIS_CONFIG_DIR ??= join(homedir(), '.karis-local');

await import('../dist/index.js');
