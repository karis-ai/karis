#!/usr/bin/env tsx
/**
 * Comprehensive Performance & Accuracy Testing Suite for Karis CLI
 * Tests: Performance, Accuracy, API Integration, Error Handling
 */

import { spawn } from 'child_process';
import { performance } from 'perf_hooks';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const CONFIG = {
  apiKey: 'sk-ka-v1-L7lVlH0BmEwYUM-_BgSCl3oPbw6Nv0mm',
  baseUrl: 'https://api-staging.sophiapro.ai',
  testDomain: 'karis.im',
  testTopic: 'AI marketing intelligence',
  testUrl: 'https://karis.im',
};

// Test Results Storage
interface TestResult {
  name: string;
  category: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  details?: any;
  error?: string;
}

const results: TestResult[] = [];

// Utility Functions
function log(message: string, level: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warn: '\x1b[33m',    // Yellow
  };
  const reset = '\x1b[0m';
  const prefix = {
    info: 'ℹ',
    success: '✓',
    error: '✗',
    warn: '⚠',
  };
  console.log(`${colors[level]}${prefix[level]} ${message}${reset}`);
}

async function runCommand(command: string, args: string[], timeout = 120000): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}> {
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

    const timer = setTimeout(() => {
      proc.kill();
      resolve({
        stdout,
        stderr: stderr + '\nTIMEOUT',
        exitCode: -1,
        duration: performance.now() - start,
      });
    }, timeout);

    proc.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr,
        exitCode: code || 0,
        duration: performance.now() - start,
      });
    });
  });
}

async function setupConfig() {
  log('Setting up test configuration...', 'info');

  await runCommand('npx', ['tsx', 'cli/bin/karis.js', 'config', 'set', 'api-key', CONFIG.apiKey]);
  await runCommand('npx', ['tsx', 'cli/bin/karis.js', 'config', 'set', 'base-url', CONFIG.baseUrl]);

  log('Configuration complete', 'success');
}

// Test Categories

// 1. Performance Tests
async function testPerformance() {
  log('\n=== PERFORMANCE TESTS ===\n', 'info');

  // Test 1.1: CLI Startup Time
  {
    const testName = 'CLI Startup Time';
    log(`Running: ${testName}`, 'info');
    const start = performance.now();
    const result = await runCommand('npx', ['tsx', 'cli/bin/karis.js', '--version']);
    const duration = performance.now() - start;

    const status = result.exitCode === 0 && duration < 5000 ? 'PASS' : 'FAIL';
    results.push({
      name: testName,
      category: 'Performance',
      status,
      duration,
      details: { threshold: '5000ms', actual: `${duration.toFixed(0)}ms` },
    });
    log(`${testName}: ${status} (${duration.toFixed(0)}ms)`, status === 'PASS' ? 'success' : 'error');
  }

  // Test 1.2: Config Read Performance
  {
    const testName = 'Config Read Performance';
    log(`Running: ${testName}`, 'info');
    const start = performance.now();
    const result = await runCommand('npx', ['tsx', 'cli/bin/karis.js', 'config', 'list']);
    const duration = performance.now() - start;

    const status = result.exitCode === 0 && duration < 3000 ? 'PASS' : 'FAIL';
    results.push({
      name: testName,
      category: 'Performance',
      status,
      duration,
      details: { threshold: '3000ms', actual: `${duration.toFixed(0)}ms` },
    });
    log(`${testName}: ${status} (${duration.toFixed(0)}ms)`, status === 'PASS' ? 'success' : 'error');
  }

  // Test 1.3: Help Command Performance
  {
    const testName = 'Help Command Performance';
    log(`Running: ${testName}`, 'info');
    const start = performance.now();
    const result = await runCommand('npx', ['tsx', 'cli/bin/karis.js', '--help']);
    const duration = performance.now() - start;

    const status = result.exitCode === 0 && duration < 3000 ? 'PASS' : 'FAIL';
    results.push({
      name: testName,
      category: 'Performance',
      status,
      duration,
      details: { threshold: '3000ms', actual: `${duration.toFixed(0)}ms` },
    });
    log(`${testName}: ${status} (${duration.toFixed(0)}ms)`, status === 'PASS' ? 'success' : 'error');
  }

  // Test 1.4: GEO Audit Performance
  {
    const testName = 'GEO Audit Performance';
    log(`Running: ${testName} (this may take 60-90 seconds)`, 'info');
    const start = performance.now();
    const result = await runCommand('npx', ['tsx', 'cli/bin/karis.js', 'geo', 'audit', CONFIG.testDomain], 120000);
    const duration = performance.now() - start;

    const status = result.exitCode === 0 && duration < 120000 ? 'PASS' : 'FAIL';
    results.push({
      name: testName,
      category: 'Performance',
      status,
      duration,
      details: {
        threshold: '120000ms',
        actual: `${duration.toFixed(0)}ms`,
        outputLength: result.stdout.length,
      },
    });
    log(`${testName}: ${status} (${(duration / 1000).toFixed(1)}s)`, status === 'PASS' ? 'success' : 'error');
  }
}

