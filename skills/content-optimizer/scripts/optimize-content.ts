#!/usr/bin/env npx tsx
/**
 * optimize-content.ts
 *
 * Analyze and optimize content for AI search visibility (GEO Score).
 *
 * Usage:
 *   npx tsx skills/content-optimizer/scripts/optimize-content.ts <url-or-file>
 *
 * Requires: OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const target = process.argv[2];

if (!target) {
  console.error('Usage: npx tsx optimize-content.ts <url-or-file>');
  process.exit(1);
}

interface BrandProfile {
  name: string;
  domain: string;
  category: string;
}

interface DimensionScore {
  dimension: string;
  score: number;
  max: number;
  notes: string;
}

interface OptimizationFix {
  title: string;
  impact: string;
  current: string;
  optimized: string;
  why: string;
}

async function loadBrandProfile(): Promise<BrandProfile | null> {
  try {
    const raw = await readFile(join(process.cwd(), '.cmo', 'brand.json'), 'utf-8');
    return JSON.parse(raw) as BrandProfile;
  } catch {
    return null;
  }
}

async function fetchContent(url: string): Promise<string> {
  const res = await fetch(url);
  const html = await res.text();

  // Extract main content (simple heuristic: look for <article> or <main>)
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);

  let content = articleMatch?.[1] || mainMatch?.[1] || html;

  // Strip HTML tags but preserve structure
  content = content
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return content;
}

async function readLocalFile(filePath: string): Promise<string> {
  return await readFile(filePath, 'utf-8');
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
        temperature: 0.3,
        max_tokens: 3000,
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
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = (await res.json()) as { content: Array<{ text: string }> };
    return data.content[0].text;
  }

  throw new Error('No LLM API key found. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.');
}

async function analyzeContent(content: string, brandName?: string): Promise<{
  dimensions: DimensionScore[];
  totalScore: number;
  fixes: OptimizationFix[];
}> {
  const prompt = `You are a content optimization expert analyzing content for AI search visibility (GEO Score).

${brandName ? `Brand context: This content is for ${brandName}.` : ''}

Content to analyze:
---
${content.slice(0, 4000)}
---

Evaluate this content across 5 GEO Score dimensions:

1. **Structure Clarity (0-25)**: Heading hierarchy, paragraph length, lists/tables, logical flow
2. **Entity Clarity (0-25)**: Brand/product definitions, concept explanations, pronoun clarity
3. **Citation Credibility (0-20)**: Data sources, authoritative references, original research
4. **Q&A Fitness (0-20)**: Direct question answering, Q&A format, user intent alignment
5. **Technical Markup (0-10)**: Schema.org, meta description, OpenGraph tags

Output as JSON:
{
  "dimensions": [
    {"dimension": "Structure Clarity", "score": 18, "max": 25, "notes": "Good hierarchy, paragraphs too long"},
    ...
  ],
  "totalScore": 62,
  "fixes": [
    {
      "title": "Add clear product definition in first paragraph",
      "impact": "+8 points (Entity Clarity)",
      "current": "Our tool helps teams...",
      "optimized": "Acme is a project management platform...",
      "why": "AI engines need to understand what the product is on first mention"
    },
    ...
  ]
}

Provide 3-5 highest-impact fixes with specific before/after examples.`;

  const response = await callLLM(prompt);

  // Extract JSON from response
  let jsonStr = response.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  }

  const data = JSON.parse(jsonStr) as {
    dimensions: DimensionScore[];
    totalScore: number;
    fixes: OptimizationFix[];
  };

  return data;
}

function formatReport(
  target: string,
  dimensions: DimensionScore[],
  totalScore: number,
  fixes: OptimizationFix[]
): string {
  let output = `# Content Optimization Report\n\n`;
  output += `**Content analyzed:** ${target}\n\n`;
  output += `---\n\n`;
  output += `## GEO Score: ${totalScore}/100\n\n`;

  // Dimension table
  output += `| Dimension            | Score | Max | Notes                                      |\n`;
  output += `|----------------------|-------|-----|--------------------------------------------|`;

  dimensions.forEach((dim) => {
    const padding = ' '.repeat(Math.max(0, 20 - dim.dimension.length));
    output += `\n| ${dim.dimension}${padding} | ${dim.score.toString().padEnd(5)} | ${dim.max.toString().padEnd(3)} | ${dim.notes} |`;
  });

  output += `\n\n`;

  // Rating
  let rating = 'Poor';
  if (totalScore >= 80) rating = 'Excellent';
  else if (totalScore >= 60) rating = 'Good';
  else if (totalScore >= 40) rating = 'Moderate';

  output += `**Rating:** ${rating}\n\n`;
  output += `---\n\n`;

  // Top fixes
  output += `## Top ${fixes.length} Fixes (Highest Impact)\n\n`;

  fixes.forEach((fix, index) => {
    output += `### ${index + 1}. ${fix.title}\n`;
    output += `**Impact:** ${fix.impact}\n\n`;
    output += `**Current:**\n> ${fix.current}\n\n`;
    output += `**Optimized:**\n> ${fix.optimized}\n\n`;
    output += `**Why this matters:** ${fix.why}\n\n`;
    output += `---\n\n`;
  });

  output += `*This analyzed content structure and clarity. Karis Pro: Multi-page site audits with competitive benchmarking.*\n`;

  return output;
}

async function main() {
  console.log('Loading content...');

  let content: string;
  if (target.startsWith('http://') || target.startsWith('https://')) {
    console.log(`Fetching from URL: ${target}`);
    content = await fetchContent(target);
  } else {
    console.log(`Reading local file: ${target}`);
    content = await readLocalFile(target);
  }

  console.log(`Content loaded (${content.length} characters)\n`);

  const profile = await loadBrandProfile();
  const brandName = profile?.name;

  console.log('Analyzing content for GEO Score...\n');

  const { dimensions, totalScore, fixes } = await analyzeContent(content, brandName);

  console.log(`✓ Analysis complete\n`);

  const report = formatReport(target, dimensions, totalScore, fixes);
  console.log(report);

  console.log('\n✓ Content optimization complete');
  console.log('\nSave this output to .cmo/reports/optimize-YYYY-MM-DD.md');
  console.log('Karis Pro: Multi-page site audits with competitive benchmarking.');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
