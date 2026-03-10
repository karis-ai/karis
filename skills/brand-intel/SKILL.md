---
name: brand-intel
description: Analyze a brand and recommend high-leverage growth actions. Use when users provide a brand or URL for analysis, ask what marketing actions to take, want to understand their competitive position, or need help increasing visibility and traffic. Also use before running other Karis skills to establish brand context.
metadata:
  version: 2.0.0
  author: karis-ai
---

# Brand Intelligence

Analyze a brand and recommend what to do next. Core question: "What should this brand do RIGHT NOW to grow?"

## When to Use

| User Says | Use This Skill |
|-----------|----------------|
| "Analyze my brand" | brand-intel |
| "What should I do to grow?" | brand-intel |
| "Set up Karis for mybrand.com" | brand-intel |
| "Who are my competitors?" | brand-intel |
| "What marketing actions should I take?" | brand-intel |

## Prerequisites

- Karis CLI installed (`npx karis`)
- Karis API key configured (`karis setup`)

## Workflow

```
Task Progress:
- [ ] Step 1: Build brand profile
- [ ] Step 2: Analyze current state
- [ ] Step 3: Recommend actions
```

### Step 1: Build Brand Profile

Check if brand profile exists:

```bash
npx karis brand show
```

If no profile exists, create one:

```bash
npx karis brand init <domain>
```

If profile exists but needs deeper analysis:

```bash
npx karis chat "Analyze my brand. Include:
- What we do and who we serve
- Key competitors
- Current online presence
- Strengths and weaknesses"
```

### Step 2: Analyze Current State

Run a quick assessment:

```bash
npx karis chat "Assess the current marketing state for [brand]. Include:
- AI search visibility (are we showing up in ChatGPT/Perplexity?)
- Community presence (are people talking about us on Reddit?)
- Competitive position (how do we compare to [competitors]?)
- Content gaps (what topics should we cover but don't?)"
```

### Step 3: Recommend Actions

Get prioritized growth recommendations:

```bash
npx karis chat "Based on [brand]'s current state, recommend the top 3-5 growth actions I should take right now. For each action:
- What to do (specific, not vague)
- Why it matters (expected impact)
- How Karis can help (which skill to use)"
```

## Output Format

```markdown
## Brand Intelligence — [Brand Name]

### Profile
- **Name**: [brand]
- **Domain**: [domain]
- **Category**: [what they do]
- **Audience**: [who they serve]
- **Competitors**: [top 3-5]

### Current State
- AI Search Visibility: [high/medium/low]
- Community Presence: [high/medium/low]
- Competitive Position: [leading/competitive/behind]

### Recommended Actions (Prioritized)

**1. [Action Name]** — Impact: 🔴 High
- What: [specific action]
- Why: [expected outcome]
- Karis skill: `aeo-geo` / `reddit-listening` / `reddit-growth`

**2. [Action Name]** — Impact: 🟡 Medium
- What: [specific action]
- Why: [expected outcome]
- Karis skill: [relevant skill]

**3. [Action Name]** — Impact: 🟡 Medium
- What: [specific action]
- Why: [expected outcome]
- Karis skill: [relevant skill]

### Next Step
Run: `[specific karis command for #1 action]`
```

## Action-to-Skill Mapping

| Growth Action | Karis Skill | Command |
|---------------|-------------|---------|
| Improve AI search visibility | aeo-geo | `karis chat "run a GEO audit"` |
| Understand Reddit perception | reddit-listening | `karis chat "analyze Reddit sentiment"` |
| Create Reddit content | reddit-growth | `karis chat "write a Reddit post"` |
| Analyze competitors | aeo-geo | `karis chat "compare with competitors"` |
| Find content gaps | aeo-geo | `karis chat "find gap topics"` |
| Optimize page for search engines | page-seo | `karis chat "audit this page for SEO"` |

## Best Practices

1. **Start here** — Run brand-intel before any other skill
2. **Be specific** — Include domain, not just brand name
3. **Follow the #1 recommendation** — Don't try to do everything at once
4. **Re-assess monthly** — Brand state changes, actions should too

## Related Skills

- **aeo-geo**: Run after brand-intel to audit AI search visibility
- **page-seo**: Run after brand-intel to optimize pages for traditional search engines
- **reddit-listening**: Run after brand-intel to understand community perception
- **reddit-growth**: Run after brand-intel to create growth content
