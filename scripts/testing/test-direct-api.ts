import { KarisClient } from './cli/dist/core/client.js';

async function test() {
  const client = await KarisClient.create();
  console.log('Has API key:', client.hasApiKey());
  
  try {
    const brand = await client.getBrand();
    console.log('Brand:', JSON.stringify(brand, null, 2));
  } catch (error: any) {
    console.log('Error:', error.message);
    console.log('Status:', error.statusCode);
  }
}

test();
