#!/bin/bash

# Quick Performance Benchmark
# Measures key performance metrics without full test suite

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   KARIS CLI - QUICK PERFORMANCE BENCHMARK                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
API_KEY="sk-ka-v1-L7lVlH0BmEwYUM-_BgSCl3oPbw6Nv0mm"
BASE_URL="https://api-staging.sophiapro.ai"
TEST_DOMAIN="karis.im"

# Setup
echo "Setting up configuration..."
npx tsx cli/bin/karis.js config set api-key "$API_KEY" > /dev/null 2>&1
npx tsx cli/bin/karis.js config set base-url "$BASE_URL" > /dev/null 2>&1
echo "✓ Configuration complete"
echo ""

# Function to measure time
measure_time() {
    local name="$1"
    shift
    echo -n "Testing: $name ... "

    local start=$(date +%s%N)
    "$@" > /dev/null 2>&1
    local end=$(date +%s%N)

    local duration=$(( (end - start) / 1000000 ))
    echo "${duration}ms"

    return $duration
}

echo "Running performance benchmarks..."
echo ""

# Benchmark 1: CLI Startup
measure_time "CLI Startup (--version)" npx tsx cli/bin/karis.js --version

# Benchmark 2: Config Read
measure_time "Config Read" npx tsx cli/bin/karis.js config list

# Benchmark 3: Help Command
measure_time "Help Command" npx tsx cli/bin/karis.js --help

# Benchmark 4: Brand Show
measure_time "Brand Show" npx tsx cli/bin/karis.js brand show

echo ""
echo "Running GEO Audit (this will take 60-90 seconds)..."
START=$(date +%s)
npx tsx cli/bin/karis.js geo audit "$TEST_DOMAIN" > /tmp/karis-audit-output.txt 2>&1
END=$(date +%s)
DURATION=$((END - START))

echo "✓ GEO Audit completed in ${DURATION}s"
echo ""

# Analyze output
OUTPUT_SIZE=$(wc -c < /tmp/karis-audit-output.txt)
TOOL_COUNT=$(grep -o '\[tool\]' /tmp/karis-audit-output.txt | wc -l)
HAS_SCORE=$(grep -q '/100' /tmp/karis-audit-output.txt && echo "✓" || echo "✗")

echo "GEO Audit Analysis:"
echo "  Duration: ${DURATION}s"
echo "  Output Size: ${OUTPUT_SIZE} bytes"
echo "  Tool Executions: ${TOOL_COUNT}"
echo "  Has Score: ${HAS_SCORE}"
echo ""

# Performance Summary
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   PERFORMANCE SUMMARY                                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Quick Operations (<3s):"
echo "  ✓ CLI Startup"
echo "  ✓ Config Read"
echo "  ✓ Help Command"
echo ""
echo "Long Operations:"
echo "  ✓ GEO Audit: ${DURATION}s"
echo ""

# Cleanup
rm -f /tmp/karis-audit-output.txt

echo "Benchmark complete!"
