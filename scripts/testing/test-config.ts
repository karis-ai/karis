import { loadConfig } from './cli/dist/utils/config.js';

async function test() {
  const config = await loadConfig();
  console.log('Config:', config);
  
  const apiKey = process.env.KARIS_API_KEY || config['api-key'] || '';
  const apiUrl = process.env.KARIS_API_URL || config['base-url'] || 'https://api.karis.im';
  
  console.log('API Key:', apiKey);
  console.log('API URL:', apiUrl);
  
  const url = `${apiUrl}/api/v1/brand-assets/selection`;
  console.log('Full URL:', url);
}

test();