// 2. Accuracy Tests
async function testAccuracy() {
  log('\n=== ACCURACY TESTS ===\n', 'info');

  // Test 2.1: GEO Audit Output Structure
  {
    const testName = 'GEO Audit Output Structure';
    log(`Running: ${testName}`, 'info');
    const start = performance.now();
    const result = await runCommand('npx', ['tsx', 'cli/bin/karis.js', 'geo', 'audit', CONFIG.testDomain], 120000);
    const duration = performance.now() - start;

    const output = result.stdout;
    const hasTitle = output.includes('GEO Audit Report') || output.includes('🔍');
    const hasScore = /\d+\s*\/\s*100/.test(output);
    const hasDimensions = output.includes('Dimension') || output.includes('AI Crawler');
    const hasRecommendations = output.includes('Priority') || output.includes('Issue');

    const status = result.exitCode === 0 && hasTitle && hasScore && hasDimensions ? 'PASS' : 'FAIL';
    results.push({
      name: testName,
      category: 'Accuracy',
      status,
      duration,
      details: {
        hasTitle,
        hasScore,
        hasDimensions,
        hasRecommendations,
        outputLength: output.length,
      },
    });
    log(`${testName}: ${status}`, status === 'PASS' ? 'success' : 'error');
  }

  // Test 2.2: Config Validation
  {
    const testName = 'Config Validation';
    log(`Running: ${testName}`, 'info');
    const start = performance.now();
    const result = await runCommand('npx', ['tsx', 'cli/bin/karis.js', 'config', 'list']);
    const duration = performance.now() - start;

    const hasApiKey = result.stdout.includes('api-key');
    const hasBaseUrl = result.stdout.includes('base-url');
    const keyMasked = result.stdout.includes('sk-ka...') || result.stdout.includes('***');

    const status = result.exitCode === 0 && hasApiKey && hasBaseUrl ? 'PASS' : 'FAIL';
    results.push({
      name: testName,
      category: 'Accuracy',
      status,
      duration,
      details: { hasApiKey, hasBaseUrl, keyMasked },
    });
    log(`${testName}: ${status}`, status === 'PASS' ? 'success' : 'error');
  }

  // Test 2.3: Help Documentation Completeness
  {
    const testName = 'Help Documentation Completeness';
    log(`Running: ${testName}`, 'info');
    const start = performance.now();
    const result = await runCommand('npx', ['tsx', 'cli/bin/karis.js', '--help']);
    const duration = performance.now() - start;

    const output = result.stdout;
    const hasGeo = output.includes('geo');
    const hasContent = output.includes('content');
    const hasCompetitor = output.includes('competitor');
    const hasChat = output.includes('chat');
    const hasBrand = output.includes('brand');
    const hasConfig = output.includes('config');

    const status = result.exitCode === 0 && hasGeo && hasContent && hasCompetitor ? 'PASS' : 'FAIL';
    results.push({
      name: testName,
      category: 'Accuracy',
      status,
      duration,
      details: { hasGeo, hasContent, hasCompetitor, hasChat, hasBrand, hasConfig },
    });
    log(`${testName}: ${status}`, status === 'PASS' ? 'success' : 'error');
  }
}

