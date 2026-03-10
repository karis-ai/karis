# GEO Audit Methodology

This document defines the methodology for measuring brand visibility in AI search engines (Generative Engine Optimization audits).

## Overview

A GEO audit measures how often and how prominently a brand appears when users ask AI search engines (ChatGPT, Perplexity, Claude, etc.) questions related to the brand's category. Unlike traditional SEO which measures rankings in search result pages, GEO measures presence in generated answers.

## Core Metrics

### 1. Answer Share

**Definition**: The percentage of responses where the brand is mentioned.

**Formula**: `(Responses mentioning brand / Total responses) × 100%`

**Example**: If a brand is mentioned in 3 out of 10 test prompts, Answer Share = 30%.

**Interpretation**:
- **>50%**: Dominant presence — brand appears in most relevant queries
- **30-50%**: Strong presence — brand is well-known in the category
- **10-30%**: Moderate presence — brand appears occasionally
- **<10%**: Weak presence — brand rarely mentioned

**Why it matters**: Answer Share is the primary visibility metric. If your brand doesn't appear in AI responses, users won't discover you through AI search.

### 2. Citation Rate

**Definition**: The percentage of responses where the brand's website is cited (linked as a source).

**Formula**: `(Responses citing brand / Total responses) × 100%`

**Example**: If a brand's website is linked in 1 out of 10 responses, Citation Rate = 10%.

**Interpretation**:
- **>20%**: High authority — AI engines trust your content as a source
- **10-20%**: Moderate authority — occasionally cited
- **<10%**: Low authority — rarely cited as a source

**Why it matters**: Citations drive traffic and signal authority. A mention without a citation is awareness; a citation is a referral.

### 3. Mention Position

**Definition**: The average position where the brand appears in responses (when mentioned).

**Formula**: `Sum of positions / Number of mentions`

**Example**: Brand mentioned 1st, 3rd, and 2nd in three responses = (1+3+2)/3 = 2.0 average position.

**Interpretation**:
- **1.0-2.0**: Prominent — brand appears early in responses
- **2.0-3.0**: Moderate — brand appears mid-list
- **>3.0**: Buried — brand appears late in responses

**Why it matters**: Users skim AI responses. Being mentioned 5th is far less valuable than being mentioned 1st. Position is a proxy for prominence and relevance.

### 4. Sentiment

**Definition**: The average sentiment when the brand is mentioned.

**Scale**: -1 (negative) to +1 (positive), with 0 as neutral.

**Scoring**:
- **Positive (+1)**: Brand praised, recommended, or described favorably
- **Neutral (0)**: Brand mentioned factually without opinion
- **Negative (-1)**: Brand criticized or described unfavorably

**Example**: 2 positive mentions (+1, +1) and 1 neutral (0) = (+1+1+0)/3 = +0.67

**Interpretation**:
- **>+0.5**: Positive perception — brand is well-regarded
- **0 to +0.5**: Neutral to positive — factual mentions
- **<0**: Negative perception — brand has reputation issues

**Why it matters**: Visibility without positive sentiment can hurt more than help. Negative mentions in AI responses damage brand perception at scale.

### 5. Gap Topics

**Definition**: Prompts where competitors were mentioned but the brand wasn't.

**Identification**: For each response, check:
1. Was the brand mentioned? (no)
2. Were competitors mentioned? (yes)
3. → This is a gap topic

**Example**: Prompt "best project management tools for startups" mentions Linear and Jira but not your brand → gap topic.

**Why it matters**: Gap topics reveal where competitors are winning mindshare. These are high-priority content opportunities — if you create authoritative content on these topics, you can close the gap.

## Prompt Generation Strategy

### Intent Distribution

Test prompts should cover three intent types:

**Informational (40%)**:
- "What is [category]?"
- "How does [feature] work?"
- "Why use [category]?"

**Comparative (40%)**:
- "[Brand A] vs [Brand B]"
- "Best [category] for [use case]"
- "Which [category] should I use?"

**Transactional (20%)**:
- "Recommend a [category]"
- "Find [category] for [use case]"
- "Top [number] [category] tools"

### Prompt Quality Criteria

Good test prompts are:
1. **Realistic**: Something a real user would ask
2. **Category-specific**: Tailored to the brand's domain
3. **Varied**: Different phrasings, use cases, and angles
4. **Competitive**: Include competitor names in comparative prompts

Bad test prompts are:
- Too generic: "best software"
- Brand-biased: "why is [brand] the best"
- Unrealistic: "comprehensive analysis of all project management tools"

## Analysis Process

### Per-Response Analysis

For each LLM response, extract:

1. **Brand mentioned?**: Search for brand name (case-insensitive)
2. **Brand cited?**: Check if brand's domain appears as a link/source
3. **Mention position**: Count position in list (1st, 2nd, 3rd, etc.)
4. **Sentiment**: Classify tone as positive/neutral/negative
5. **Competitors mentioned**: List which competitors appeared

### Aggregation

After analyzing all responses:
1. Calculate Answer Share (% mentioned)
2. Calculate Citation Rate (% cited)
3. Calculate average Mention Position (only for responses where mentioned)
4. Calculate average Sentiment (only for responses where mentioned)
5. Identify Gap Topics (competitors mentioned, brand not mentioned)

## Limitations

### Free Tier (10 prompts × 1 model)

- **Statistical confidence**: Low sample size means results are directional, not definitive
- **Model bias**: Single model may have idiosyncratic preferences
- **Temporal snapshot**: One-time audit doesn't show trends

**Mitigation**: Focus on patterns (gap topics, sentiment) rather than precise percentages.

### Karis Pro (50+ prompts × 4 models)

- **Statistical confidence**: High sample size provides reliable metrics
- **Model diversity**: Multiple models (GPT-4, Claude, Gemini, Perplexity) reduce bias
- **Trend tracking**: Historical data shows visibility changes over time

## Reporting Best Practices

### Executive Summary

Lead with the most important finding:
- If Answer Share is low: "Your brand appears in only X% of relevant AI search queries."
- If Gap Topics are significant: "Competitors dominate X key topics where you're absent."
- If Sentiment is negative: "Your brand is mentioned but with negative sentiment."

### Recommendations

Make recommendations specific and actionable:
- **Bad**: "Improve content"
- **Good**: "Create a comparison guide 'Linear vs Jira vs [Brand]' to close the gap on comparative queries"

Prioritize by impact:
1. High-volume gap topics (competitors mentioned, brand not)
2. Low citation rate (create authoritative content)
3. Negative sentiment (address perception issues)

## References

- **GEO vs SEO**: GEO measures presence in generated answers; SEO measures rankings in search results
- **AI Search Engines**: ChatGPT, Perplexity, Claude, Gemini, Bing Chat, etc.
- **Citation**: A link or source attribution to the brand's website in an AI response
