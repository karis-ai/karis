# 🎯 Karis CLI Testing - Quick Reference Card

## 🚀 Run Tests

```bash
# Quick benchmark (~2 min)
./benchmark.sh

# Accuracy tests (~5 min)
npx tsx test-accuracy.ts

# Full test suite (~10 min)
./run-tests.sh
```

## 📊 Current Performance

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| CLI Startup | < 5s | 1.4s | ✅ |
| Config Read | < 3s | 1.4s | ✅ |
| GEO Audit | < 120s | 75s | ✅ |
| Memory | < 500MB | 150MB | ✅ |

**Overall Grade: A**

## 📁 Test Files

### Scripts
- `test-suite.ts` - Comprehensive (14 tests)
- `test-accuracy.ts` - Accuracy validation
- `benchmark.sh` - Quick performance check
- `run-tests.sh` - Master runner

### Docs
- `TESTING_README.md` - Quick reference
- `TESTING_GUIDE.md` - Complete guide
- `PERFORMANCE_REPORT.md` - Performance results
- `测试完成报告.md` - Chinese summary

## 🎯 Test Coverage

✅ Performance (5 tests)
✅ Accuracy (multi-domain)
✅ API Integration (3 tests)
✅ Error Handling (3 tests)
✅ Resources (1 test)

## 📈 Results

```json
{
  "summary": {
    "total": 14,
    "passed": 14,
    "passRate": "100%"
  }
}
```

## 🔧 Setup

```bash
# Install
npm install
cd cli && npm run build && cd ..

# Configure
npx tsx cli/bin/karis.js config set api-key "sk-ka-v1-..."
npx tsx cli/bin/karis.js config set base-url "https://api-staging.sophiapro.ai"
```

## 🐛 Troubleshooting

```bash
# Verify config
npx tsx cli/bin/karis.js config list

# Check API
curl -H "Authorization: Bearer sk-ka-v1-..." \
  https://api-staging.sophiapro.ai/api/api-keys/me

# Increase memory
NODE_OPTIONS=--max-old-space-size=4096 ./run-tests.sh
```

## ✅ Status

**Last Run:** 2026-03-05
**Status:** ✅ Production Ready
**Grade:** A
**Pass Rate:** 100%

---

**All tests passing. Ready for production.**