// 3. API Integration Tests
async function testAPIIntegration() {
  log('\n=== API INTEGRATION TESTS ===\n', 'info');

  // Test 3.1: API Authentication
  {
    const testName = 'API Authentication';
    log(`Running: ${testName}`, 'info');
    const start = performance.now();
    const result = await runCommand('npx', ['tsx', 'cli/bin/karis.js', 'geo', 'audit', CONFIG.testDomain], 120000);
    const duration = performance.now() - start;

    const noAuthError = !result.stderr.includes('401') && !result.stderr.includes('Unauthorized');
    const hasOutput = result.stdout.length > 100;

    const status = result.exitCode === 0 && noAuthError && hasOutput ? 'PASS' : 'FAIL';
    results.push({
      name: testName,
      category: 'API Integration',
      status,
      duration,
      details: { noAuthError, hasOutput, exitCode: result.exitCode },
    });
    log(`${testName}: ${status}`, status === 'PASS' ? 'success' : 'error');
  }

  // Test 3.2: API Response Streaming
  {
    const testName = 'API Response Streaming';
    log(`Running: ${testName}`, 'info');
    const start = performance.now();
    const result = await runCommand('npx', ['tsx', 'cli/bin/karis.js', 'geo', 'audit', CONFIG.testDomain], 120000);
    const duration = performance.now() - start;

    const hasToolOutput = result.stdout.includes('[tool]') || result.stdout.includes('done');
    const hasContent = result.stdout.length > 500;

    const status = result.exitCode === 0 && hasToolOutput && hasContent ? 'PASS' : 'FAIL';
    results.push({
      name: testName,
      category: 'API Integration',
      status,
      duration,
      details: { hasToolOutput, hasContent, contentLength: result.stdout.length },
    });
    log(`${testName}: ${status}`, status === 'PASS' ? 'success' : 'error');
  }

  // Test 3.3: Error Handling - Invalid Domain
  {
    const testName = 'Error Handling - Invalid Domain';
    log(`Running: ${testName}`, 'info');
    const start = performance.now();
    const result = await runCommand('npx', ['tsx', 'cli/bin/karis.js', 'geo', 'audit', 'invalid-domain-xyz-123.com'], 120000);
    const duration = performance.now() - start;

    // Should either complete with a report or show a clear error
    const hasOutput = result.stdout.length > 0 || result.stderr.length > 0;

    const status = hasOutput ? 'PASS' : 'FAIL';
    results.push({
      name: testName,
      category: 'API Integration',
      status,
      duration,
      details: {
        exitCode: result.exitCode,
        hasStdout: result.stdout.length > 0,
        hasStderr: result.stderr.length > 0,
      },
    });
    log(`${testName}: ${status}`, status === 'PASS' ? 'success' : 'error');
  }
}

// 4. Error Handling Tests
async function testErrorHandling() {
  log('\n=== ERROR HANDLING TESTS ===\n', 'info');

  // Test 4.1: Missing API Key
  {
    const testName = 'Missing API Key Error';
    log(`Running: ${testName}`, 'info');

    // Backup current config
    const configPath = path.join(process.env.HOME || '', '.karis', 'config.json');
    let backup = '';
    if (fs.existsSync(configPath)) {
      backup = fs.readFileSync(configPath, 'utf-8');
    }

    // Remove API key
    await runCommand('npx', ['tsx', 'cli/bin/karis.js', 'config', 'set', 'api-key', '']);

    const start = performance.now();
    const result = await runCommand('npx', ['tsx', 'cli/bin/karis.js', 'geo', 'audit', CONFIG.testDomain], 30000);
    const duration = performance.now() - start;

    const hasError = result.stderr.includes('API key') || result.stderr.includes('api-key') || result.exitCode !== 0;

    // Restore config
    if (backup) {
      fs.writeFileSync(configPath, backup);
    } else {
      await setupConfig();
    }

    const status = hasError ? 'PASS' : 'FAIL';
    results.push({
      name: testName,
      category: 'Error Handling',
      status,
      duration,
      details: { hasError, exitCode: result.exitCode },
    });
    log(`${testName}: ${status}`, status === 'PASS' ? 'success' : 'error');
  }

  // Test 4.2: Invalid Command
  {
    const testName = 'Invalid Command Error';
    log(`Running: ${testName}`, 'info');
    const start = performance.now();
    const result = await runCommand('npx', ['tsx', 'cli/bin/karis.js', 'invalid-command']);
    const duration = performance.now() - start;

    const hasError = result.stderr.includes('unknown command') || result.exitCode !== 0;

    const status = hasError ? 'PASS' : 'FAIL';
    results.push({
      name: testName,
      category: 'Error Handling',
      status,
      duration,
      details: { hasError, exitCode: result.exitCode },
    });
    log(`${testName}: ${status}`, status === 'PASS' ? 'success' : 'error');
  }

  // Test 4.3: Missing Required Argument
  {
    const testName = 'Missing Required Argument Error';
    log(`Running: ${testName}`, 'info');
    const start = performance.now();
    const result = await runCommand('npx', ['tsx', 'cli/bin/karis.js', 'config', 'set']);
    const duration = performance.now() - start;

    const hasError = result.stderr.length > 0 || result.exitCode !== 0;

    const status = hasError ? 'PASS' : 'FAIL';
    results.push({
      name: testName,
      category: 'Error Handling',
      status,
      duration,
      details: { hasError, exitCode: result.exitCode },
    });
    log(`${testName}: ${status}`, status === 'PASS' ? 'success' : 'error');
  }
}

