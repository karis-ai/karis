#!/usr/bin/env npx tsx
/**
 * research-prompts.ts
 *
 * Generate prompt variants by intent type and estimate search volume.
 *
 * Usage:
 *   npx tsx skills/prompt-research/scripts/research-prompts.ts <domain>
 *
 * Requires: OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable
 */

import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const domain = process.argv[2];

if (!domain) {
  console.error('Usage: npx tsx research-prompts.ts <domain>');
  process.exit(1);
}

interface BrandProfile {
  name: string;
  domain: string;
  category: string;
  industries: string[];
  audience: { primary: string; secondary: string };
  value_propositions: string[];
  competitors: Array<{ name: string; domain: string }>;
  keywords: string[];
}

interface Prompt {
  prompt: string;
  intent: 'Informational' | 'Comparative' | 'Transactional' | 'Navigational';
  volume: 'HIGH' | 'MEDIUM' | 'LOW';
  mentioned?: '✅' | '❌' | '🔴';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  notes?: string;
}

async function loadBrandProfile(): Promise<BrandProfile | null> {
  try {
    const raw = await readFile(join(process.cwd(), '.cmo', 'brand.json'), 'utf-8');
    return JSON.parse(raw) as BrandProfile;
  } catch {
    return null;
  }
}

async function loadAuditData(): Promise<Map<string, { mentioned: boolean; competitors: string[] }>> {
  const auditMap = new Map<string, { mentioned: boolean; competitors: string[] }>();

  try {
    const reportsDir = join(process.cwd(), '.cmo', 'reports');
    const files = await readdir(reportsDir);

    for (const file of files) {
      if (file.endsWith('.md')) {
        const content = await readFile(join(reportsDir, file), 'utf-8');

        // Simple heuristic: extract prompts and brand mentions from audit reports
        // This is a simplified version — real implementation would parse structured data
        const promptMatches = content.matchAll(/\*\*Prompt:\*\* (.+)/g);
        const brandMentioned = content.includes('✅') || content.includes('Mentioned: Yes');
        const competitorMatches = content.matchAll(/Competitor: (.+)/g);

        for (const match of promptMatches) {
          const prompt = match[1].trim();
          const competitors: string[] = [];

          for (const compMatch of competitorMatches) {
            competitors.push(compMatch[1].trim());
          }

          auditMap.set(prompt, { mentioned: brandMentioned, competitors });
        }
      }
    }
  } catch {
    // No audit data available
  }

  return auditMap;
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
        max_tokens: 2500,
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
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = (await res.json()) as { content: Array<{ text: string }> };
    return data.content[0].text;
  }

  throw new Error('No LLM API key found. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.');
}

async function generatePrompts(profile: BrandProfile): Promise<Prompt[]> {
  const prompt = `You are a search behavior researcher generating realistic user prompts for ${profile.name}.

Brand Context:
- Category: ${profile.category}
- Industries: ${profile.industries.join(', ')}
- Primary Audience: ${profile.audience.primary}
- Value Propositions: ${profile.value_propositions.join('; ')}
- Keywords: ${profile.keywords.join(', ')}
- Competitors: ${profile.competitors.map((c) => c.name).join(', ')}

Generate 25 realistic user prompts across 4 intent types:

1. **Informational (40%)**: "What is X?", "How does Y work?", "Why do teams use Z?"
2. **Comparative (30%)**: "X vs Y", "Best tool for Z", "Alternatives to X"
3. **Transactional (20%)**: "How to set up X", "X pricing", "Migrate from Y to X"
4. **Navigational (10%)**: "X login", "X documentation", "X features"

Requirements:
- Prompts must sound like real user queries (conversational, specific, with context)
- Include brand name in navigational prompts
- Include competitor names in comparative prompts
- Estimate search volume (HIGH, MEDIUM, LOW) based on:
  - HIGH: Broad category terms, common pain points, popular comparisons
  - MEDIUM: Specific features, niche use cases, tactical questions
  - LOW: Brand-specific navigational queries, very specific edge cases

Output as JSON:
{
  "prompts": [
    {
      "prompt": "How do remote teams handle sprint planning?",
      "intent": "Informational",
      "volume": "HIGH"
    },
    ...
  ]
}`;

  const response = await callLLM(prompt);

  // Extract JSON from response
  let jsonStr = response.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  }

  const data = JSON.parse(jsonStr) as { prompts: Array<{ prompt: string; intent: string; volume: string }> };

  // Convert to Prompt objects with priority
  return data.prompts.map((p) => {
    const intent = p.intent as Prompt['intent'];
    const volume = p.volume as Prompt['volume'];

    // Calculate priority based on volume
    let priority: Prompt['priority'] = 'MEDIUM';
    if (volume === 'HIGH') priority = 'HIGH';
    if (volume === 'LOW' || intent === 'Navigational') priority = 'LOW';

    return {
      prompt: p.prompt,
      intent,
      volume,
      priority,
    };
  });
}

