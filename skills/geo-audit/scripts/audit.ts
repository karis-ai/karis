#!/usr/bin/env npx tsx
/**
 * audit.ts
 *
 * Execute a GEO audit: generate prompts, query LLM, analyze responses, calculate metrics.
 *
 * Usage:
 *   npx tsx skills/geo-audit/scripts/audit.ts <domain>
 *
 * Requires: OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const domain = process.argv[2];

if (!domain) {
  console.error('Usage: npx tsx audit.ts <domain>');
  process.exit(1);
}

interface BrandProfile {
  name: string;
  domain: string;
  category: string;
  competitors: Array<{ name: string; domain: string }>;
  keywords: string[];
}

interface AuditResult {
  prompt: string;
  response: string;
  brandMentioned: boolean;
  brandCited: boolean;
  mentionPosition: number | null;
  sentiment: number;
  competitorsMentioned: string[];
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
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = (await res.json()) as { content: Array<{ type: string; text: string }> };
    return data.content.find((c) => c.type === 'text')?.text ?? '';
  }

  throw new Error('Set OPENAI_API_KEY or ANTHROPIC_API_KEY');
}

function generatePrompts(profile: BrandProfile): string[] {
  const category = profile.category;
  const competitors = profile.competitors.map((c) => c.name);

  // 10 prompts: 4 informational, 4 comparative, 2 transactional
  return [
    // Informational (4)
    `What is ${category}?`,
    `How does ${category} work?`,
    `Why use ${category}?`,
    `What are the benefits of ${category}?`,
    // Comparative (4)
    `${competitors[0]} vs ${competitors[1]}`,
    `Best ${category} for startups`,
    `Which ${category} should I use?`,
    `Compare ${competitors[0]} and ${competitors[1]}`,
    // Transactional (2)
    `Recommend a ${category}`,
    `Top 5 ${category} tools`,
  ];
}

function analyzeResponse(
  response: string,
  brandName: string,
  brandDomain: string,
  competitors: Array<{ name: string }>,
): Omit<AuditResult, 'prompt' | 'response'> {
  const lowerResponse = response.toLowerCase();
  const lowerBrand = brandName.toLowerCase();

  const brandMentioned = lowerResponse.includes(lowerBrand);
  const brandCited = lowerResponse.includes(brandDomain);

  let mentionPosition: number | null = null;
  if (brandMentioned) {
    // Simple heuristic: find position in numbered lists or order of appearance
    const lines = response.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(lowerBrand)) {
        // Check if line starts with number
        const match = lines[i].match(/^\s*(\d+)\./);
        if (match) {
          mentionPosition = parseInt(match[1], 10);
          break;
        }
      }
    }
    if (mentionPosition === null) mentionPosition = 1; // Default to 1st if not in numbered list
  }

  // Sentiment: simple keyword-based heuristic
  let sentiment = 0;
  if (brandMentioned) {
    const positiveWords = ['best', 'great', 'excellent', 'recommended', 'popular', 'leading'];
    const negativeWords = ['poor', 'bad', 'limited', 'lacking', 'inferior'];
    const hasPositive = positiveWords.some((w) => lowerResponse.includes(w));
    const hasNegative = negativeWords.some((w) => lowerResponse.includes(w));
    if (hasPositive && !hasNegative) sentiment = 1;
    else if (hasNegative && !hasPositive) sentiment = -1;
    else sentiment = 0;
  }

  const competitorsMentioned = competitors
    .filter((c) => lowerResponse.includes(c.name.toLowerCase()))
    .map((c) => c.name);

  return { brandMentioned, brandCited, mentionPosition, sentiment, competitorsMentioned };
}

async function main(): Promise<void> {
  console.log('Loading brand profile...');
  const profile = await loadBrandProfile();
  if (!profile || profile.domain !== domain) {
    console.error(`No brand profile found for ${domain}. Run: npx karis init`);
    process.exit(1);
  }

  console.log(`Auditing ${profile.name} (${profile.domain})...`);
  const prompts = generatePrompts(profile);
  console.log(`Generated ${prompts.length} test prompts.`);

  const results: AuditResult[] = [];

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    console.log(`[${i + 1}/${prompts.length}] Querying: "${prompt}"`);
    const response = await callLLM(prompt);
    const analysis = analyzeResponse(response, profile.name, profile.domain, profile.competitors);
    results.push({ prompt, response, ...analysis });
  }

  // Calculate metrics
  const totalResponses = results.length;
  const mentioned = results.filter((r) => r.brandMentioned).length;
  const cited = results.filter((r) => r.brandCited).length;
  const positions = results.filter((r) => r.mentionPosition !== null).map((r) => r.mentionPosition!);
  const avgPosition = positions.length > 0 ? positions.reduce((a, b) => a + b, 0) / positions.length : null;
  const sentiments = results.filter((r) => r.brandMentioned).map((r) => r.sentiment);
  const avgSentiment = sentiments.length > 0 ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length : 0;
  const gapTopics = results.filter((r) => !r.brandMentioned && r.competitorsMentioned.length > 0);

  console.log('\n=== GEO Audit Results ===');
  console.log(`Answer Share: ${((mentioned / totalResponses) * 100).toFixed(1)}%`);
  console.log(`Citation Rate: ${((cited / totalResponses) * 100).toFixed(1)}%`);
  console.log(`Mention Position: ${avgPosition?.toFixed(1) ?? 'N/A'}`);
  console.log(`Sentiment: ${avgSentiment >= 0 ? '+' : ''}${avgSentiment.toFixed(2)}`);
  console.log(`Gap Topics: ${gapTopics.length}`);

  // Output JSON for report.ts
  console.log('\n' + JSON.stringify({ profile, results, metrics: {
    answerShare: (mentioned / totalResponses) * 100,
    citationRate: (cited / totalResponses) * 100,
    mentionPosition: avgPosition,
    sentiment: avgSentiment,
    gapTopics: gapTopics.length,
  }}, null, 2));
}

main().catch((err: Error) => {
  console.error('Error:', err.message);
  process.exit(1);
});
