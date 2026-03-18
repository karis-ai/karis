---
name: aeo-geo
description: Audit your brand's AI search visibility and website GEO readiness. Supports two modes — visibility audit (are you being mentioned by AI?) and site audit (is your site optimized for AI?). Use when users ask about AI search performance, GEO/AEO scores, brand mentions in ChatGPT/Perplexity/Claude, AI crawler accessibility, llms.txt, or content optimization for generative engines.
metadata:
  version: 2.0.0
  author: karis-ai
---

# GEO Audit

Audit your brand's AI search presence — both how visible you are in AI responses and how well your website is optimized for AI engines.

## When to Use

| User Says | Mode |
|-----------|------|
| "How visible is my brand in AI search?" | Visibility Audit |
| "What's my Answer Share?" | Visibility Audit |
| "Compare my brand to competitors in AI search" | Visibility Audit |
| "Check my site for AI search optimization" | Site Audit |
| "Is my robots.txt blocking AI crawlers?" | Site Audit |
| "What's my GEO score?" | Either (ask user) |
| "Full GEO audit" | Both |

## Prerequisites

- Karis CLI installed (`npx @karis-ai/cli`)
- Karis API key configured (`karis setup`)
- Brand profile created (`karis brand init`)

## Two Modes

### Mode 1: Visibility Audit

**Question:** "Is my brand being mentioned by AI search engines?"

Generates test prompts, queries AI engines, measures whether your brand appears in responses.

**Key metrics:** Answer Share, Citation Rate, Mention Position, Sentiment, Gap Topics.

### Mode 2: Site Audit

**Question:** "Is my website optimized for AI engines to understand and cite?"

Analyzes your website's technical readiness and content quality for AI search.

**Key metrics:** GEO Score (0-100) across 5 dimensions.

### Mode 3: Content Strategy

**Question:** "What content should I create to improve my AI search presence?"

Analyzes topic clusters, identifies content gaps, develops content pillars with AI citation potential.

### Mode 4: Full Audit

Runs Visibility + Site + Content Strategy. Recommended for first-time users.

---

## Mode 1: Visibility Audit

```
Task Progress:
- [ ] Step 1: Load brand context
- [ ] Step 2: Execute visibility audit via Karis CLI
- [ ] Step 3: Present results
```

### Step 1: Load Brand Context

```bash
npx @karis-ai/cli brand show
```

If no brand profile exists:
```bash
npx @karis-ai/cli brand init <domain>
```

### Step 2: Execute Visibility Audit

```bash
npx @karis-ai/cli chat --skill aeo-geo "Run a GEO visibility audit for my brand. Include:
- Answer Share (% of AI responses mentioning my brand)
- Citation Rate (% citing my website)
- Mention Position (where I appear in responses)
- Sentiment (how I'm described)
- Gap Topics (where competitors appear but I don't)
- Compare against my top competitors"
```

### Step 3: Present Results

**Output format:**

```markdown
## GEO Visibility Audit — [Brand Name]

### Core Metrics
- **Answer Share**: X% (mentioned in X of Y responses)
- **Citation Rate**: X% (cited with link in X of Y responses)
- **Mention Position**: X.X avg (1 = first mentioned)
- **Sentiment**: +X.XX (-1 to +1 scale)
- **Gap Topics**: X topics where competitors appear but you don't

### Strengths
- [Topics where brand appears prominently]

### Gaps
- [Topics where competitors appear but brand doesn't]

### Recommendations
1. [Specific action]
2. [Specific action]
3. [Specific action]
```

---

## Mode 2: Site Audit

```
Task Progress:
- [ ] Step 1: Load brand context
- [ ] Step 2: Execute site audit via Karis CLI
- [ ] Step 3: Present results with improvements
```

### Step 1: Load Brand Context

```bash
npx @karis-ai/cli brand show
```

### Step 2: Execute Site Audit

```bash
npx @karis-ai/cli chat --skill aeo-geo "Run a GEO site audit for [domain]. Analyze:
- AI crawler accessibility (robots.txt, llms.txt, sitemap)
- Content structure (headings, depth, scannability)
- Semantic relevance (keyword coverage, topical depth)
- Structured data (Schema.org, JSON-LD)
- User intent alignment (Q&A coverage, journey stages)
Calculate a GEO Score (0-100) and provide prioritized improvements."
```

### Step 3: Present Results

**Output format:**

```markdown
## GEO Site Audit — [Domain]

### GEO Score: XX/100

| Category | Score | Weight | Status |
|----------|-------|--------|--------|
| AI Crawler Accessibility | XX/100 | 15% | ✅/⚠️/❌ |
| Content Structure | XX/100 | 20% | ✅/⚠️/❌ |
| Semantic Relevance | XX/100 | 25% | ✅/⚠️/❌ |
| Structured Data | XX/100 | 20% | ✅/⚠️/❌ |
| User Intent Alignment | XX/100 | 20% | ✅/⚠️/❌ |

### Score Interpretation
- 80-100: ✅ Excellent
- 60-79: ⚠️ Good (needs improvement)
- 40-59: ⚠️ Needs work
- 0-39: ❌ Critical

### AI Crawler Configuration
- robots.txt: [status]
- llms.txt: [status]
- sitemap.xml: [status]
- Schema.org: [status]

### Priority Improvements

**🔴 High Priority:**
1. [Critical fix]
2. [Critical fix]

**🟡 Medium Priority:**
1. [Enhancement]
2. [Enhancement]
```

---

## Mode 3: Content Strategy

```
Task Progress:
- [ ] Step 1: Load brand context
- [ ] Step 2: Execute content strategy analysis
- [ ] Step 3: Present topic clusters and content plan
```

