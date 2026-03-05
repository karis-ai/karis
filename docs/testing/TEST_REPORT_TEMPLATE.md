# Karis CLI - Test Execution Report

**Date:** [AUTO-GENERATED]
**Version:** 0.1.0
**Environment:** Staging
**Tester:** Automated Test Suite

---

## Executive Summary

This report documents the results of comprehensive performance and accuracy testing of the Karis CLI.

**Overall Status:** [PASS/FAIL]
- Total Tests: [X]
- Passed: [X]
- Failed: [X]
- Pass Rate: [X%]

---

## Test Environment

```
API URL: https://api-staging.sophiapro.ai
API Key: sk-ka-v1-L7lVlH0BmEwYUM-_BgSCl3oPbw6Nv0mm
Node Version: [AUTO]
Platform: [AUTO]
Test Duration: [AUTO]
```

---

## Performance Test Results

### 1. CLI Operations Performance

| Operation | Target | Actual | Status |
|-----------|--------|--------|--------|
| CLI Startup | < 5s | [X]ms | [PASS/FAIL] |
| Config Read | < 3s | [X]ms | [PASS/FAIL] |
| Help Command | < 3s | [X]ms | [PASS/FAIL] |
| Brand Show | < 5s | [X]ms | [PASS/FAIL] |

### 2. API Operations Performance

| Operation | Target | Actual | Status |
|-----------|--------|--------|--------|
| GEO Audit | < 120s | [X]s | [PASS/FAIL] |
| Content Discover | < 120s | [X]s | [PASS/FAIL] |
| Competitor Analyze | < 120s | [X]s | [PASS/FAIL] |

### 3. Resource Usage

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Peak Memory | < 500MB | [X]MB | [PASS/FAIL] |
| CPU Usage | < 80% | [X]% | [PASS/FAIL] |

---

## Accuracy Test Results

### 1. GEO Audit Quality

**Test Domains:** karis.im, anthropic.com, openai.com

| Domain | Score | Dimensions | Recommendations | Tools | Grade |
|--------|-------|------------|-----------------|-------|-------|
| karis.im | [X]/100 | [X]/5 | [X] | [X] | [A-F] |
| anthropic.com | [X]/100 | [X]/5 | [X] | [X] | [A-F] |
| openai.com | [X]/100 | [X]/5 | [X] | [X] | [A-F] |

**Average Structure Score:** [X]/100
**Overall Grade:** [A-F]

### 2. Output Consistency

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| All have scores | 100% | [X]% | [PASS/FAIL] |
| All have dimensions | 100% | [X]% | [PASS/FAIL] |
| All have recommendations | 100% | [X]% | [PASS/FAIL] |
| All have tool execution | 100% | [X]% | [PASS/FAIL] |

---

## API Integration Test Results

### 1. Authentication

| Test | Status | Details |
|------|--------|---------|
| Valid API Key | [PASS/FAIL] | [Details] |
| Invalid API Key | [PASS/FAIL] | [Details] |
| Missing API Key | [PASS/FAIL] | [Details] |

### 2. Streaming

| Test | Status | Details |
|------|--------|---------|
| SSE Connection | [PASS/FAIL] | [Details] |
| Tool Execution Streaming | [PASS/FAIL] | [Details] |
| Content Streaming | [PASS/FAIL] | [Details] |

### 3. Error Handling

| Test | Status | Details |
|------|--------|---------|
| Invalid Domain | [PASS/FAIL] | [Details] |
| Network Timeout | [PASS/FAIL] | [Details] |
| API Error Response | [PASS/FAIL] | [Details] |

---

## Error Handling Test Results

| Test | Expected Behavior | Actual Behavior | Status |
|------|-------------------|-----------------|--------|
| Missing API Key | Show error message | [Actual] | [PASS/FAIL] |
| Invalid Command | Show error + help | [Actual] | [PASS/FAIL] |
| Missing Argument | Show error + usage | [Actual] | [PASS/FAIL] |

---

## Detailed Test Logs

### Performance Tests

```
[Test logs will be inserted here]
```

### Accuracy Tests

```
[Test logs will be inserted here]
```

### API Integration Tests

```
[Test logs will be inserted here]
```

---

## Issues Identified

### Critical Issues
[None / List issues]

### Major Issues
[None / List issues]

### Minor Issues
[None / List issues]

---

## Recommendations

### High Priority
1. [Recommendation]

### Medium Priority
1. [Recommendation]

### Low Priority
1. [Recommendation]

---

## Performance Trends

### Compared to Previous Test (if available)

| Metric | Previous | Current | Change |
|--------|----------|---------|--------|
| CLI Startup | [X]ms | [X]ms | [+/-X%] |
| GEO Audit | [X]s | [X]s | [+/-X%] |
| Memory Usage | [X]MB | [X]MB | [+/-X%] |

---

## Conclusion

[Summary of test results and overall assessment]

**Status:** [PRODUCTION READY / NEEDS WORK / BLOCKED]

**Next Steps:**
1. [Action item]
2. [Action item]

---

## Appendix

### Raw Test Data

See attached files:
- `test-results.json` - Comprehensive test results
- `accuracy-test-results.json` - Accuracy test results
- `benchmark-output.txt` - Quick benchmark output

### Test Commands

```bash
# Run all tests
./run-tests.sh

# Run quick benchmark
./benchmark.sh

# Run accuracy tests
npx tsx test-accuracy.ts
```

### Environment Details

```
[System information]
```
