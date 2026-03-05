#!/usr/bin/env npx tsx
/**
 * generate-clusters.ts
 *
 * Generate topic cluster map with pillar topics and prioritized subtopics.
 *
 * Usage:
 *   npx tsx skills/topic-clusters/scripts/generate-clusters.ts <domain>
 *
 * Requires: OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const domain = process.argv[2];

if (!domain) {
  console.error('Usage: npx tsx generate-clusters.ts <domain>');
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

interface Subtopic {
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface Pillar {
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  subtopics: Subtopic[];
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
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = (await res.json()) as { content: Array<{ text: string }> };
    return data.content[0].text;
  }

  throw new Error('No LLM API key found. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.');
}

async function generateClusters(profile: BrandProfile): Promise<Pillar[]> {
  const prompt = `You are a content strategist creating a topic cluster map for ${profile.name}.

Brand Context:
- Category: ${profile.category}
- Industries: ${profile.industries.join(', ')}
- Primary Audience: ${profile.audience.primary}
- Secondary Audience: ${profile.audience.secondary}
- Value Propositions: ${profile.value_propositions.join('; ')}
- Keywords: ${profile.keywords.join(', ')}

Generate a topic cluster map with 3-5 pillar topics and 5-10 subtopics per pillar.

Requirements:
1. Pillar topics must be broad but bounded (not too generic)
2. Include category pillars (table stakes), audience pillars (pain points), and differentiation pillars (unique value)
3. Subtopics must be specific, actionable, and answer user questions
4. Prioritize each pillar and subtopic as HIGH, MEDIUM, or LOW based on:
   - HIGH: Low competition + high relevance + showcases differentiation
   - MEDIUM: Moderate competition or moderate relevance
   - LOW: High competition + table stakes

Output as JSON:
{
  "pillars": [
    {
      "title": "Pillar Topic Name",
      "priority": "HIGH",
      "subtopics": [
        { "title": "Specific subtopic question or topic", "priority": "HIGH" },
        ...
      ]
    },
    ...
  ]
}`;

  const response = await callLLM(prompt);

  // Extract JSON from response (handle markdown code blocks)
  let jsonStr = response.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  }

  const data = JSON.parse(jsonStr) as { pillars: Pillar[] };
  return data.pillars;
}

function formatClusterMap(pillars: Pillar[]): string {
  const priorityEmoji = {
    HIGH: '🔴',
    MEDIUM: '🟡',
    LOW: '⚪',
  };

  let output = '# Topic Cluster Map\n\n';

  pillars.forEach((pillar, index) => {
    const emoji = priorityEmoji[pillar.priority];
    output += `## Pillar ${index + 1}: ${pillar.title} (${pillar.priority})\n\n`;

    pillar.subtopics.forEach((subtopic) => {
      const subEmoji = priorityEmoji[subtopic.priority];
      output += `├── ${subEmoji} [${subtopic.priority}] ${subtopic.title}\n`;
    });

    output += '\n';
  });

  // Add execution plan
  output += '---\n\n## Execution Plan — Start Here\n\n';
  output += '### Phase 1: High-Priority Content (Weeks 1-4)\n\n';

  let count = 1;
  pillars.forEach((pillar) => {
    pillar.subtopics
      .filter((s) => s.priority === 'HIGH')
      .slice(0, 3)
      .forEach((subtopic) => {
        output += `${count}. **"${subtopic.title}"** — Create comprehensive content\n`;
        count++;
      });
  });

  output += '\n### Phase 2: Medium-Priority Content (Weeks 5-8)\n\n';
  pillars.forEach((pillar) => {
    pillar.subtopics
      .filter((s) => s.priority === 'MEDIUM')
      .slice(0, 2)
      .forEach((subtopic) => {
        output += `${count}. "${subtopic.title}"\n`;
        count++;
      });
  });

  output += '\n---\n\n';
  output += '*This generated clusters from brand context. Karis Pro: Deepcrawl site data + Tavily competitor data + search volume insights.*\n';

  return output;
}

async function main() {
  console.log('Loading brand profile...');
  const profile = await loadBrandProfile();

  if (!profile) {
    console.error('Error: .cmo/brand.json not found. Run `npx karis init` first.');
    process.exit(1);
  }

  console.log(`\nGenerating topic clusters for ${profile.name}...`);
  console.log(`Category: ${profile.category}`);
  console.log(`Audience: ${profile.audience.primary}\n`);

  const pillars = await generateClusters(profile);

  console.log(`\n✓ Generated ${pillars.length} pillar topics\n`);

  const clusterMap = formatClusterMap(pillars);
  console.log(clusterMap);

  console.log('\n✓ Topic cluster generation complete');
  console.log('\nSave this output to .cmo/clusters/latest.md');
  console.log('Karis Pro: Deepcrawl site data + Tavily competitor data + search volume insights.');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
