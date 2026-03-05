#!/usr/bin/env tsx
/**
 * Brand Command Testing
 * Tests brand profile creation and management for karis.im
 */

import { spawn } from 'child_process';
import { performance } from 'perf_hooks';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  duration: number;
  details?: any;
  error?: string;
}

const results: TestResult[] = [];

function log(message: string, level: 'info' | 'success' | 'error' = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
  };
  const reset = '\x1b[0m';
  const prefix = { info: 'ℹ', success: '✓', error: '✗' };
  console.log(`${colors[level]}${prefix[level]} ${message}${reset}`);
}

async function runCommand(
  command: string,
  args: string[],
  input?: string
): Promise<{ stdout: string; stderr: string; exitCode: number; duration: number }> {
  return new Promise((resolve) => {
    const start = performance.now();
    const proc = spawn(command, args, { shell: true });

    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    if (input) {
      proc.stdin?.write(input);
      proc.stdin?.end();
    }

    setTimeout(() => {
      proc.kill();
      resolve({
        stdout,
        stderr: stderr + '\nTIMEOUT',
        exitCode: -1,
        duration: performance.now() - start,
      });
    }, 30000);

    proc.on('close', (code) => {
      resolve({
        stdout,
        stderr,
        exitCode: code || 0,
        duration: performance.now() - start,
      });
    });
  });
}

async function testBrandShow() {
  const testName = 'Brand Show (Before Init)';
  log(`Running: ${testName}`, 'info');

  const start = performance.now();
  const result = await runCommand('npx', ['tsx', 'cli/bin/karis.js', 'brand', 'show']);
  const duration = performance.now() - start;

  const hasMessage = result.stdout.includes('No brand profile') || result.stdout.includes('Brand Profile');
  const status = result.exitCode === 0 && hasMessage ? 'PASS' : 'FAIL';

  results.push({
    name: testName,
    status,
    duration,
    details: {
      exitCode: result.exitCode,
      hasMessage,
      output: result.stdout.substring(0, 200),
    },
  });

  log(`${testName}: ${status} (${duration.toFixed(0)}ms)`, status === 'PASS' ? 'success' : 'error');
  return result;
}

async function testBrandInit() {
  const testName = 'Brand Init (karis.im)';
  log(`Running: ${testName}`, 'info');

  // Prepare input for interactive prompts
  const input = [
    'Karis',                                    // Brand name
    'karis.im',                                 // Domain
    'AI marketing intelligence platform',       // Category
    'SaaS, Marketing, AI',                      // Industries
    'Marketing teams, CMOs',                    // Primary audience
    'Product managers, Founders',               // Secondary audience
    'Perplexity:perplexity.ai, ChatGPT:openai.com', // Competitors
    'GEO, AI search, marketing intelligence',   // Keywords
    'blog, twitter, linkedin, github',          // Channels
    'technical but approachable',               // Tone
  ].join('\n') + '\n';

  const start = performance.now();
  const result = await runCommand('npx', ['tsx', 'cli/bin/karis.js', 'brand', 'init'], input);
  const duration = performance.now() - start;

  const hasSuccess = result.stdout.includes('Brand profile created') || result.stdout.includes('already exists');
  const status = (result.exitCode === 0 || hasSuccess) ? 'PASS' : 'FAIL';

  results.push({
    name: testName,
    status,
    duration,
    details: {
      exitCode: result.exitCode,
      hasSuccess,
      output: result.stdout.substring(0, 500),
      error: result.stderr.substring(0, 200),
    },
  });

  log(`${testName}: ${status} (${duration.toFixed(0)}ms)`, status === 'PASS' ? 'success' : 'error');
  return result;
}

async function testBrandShowAfterInit() {
  const testName = 'Brand Show (After Init)';
  log(`Running: ${testName}`, 'info');

  const start = performance.now();
  const result = await runCommand('npx', ['tsx', 'cli/bin/karis.js', 'brand', 'show']);
  const duration = performance.now() - start;

  const hasBrandInfo = result.stdout.includes('Karis') || result.stdout.includes('karis.im');
  const hasCategory = result.stdout.includes('Category') || result.stdout.includes('AI marketing');
  const hasCompetitors = result.stdout.includes('Competitors') || result.stdout.includes('Perplexity');

  const status = result.exitCode === 0 && hasBrandInfo ? 'PASS' : 'FAIL';

  results.push({
    name: testName,
    status,
    duration,
    details: {
      exitCode: result.exitCode,
      hasBrandInfo,
      hasCategory,
      hasCompetitors,
      output: result.stdout,
    },
  });

  log(`${testName}: ${status} (${duration.toFixed(0)}ms)`, status === 'PASS' ? 'success' : 'error');
  return result;
}

