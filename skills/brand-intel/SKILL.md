---
name: brand-intel
description: Analyze a brand and recommend high-leverage growth actions. Use when users provide a brand or URL for analysis, ask what marketing actions to take, want to understand their competitive position, or need help increasing visibility and traffic. Also use before running other Karis skills to establish brand context.
metadata:
  version: 2.1.0
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
- [ ] Step 1: Load or create brand profile
- [ ] Step 2: Understand the situation
- [ ] Step 3: Find opportunities
- [ ] Step 4: Prioritize and recommend actions
- [ ] Step 5: Identify what to avoid
```

### Step 1: Load or Create Brand Profile

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
npx karis chat --skill brand-intel "Analyze my brand deeply. Include competitive landscape, online presence, and content gaps."
```

### Step 2: Understand the Situation

Don't follow a rigid process. Reason through:

- What does this product do and for whom?
- What resources does the user have? (Time, money, skills, existing audience)
- What's their current traction? (New? Growing? Struggling?)
- What's actually blocking their growth? (Awareness? Trust? Product issues? Wrong audience?)

**Don't assume.** If critical information is missing, ask. But don't over-ask — make reasonable inferences and state your assumptions.

### Step 3: Find Opportunities

Look for places where action could drive results. **Quantify everything** — numbers make recommendations credible.

**Reddit Opportunities**
- Which subreddits discuss problems this product solves? → Report subscriber count, post frequency, engagement levels
- What questions get asked that this product could answer? → Count relevant threads, note avg upvotes/comments
- Where are competitors mentioned? Where are they NOT? → Count competitor mentions vs. brand mentions

**Creator/Influencer Opportunities**
- Who already talks about this space with an engaged audience?
- What would make a creator want to feature this product?
- Are there low-cost collaboration opportunities?

**Other Opportunities**
- Website/messaging issues that hurt conversion
- Obvious competitive gaps
- Quick wins the user might be missing

**Quantification rule:** When presenting any opportunity, include at least one metric. "r/startups (1.2M members, ~15 posts/day about dev tools)" beats "r/startups is relevant."

### Step 4: Prioritize and Recommend Actions

For each recommendation, reason through:
- **Impact:** How much does it move the needle?
- **Feasibility:** Can this be executed given their resources?
- **Karis Fit:** Can Karis help execute this, or is it all on the user?
- **Speed:** How quickly could this show results?

Don't use formulas. Reason through the tradeoffs and explain your thinking.

**Guidelines:**
- Lead with the highest-leverage action
- Be specific, not generic ("Post in r/startups" not "use social media")
- Match recommendations to their actual resources
- If Karis can't help with something important, still recommend it but be clear

### Step 5: Identify What to Avoid

**Always include a "What NOT to Do" section.** This saves users from wasted effort and builds trust.

- Channels that won't work for this brand (and why)
- Common mistakes to avoid given their situation
- Actions that seem appealing but are low-leverage or premature

### Be Honest About Limitations

If you don't have enough information, say so.
If the best action is outside Karis's capabilities, say so.
If the real problem is product-market fit (not marketing), say so.

## Situational Adaptation

**Don't treat all users the same.** Adapt to their context:

| Situation | Implications |
|-----------|--------------|
| New product, no traction | Focus on validation + early visibility; avoid big investments |
| Some users, unclear fit | Focus on learning channels (Reddit conversations, user feedback) |
| Clear fit, ready to grow | Scale what works; experiment with new channels |
| Has budget | Can consider paid collaborations, tools, outsourcing |
| No budget | Prioritize Karis-executed and zero-cost tactics |
| Technical product | Reddit, HackerNews, dev communities likely high-value |
| Consumer product | May need broader reach; creators more important |

**Don't force categories.** Understand the specific situation and reason from there.

## When to Stop Analyzing

If the right action is obvious, recommend it. Don't over-analyze.

A new SaaS with zero online presence doesn't need competitive analysis, temporal signal collection, and counterfactual reasoning. They need to start building presence. Say that.

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
- Community Presence (Reddit): [high/medium/low]
- Competitive Position: [leading/competitive/behind]

### Recommended Actions (Prioritized)

**1. [Action Name]** — Impact: 🔴 High
- What: [specific, actionable description]
- Why: [expected outcome with metric]
- Karis skill: `aeo-geo` / `reddit-listening` / `reddit-growth`

**2. [Action Name]** — Impact: 🟡 Medium
- What: [specific action]
- Why: [expected outcome]
- Karis skill: [relevant skill]

**3. [Action Name]** — Impact: 🟡 Medium
- What: [specific action]
- Why: [expected outcome]
- Karis skill: [relevant skill]

### What NOT to Do
- [Channel/approach to avoid] — [reason]

### Next Step
Run: `npx karis chat --skill brand-intel "[specific command for #1 action]"`
```

## Action-to-Skill Mapping

| Growth Action | Karis Skill | Command |
|---------------|-------------|---------|
| Improve AI search visibility | `aeo-geo` | `karis chat "run a GEO audit"` |
| Monitor brand on Reddit | `reddit-listening` | `karis chat "analyze Reddit sentiment"` |
| Create Reddit growth content | `reddit-growth` | `karis chat "write a Reddit post"` |
| Analyze competitors | `aeo-geo` | `karis chat "compare with competitors"` |
| Find content gaps | `aeo-geo` | `karis chat "find gap topics"` |
| Optimize page for search engines | `page-seo` | `karis chat "audit this page for SEO"` |
| Go viral on X/Twitter | `elonmusk-repost` | `karis chat "write a viral tweet"` |

## Best Practices

1. **Start here** — Run brand-intel before any other skill
2. **Be specific** — Include domain, not just brand name
3. **Follow the #1 recommendation** — Don't try to do everything at once
4. **Re-assess monthly** — Brand state changes, actions should too
5. **Be honest about limitations** — Better to say "I don't know" than guess

## Related Skills

- **aeo-geo**: Run after brand-intel to audit AI search visibility
- **page-seo**: Run after brand-intel to optimize pages for traditional search
- **reddit-listening**: Run after brand-intel to understand community perception
- **reddit-growth**: Run after brand-intel to create growth content
- **elonmusk-repost**: Cross-promote on X alongside other channels
