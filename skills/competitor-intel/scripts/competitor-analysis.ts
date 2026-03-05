#!/usr/bin/env npx tsx
/**
 * competitor-analysis.ts
 *
 * Analyze competitor performance in AI search: run simplified audits on competitors,
 * compare Answer Share rankings, identify gap topics.
 *
 * Usage:
 *   npx tsx skills/competitor-intel/scripts/competitor-analysis.ts <domain>
 *
 * Requires: OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const domain = process.argv[2];

if (!domain) {
  console.error('Usage: npx tsx competitor-analysis.ts <domain>');
  process.exit(1);
}

interface BrandProfile {
  name: string;
  domain: string;
  category: string;
  competitors: Array<{ name: string; domain: string }>;
  keywords: string[];
}

interface CompetitorResult {
  prompt: string;
  response: string;
  brands: {
    [brandName: string]: {
      mentioned: boolean;
      cited: boolean;
      position: number | null;
      sentiment: number;
    };
  };
}

async function loadBrandProfile(): Promise<BrandProfile | null> {
  try {
    const raw = await readFile(join(process.cwd(), '.cmo', 'brand.json'), 'utf-8');
    return JSON.parse(raw) as BrandProfile;
  } catch {
    return null;
  }
}

async function callLLM(prompt: string): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (openaiKey) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });
    const data = (await res.json()) as { choices: Array<{ message: { content: string } }> };
    return data.choices[0].message.content;
  }

  if (anthropicKey) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = (await res.json()) as { content: Array<{ text: string }> };
    return data.content[0].text;
  }

  throw new Error('No LLM API key found. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.');
}

function generatePrompts(category: string, competitors: Array<{ name: string }>): string[] {
  const competitorNames = competitors.map((c) => c.name).join(', ');

  return [
    // Informational (40%)
    `What is ${category}?`,
    `How does ${category} work?`,
    `Why use ${category}?`,
    `What are the benefits of ${category}?`,

    // Comparative (40%)
    `${competitorNames} comparison`,
    `Best ${category} tools`,
    `${competitors[0]?.name} vs ${competitors[1]?.name}`,
    `Top ${category} software`,

    // Transactional (20%)
    `Recommend a ${category} tool`,
    `Which ${category} should I use?`,
  ];
}

function analyzeBrandMentions(
  response: string,
  brandName: string,
  brandDomain: string
): {
  mentioned: boolean;
  cited: boolean;
  position: number | null;
  sentiment: number;
} {
  const lowerResponse = response.toLowerCase();
  const lowerBrand = brandName.toLowerCase();
  const lowerDomain = brandDomain.toLowerCase();

  const mentioned = lowerResponse.includes(lowerBrand);
  const cited = lowerResponse.includes(lowerDomain) || lowerResponse.includes(`[${lowerBrand}]`);

  let position: number | null = null;
  if (mentioned) {
    const lines = response.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(lowerBrand)) {
        position = i + 1;
        break;
      }
    }
  }

  // Simple sentiment: check for positive/negative words near brand mention
  let sentiment = 0;
  if (mentioned) {
    const positiveWords = ['best', 'great', 'excellent', 'powerful', 'recommended', 'popular', 'leading'];
    const negativeWords = ['limited', 'expensive', 'complex', 'slow', 'outdated', 'lacking'];

    const contextStart = Math.max(0, lowerResponse.indexOf(lowerBrand) - 100);
    const contextEnd = Math.min(lowerResponse.length, lowerResponse.indexOf(lowerBrand) + 100);
    const context = lowerResponse.slice(contextStart, contextEnd);

    const positiveCount = positiveWords.filter((w) => context.includes(w)).length;
    const negativeCount = negativeWords.filter((w) => context.includes(w)).length;

    if (positiveCount > negativeCount) sentiment = 1;
    else if (negativeCount > positiveCount) sentiment = -1;
    else sentiment = 0;
  }

  return { mentioned, cited, position, sentiment };
}

async function main() {
  console.log('Loading brand profile...');
  const profile = await loadBrandProfile();

  if (!profile) {
    console.error('Error: .cmo/brand.json not found. Run `npx karis init` first.');
    process.exit(1);
  }

  if (!profile.competitors || profile.competitors.length === 0) {
    console.error('Error: No competitors defined in brand profile.');
    process.exit(1);
  }

  console.log(`\nAnalyzing ${profile.name} vs ${profile.competitors.map((c) => c.name).join(', ')}`);
  console.log(`Category: ${profile.category}\n`);

  const prompts = generatePrompts(profile.category, profile.competitors);
  const results: CompetitorResult[] = [];

  // All brands to analyze (your brand + competitors)
  const allBrands = [
    { name: profile.name, domain: profile.domain },
    ...profile.competitors,
  ];

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    console.log(`[${i + 1}/${prompts.length}] Querying: "${prompt}"`);

    const response = await callLLM(prompt);

    // Analyze all brands in this response
    const brands: CompetitorResult['brands'] = {};
    for (const brand of allBrands) {
      brands[brand.name] = analyzeBrandMentions(response, brand.name, brand.domain);
    }

    results.push({ prompt, response, brands });
  }

  // Calculate Answer Share for each brand
  console.log('\n=== Answer Share Rankings ===\n');

  const brandStats = allBrands.map((brand) => {
    const mentions = results.filter((r) => r.brands[brand.name]?.mentioned).length;
    const citations = results.filter((r) => r.brands[brand.name]?.cited).length;
    const answerShare = (mentions / results.length) * 100;
    const citationRate = (citations / results.length) * 100;

    return {
      name: brand.name,
      answerShare,
      citationRate,
      mentions,
      citations,
    };
  });

  // Sort by Answer Share descending
  brandStats.sort((a, b) => b.answerShare - a.answerShare);

  brandStats.forEach((stat, index) => {
    const isYou = stat.name === profile.name;
    const marker = isYou ? ' (you)' : '';
    console.log(
      `${index + 1}. ${stat.name}${marker}: ${stat.answerShare.toFixed(1)}% Answer Share, ${stat.citationRate.toFixed(1)}% Citation Rate`
    );
  });

  // Identify gap topics
  console.log('\n=== Gap Topics (competitors mentioned, you weren\'t) ===\n');

  const gapTopics = results.filter((r) => {
    const youMentioned = r.brands[profile.name]?.mentioned;
    const anyCompetitorMentioned = profile.competitors.some((c) => r.brands[c.name]?.mentioned);
    return !youMentioned && anyCompetitorMentioned;
  });

  if (gapTopics.length === 0) {
    console.log('No gap topics found — you appear in all prompts where competitors do!');
  } else {
    gapTopics.forEach((gap) => {
      const competitorsMentioned = profile.competitors
        .filter((c) => gap.brands[c.name]?.mentioned)
        .map((c) => c.name)
        .join(', ');
      console.log(`- "${gap.prompt}" → ${competitorsMentioned} mentioned, you absent`);
    });
  }

  console.log('\n✓ Competitive analysis complete');
  console.log('\nThis compared', allBrands.length, 'brands across', prompts.length, 'prompts.');
  console.log('Karis Pro: Multi-model competitive tracking with historical trends.');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
