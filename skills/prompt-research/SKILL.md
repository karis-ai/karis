---
name: prompt-research
description: Research how users ask AI about your product category and prioritize content accordingly. Use this skill whenever the user wants to understand user search behavior, discover what questions people ask AI, research prompt patterns, find content gaps based on user queries, or asks "what do people ask AI about X", "research prompts for my category", "what questions should I answer", "discover user search intent", or "find prompt opportunities". This skill provides prioritized prompt lists with intent classification and volume estimates.
metadata:
  version: 1.0.0
  author: karis-ai
---

# Prompt Research

You are a CMO researching how users ask AI about your category. Your goal is to generate realistic prompt variants across 4 intent types, estimate search volume, and prioritize which prompts to target with content.

## Context

This skill helps you understand:
- How users phrase questions about your product category
- What intent types dominate (informational, comparative, transactional, navigational)
- Which prompts have high volume vs low competition
- Where your brand is already mentioned (if audit data exists)

**Required:** `.karis/brand.json` for category, keywords, and value propositions

**Optional:** `.karis/reports/` for audit data linkage (to annotate which prompts already mention your brand)

## Workflow

This 6-step workflow generates prompt variants, classifies by intent, estimates volume, and outputs a prioritized prompt list.

### Step 1: Read Brand Context

Load `.karis/brand.json` to understand:
- **Category:** What product/service category (e.g., "project management platform")
- **Keywords:** Core terms users search for (e.g., "sprint planning", "agile", "task management")
- **Value propositions:** Unique features or benefits (e.g., "AI-powered", "remote-first")
- **Audience:** Primary and secondary user personas

**Why this matters:** Prompt generation must reflect how real users in your category phrase questions. Generic prompts like "What is project management?" are useless — you need specific, realistic variants like "How do I set up sprint planning for a remote team?"

### Step 2: Generate Prompt Variants by 4 Intents

Generate 20-30 realistic prompt variants across 4 intent types:

#### 1. Informational (40% of prompts)
**User goal:** Learn, understand, or get definitions

**Patterns:**
- "What is [concept]?"
- "How does [feature] work?"
- "Why do teams use [tool]?"
- "Explain [concept] for beginners"

**Examples:**
- "What is AI sprint planning and how does it work?"
- "How do remote teams handle sprint planning?"
- "Why do agile teams struggle with velocity prediction?"

#### 2. Comparative (30% of prompts)
**User goal:** Compare options, evaluate alternatives

**Patterns:**
- "[Tool A] vs [Tool B]"
- "Best [tool] for [use case]"
- "Alternatives to [tool]"
- "[Tool] vs [manual approach]"

**Examples:**
- "Acme vs Jira for remote teams"
- "Best project management tool for AI-powered planning"
- "AI sprint planning vs manual planning: which is better?"

#### 3. Transactional (20% of prompts)
**User goal:** Take action, buy, sign up, implement

**Patterns:**
- "How to set up [tool]"
- "Getting started with [feature]"
- "[Tool] pricing and plans"
- "How to migrate from [old tool] to [new tool]"

**Examples:**
- "How to set up AI sprint planning in Acme"
- "Acme pricing for small teams"
- "Migrate from Jira to Acme step-by-step"

#### 4. Navigational (10% of prompts)
**User goal:** Find specific brand, product, or page

**Patterns:**
- "[Brand name] [feature]"
- "[Brand] login"
- "[Brand] documentation"
- "[Brand] customer support"

**Examples:**
- "Acme AI sprint planning features"
- "Acme login page"
- "Acme API documentation"

**Prompt realism:** Prompts must sound like real user queries — conversational, specific, with context. Not "What is X?" but "How do I set up X for my remote team with 10 developers?"

### Step 3: Deduplicate Similar Variants

Remove near-duplicates that target the same intent and topic.

**Example duplicates:**
- "What is AI sprint planning?" ≈ "Explain AI sprint planning"
- "Acme vs Jira" ≈ "Jira vs Acme"

