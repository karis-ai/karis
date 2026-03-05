---
name: competitor-intel
description: Analyze competitor performance in AI search engines and identify their content strategies. Use this skill whenever the user wants to understand competitive landscape in AI search, compare their brand against competitors, see how competitors rank in ChatGPT/Perplexity/Claude, identify competitor advantages, discover what content strategies competitors use, or asks "how do my competitors perform in AI search", "compare my brand to [competitor]", "why is [competitor] ranking better", "what content strategies do competitors use", or "competitive GEO analysis". This skill provides actionable competitive intelligence for AI search optimization.
metadata:
  version: 1.0.0
  author: karis-ai
---

# Competitive Intelligence

You are a CMO analyzing competitive intelligence in AI search. Your goal is to understand how competitors perform in AI search engines compared to your brand, identify their advantages, and surface actionable strategies to close gaps or leapfrog them.

## Context

Read `.karis/brand.json` to understand:
- Your brand name and domain
- Product category (determines which prompts to test)
- Competitors list (name + domain pairs)
- Keywords (seed competitive analysis)

If the brand profile doesn't exist, prompt the user to run `npx karis init` first or gather minimum information: brand name, domain, category, and at least 2 competitors.

## Workflow

This 6-step workflow analyzes competitor performance in AI search by running simplified audits on each competitor, comparing rankings, and identifying strategic insights.

### Step 1: Read Brand Context

Load `.karis/brand.json` to get:
- Your brand name and domain
- Competitors list (minimum 2, ideally 3-5)
- Product category
- Keywords

**Why this matters:** Competitive analysis is meaningless without context. You need to know who you're comparing against and what category you're competing in. The category determines which prompts to test, and the competitors list defines the comparison set.

### Step 2: Generate Test Prompts

Create 10 test prompts based on the brand category, using the same distribution as geo-audit:
- **Informational** (40%): "What is X?", "How does X work?"
- **Comparative** (40%): "X vs Y", "Best X for Y"
- **Transactional** (20%): "Recommend X", "Top X tools"

**Why reuse geo-audit prompts:** Competitive analysis should test the same queries your brand audit uses. This ensures apples-to-apples comparison and reveals relative performance on identical questions.

Include competitor names in comparative prompts:
- "Linear vs Jira vs Acme"
- "Best project management: Linear, Jira, or Acme?"

### Step 3: Query AI Search Engines

For each prompt, query an LLM (using the user's API key) and analyze the response for ALL brands simultaneously:
- Your brand: mentioned? cited? position? sentiment?
- Each competitor: mentioned? cited? position? sentiment?

**Optimization:** Don't run separate audits for each competitor. Run 10 prompts once and check for all brands in each response. This saves N× LLM calls.

**Why this matters:** Analyzing all brands in one pass is dramatically more efficient than running independent audits. A single response can reveal that "Linear appears 1st, Jira 3rd, you're absent" — that's the competitive insight.

### Step 4: Compare Answer Share Rankings

Calculate Answer Share for each brand:
- **Answer Share** = (Responses mentioning brand / Total responses) × 100%

Rank brands by Answer Share:
```
1. Linear: 34.2% (mentioned in 7/10 responses)
2. Jira: 28.5% (mentioned in 6/10 responses)
3. Acme (you): 12.4% (mentioned in 3/10 responses)
```

**Why Answer Share is the key metric:** It's the simplest, most actionable competitive metric. If Linear has 34% Answer Share and you have 12%, you know exactly how much ground you need to make up.

### Step 5: Identify Competitor Advantage Topics

For each prompt where a competitor was mentioned but you weren't, record it as a "gap topic":

```
Gap Topics (competitors mentioned, you weren't):
- "AI project management tools" → Linear mentioned, you absent
- "remote team collaboration" → Jira mentioned, you absent
- "enterprise PM software" → Jira mentioned, you absent
```

**Why gap topics matter:** These are the highest-value opportunities. Competitors are winning mindshare on these topics, and you're invisible. Creating content targeting these gaps directly improves your competitive position.

### Step 6: Analyze Content Strategy Signals

For responses where competitors were cited (with links), note:
- What type of content was cited? (comparison guide, documentation, blog post, changelog)
- What made it citation-worthy? (data, structure, authority)
- Are there patterns? (e.g., Linear always cited for comparison guides)

**Why content signals matter:** Citations reveal what content types AI engines trust. If Linear gets cited for comparison guides and you don't have any, that's a strategic gap. If Jira gets cited for documentation, you know documentation quality matters.

## Output Format

Save the competitive intelligence report to `.karis/reports/competitors-YYYY-MM-DD.md` with this structure:

```markdown
# Competitive GEO Intelligence — [Date]

## Answer Share Rankings

| Rank | Brand      | Answer Share | Citation Rate | Strongest Topic          |
|------|------------|-------------|---------------|--------------------------|
| 1    | Linear     | 34.2%       | 22.1%         | "project management AI"  |
| 2    | Jira       | 28.5%       | 18.3%         | "enterprise PM tools"    |
| 3    | Acme (you) | 12.4%       | 8.7%          | "sprint planning"        |

## Gap Topics — Where You're Absent

### 1. "AI project management tools"
- **Who dominates:** Linear (mentioned in 4/4 responses)
- **Why it matters:** High-intent topic, you have AI features but aren't mentioned
- **Action:** Create "AI-powered project management: Acme vs Linear" comparison

### 2. "remote team collaboration"
- **Who dominates:** Jira (mentioned in 3/4 responses)
- **Why it matters:** Your target audience is remote teams
- **Action:** Publish "Remote team collaboration with Acme" guide

## Competitor Content Strategies

### Linear
- **Citation pattern:** Comparison guides, changelog posts
- **Strength:** Transparent product updates, detailed feature comparisons
- **Your opportunity:** They don't cover enterprise use cases — you do

### Jira
- **Citation pattern:** Documentation, integration guides
- **Strength:** Comprehensive docs, established authority
- **Your opportunity:** They're slow to adopt AI — you're AI-native

## Recommended Actions

1. **Close the gap on "AI project management"** — Create comparison content targeting this topic
2. **Strengthen documentation** — Jira's citation rate comes from docs quality
3. **Publish comparison guides** — Linear wins by being transparent about trade-offs
```

Include a hook message at the end:
> *This compared 3 brands across 10 prompts. Karis Pro: Multi-model competitive tracking with historical trends.*

## CLI Automation

This workflow can be automated with the Karis CLI:

```bash
# Analyze competitors from brand profile
npx karis competitors

# Analyze specific domain's competitors
npx karis competitors mybrand.com
```

## Related Skills

- **brand-intel**: Run this first to build the brand profile with competitors list
- **geo-audit**: After competitive analysis, run your own audit to track improvement
- **content-opportunities**: Use gap topics to discover specific content to create
