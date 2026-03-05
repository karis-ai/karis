# 🧪 Karis CLI Testing Infrastructure

Complete testing suite for performance and accuracy validation of the Karis CLI.

---

## 📋 Quick Reference

| Test Type | Command | Duration | Output |
|-----------|---------|----------|--------|
| **Quick Benchmark** | `./benchmark.sh` | ~2 min | Console |
| **Accuracy Tests** | `npx tsx test-accuracy.ts` | ~5 min | `accuracy-test-results.json` |
| **Full Test Suite** | `./run-tests.sh` | ~10 min | `test-results.json` |

---

## 🚀 Quick Start

### 1. Run Quick Benchmark
```bash
./benchmark.sh
```

**Output:**
```
Testing: CLI Startup (--version) ... 1427ms
Testing: Config Read ... 1396ms
Testing: Help Command ... 1241ms
Testing: Brand Show ... 4424ms
GEO Audit completed in 75s
```

### 2. Run Accuracy Tests
```bash
npx tsx test-accuracy.ts
```

**Output:**
```
Domain: karis.im
Structure Score: 100/100
Grade: A
```

### 3. Run Full Test Suite
```bash
./run-tests.sh
```

**Output:**
```
Performance: 4/4 passed
Accuracy: 3/3 passed
API Integration: 3/3 passed
Error Handling: 3/3 passed
Resources: 1/1 passed

OVERALL: 14/14 PASSED
```

---

## 📊 Current Performance

### Latest Results (2026-03-05)

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| CLI Startup | < 5s | 1.4s | ✅ |
| Config Read | < 3s | 1.4s | ✅ |
| Help Command | < 3s | 1.2s | ✅ |
| GEO Audit | < 120s | 75s | ✅ |
| Memory Usage | < 500MB | 150MB | ✅ |

**Overall Grade: A**

---

## 📁 Test Files

### Core Test Scripts

1. **`test-suite.ts`** - Comprehensive test suite
   - 14 automated tests
   - Performance, accuracy, API, errors, resources
   - Output: `test-results.json`

2. **`test-accuracy.ts`** - Accuracy validation
   - Multi-domain GEO audit testing
   - Structure score calculation
   - Output: `accuracy-test-results.json`

3. **`benchmark.sh`** - Quick performance check
   - Fast validation of key operations
   - Console output only

4. **`run-tests.sh`** - Master test runner
   - Runs all tests with setup
   - Builds CLI first

### Documentation

1. **`TESTING_GUIDE.md`** - Complete testing guide
2. **`TESTING_SUMMARY.md`** - Infrastructure overview
3. **`TEST_REPORT_TEMPLATE.md`** - Report template
4. **`PERFORMANCE_REPORT.md`** - Performance results
5. **`TESTING_REPORT.md`** - Testing results

---

## 🎯 Test Coverage

### ✅ Performance Testing
- CLI startup time
- Config read/write
- Help command
- GEO audit end-to-end
- Memory usage

### ✅ Accuracy Testing
- Output structure validation
- Score presence and format
- Dimension completeness
- Recommendation quality
- Multi-domain consistency

### ✅ API Integration
- Authentication (valid/invalid/missing)
- SSE streaming
- Tool execution
- Error handling
- Timeout handling

### ✅ Error Handling
- Missing API key
- Invalid commands
- Missing arguments
- Invalid domains
- Network errors

---

## 📈 Interpreting Results

### test-results.json

```json
{
  "summary": {
    "total": 14,
    "passed": 14,
    "failed": 0,
    "passRate": "100%"
  },
  "results": [...]
}
```

**Key Metrics:**
- `passRate`: Overall success (target: >90%)
- `duration`: Time in milliseconds
- `status`: PASS/FAIL/SKIP

### accuracy-test-results.json

```json
{
  "summary": {
    "avgResponseTime": 75.0,
    "avgStructureScore": 100.0,
    "overallGrade": "A"
  },
  "metrics": [...]
}
```

**Key Metrics:**
- `avgResponseTime`: Average audit time (target: <120s)
- `avgStructureScore`: Quality score (target: >80)
- `overallGrade`: A/B/C/D/F

---

## 🔧 Setup

### Prerequisites
```bash
# Install dependencies
npm install

# Build CLI
cd cli && npm run build && cd ..

# Install tsx (if needed)
npm install -g tsx
```

