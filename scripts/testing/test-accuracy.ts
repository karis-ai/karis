#!/usr/bin/env tsx
/**
 * GEO Audit Accuracy Testing
 * Validates the quality and accuracy of GEO audit reports
 */

import { spawn } from 'child_process';
import { performance } from 'perf_hooks';

interface AuditMetrics {
  domain: string;
  hasScore: boolean;
  scoreValue?: number;
  hasDimensions: boolean;
  dimensionCount: number;
  hasRecommendations: boolean;
  recommendationCount: number;
  hasToolExecution: boolean;
  toolCount: number;
  responseTime: number;
  outputLength: number;
  structureScore: number; // 0-100
}

const TEST_DOMAINS = [
  'karis.im',
  'anthropic.com',
  'openai.com',
];

async function runAudit(domain: string): Promise<{ stdout: string; stderr: string; duration: number }> {
  return new Promise((resolve) => {
    const start = performance.now();
    const proc = spawn('npx', ['tsx', 'cli/bin/karis.js', 'geo', 'audit', domain], { shell: true });

    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    setTimeout(() => {
      proc.kill();
      resolve({ stdout, stderr: stderr + '\nTIMEOUT', duration: performance.now() - start });
    }, 180000); // 3 min timeout

    proc.on('close', () => {
      resolve({ stdout, stderr, duration: performance.now() - start });
    });
  });
}

function analyzeAuditOutput(domain: string, output: string, duration: number): AuditMetrics {
  const metrics: AuditMetrics = {
    domain,
    hasScore: false,
    hasDimensions: false,
    dimensionCount: 0,
    hasRecommendations: false,
    recommendationCount: 0,
    hasToolExecution: false,
    toolCount: 0,
    responseTime: duration,
    outputLength: output.length,
    structureScore: 0,
  };

  // Check for score
  const scoreMatch = output.match(/(\d+)\s*\/\s*100/);
  if (scoreMatch) {
    metrics.hasScore = true;
    metrics.scoreValue = parseInt(scoreMatch[1]);
  }

  // Check for dimensions
  const dimensionPatterns = [
    /AI Crawler/gi,
    /Content Structure/gi,
    /Semantic Relevance/gi,
    /Structured Data/gi,
    /User Intent/gi,
  ];

  dimensionPatterns.forEach(pattern => {
    if (pattern.test(output)) {
      metrics.dimensionCount++;
    }
  });
  metrics.hasDimensions = metrics.dimensionCount >= 3;

  // Check for recommendations
  const recommendationPatterns = [
    /优先级|Priority/gi,
    /问题|Issue/gi,
    /建议|Recommendation/gi,
    /修复|Fix/gi,
  ];

  recommendationPatterns.forEach(pattern => {
    const matches = output.match(pattern);
    if (matches) {
      metrics.recommendationCount += matches.length;
    }
  });
  metrics.hasRecommendations = metrics.recommendationCount > 0;

  // Check for tool execution
  const toolMatches = output.match(/\[tool\]/g);
  if (toolMatches) {
    metrics.hasToolExecution = true;
    metrics.toolCount = toolMatches.length;
  }

  // Calculate structure score
  let score = 0;
  if (metrics.hasScore) score += 25;
  if (metrics.hasDimensions) score += 25;
  if (metrics.hasRecommendations) score += 25;
  if (metrics.hasToolExecution) score += 15;
  if (metrics.outputLength > 1000) score += 10;
  metrics.structureScore = score;

  return metrics;
}

function printMetrics(metrics: AuditMetrics) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Domain: ${metrics.domain}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Response Time: ${(metrics.responseTime / 1000).toFixed(1)}s`);
  console.log(`Output Length: ${metrics.outputLength} characters`);
  console.log(`\nContent Analysis:`);
  console.log(`  ✓ Has Score: ${metrics.hasScore ? '✓' : '✗'} ${metrics.scoreValue !== undefined ? `(${metrics.scoreValue}/100)` : ''}`);
  console.log(`  ✓ Has Dimensions: ${metrics.hasDimensions ? '✓' : '✗'} (${metrics.dimensionCount}/5)`);
  console.log(`  ✓ Has Recommendations: ${metrics.hasRecommendations ? '✓' : '✗'} (${metrics.recommendationCount} found)`);
  console.log(`  ✓ Has Tool Execution: ${metrics.hasToolExecution ? '✓' : '✗'} (${metrics.toolCount} tools)`);
  console.log(`\nStructure Score: ${metrics.structureScore}/100`);

  const grade = metrics.structureScore >= 90 ? 'A' :
                metrics.structureScore >= 80 ? 'B' :
                metrics.structureScore >= 70 ? 'C' :
                metrics.structureScore >= 60 ? 'D' : 'F';
  console.log(`Grade: ${grade}`);
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   GEO AUDIT ACCURACY TESTING                               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const allMetrics: AuditMetrics[] = [];

  for (const domain of TEST_DOMAINS) {
    console.log(`\n🔍 Testing: ${domain}`);
    console.log(`⏳ Running audit (this may take 60-90 seconds)...`);

    const result = await runAudit(domain);

    if (result.stderr.includes('TIMEOUT')) {
      console.log(`❌ TIMEOUT for ${domain}`);
      continue;
    }

    const metrics = analyzeAuditOutput(domain, result.stdout, result.duration);
    allMetrics.push(metrics);

    printMetrics(metrics);
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log(`${'='.repeat(60)}`);

  const avgResponseTime = allMetrics.reduce((sum, m) => sum + m.responseTime, 0) / allMetrics.length;
  const avgStructureScore = allMetrics.reduce((sum, m) => sum + m.structureScore, 0) / allMetrics.length;
  const allHaveScores = allMetrics.every(m => m.hasScore);
  const allHaveDimensions = allMetrics.every(m => m.hasDimensions);
  const allHaveRecommendations = allMetrics.every(m => m.hasRecommendations);

  console.log(`\nTests Run: ${allMetrics.length}/${TEST_DOMAINS.length}`);
  console.log(`Average Response Time: ${(avgResponseTime / 1000).toFixed(1)}s`);
  console.log(`Average Structure Score: ${avgStructureScore.toFixed(1)}/100`);
  console.log(`\nConsistency:`);
  console.log(`  All have scores: ${allHaveScores ? '✓' : '✗'}`);
  console.log(`  All have dimensions: ${allHaveDimensions ? '✓' : '✗'}`);
  console.log(`  All have recommendations: ${allHaveRecommendations ? '✓' : '✗'}`);

  const overallGrade = avgStructureScore >= 90 ? 'A' :
                       avgStructureScore >= 80 ? 'B' :
                       avgStructureScore >= 70 ? 'C' :
                       avgStructureScore >= 60 ? 'D' : 'F';

  console.log(`\n🎯 Overall Grade: ${overallGrade}`);

  // Save results
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      testsRun: allMetrics.length,
      avgResponseTime: avgResponseTime / 1000,
      avgStructureScore,
      overallGrade,
    },
    metrics: allMetrics,
  };

  const fs = await import('fs');
  fs.writeFileSync('accuracy-test-results.json', JSON.stringify(report, null, 2));
  console.log(`\n✓ Results saved to accuracy-test-results.json`);
}

main();