### Step 1: Load Brand Context

```bash
npx @karis-ai/cli brand show
```

### Step 2: Execute Content Strategy Analysis

```bash
npx @karis-ai/cli chat --skill aeo-geo "Analyze content strategy for [domain] for AI search optimization. Include:
- Map all major content (product, blog, docs, case studies)
- Identify 3-7 topic clusters with primary keywords
- For each cluster: existing content, content gaps, AI citation potential
- Recommend content pillars with specific titles and formats
- Prioritize by GEO value (which content would AI engines most likely cite)"
```

### Step 3: Present Results

```markdown
## GEO Content Strategy — [Domain]

### Content Audit
- Pages analyzed: [count]
- Existing themes: [list]
- Content gaps: [list]

### Topic Clusters (3-7)

**Cluster 1: [Name]**
- Primary keywords: [4-6 keywords]
- Existing content: [pages that belong]
- Content gaps: [topics to fill]
- AI citation potential: [high/medium/low] — [why]

### Content Pillars

**Pillar 1: [Specific Title]**
- Focus: [aspect addressed]
- Sub-topics: [3-5 supporting pieces]
- GEO value: [why AI would cite this]
- Format: [guide/comparison/FAQ/how-to]

### Strategic Recommendations (Prioritized)
1. [Specific content to create]
2. [Structural improvement]
3. [Competitive positioning content]
```

---

## Mode 4: Full Audit

Run all three audits together:

```bash
npx @karis-ai/cli chat --skill aeo-geo "Run a full GEO audit for [brand/domain]. Include:
1. Visibility audit — Am I being mentioned by AI search engines?
2. Site audit — Is my website optimized for AI engines?
3. Content strategy — What content should I create?
Provide a combined report with overall score and action plan."
```

**Output format:**

```markdown
## Full GEO Audit — [Brand Name]

### Part 1: Visibility
- Answer Share: X%
- Citation Rate: X%
- Gap Topics: X

### Part 2: Site Readiness
- GEO Score: XX/100
- Top issue: [biggest problem]

### Part 3: Content Strategy
- Topic clusters: X identified
- Content gaps: X topics to fill
- Top priority: [highest-impact content to create]

### Combined Action Plan
1. [Highest impact action]
2. [Second highest]
3. [Third highest]
```

---

## Scoring Reference

### AI Crawler Accessibility (15%)

| Score | Criteria |
|-------|----------|
| 90-100 | All AI crawlers allowed, comprehensive llms.txt, complete sitemap |
| 70-89 | Most crawlers allowed, basic llms.txt |
| 50-69 | Not specified (implicit allow), no llms.txt |
| Below 50 | Major crawlers blocked |

### Content Structure (20%)

| Score | Criteria |
|-------|----------|
| 90-100 | Clean H1-H3 hierarchy, 1500+ word depth, scannable |
| 70-89 | Good structure, adequate depth |
| 50-69 | Inconsistent headings, thin content |
| Below 50 | No structure, very thin |

### Semantic Relevance (25%)

| Score | Criteria |
|-------|----------|
| 90-100 | Strong keyword coverage, topical authority, related terms |
| 70-89 | Good coverage, some gaps |
| 50-69 | Basic coverage, missing related topics |
| Below 50 | Off-topic or keyword-stuffed |

### Structured Data (20%)

| Score | Criteria |
|-------|----------|
| 90-100 | Rich JSON-LD (Organization, FAQ, Product), tables, lists |
| 70-89 | Basic schema, some structured elements |
| 50-69 | Minimal schema |
| Below 50 | No structured data |

### User Intent Alignment (20%)

| Score | Criteria |
|-------|----------|
| 90-100 | Covers all journey stages, Q&A format, addresses pain points |
| 70-89 | Good coverage, some intent gaps |
| 50-69 | Partial coverage |
| Below 50 | Misaligned with user intent |

---

## Best Practices

1. **Run visibility audit first** — Know where you stand before optimizing
2. **Check competitors** — Your GEO score means nothing without context
3. **Fix crawlers first** — If AI can't reach your site, nothing else matters
4. **Focus on gaps** — Topics where competitors appear but you don't
5. **Re-audit monthly** — Track progress over time

## Quality Checklist

### Visibility Audit
- [ ] Brand context loaded (brand profile or user input)
- [ ] 10-20 test prompts generated from topic clusters
- [ ] All 5 visibility metrics measured (Answer Share, Citation Rate, Mention Position, Sentiment, Gap Topics)
- [ ] Gap topics identified (where competitors appear but brand doesn't)
- [ ] 3 prioritized recommendations provided

### Site Audit
- [ ] AI crawler config checked (robots.txt, llms.txt, sitemap)
- [ ] All 5 categories scored with rationale
- [ ] Overall score calculated correctly
- [ ] High/Medium priority improvements listed

### Content Strategy
- [ ] 3-7 topic clusters identified with 4-6 keywords each
- [ ] Content pillars with specific recommendations
- [ ] GEO value explained for each pillar
- [ ] 5-7 strategic recommendations prioritized

## Common Pitfalls

1. **Skipping AI crawler check** — Always check robots.txt and llms.txt first
2. **Scoring too generously** — Be critical and realistic
3. **Generic recommendations** — Be specific with content titles
4. **Missing structured data check** — Always view page source for JSON-LD
5. **Under-length output** — Aim for 2,500+ words in reports

## Examples

See [examples/](examples/) for sample audit reports.

## Related Skills

- **brand-intel**: Build brand profile before auditing
- **page-seo**: Optimize individual pages for traditional search engines (Google, Bing)
- **reddit-listening**: Understand brand perception on Reddit