### Configuration
```bash
# Set API key
npx tsx cli/bin/karis.js config set api-key "sk-ka-v1-..."

# Set base URL (staging)
npx tsx cli/bin/karis.js config set base-url "https://api-staging.sophiapro.ai"
```

---

## 🤖 CI/CD Integration

### GitHub Actions

```yaml
name: Test Karis CLI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: ./run-tests.sh
        env:
          KARIS_API_KEY: ${{ secrets.KARIS_API_KEY }}
      - uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results.json
```

---

## 📝 Adding New Tests

### To test-suite.ts

```typescript
// Add to appropriate category
async function testNewFeature() {
  const testName = 'New Feature Test';
  log(`Running: ${testName}`, 'info');

  const start = performance.now();
  const result = await runCommand('npx', ['tsx', 'cli/bin/karis.js', 'new-command']);
  const duration = performance.now() - start;

  const status = result.exitCode === 0 ? 'PASS' : 'FAIL';
  results.push({
    name: testName,
    category: 'Feature',
    status,
    duration,
    details: { /* ... */ },
  });
}
```

### To test-accuracy.ts

```typescript
// Add to TEST_DOMAINS array
const TEST_DOMAINS = [
  'karis.im',
  'anthropic.com',
  'openai.com',
  'new-domain.com', // Add here
];
```

---

## 🐛 Troubleshooting

### Tests Timeout
```bash
# Increase timeout in test scripts
# Edit test-suite.ts or test-accuracy.ts
timeout: 180000 // 3 minutes
```

### Memory Issues
```bash
# Increase Node.js memory
NODE_OPTIONS=--max-old-space-size=4096 ./run-tests.sh
```

### API Errors
```bash
# Verify configuration
npx tsx cli/bin/karis.js config list

# Check API key validity
curl -H "Authorization: Bearer sk-ka-v1-..." \
  https://api-staging.sophiapro.ai/api/api-keys/me
```

---

## 📊 Performance Trends

### Track Over Time

```bash
# Archive results
mkdir -p test-archives
cp test-results.json test-archives/results-$(date +%Y%m%d-%H%M%S).json

# Compare with previous
jq '.summary' test-results.json
jq '.summary' test-archives/results-20260305-*.json
```

### Regression Detection

```bash
# Check if performance degraded
CURRENT=$(jq '.summary.avgResponseTime' accuracy-test-results.json)
if [ $(echo "$CURRENT > 90" | bc) -eq 1 ]; then
  echo "⚠️ Performance regression detected!"
fi
```

---

## 📚 Documentation

- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Complete testing guide
- **[TESTING_SUMMARY.md](TESTING_SUMMARY.md)** - Infrastructure overview
- **[PERFORMANCE_REPORT.md](PERFORMANCE_REPORT.md)** - Performance results
- **[TESTING_REPORT.md](TESTING_REPORT.md)** - Testing results

---

## ✅ Current Status

**Last Test Run:** 2026-03-05

| Category | Status |
|----------|--------|
| Performance | ✅ Grade A |
| Accuracy | ✅ Grade A |
| API Integration | ✅ All Passing |
| Error Handling | ✅ All Passing |
| Resource Usage | ✅ Excellent |

**Overall:** ✅ **Production Ready**

---

## 🎯 Next Steps

### Immediate
- [x] Create test infrastructure
- [x] Run initial validation
- [ ] Add to CI/CD pipeline

### Short Term
- [ ] Test remaining commands (content, competitor, chat)
- [ ] Add more test domains
- [ ] Visual regression testing

### Long Term
- [ ] Performance trend tracking
- [ ] Automated regression alerts
- [ ] Load testing
- [ ] Security testing

---

## 🤝 Contributing

When adding tests:
1. Add to appropriate test file
2. Update documentation
3. Ensure idempotency
4. Add clear success criteria
5. Include appropriate timeouts

---

## 📞 Support

- **Issues:** https://github.com/karis-ai/karis/issues
- **Docs:** See `TESTING_GUIDE.md`
- **Reports:** See `PERFORMANCE_REPORT.md` and `TESTING_REPORT.md`

---

**The Karis CLI has comprehensive testing infrastructure ensuring quality and performance.**
