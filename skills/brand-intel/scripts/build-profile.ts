#!/usr/bin/env npx tsx
/**
 * build-profile.ts
 *
 * Auto-generate an initial brand profile from a domain.
 * Fetches the website, extracts meta information, and uses an LLM
 * to generate a structured brand profile.
 *
 * Usage:
 *   npx tsx skills/brand-intel/scripts/build-profile.ts <domain>
 *
 * Requires: OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable
 */

const domain = process.argv[2];

if (!domain) {
  console.error('Usage: npx tsx build-profile.ts <domain>');
  process.exit(1);
}

const url = domain.startsWith('http') ? domain : `https://${domain}`;

interface BrandProfile {
  name: string;
  domain: string;
  category: string;
  industries: string[];
  audience: { primary: string; secondary: string };
  value_propositions: string[];
  competitors: Array<{ name: string; domain: string }>;
  keywords: string[];
  channels: string[];
  tone: string;
}

async function fetchPageContent(pageUrl: string): Promise<string> {
  try {
    const res = await fetch(pageUrl, {
      headers: { 'User-Agent': 'Karis/1.0 (brand-intel)' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return '';
    const html = await res.text();
    // Extract text content — strip tags, scripts, styles
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 5000);
  } catch {
    return '';
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
        messages: [
          { role: 'system', content: 'You are a brand analyst. Return ONLY valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 2048,
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
        max_tokens: 2048,
        system: 'You are a brand analyst. Return ONLY valid JSON.',
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = (await res.json()) as { content: Array<{ type: string; text: string }> };
    return data.content.find((c) => c.type === 'text')?.text ?? '';
  }

  throw new Error('Set OPENAI_API_KEY or ANTHROPIC_API_KEY to use auto-detection.');
}

async function main(): Promise<void> {
  console.log(`Fetching ${url}...`);
  const content = await fetchPageContent(url);

  if (!content) {
    console.error(`Could not fetch content from ${url}`);
    process.exit(1);
  }

  console.log('Analyzing brand with LLM...');
  const prompt = `Analyze this website content and generate a brand profile JSON.

Website: ${domain}
Content (first 5000 chars):
${content}

Return a JSON object with this exact structure:
{
  "name": "Brand Name",
  "domain": "${domain}",
  "category": "product category description",
  "industries": ["industry1", "industry2"],
  "audience": { "primary": "primary audience", "secondary": "secondary audience" },
  "value_propositions": ["value prop 1", "value prop 2"],
  "competitors": [{ "name": "Competitor", "domain": "competitor.com" }],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "channels": ["blog", "twitter", "linkedin"],
  "tone": "tone description"
}`;

  const response = await callLLM(prompt);
  const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    const profile: BrandProfile = JSON.parse(cleaned);
    profile.domain = domain.replace(/^https?:\/\//, '');
    console.log(JSON.stringify(profile, null, 2));
  } catch {
    console.error('Failed to parse LLM response as JSON:');
    console.error(cleaned);
    process.exit(1);
  }
}

main().catch((err: Error) => {
  console.error('Error:', err.message);
  process.exit(1);
});
