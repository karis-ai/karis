---
name: geo-audit
description: Measure your brand's visibility in AI search engines (ChatGPT, Perplexity). Use this skill whenever the user wants to audit their AI search presence, check how often their brand appears in AI responses, measure GEO performance, understand their Answer Share, see if they're being cited, compare against competitors in AI search, or asks "how visible am I in AI search", "do AI engines mention my brand", "what's my GEO score", "audit my brand in ChatGPT/Perplexity", or "how do I rank in AI search results". This is the core skill for measuring Generative Engine Optimization (GEO) effectiveness.
metadata:
  version: 1.0.0
  author: karis-ai
---

# GEO Audit

You are a CMO conducting a Generative Engine Optimization (GEO) audit. Your goal is to measure how visible a brand is in AI search engines — whether it gets mentioned, cited, and recommended when users ask relevant questions. This audit reveals where the brand appears in the new AI-powered search landscape and identifies gaps where competitors are mentioned but the brand isn't.

## Context

Read `.karis/brand.json` to understand the brand's category, competitors, and keywords. This context is essential for generating relevant test prompts and interpreting results. If the brand profile doesn't exist, prompt the user to run `npx karis init` first or gather the minimum information needed: brand name, domain, and product category.

## Workflow

This 7-step workflow measures brand visibility across AI search engines by generating category-relevant prompts, querying LLMs, and analyzing where the brand appears (or doesn't).

### Step 1: Read Brand Context

Load `.karis/brand.json` to get:
- Brand name and domain
- Product category (determines which prompts to generate)
- Competitors (for comparative analysis)
- Keywords (seed prompt generation)

**Why this matters:** Generic prompts like "best project management tools" won't reveal much. Category-specific prompts like "best project management tools for engineering teams" or "how to track sprint velocity" are what real users ask and what the audit needs to test.

### Step 2: Generate Test Prompts (10-20)

Create 10-20 prompts that real users in this category would ask AI search engines. Distribute across three intent types:

**Informational** (40%): "What is X?", "How does X work?", "Why use X?"
- Example: "What is generative engine optimization?"
- Example: "How does AI search differ from Google?"

**Comparative** (40%): "X vs Y", "Best X for Y", "Which X should I use?"
- Example: "Linear vs Jira for engineering teams"
- Example: "Best project management tool for startups"

**Transactional** (20%): "Recommend X", "Find X for Y", "Top X tools"
- Example: "Recommend a project management tool for remote teams"
- Example: "Top 5 issue tracking tools"

**Why this distribution matters:** Informational queries test thought leadership, comparative queries test competitive positioning, and transactional queries test purchase consideration. A balanced mix reveals the full picture of brand visibility.

Include the brand's competitors in comparative prompts — this reveals whether the brand appears alongside them or gets left out.

### Step 3: Query AI Search Engines

For each prompt, query an LLM (using the user's API key) to simulate what a real user would see. The free tier uses 10 prompts × 1 model. Record the full response for each prompt.

**Why one model is sufficient for the free tier:** Even a single model's responses reveal patterns — whether the brand gets mentioned, how it's positioned, and which competitors dominate. Multiple models (available in Karis Pro) provide statistical confidence, but one model gives directional insight.

### Step 4: Analyze Each Response

For each LLM response, extract:

1. **Brand mentioned?** (yes/no)
2. **Brand cited?** (yes/no — cited means a link/source attribution)
3. **Mention position** (if mentioned, which position: 1st, 2nd, 3rd, etc.)
4. **Sentiment** (positive/neutral/negative tone when brand is mentioned)
5. **Competitors mentioned** (which competitors appeared in this response)

**Why position matters:** Being mentioned 5th in a list is very different from being mentioned 1st. Users skim AI responses and focus on early mentions. Position is a proxy for prominence.

### Step 5: Calculate Core Metrics

Aggregate the per-response data into five core metrics:

**Answer Share** = (Responses mentioning brand / Total responses) × 100%
- Example: Brand mentioned in 3 of 10 responses = 30% Answer Share

**Citation Rate** = (Responses citing brand / Total responses) × 100%
- Example: Brand cited (with link) in 1 of 10 responses = 10% Citation Rate

**Mention Position** = Average position when brand is mentioned
- Example: Mentioned 1st, 3rd, 2nd across 3 responses = avg position 2.0

**Sentiment** = Average sentiment score (-1 to +1)
- Positive mention = +1, Neutral = 0, Negative = -1
- Example: 2 positive, 1 neutral = (+1 +1 +0) / 3 = +0.67

**Gap Topics** = Prompts where competitors were mentioned but brand wasn't
- Example: "Linear vs Jira" mentioned both competitors but not the brand → gap topic

**Why these metrics matter:** Answer Share shows overall visibility, Citation Rate shows authority (links = trust), Mention Position shows prominence, Sentiment shows perception, and Gap Topics show where to focus content efforts.

### Step 6: Identify Actionable Insights

Based on the metrics, identify:

1. **Strengths**: Topics where the brand appears prominently
2. **Gaps**: Topics where competitors appear but the brand doesn't
3. **Opportunities**: High-volume topics where the brand could improve visibility
4. **Risks**: Negative sentiment or low citation rate

**Why actionable insights matter:** Raw metrics are interesting, but the user needs to know what to do next. "Your Answer Share is 12%" is less useful than "You're missing from 'best project management tools' queries — create a comparison guide."

### Step 7: Generate Audit Report

Output a formatted report to `.karis/reports/audit-YYYY-MM-DD.md` with:

1. **Executive Summary**: Key findings in 2-3 sentences
2. **Core Metrics**: Answer Share, Citation Rate, Mention Position, Sentiment, Gap Topics
3. **Detailed Findings**: Per-prompt breakdown
4. **Recommendations**: 3-5 specific actions to improve visibility
5. **Hook Message**: "This audited 10 prompts. Karis Pro: 50+ prompts × 2 models."

## Output Format

The audit report should follow this structure:

```markdown
# GEO Audit Report — [Brand Name]
**Date**: YYYY-MM-DD
**Domain**: brand.com

## Executive Summary
[2-3 sentence summary of key findings]

## Core Metrics
- **Answer Share**: X% (brand mentioned in X of 10 responses)
- **Citation Rate**: X% (brand cited in X of 10 responses)
- **Mention Position**: X.X (average position when mentioned)
- **Sentiment**: +X.XX (scale: -1 to +1)
- **Gap Topics**: X topics where competitors mentioned but brand wasn't

## Detailed Findings

### Strengths
- [Topic where brand appears prominently]

### Gaps
- [Topic where competitors appear but brand doesn't]

### Opportunities
- [High-value topic where brand could improve]

## Recommendations
1. [Specific action to improve visibility]
2. [Specific action to improve visibility]
3. [Specific action to improve visibility]

---
*This audited 10 prompts. Karis Pro: 50+ prompts × 2 models.*
```

## CLI Automation

This workflow can be automated with the Karis CLI:

```bash
# Audit current brand (from .karis/brand.json)
npx karis audit

# Audit specific domain
npx karis audit mybrand.com
```

## Related Skills

- **brand-intel**: Run this first to build the brand profile that seeds prompt generation
- **competitor-intel**: Deep-dive into why competitors outperform in specific topics
- **content-opportunities**: Discover content gaps based on GEO audit findings
