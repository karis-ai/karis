#!/usr/bin/env tsx
/**
 * Direct API test for brand management
 */

import { KarisClient } from './cli/src/core/client.js';
import type { BrandProfile } from './cli/src/core/client.js';

async function testBrandAPI() {
  console.log('🧪 Testing Brand API directly...\n');

  const client = await KarisClient.create();

  if (!client.hasApiKey()) {
    console.log('❌ No API key found');
    return;
  }

  console.log('✓ API key loaded\n');

  // Test 1: Get existing brand (should be null initially)
  console.log('Test 1: Get existing brand profile');
  try {
    const existing = await client.getBrand();
    if (existing) {
      console.log('✓ Brand profile exists:');
      console.log(JSON.stringify(existing, null, 2));
    } else {
      console.log('✓ No brand profile found (expected)\n');
    }
  } catch (error) {
    console.log(`❌ Error: ${error}\n`);
  }

  // Test 2: Create brand profile
  console.log('Test 2: Create brand profile for karis.im');
  const profile: BrandProfile = {
    name: 'Karis',
    domain: 'karis.im',
    category: 'AI marketing intelligence platform',
    industries: ['SaaS', 'Marketing', 'AI'],
    audience: {
      primary: 'Marketing teams, CMOs',
      secondary: 'Product managers, Founders',
    },
    value_propositions: [
      'AI-powered marketing intelligence',
      'GEO optimization for AI search engines',
      'Automated brand visibility tracking',
    ],
    competitors: [
      { name: 'Perplexity', domain: 'perplexity.ai' },
      { name: 'ChatGPT', domain: 'openai.com' },
    ],
    keywords: ['GEO', 'AI search', 'marketing intelligence', 'brand visibility'],
    channels: ['blog', 'twitter', 'linkedin', 'github'],
    tone: 'technical but approachable',
  };

  try {
    const created = await client.createBrand(profile);
    console.log('✓ Brand profile created successfully:');
    console.log(JSON.stringify(created, null, 2));
    console.log();
  } catch (error: any) {
    if (error.message?.includes('already exists') || error.statusCode === 409) {
      console.log('⚠️  Brand profile already exists, updating instead...\n');

      // Test 3: Update brand profile
      console.log('Test 3: Update brand profile');
      try {
        const updated = await client.updateBrand({
          keywords: ['GEO', 'AI search', 'marketing intelligence', 'brand visibility', 'content optimization'],
        });
        console.log('✓ Brand profile updated successfully:');
        console.log(JSON.stringify(updated, null, 2));
        console.log();
      } catch (updateError) {
        console.log(`❌ Update error: ${updateError}\n`);
      }
    } else {
      console.log(`❌ Create error: ${error.message || error}\n`);
    }
  }

  // Test 4: Get brand profile again
  console.log('Test 4: Get brand profile after creation');
  try {
    const final = await client.getBrand();
    if (final) {
      console.log('✓ Brand profile retrieved:');
      console.log(`  Name: ${final.name}`);
      console.log(`  Domain: ${final.domain}`);
      console.log(`  Category: ${final.category}`);
      console.log(`  Industries: ${final.industries.join(', ')}`);
      console.log(`  Primary Audience: ${final.audience.primary}`);
      console.log(`  Competitors: ${final.competitors.map(c => c.name).join(', ')}`);
      console.log(`  Keywords: ${final.keywords.join(', ')}`);
      console.log();
    } else {
      console.log('❌ Brand profile not found after creation\n');
    }
  } catch (error) {
    console.log(`❌ Error: ${error}\n`);
  }

  console.log('✅ Brand API tests complete');
}

testBrandAPI().catch(console.error);