function annotateMentions(prompts: Prompt[], auditData: Map<string, { mentioned: boolean; competitors: string[] }>, brandName: string): Prompt[] {
  return prompts.map((p) => {
    const auditEntry = auditData.get(p.prompt);

    if (!auditEntry) {
      // No audit data for this prompt
      return p;
    }

    if (auditEntry.mentioned) {
      p.mentioned = '✅';
      p.notes = 'Already mentioned';
    } else if (auditEntry.competitors.length > 0) {
      p.mentioned = '🔴';
      p.priority = 'HIGH'; // Upgrade priority
      p.notes = `${auditEntry.competitors[0]} mentioned, you're not`;
    } else {
      p.mentioned = '❌';
      p.notes = 'Content gap';
    }

    return p;
  });
}

function formatPromptList(prompts: Prompt[], brandName: string): string {
  const intentCounts = {
    Informational: prompts.filter((p) => p.intent === 'Informational').length,
    Comparative: prompts.filter((p) => p.intent === 'Comparative').length,
    Transactional: prompts.filter((p) => p.intent === 'Transactional').length,
    Navigational: prompts.filter((p) => p.intent === 'Navigational').length,
  };

  const highPriority = prompts.filter((p) => p.priority === 'HIGH');
  const mediumPriority = prompts.filter((p) => p.priority === 'MEDIUM');
  const lowPriority = prompts.filter((p) => p.priority === 'LOW');

  let output = `# Prompt Research — ${new Date().toISOString().split('T')[0]}\n\n`;
  output += `## Summary\n\n`;
  output += `- **Total prompts:** ${prompts.length}\n`;
  output += `- **Informational:** ${intentCounts.Informational} (${Math.round((intentCounts.Informational / prompts.length) * 100)}%)\n`;
  output += `- **Comparative:** ${intentCounts.Comparative} (${Math.round((intentCounts.Comparative / prompts.length) * 100)}%)\n`;
  output += `- **Transactional:** ${intentCounts.Transactional} (${Math.round((intentCounts.Transactional / prompts.length) * 100)}%)\n`;
  output += `- **Navigational:** ${intentCounts.Navigational} (${Math.round((intentCounts.Navigational / prompts.length) * 100)}%)\n\n`;

  output += `---\n\n`;
  output += `## High-Priority Prompts (Create Content First)\n\n`;
  output += `| Prompt | Intent | Volume | Mentioned | Notes |\n`;
  output += `|--------|--------|--------|-----------|-------|\n`;

  highPriority.forEach((p) => {
    output += `| ${p.prompt} | ${p.intent} | ${p.volume} | ${p.mentioned || '-'} | ${p.notes || '-'} |\n`;
  });

  output += `\n---\n\n`;
  output += `## Medium-Priority Prompts\n\n`;
  output += `| Prompt | Intent | Volume | Mentioned | Notes |\n`;
  output += `|--------|--------|--------|-----------|-------|\n`;

  mediumPriority.forEach((p) => {
    output += `| ${p.prompt} | ${p.intent} | ${p.volume} | ${p.mentioned || '-'} | ${p.notes || '-'} |\n`;
  });

  output += `\n---\n\n`;
  output += `## Low-Priority Prompts\n\n`;
  output += `| Prompt | Intent | Volume | Mentioned | Notes |\n`;
  output += `|--------|--------|--------|-----------|-------|\n`;

  lowPriority.forEach((p) => {
    output += `| ${p.prompt} | ${p.intent} | ${p.volume} | ${p.mentioned || '-'} | ${p.notes || '-'} |\n`;
  });

  output += `\n---\n\n`;
  output += `*This generated prompts from brand context. Karis Pro: Real search volume data from Google + AI engine query logs.*\n`;

  return output;
}

async function main() {
  console.log('Loading brand profile...');
  const profile = await loadBrandProfile();

  if (!profile) {
    console.error('Error: .cmo/brand.json not found. Run `npx karis init` first.');
    process.exit(1);
  }

  console.log(`\nGenerating prompts for ${profile.name}...`);
  console.log(`Category: ${profile.category}\n`);

  let prompts = await generatePrompts(profile);

  console.log(`✓ Generated ${prompts.length} prompts\n`);

  console.log('Checking for audit data...');
  const auditData = await loadAuditData();

  if (auditData.size > 0) {
    console.log(`✓ Found audit data for ${auditData.size} prompts`);
    prompts = annotateMentions(prompts, auditData, profile.name);
  } else {
    console.log('No audit data found (run geo-audit or competitor-intel first for mention annotations)\n');
  }

  const promptList = formatPromptList(prompts, profile.name);
  console.log(promptList);

  console.log('\n✓ Prompt research complete');
  console.log('\nSave this output to .cmo/prompts/YYYY-MM-DD.md');
  console.log('Karis Pro: Real search volume data from Google + AI engine query logs.');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
