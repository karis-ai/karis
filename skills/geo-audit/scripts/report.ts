#!/usr/bin/env npx tsx
/**
 * report.ts
 *
 * Generate a formatted markdown report from audit results.
 *
 * Usage:
 *   npx tsx skills/geo-audit/scripts/report.ts <audit-results.json>
 *
 * Or pipe from audit.ts:
 *   npx tsx audit.ts domain.com | tail -n +X | npx tsx report.ts
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

interface AuditData {
  profile: {
    name: string;
    domain: string;
    category: string;
    competitors: Array<{ name: string; domain: string }>;
  };
  results: Array<{
    prompt: string;
    response: string;
    brandMentioned: boolean;
    brandCited: boolean;
    mentionPosition: number | null;
    sentiment: number;
    competitorsMentioned: string[];
  }>;
  metrics: {
    answerShare: number;
    citationRate: number;
    mentionPosition: number | null;
    sentiment: number;
    gapTopics: number;
  };
}

async function generateReport(data: AuditData): Promise<string> {
  const { profile, results, metrics } = data;
  const date = new Date().toISOString().split('T')[0];

  const strengths = results
    .filter((r) => r.brandMentioned)
    .map((r) => `- **"${r.prompt}"**: Mentioned ${r.mentionPosition ? `${r.mentionPosition}${getOrdinal(r.mentionPosition)}` : 'in response'}`)
    .slice(0, 3);

  const gaps = results
    .filter((r) => !r.brandMentioned && r.competitorsMentioned.length > 0)
    .map((r) => `- **"${r.prompt}"**: ${r.competitorsMentioned.join(', ')} mentioned; ${profile.name} absent`);

  const recommendations = [
    gaps.length > 0
      ? `Create comparison guide: Publish "${profile.name} vs ${profile.competitors.map((c) => c.name).join(' vs ')}: 2026 Comparison" to address gap topics.`
      : null,
    metrics.citationRate < 20
      ? 'Improve citation rate: Add structured data (schema.org) and publish original research that AI engines can cite.'
      : null,
    'Track progress: Re-run this audit monthly to measure improvement as new content is published.',
  ].filter(Boolean);

  return `# GEO Audit Report — ${profile.name}
**Date**: ${date}
**Domain**: ${profile.domain}

## Executive Summary

${profile.name} appears in ${metrics.answerShare.toFixed(0)}% of relevant AI search queries${metrics.citationRate < 10 ? ', but is rarely cited as a source' : ''}. ${gaps.length > 0 ? `The brand is absent from ${gaps.length} key queries where competitors dominate.` : 'The brand has good visibility in its category.'} Sentiment is ${metrics.sentiment >= 0.5 ? 'positive' : metrics.sentiment >= 0 ? 'neutral to positive' : 'negative'} when mentioned.

## Core Metrics

- **Answer Share**: ${metrics.answerShare.toFixed(0)}% (brand mentioned in ${results.filter((r) => r.brandMentioned).length} of ${results.length} responses)
- **Citation Rate**: ${metrics.citationRate.toFixed(0)}% (brand cited in ${results.filter((r) => r.brandCited).length} of ${results.length} responses)
- **Mention Position**: ${metrics.mentionPosition?.toFixed(1) ?? 'N/A'} (average position when mentioned)
- **Sentiment**: ${metrics.sentiment >= 0 ? '+' : ''}${metrics.sentiment.toFixed(2)} (scale: -1 to +1)
- **Gap Topics**: ${metrics.gapTopics} topics where competitors mentioned but brand wasn't

## Detailed Findings

### Strengths

${strengths.length > 0 ? strengths.join('\n') : '- No strong mentions found in this audit'}

### Gaps

${gaps.length > 0 ? gaps.join('\n') : '- No significant gaps identified'}

### Opportunities

${gaps.length > 0 ? '- Target gap topics with comparison content and use case guides' : '- Maintain current visibility and expand to adjacent topics'}

## Recommendations

${recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

---

*This audited ${results.length} prompts. Karis Pro: 50+ prompts × 4 models.*
`;
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

async function main(): Promise<void> {
  const inputFile = process.argv[2];

  let data: AuditData;
  if (inputFile) {
    const raw = await readFile(inputFile, 'utf-8');
    data = JSON.parse(raw) as AuditData;
  } else {
    // Read from stdin
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    const raw = Buffer.concat(chunks).toString('utf-8');
    data = JSON.parse(raw) as AuditData;
  }

  const report = await generateReport(data);

  // Save to .cmo/reports/
  const reportsDir = join(process.cwd(), '.cmo', 'reports');
  await mkdir(reportsDir, { recursive: true });
  const date = new Date().toISOString().split('T')[0];
  const reportPath = join(reportsDir, `audit-${date}.md`);
  await writeFile(reportPath, report, 'utf-8');

  console.log(report);
  console.log(`\nReport saved to: ${reportPath}`);
}

main().catch((err: Error) => {
  console.error('Error:', err.message);
  process.exit(1);
});
