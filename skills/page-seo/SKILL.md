---
name: page-seo
description: Optimize a webpage for traditional search engines (Google, Bing). Covers keyword research, competitor page analysis, on-page SEO audit with scoring, content optimization, and schema markup recommendations. Use when users ask about SEO scores, title tags, meta descriptions, keyword optimization, heading structure, internal linking, or structured data for search engines.
metadata:
  version: 1.0.0
  author: karis-ai
---

# Page SEO

Optimize a single webpage for traditional search engines. Core question: "How well does this page rank for its target keyword, and what should we fix?"

## When to Use

| User Says | Use This Skill |
|-----------|----------------|
| "Optimize this page for SEO" | page-seo |
| "What's my SEO score?" | page-seo |
| "Help me rank for [keyword]" | page-seo |
| "Audit my page's on-page SEO" | page-seo |
| "Fix my title tag / meta description" | page-seo |
| "Add schema markup to my page" | page-seo |
| "What keywords should I target?" | page-seo |
| "Why isn't my page ranking?" | page-seo |
| "Analyze competitor pages for [keyword]" | page-seo |

## Prerequisites

- Karis CLI installed (`npx @karis-ai/cli`) — optional but recommended
- Karis API key configured (`karis setup`) — optional
- Brand profile created (`karis brand init`) — optional, provides context

## Workflow

```
Task Progress:
- [ ] Step 1: Keyword Research
- [ ] Step 2: Competitor Page Analysis
- [ ] Step 3: On-Page SEO Audit
- [ ] Step 4: Content Optimization
```

### Step 1: Keyword Research

Extract the target keyword from user context. Identify related terms and search intent.

**What to determine:**
- **Primary keyword**: The main term the page should rank for
- **Secondary keywords**: 3-5 related terms and long-tail variations
- **Search intent**: Informational, navigational, commercial, or transactional
- **Estimated difficulty**: Low / Medium / High (based on SERP competition)

**Optional CLI command:**
```bash
npx @karis-ai/cli chat --skill page-seo "Research keywords for [topic]. Include:
- Primary keyword recommendation
- 5 secondary/long-tail keywords
- Search intent classification
- Difficulty assessment based on SERP competition"
```

**Output:**

| Keyword | Type | Intent | Difficulty |
|---------|------|--------|------------|
| [primary] | Primary | [intent] | [low/med/high] |
| [secondary 1] | Secondary | [intent] | [low/med/high] |
| [secondary 2] | Long-tail | [intent] | [low/med/high] |

### Step 2: Competitor Page Analysis

Analyze the top 5 ranking pages for the target keyword to identify gaps and opportunities.

**What to analyze per competitor:**
- Title tag and meta description approach
- Heading structure (H1, H2, H3 hierarchy)
- Content depth and word count
- Unique angles or topics covered
- Internal/external linking strategy
- Schema markup used
- Content freshness (publish/update dates)

**Optional CLI command:**
```bash
npx @karis-ai/cli chat --skill page-seo "Analyze top 5 ranking pages for '[keyword]'. For each:
- Title and meta description
- Heading structure
- Content depth and word count
- Unique angles covered
- Schema markup used
Identify content gaps and opportunities."
```

**Output:**

```markdown
## Competitor Analysis — "[keyword]"

### Top 5 Pages

| # | Page | Word Count | Headings | Schema | Unique Angle |
|---|------|-----------|----------|--------|--------------|
| 1 | [url] | [count] | [count] | [type] | [angle] |
| 2 | [url] | [count] | [count] | [type] | [angle] |
| 3 | [url] | [count] | [count] | [type] | [angle] |
| 4 | [url] | [count] | [count] | [type] | [angle] |
| 5 | [url] | [count] | [count] | [type] | [angle] |

### Content Gaps
- [Topic/angle missing from most competitors]
- [Question not answered by any competitor]
- [Data point or example no one provides]

### Opportunities
- [How to differentiate]
- [Underserved subtopic]
```

### Step 3: On-Page SEO Audit

Score the page across 10 on-page SEO factors. Generate a score from 0-100.

**Scoring Rubric:**

| Factor | Weight | What to Check |
|--------|--------|---------------|
| Title Tag | 15% | Contains keyword, 50-60 chars, compelling |
| Meta Description | 15% | Contains keyword, 150-160 chars, includes CTA |
| H1 Tag | 10% | Single H1, contains keyword, matches title intent |
| Heading Structure | 10% | Logical H2-H3 hierarchy, keywords in subheadings |
| Image Optimization | 10% | Alt text with keywords, compressed, descriptive filenames |
| Internal Links | 10% | 3+ relevant internal links, descriptive anchor text |
| External Links | 5% | 1-2 authoritative outbound links, opens in new tab |
| Social Meta | 10% | Open Graph tags, Twitter Card, proper images |
| Content Quality | 10% | Adequate length (1500+), covers topic depth, readable |
| Keyword Presence | 5% | In first 100 words, URL, naturally distributed |

**Per-factor scoring:**
- **9-10**: Excellent — fully optimized
- **7-8**: Good — minor improvements possible
- **5-6**: Needs work — clear issues to fix
- **3-4**: Poor — significant problems
- **0-2**: Missing or critically broken

**E-E-A-T Signals Checklist:**
- [ ] Author byline with credentials
- [ ] Author bio page linked
- [ ] Sources cited for claims
- [ ] Publication/update dates visible
- [ ] About page accessible
- [ ] Contact information available
- [ ] First-hand experience demonstrated
- [ ] Unique data, screenshots, or examples

