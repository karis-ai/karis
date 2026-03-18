---
name: reddit-listening
description: Analyze Reddit discussions for brand intelligence, competitor insights, and community sentiment. Use when users want to understand Reddit conversations about their brand, track competitor mentions, discover community pain points, analyze sentiment trends, or monitor brand health on Reddit. Works by calling Karis CLI which connects to Reddit data via Karis API.
metadata:
  version: 2.0.0
  author: karis-ai
---

# Reddit Listening

Monitor and analyze Reddit conversations for brand intelligence, competitive insights, and community sentiment.

## When to Use

| User Says | Use This Skill |
|-----------|----------------|
| "What are people saying about my brand on Reddit?" | reddit-listening |
| "Compare my brand to competitors on Reddit" | reddit-listening |
| "Find Reddit communities discussing [topic]" | reddit-listening |
| "Track complaints about my product on Reddit" | reddit-listening |
| "Analyze sentiment about my brand on Reddit" | reddit-listening |
| "What pricing feedback exists on Reddit?" | reddit-listening |
| "What content formats work in my space on Reddit?" | reddit-listening |

## Prerequisites

- Karis CLI installed (`npx karis`)
- Karis API key configured (`karis setup`)
- Brand profile created (`karis brand init`)

## Workflow

```
Task Progress:
- [ ] Step 1: Resolve brand context
- [ ] Step 2: Determine analysis type
- [ ] Step 3: Execute via Karis CLI
- [ ] Step 4: Present results
```

### Step 1: Resolve Brand Context

**Resolution order** — use the first available:
1. User-provided brand name/domain in the current message
2. Brand profile from `npx karis brand show`
3. Ask the user for brand name and domain

**Critical constraints:**
- The brand name provided by the user is the source of truth — never modify or "correct" it
- All URLs in results must be clickable (full Reddit URLs, not truncated)
- Never fabricate Reddit data — if no results found, say so

```bash
npx karis brand show
```

If no brand profile exists:
```bash
npx karis brand init <domain>
```

### Step 2: Determine Analysis Type

| User Need | Analysis Type |
|-----------|--------------|
| Brand sentiment | Brand Analysis — overall perception and mention tracking |
| Competitor comparison | Competitive Analysis — side-by-side sentiment |
| Community discovery | Subreddit Discovery — find communities where audience lives |
| Complaint tracking | Issue Monitoring — surface pain points and feature requests |
| Audience insights | Audience Analysis — understand who's talking and what they care about |
| Pricing feedback | Pricing Analysis — pricing pain points and expectations |
| Content ideas | Content Preference — what formats and topics resonate |

### Step 3: Execute via Karis CLI

**Brand Sentiment Analysis:**
```bash
npx karis chat --skill reddit-listening "Analyze Reddit sentiment for [brand]. Include:
- Overall sentiment (positive/negative/neutral) with percentage breakdown
- Top mentioned topics with mention counts
- Common pain points (direct quotes from users)
- Key subreddits where brand is discussed
- Trending discussions from last 30 days"
```

**Competitor Comparison:**
```bash
npx karis chat --skill reddit-listening "Compare [brand_a] vs [brand_b] on Reddit. Include:
- Mention volume comparison (with counts)
- Sentiment comparison (side-by-side)
- Feature comparisons from actual user discussions
- Gap topics where competitor is discussed but we're not
- Direct user quotes for each brand"
```

**Subreddit Discovery:**
```bash
npx karis chat --skill reddit-listening "Find Reddit communities discussing [topic]. Include:
- Relevant subreddits with member counts and activity levels
- Content themes in each community
- Posting guidelines and restrictions
- Engagement patterns (best times, formats)
- Which subreddits overlap (shared audience)"
```

**Complaint Tracking:**
```bash
npx karis chat --skill reddit-listening "Track complaints about [brand] on Reddit. Include:
- Common complaint themes with frequency
- Severity assessment (critical/moderate/minor)
- Affected user segments
- Direct user quotes (verbatim)
- Comparison to competitor complaint patterns"
```

**Audience Analysis:**
```bash
npx karis chat --skill reddit-listening "Analyze Reddit audience for [brand]. Include:
- Who's talking (demographics, roles, experience levels)
- Pain points and unmet needs
- Language patterns and tone
- Power users and influencers in the space
- What topics generate the most engagement"
```

**Pricing Analysis:**
```bash
npx karis chat --skill reddit-listening "Analyze Reddit discussions about pricing in [brand]'s space. Include:
- Price sensitivity signals
- Willingness-to-pay indicators
- Competitor pricing complaints
- 'Too expensive' vs 'worth it' sentiment ratio
- Feature-to-price expectations"
```

**Content Preference Analysis:**
```bash
npx karis chat --skill reddit-listening "Analyze what content performs best for [brand]'s category on Reddit. Include:
- Top-performing post formats (demo, story, data, question)
- Engagement patterns by content type
- What gets upvoted vs what gets comments
- Community content preferences by subreddit"
```

### Step 4: Present Results

```markdown
## Reddit Listening: [Brand Name]

### Overview
- Analysis period: [timeframe]
- Data sources: [subreddits analyzed]
- Total mentions: [count]

### Key Findings
1. [Finding 1 — with specific data]
2. [Finding 2 — with specific data]
3. [Finding 3 — with specific data]

### Sentiment Breakdown
- Positive: X% — [top positive theme]
- Neutral: Y% — [context]
- Negative: Z% — [top negative theme]

### Top Topics
1. [Topic 1] — [mention count] — [sentiment]
2. [Topic 2] — [mention count] — [sentiment]
3. [Topic 3] — [mention count] — [sentiment]

### User Quotes
> "[Direct quote from Reddit user]" — r/[subreddit], [upvotes] upvotes
> "[Direct quote]" — r/[subreddit], [upvotes] upvotes

### Actionable Insights
- [Insight 1 — with recommended action]
- [Insight 2 — with recommended action]

### Recommended Next Steps
1. [Action] — use `karis chat "[command]"`
2. [Action] — use `karis chat "[command]"`
```

## Advanced Usage

### Multi-Brand Comparison

```bash
npx karis chat --skill reddit-listening "Compare [brand_a], [brand_b], and [brand_c] on Reddit.
Show mention volume, sentiment, and key differentiators."
```

### Time-Based Analysis

```bash
npx karis chat --skill reddit-listening "Analyze Reddit sentiment for [brand] over the past 3 months.
Show trends and significant events."
```

### Topic-Specific Deep Dive

```bash
npx karis chat --skill reddit-listening "Analyze Reddit discussions about [brand]'s [feature/product].
Include user feedback, feature requests, and comparison to alternatives."
```

## Output Files

Karis CLI automatically saves analysis results:

- Reports: `.karis/reports/reddit-listening-[brand]-[date].md`
- Raw data: `.karis/data/reddit-[brand]-[date].csv`

## Best Practices

1. **Resolve brand context first** — always start with `karis brand show`
2. **Be specific** — include specific topics or features in queries
3. **Set timeframes** — specify time ranges for trend analysis
4. **Compare strategically** — focus on 2-3 competitors max
5. **Preserve user quotes** — direct quotes are the most valuable output
6. **Follow up** — use insights to inform reddit-growth actions

## Limitations

- Analysis depends on Karis API data availability
- Reddit data may have delays (typically 24-48 hours)
- Private subreddits are not accessible
- Deleted posts/comments may not be included

## Related Skills

- **brand-intel**: Build brand profile before analysis
- **reddit-growth**: Create content based on listening insights
- **aeo-geo**: Measure AI search visibility (complements Reddit insights)
