# Karis CLI - Testing Guide

**Last Updated:** 2026-03-05
**Version:** 0.1.0

---

## Overview

This guide covers all testing approaches for the Karis CLI, including performance testing, accuracy validation, and API integration testing.

---

## Quick Start

### Run All Tests (Comprehensive)
```bash
./run-tests.sh
```
**Duration:** ~10 minutes
**Output:** `test-results.json`

### Run Quick Benchmark
```bash
./benchmark.sh
```
**Duration:** ~2 minutes
**Output:** Console summary

### Run Accuracy Tests
```bash
npx tsx test-accuracy.ts
```
**Duration:** ~5 minutes
**Output:** `accuracy-test-results.json`

---

## Test Suites

### 1. Comprehensive Test Suite (`test-suite.ts`)

Full end-to-end testing covering all aspects of the CLI.

**Test Categories:**

#### Performance Tests
- CLI Startup Time (< 5s)
- Config Read Performance (< 3s)
- Help Command Performance (< 3s)
- GEO Audit Performance (< 120s)

#### Accuracy Tests
- GEO Audit Output Structure
- Config Validation
- Help Documentation Completeness

#### API Integration Tests
- API Authentication
- API Response Streaming
- Error Handling - Invalid Domain

#### Error Handling Tests
- Missing API Key Error
- Invalid Command Error
- Missing Required Argument Error

#### Resource Usage Tests
- Memory Usage During GEO Audit (< 500MB)

**Run:**
```bash
npx tsx test-suite.ts
```

**Output:**
```json
{
  "timestamp": "2026-03-05T10:00:00.000Z",
  "summary": {
    "total": 15,
    "passed": 14,
    "failed": 1,
    "passRate": "93.3%"
  },
  "results": [...]
}
```

---

### 2. Accuracy Test Suite (`test-accuracy.ts`)

Validates the quality and consistency of GEO audit reports across multiple domains.

**Test Domains:**
- karis.im
- anthropic.com
- openai.com

**Metrics Measured:**
- Has Score (X/100)
- Has Dimensions (5 dimensions)
- Has Recommendations
- Has Tool Execution
- Output Length
- Structure Score (0-100)

**Run:**
```bash
npx tsx test-accuracy.ts
```

**Output:**
```
Domain: karis.im
Response Time: 66.2s
Output Length: 2529 characters

Content Analysis:
  ✓ Has Score: ✓ (49/100)
  ✓ Has Dimensions: ✓ (5/5)
  ✓ Has Recommendations: ✓ (12 found)
  ✓ Has Tool Execution: ✓ (8 tools)

Structure Score: 100/100
Grade: A
```

---

### 3. Quick Benchmark (`benchmark.sh`)

Fast performance check for key operations.

**Tests:**
- CLI Startup
- Config Read
- Help Command
- Brand Show
- GEO Audit (full)

**Run:**
```bash
./benchmark.sh
```

**Output:**
```
Testing: CLI Startup (--version) ... 1234ms
Testing: Config Read ... 987ms
Testing: Help Command ... 1123ms
Testing: Brand Show ... 2456ms

GEO Audit completed in 66s

GEO Audit Analysis:
  Duration: 66s
  Output Size: 2529 bytes
  Tool Executions: 8
  Has Score: ✓
```

---

## Performance Benchmarks

### Expected Performance

| Operation | Target | Acceptable | Needs Work |
|-----------|--------|------------|------------|
| CLI Startup | < 2s | < 5s | > 5s |
| Config Read | < 1s | < 3s | > 3s |
| Help Command | < 1s | < 3s | > 3s |
| GEO Audit | < 60s | < 120s | > 120s |
| Memory Usage | < 200MB | < 500MB | > 500MB |

### Current Performance (as of 2026-03-05)

| Operation | Actual | Status |
|-----------|--------|--------|
| CLI Startup | ~1.2s | ✓ Good |
| Config Read | ~1.0s | ✓ Good |
| Help Command | ~1.4s | ✓ Good |
| GEO Audit | ~66s | ✓ Good |
| Memory Usage | ~150MB | ✓ Good |

---

## Accuracy Benchmarks

### GEO Audit Quality Metrics

**Structure Score Components:**
- Has Score (25 points)
- Has Dimensions (25 points)
- Has Recommendations (25 points)
- Has Tool Execution (15 points)
- Output Length > 1000 chars (10 points)

**Grading:**
- A: 90-100 points
- B: 80-89 points
- C: 70-79 points
- D: 60-69 points
- F: < 60 points