**Optional CLI command:**
```bash
npx @karis-ai/cli chat --skill page-seo "Audit this page for on-page SEO: [URL or paste content].
Score each factor out of 10:
Title Tag, Meta Description, H1, Heading Structure, Image Optimization,
Internal Links, External Links, Social Meta, Content Quality, Keyword Presence.
Calculate overall SEO Score (0-100)."
```

**Output:**

```markdown
## On-Page SEO Audit — [Page Title]

### SEO Score: XX/100

| Factor | Weight | Score | Status | Issue |
|--------|--------|-------|--------|-------|
| Title Tag | 15% | X/10 | ✅/⚠️/❌ | [issue or "OK"] |
| Meta Description | 15% | X/10 | ✅/⚠️/❌ | [issue or "OK"] |
| H1 Tag | 10% | X/10 | ✅/⚠️/❌ | [issue or "OK"] |
| Heading Structure | 10% | X/10 | ✅/⚠️/❌ | [issue or "OK"] |
| Image Optimization | 10% | X/10 | ✅/⚠️/❌ | [issue or "OK"] |
| Internal Links | 10% | X/10 | ✅/⚠️/❌ | [issue or "OK"] |
| External Links | 5% | X/10 | ✅/⚠️/❌ | [issue or "OK"] |
| Social Meta | 10% | X/10 | ✅/⚠️/❌ | [issue or "OK"] |
| Content Quality | 10% | X/10 | ✅/⚠️/❌ | [issue or "OK"] |
| Keyword Presence | 5% | X/10 | ✅/⚠️/❌ | [issue or "OK"] |

### E-E-A-T Assessment
- [Present/missing signals]

### Priority Fixes
1. 🔴 [Critical fix]
2. 🟡 [Medium priority fix]
3. 🟢 [Nice to have]
```

### Step 4: Content Optimization

Based on the audit and competitor analysis, optimize the page content.

**What to optimize:**
- Rewrite title tag and meta description
- Fix heading structure
- Add missing keyword placements (naturally)
- Suggest internal/external links to add
- Recommend schema markup type (see [references/schema-templates.md](references/schema-templates.md))
- Improve E-E-A-T signals

**Optional CLI command:**
```bash
npx @karis-ai/cli chat --skill page-seo "Optimize this content for '[keyword]'. Based on the audit:
- Rewrite title tag and meta description
- Fix heading structure
- Add keyword placements naturally
- Suggest internal and external links
- Recommend schema markup type
- Improve E-E-A-T signals"
```

**Output:**

```markdown
## Content Optimization — [Page Title]

### Rewritten Meta Tags
- **Title**: [new title, 50-60 chars]
- **Meta Description**: [new description, 150-160 chars]

### Heading Structure (Revised)
- H1: [heading]
  - H2: [heading]
    - H3: [heading]
  - H2: [heading]
  - H2: [heading]

### Keyword Placements
- First paragraph: [suggestion]
- Subheadings: [which H2s to include keyword]
- Image alt text: [suggestions]

### Links to Add
**Internal:**
- [anchor text] → [target page]
- [anchor text] → [target page]

**External:**
- [anchor text] → [authoritative source]

### Recommended Schema
- Type: [Article/Product/FAQ/HowTo/etc.]
- See template: [references/schema-templates.md](references/schema-templates.md)

### E-E-A-T Improvements
- [Specific recommendation]
- [Specific recommendation]
```

## Output Format

Final combined report:

```markdown
# Page SEO Report — [Page Title]
**Target Keyword:** [keyword]
**Date:** [date]

## SEO Score: XX/100

## Keyword Research
[Step 1 output]

## Competitor Analysis
[Step 2 output]

## On-Page Audit
[Step 3 output]

## Optimization Plan
[Step 4 output]

## Next Steps
1. [Most impactful change]
2. [Second priority]
3. [Third priority]
```

## Scoring Reference

### Score Calculation

Overall SEO Score = Sum of (factor_score / 10 * weight * 100)

| Factor | Weight |
|--------|--------|
| Title Tag | 15% |
| Meta Description | 15% |
| H1 Tag | 10% |
| Heading Structure | 10% |
| Image Optimization | 10% |
| Internal Links | 10% |
| External Links | 5% |
| Social Meta | 10% |
| Content Quality | 10% |
| Keyword Presence | 5% |

### Score Interpretation

| Score | Rating | Meaning |
|-------|--------|---------|
| 90-100 | Excellent | Page is well-optimized, focus on content freshness |
| 75-89 | Good | Minor improvements needed, competitive for most keywords |
| 60-74 | Needs Work | Clear gaps affecting ranking potential |
| 40-59 | Poor | Significant on-page issues, unlikely to rank |
| 0-39 | Critical | Major SEO problems, needs complete overhaul |

## Best Practices

1. **Start with keyword research** — Don't optimize without knowing what to optimize for
2. **Check competitors first** — Understand what's already ranking before writing
3. **Fix technical issues before content** — Title tags and meta descriptions are quick wins
4. **Write for users, optimize for engines** — Keyword stuffing hurts rankings
5. **One primary keyword per page** — Avoid keyword cannibalization across pages
6. **Update regularly** — Search engines favor fresh, maintained content
7. **Measure after changes** — Track ranking position changes after optimization
8. **Use schema markup** — Structured data improves rich snippet eligibility

## Related Skills

- **aeo-geo**: Optimize for AI search engines (ChatGPT, Perplexity, Claude) — complementary to traditional SEO
- **brand-intel**: Establish brand context before page-level optimization
- **reddit-growth**: Drive initial traffic and backlinks to optimized pages