async function testBrandCompetitorList() {
  const testName = 'Brand Competitor List';
  log(`Running: ${testName}`, 'info');

  const start = performance.now();
  const result = await runCommand('npx', ['tsx', 'cli/bin/karis.js', 'brand', 'competitor', 'list']);
  const duration = performance.now() - start;

  const hasCompetitors = result.stdout.includes('Perplexity') || result.stdout.includes('ChatGPT') || result.stdout.includes('Competitors');
  const status = result.exitCode === 0 && hasCompetitors ? 'PASS' : 'FAIL';

  results.push({
    name: testName,
    status,
    duration,
    details: {
      exitCode: result.exitCode,
      hasCompetitors,
      output: result.stdout.substring(0, 300),
    },
  });

  log(`${testName}: ${status} (${duration.toFixed(0)}ms)`, status === 'PASS' ? 'success' : 'error');
  return result;
}

async function testBrandEdit() {
  const testName = 'Brand Edit (Keywords)';
  log(`Running: ${testName}`, 'info');

  const input = 'GEO, AI search, marketing intelligence, brand visibility\n';

  const start = performance.now();
  const result = await runCommand('npx', ['tsx', 'cli/bin/karis.js', 'brand', 'edit', 'keywords'], input);
  const duration = performance.now() - start;

  const hasSuccess = result.stdout.includes('updated') || result.stdout.includes('saved') || result.exitCode === 0;
  const status = hasSuccess ? 'PASS' : 'FAIL';

  results.push({
    name: testName,
    status,
    duration,
    details: {
      exitCode: result.exitCode,
      hasSuccess,
      output: result.stdout.substring(0, 200),
    },
  });

  log(`${testName}: ${status} (${duration.toFixed(0)}ms)`, status === 'PASS' ? 'success' : 'error');
  return result;
}

function generateReport() {
  log('\n=== BRAND COMMAND TEST SUMMARY ===\n', 'info');

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const total = results.length;

  results.forEach((result) => {
    const icon = result.status === 'PASS' ? '✓' : '✗';
    const color = result.status === 'PASS' ? '\x1b[32m' : '\x1b[31m';
    console.log(`  ${color}${icon}\x1b[0m ${result.name} (${result.duration.toFixed(0)}ms)`);
    if (result.details) {
      console.log(`    ${JSON.stringify(result.details, null, 2).split('\n').join('\n    ')}`);
    }
  });

  log(`\n=== OVERALL: ${passed}/${total} PASSED ===\n`, failed === 0 ? 'success' : 'error');

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total,
      passed,
      failed,
      passRate: `${((passed / total) * 100).toFixed(1)}%`,
    },
    results,
  };

  const fs = require('fs');
  fs.writeFileSync('brand-test-results.json', JSON.stringify(report, null, 2));
  log('Results saved to brand-test-results.json', 'success');
}

async function main() {
  log('=== KARIS CLI - BRAND COMMAND TESTING ===\n', 'info');
  log('Testing brand profile management for karis.im\n', 'info');

  try {
    // Test 1: Show before init
    await testBrandShow();
    console.log();

    // Test 2: Initialize brand
    await testBrandInit();
    console.log();

    // Test 3: Show after init
    const showResult = await testBrandShowAfterInit();
    console.log();
    console.log('Brand Profile Output:');
    console.log('─'.repeat(60));
    console.log(showResult.stdout);
    console.log('─'.repeat(60));
    console.log();

    // Test 4: List competitors
    await testBrandCompetitorList();
    console.log();

    // Test 5: Edit keywords
    await testBrandEdit();
    console.log();

    generateReport();
  } catch (error) {
    log(`Test suite failed: ${error}`, 'error');
    process.exit(1);
  }
}

main();
