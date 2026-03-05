#!/usr/bin/env tsx
/**
 * Test updated brand commands with new API endpoints
 */

import { KarisClient } from './cli/dist/core/client.js';

async function testUpdatedBrandAPI() {
  console.log('🧪 Testing Updated Brand API\n');

  const client = await KarisClient.create();

  if (!client.hasApiKey()) {
    console.log('❌ No API key found');
    return;
  }

  console.log('✓ API key loaded\n');

  // Test 1: Get existing brand
  console.log('Test 1: GET /api/v1/brand-assets/selection');
  try {
    const existing = await client.getBrand();
    if (existing) {
      console.log('✓ Brand profile exists:');
      console.log(`  Name: ${existing.name || 'N/A'}`);
      console.log(`  Domain: ${existing.domain}`);
      console.log(`  Claimed: ${existing.claimed}`);
      if (existing.colors) console.log(`  Colors: ${existing.colors.length}`);
      if (existing.logos) console.log(`  Logos: ${existing.logos.length}`);
      if (existing.fonts) console.log(`  Fonts: ${existing.fonts.length}`);
      console.log();
    } else {
      console.log('✓ No brand profile found (expected)\n');
    }
  } catch (error: any) {
    console.log(`❌ Error: ${error.message || error}\n`);
  }

  // Test 2: Create brand profile (analyze domain)
  console.log('Test 2: POST /api/v1/brand-assets/analyze');
  console.log('  Analyzing domain: karis.im');
  try {
    const created = await client.createBrand('karis.im');
    console.log('✓ Brand profile created:');
    console.log(`  ID: ${created.id}`);
    console.log(`  Name: ${created.name || 'N/A'}`);
    console.log(`  Domain: ${created.domain}`);
    console.log(`  Description: ${created.description || 'N/A'}`);
    console.log(`  Claimed: ${created.claimed}`);

    if (created.colors && created.colors.length > 0) {
      console.log(`  Colors: ${created.colors.length} found`);
      created.colors.slice(0, 3).forEach(c => {
        console.log(`    - ${c.hex} (${c.type})`);
      });
    }

    if (created.logos && created.logos.length > 0) {
      console.log(`  Logos: ${created.logos.length} found`);
    }

    if (created.fonts && created.fonts.length > 0) {
      console.log(`  Fonts: ${created.fonts.map(f => f.name).join(', ')}`);
    }

    // LLM-generated fields
    if (created.category) console.log(`  Category: ${created.category}`);
    if (created.industries) console.log(`  Industries: ${created.industries.join(', ')}`);
    if (created.audience?.primary) console.log(`  Primary Audience: ${created.audience.primary}`);
    if (created.keywords) console.log(`  Keywords: ${created.keywords.join(', ')}`);

    console.log();
  } catch (error: any) {
    if (error.message?.includes('already exists') || error.statusCode === 409) {
      console.log('⚠️  Brand profile already exists\n');
    } else {
      console.log(`❌ Error: ${error.message || error}\n`);
    }
  }

  // Test 3: Update brand customizations
  console.log('Test 3: POST /api/v1/brand-assets/customizations');
  try {
    const updated = await client.updateBrand({
      category: 'AI marketing intelligence platform',
      industries: ['SaaS', 'Marketing', 'AI'],
      audience: {
        primary: 'Marketing teams, CMOs',
        secondary: 'Product managers, Founders',
      },
      value_propositions: [
        'AI-powered marketing intelligence',
        'GEO optimization for AI search engines',
      ],
      competitors: [
        { name: 'Perplexity', domain: 'perplexity.ai' },
        { name: 'ChatGPT', domain: 'openai.com' },
      ],
      keywords: ['GEO', 'AI search', 'marketing intelligence'],
      channels: ['blog', 'twitter', 'linkedin', 'github'],
      tone: 'technical but approachable',
    });

    console.log('✓ Brand customizations updated:');
    console.log(`  Category: ${updated.category}`);
    console.log(`  Industries: ${updated.industries?.join(', ')}`);
    console.log(`  Primary Audience: ${updated.audience?.primary}`);
    console.log(`  Competitors: ${updated.competitors?.map(c => c.name).join(', ')}`);
    console.log();
  } catch (error: any) {
    console.log(`❌ Error: ${error.message || error}\n`);
  }

  // Test 4: Get brand profile again
  console.log('Test 4: GET /api/v1/brand-assets/selection (after updates)');
  try {
    const final = await client.getBrand();
    if (final) {
      console.log('✓ Brand profile retrieved:');
      console.log(`  Name: ${final.name || 'N/A'}`);
      console.log(`  Domain: ${final.domain}`);
      console.log(`  Category: ${final.category || 'N/A'}`);
      console.log(`  Industries: ${final.industries?.join(', ') || 'N/A'}`);
      console.log(`  Primary Audience: ${final.audience?.primary || 'N/A'}`);
      console.log(`  Competitors: ${final.competitors?.map(c => c.name).join(', ') || 'N/A'}`);
      console.log(`  Keywords: ${final.keywords?.join(', ') || 'N/A'}`);
      console.log(`  Colors: ${final.colors?.length || 0}`);
      console.log(`  Logos: ${final.logos?.length || 0}`);
      console.log(`  Fonts: ${final.fonts?.length || 0}`);
      console.log();
    } else {
      console.log('❌ Brand profile not found\n');
    }
  } catch (error: any) {
    console.log(`❌ Error: ${error.message || error}\n`);
  }

  console.log('✅ Brand API tests complete');
}

testUpdatedBrandAPI().catch(console.error);
