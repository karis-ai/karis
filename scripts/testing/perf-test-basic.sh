#!/bin/bash

# Performance Testing Script for Karis CLI
# Measures response times, memory usage, and API performance

echo "=== Karis CLI Performance Testing ==="
echo "Started: $(date)"
echo ""

# Test 1: Config Setup Performance
echo "Test 1: Configuration Setup"
START=$(date +%s%N)
npx tsx cli/bin/karis.js config set api-key "sk-ka-v1-L7lVlH0BmEwYUM-_BgSCl3oPbw6Nv0mm" > /dev/null 2>&1
npx tsx cli/bin/karis.js config set base-url "https://api-staging.sophiapro.ai" > /dev/null 2>&1
END=$(date +%s%N)
DURATION=$(( (END - START) / 1000000 ))
echo "  Duration: ${DURATION}ms"
echo ""

# Test 2: Config Read Performance
echo "Test 2: Configuration Read"
START=$(date +%s%N)
npx tsx cli/bin/karis.js config list > /dev/null 2>&1
END=$(date +%s%N)
DURATION=$(( (END - START) / 1000000 ))
echo "  Duration: ${DURATION}ms"
echo ""

# Test 3: Help Command Performance
echo "Test 3: Help Command"
START=$(date +%s%N)
npx tsx cli/bin/karis.js --help > /dev/null 2>&1
END=$(date +%s%N)
DURATION=$(( (END - START) / 1000000 ))
echo "  Duration: ${DURATION}ms"
echo ""

# Test 4: Brand Show (No Profile)
echo "Test 4: Brand Show (No Profile)"
START=$(date +%s%N)
npx tsx cli/bin/karis.js brand show > /dev/null 2>&1
END=$(date +%s%N)
DURATION=$(( (END - START) / 1000000 ))
echo "  Duration: ${DURATION}ms"
echo ""

echo "=== Basic Tests Complete ==="
echo "Completed: $(date)"