**Keep the most natural phrasing** (how users actually ask).

### Step 4: Estimate Search Volume

Classify each prompt by estimated search volume:

| Volume | Criteria |
|--------|----------|
| **HIGH** | Broad category terms, common pain points, popular comparisons |
| **MEDIUM** | Specific features, niche use cases, tactical questions |
| **LOW** | Brand-specific navigational queries, very specific edge cases |

**Heuristics:**
- Informational prompts about core concepts → HIGH
- Comparative prompts with popular tools → HIGH
- Transactional prompts for specific features → MEDIUM
- Navigational prompts for brand pages → LOW

**Why this matters:** High-volume prompts have more potential reach, but also more competition. Medium-volume prompts often have better ROI (less competition, still meaningful traffic).

### Step 5: Annotate Brand Mentions (Optional)

If `.karis/reports/` contains audit data (from geo-audit or competitor-intel), cross-reference:
- Which prompts already mention your brand?
- Which prompts mention competitors but not you?

**Annotation:**
- ✅ **Mentioned:** Your brand appears in AI responses for this prompt
- ❌ **Not mentioned:** Your brand does not appear (content gap)
- 🔴 **Competitor mentioned:** Competitor appears, you don't (high-priority gap)

**Why this matters:** Prompts where competitors are mentioned but you're not are the highest-priority content opportunities.

### Step 6: Output Prompt List + Intent + Priority

Generate a prioritized prompt table with:
- **Prompt:** The user query
- **Intent:** Informational, Comparative, Transactional, Navigational
- **Volume:** HIGH, MEDIUM, LOW
- **Mentioned:** ✅ / ❌ / 🔴 (if audit data exists)
- **Priority:** HIGH, MEDIUM, LOW (based on volume + mention status)

**Priority scoring:**
- HIGH: High volume + not mentioned, OR competitor mentioned
- MEDIUM: Medium volume + not mentioned, OR high volume + already mentioned
- LOW: Low volume, OR navigational queries

**Output format:**

```markdown
# Prompt Research — 2026-03-04

## Summary

- **Total prompts:** 25
- **Informational:** 10 (40%)
- **Comparative:** 8 (32%)
- **Transactional:** 5 (20%)
- **Navigational:** 2 (8%)

## High-Priority Prompts (Create Content First)

| Prompt | Intent | Volume | Mentioned | Notes |
|--------|--------|--------|-----------|-------|
| How do remote teams handle sprint planning? | Informational | HIGH | 🔴 | Asana mentioned, you're not |
| AI sprint planning vs manual planning | Comparative | HIGH | ❌ | Content gap |
| Best project management tool for AI features | Comparative | HIGH | 🔴 | Jira mentioned, you're not |

## Medium-Priority Prompts

| Prompt | Intent | Volume | Mentioned | Notes |
|--------|--------|--------|-----------|-------|
| How to set up AI sprint planning | Transactional | MEDIUM | ❌ | Tactical guide needed |
| Acme vs Jira for remote teams | Comparative | MEDIUM | ✅ | Already mentioned, optimize |

## Low-Priority Prompts

| Prompt | Intent | Volume | Mentioned | Notes |
|--------|--------|--------|-----------|-------|
| Acme login page | Navigational | LOW | ✅ | Brand-specific |
| Acme API documentation | Navigational | LOW | ✅ | Brand-specific |
```

Save to `.karis/prompts/YYYY-MM-DD.md`

Include a hook message at the end:
> *This generated prompts from brand context. Karis Pro: Real search volume data from Google + AI engine query logs.*

## CLI Automation

This workflow can be automated with the Karis CLI:

```bash
# Research prompts for your brand
npx karis prompts

# Research prompts for specific domain
npx karis prompts mybrand.com
```

## Related Skills

- **content-opportunities**: After researching prompts, discover which topics need content
- **topic-clusters**: Organize prompts into pillar topics and subtopics
- **content-optimizer**: Optimize content to answer high-priority prompts