**Current Grade:** A (100/100)

---

## Test Environment Setup

### Prerequisites
```bash
# Install dependencies
npm install

# Build CLI
cd cli && npm run build && cd ..

# Install tsx globally (if not already)
npm install -g tsx
```

### Configuration
```bash
# Set API key
npx tsx cli/bin/karis.js config set api-key "sk-ka-v1-..."

# Set base URL (for staging)
npx tsx cli/bin/karis.js config set base-url "https://api-staging.sophiapro.ai"
```

---

## Continuous Integration

### GitHub Actions Workflow (Recommended)

```yaml
name: Test Karis CLI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: cd cli && npm run build
      - run: npx tsx test-suite.ts
        env:
          KARIS_API_KEY: ${{ secrets.KARIS_API_KEY }}
          KARIS_API_URL: ${{ secrets.KARIS_API_URL }}
      - uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results.json
```

---

## Troubleshooting

### Tests Timing Out

**Issue:** GEO audit tests timeout after 120s

**Solutions:**
1. Increase timeout in test scripts
2. Check API connectivity
3. Verify API key is valid

### Memory Issues

**Issue:** Tests fail with out-of-memory errors

**Solutions:**
1. Increase Node.js memory limit: `NODE_OPTIONS=--max-old-space-size=4096`
2. Run tests sequentially instead of parallel
3. Clear cache between tests

### API Authentication Errors

**Issue:** Tests fail with 401 Unauthorized

**Solutions:**
1. Verify API key is set: `npx tsx cli/bin/karis.js config list`
2. Check API key is valid on platform
3. Ensure base-url is correct for environment

---

## Test Data

### Test Domains
- **karis.im** - Primary test domain (our own site)
- **anthropic.com** - Large, well-structured site
- **openai.com** - Large, well-structured site

### Test Topics
- "AI marketing intelligence"
- "project management"
- "developer tools"

---

## Interpreting Results

### test-results.json

```json
{
  "timestamp": "2026-03-05T10:00:00.000Z",
  "summary": {
    "total": 15,
    "passed": 14,
    "failed": 1,
    "passRate": "93.3%"
  },
  "results": [
    {
      "name": "CLI Startup Time",
      "category": "Performance",
      "status": "PASS",
      "duration": 1234,
      "details": {
        "threshold": "5000ms",
        "actual": "1234ms"
      }
    }
  ]
}
```

**Key Metrics:**
- `passRate`: Overall success rate (target: > 90%)
- `duration`: Time in milliseconds
- `status`: PASS/FAIL/SKIP

### accuracy-test-results.json

```json
{
  "timestamp": "2026-03-05T10:00:00.000Z",
  "summary": {
    "testsRun": 3,
    "avgResponseTime": 66.2,
    "avgStructureScore": 95.0,
    "overallGrade": "A"
  },
  "metrics": [...]
}
```

**Key Metrics:**
- `avgResponseTime`: Average audit duration in seconds
- `avgStructureScore`: Average quality score (0-100)
- `overallGrade`: A/B/C/D/F

---

## Best Practices

### Before Running Tests

1. **Clean environment:**
   ```bash
   rm -rf ~/.karis
   ```

2. **Fresh build:**
   ```bash
   cd cli && npm run build && cd ..
   ```

3. **Verify configuration:**
   ```bash
   npx tsx cli/bin/karis.js config list
   ```

### During Testing

1. **Monitor resource usage:**
   ```bash
   # In another terminal
   watch -n 1 'ps aux | grep karis'
   ```

2. **Check logs:**
   ```bash
   tail -f ~/.karis/logs/*.log
   ```

### After Testing

1. **Review results:**
   ```bash
   cat test-results.json | jq '.summary'
   ```

2. **Archive results:**
   ```bash
   mkdir -p test-archives
   cp test-results.json test-archives/results-$(date +%Y%m%d-%H%M%S).json
   ```

---

## Contributing

When adding new tests:

1. Add test to appropriate suite (`test-suite.ts` or `test-accuracy.ts`)
2. Update this documentation
3. Ensure test is idempotent (can run multiple times)
4. Add appropriate timeouts
5. Include clear success/failure criteria

---

## Support

For issues with testing:
- Check existing test results in `TESTING_REPORT.md`
- Review performance data in `PERFORMANCE_REPORT.md`
- Open issue on GitHub: https://github.com/karis-ai/karis/issues