// 5. Memory & Resource Tests
async function testResources() {
  log('\n=== RESOURCE USAGE TESTS ===\n', 'info');

  // Test 5.1: Memory Usage During GEO Audit
  {
    const testName = 'Memory Usage During GEO Audit';
    log(`Running: ${testName}`, 'info');

    const start = performance.now();
    const memBefore = process.memoryUsage();

    await runCommand('npx', ['tsx', 'cli/bin/karis.js', 'geo', 'audit', CONFIG.testDomain], 120000);

    const memAfter = process.memoryUsage();
    const duration = performance.now() - start;

    const heapUsedMB = (memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024;
    const status = heapUsedMB < 500 ? 'PASS' : 'WARN' as any;

    results.push({
      name: testName,
      category: 'Resources',
      status,
      duration,
      details: {
        heapUsedMB: heapUsedMB.toFixed(2),
        threshold: '500MB',
      },
    });
    log(`${testName}: ${status} (${heapUsedMB.toFixed(2)}MB)`, status === 'PASS' ? 'success' : 'warn');
  }
}

// Generate Report
function generateReport() {
  log('\n=== TEST SUMMARY ===\n', 'info');

  const categories = [...new Set(results.map(r => r.category))];

  categories.forEach(category => {
    const categoryResults = results.filter(r => r.category === category);
    const passed = categoryResults.filter(r => r.status === 'PASS').length;
    const failed = categoryResults.filter(r => r.status === 'FAIL').length;
    const total = categoryResults.length;

    log(`\n${category}: ${passed}/${total} passed`, passed === total ? 'success' : 'warn');

    categoryResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✓' : result.status === 'FAIL' ? '✗' : '⚠';
      const color = result.status === 'PASS' ? '\x1b[32m' : result.status === 'FAIL' ? '\x1b[31m' : '\x1b[33m';
      console.log(`  ${color}${icon}\x1b[0m ${result.name} (${result.duration.toFixed(0)}ms)`);
      if (result.details) {
        console.log(`    ${JSON.stringify(result.details, null, 2).split('\n').join('\n    ')}`);
      }
    });
  });

  // Overall Summary
  const totalPassed = results.filter(r => r.status === 'PASS').length;
  const totalFailed = results.filter(r => r.status === 'FAIL').length;
  const totalTests = results.length;

  log(`\n=== OVERALL: ${totalPassed}/${totalTests} PASSED ===\n`, totalFailed === 0 ? 'success' : 'error');

  // Save to file
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: totalTests,
      passed: totalPassed,
      failed: totalFailed,
      passRate: `${((totalPassed / totalTests) * 100).toFixed(1)}%`,
    },
    results,
  };

  fs.writeFileSync('test-results.json', JSON.stringify(report, null, 2));
  log('Detailed results saved to test-results.json', 'success');
}

// Main Test Runner
async function main() {
  log('=== KARIS CLI COMPREHENSIVE TEST SUITE ===\n', 'info');
  log(`Test Domain: ${CONFIG.testDomain}`, 'info');
  log(`API URL: ${CONFIG.baseUrl}\n`, 'info');

  try {
    await setupConfig();

    await testPerformance();
    await testAccuracy();
    await testAPIIntegration();
    await testErrorHandling();
    await testResources();

    generateReport();
  } catch (error) {
    log(`Test suite failed: ${error}`, 'error');
    process.exit(1);
  }
}

main();
