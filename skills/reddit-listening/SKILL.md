---
name: reddit-listening
description: Analyze Reddit discussions for brand intelligence, competitor insights, and community sentiment. Use when users want to understand Reddit conversations about their brand, track competitor mentions, discover community pain points, analyze sentiment trends, or monitor brand health on Reddit. Works by calling Karis CLI which connects to Reddit data via Karis API.
metadata:
  version: 1.0.0
  author: karis-ai
---

# Reddit Listening

Monitor and analyze Reddit conversations for brand intelligence, competitive insights, and community sentiment using Karis CLI.

## When to Use

| User Says | Use This Skill |
|-----------|----------------|
| "What are people saying about my brand on Reddit?" | reddit-listening |
| "Compare my brand to competitors on Reddit" | reddit-listening |
| "Find Reddit communities discussing [topic]" | reddit-listening |
| "Track complaints about my product on Reddit" | reddit-listening |
| "Analyze sentiment about my brand on Reddit" | reddit-listening |

## Prerequisites

- Karis CLI installed (`npx karis`)
- Karis API key configured (`karis setup`)
- Brand profile created (`karis brand init`)

## Workflow

Copy this checklist and track progress:

```
Task Progress:
- [ ] Step 1: Resolve brand context
- [ ] Step 2: Determine analysis type
- [ ] Step 3: Execute via Karis CLI
- [ ] Step 4: Present results
```

### Step 1: Resolve Brand Context

Check if brand context exists:

```bash
npx karis brand show
```

If no brand profile exists, create one:

```bash
npx karis brand init <domain>
```

### Step 2: Determine Analysis Type

Select the appropriate analysis based on user needs:

| User Need | Analysis Type | Karis Command |
|-----------|--------------|---------------|
| Brand sentiment | Brand Analysis | `karis chat "analyze Reddit sentiment for [brand]"` |
| Competitor comparison | Competitive Analysis | `karis chat "compare [brand] vs [competitor] on Reddit"` |
| Community discovery | Subreddit Discovery | `karis chat "find Reddit communities discussing [topic]"` |
| Complaint tracking | Issue Monitoring | `karis chat "track complaints about [brand] on Reddit"` |
| Audience insights | Audience Analysis | `karis chat "analyze Reddit audience for [brand]"` |

### Step 3: Execute via Karis CLI

All Reddit intelligence queries go through `karis chat`:

**Brand Sentiment Analysis:**
```bash
npx karis chat "Analyze Reddit sentiment for [brand]. Include:
- Overall sentiment (positive/negative/neutral)
- Top mentioned topics
- Common pain points
- Trending discussions
- Key subreddits where brand is discussed"
```

**Competitor Comparison:**
```bash
npx karis chat "Compare [brand_a] vs [brand_b] on Reddit. Include:
- Mention volume comparison
- Sentiment comparison
- Feature comparisons from user discussions
- Competitive advantages mentioned
- Gap topics where competitor is discussed but we're not"
```

**Subreddit Discovery:**
```bash
npx karis chat "Find Reddit communities discussing [topic]. Include:
- Relevant subreddits with member counts
- Activity levels
- Content themes
- Posting guidelines
- Engagement patterns"
```

**Complaint Tracking:**
```bash
npx karis chat "Track complaints about [brand] on Reddit. Include:
- Common complaint themes
- Severity and frequency
- Affected user segments
- Resolution status
- Trending issues"
```

**Audience Analysis:**
```bash
npx karis chat "Analyze Reddit audience for [brand]. Include:
- Demographics and interests
- Pain points and needs
- Language and tone
- Influencers and power users
- Community dynamics"
```

### Step 4: Present Results

Karis CLI returns structured analysis. Present key findings to the user:

**Format:**
```markdown
## Reddit Listening: [Brand Name]

### Overview
- Analysis period: [timeframe]
- Data sources: [subreddits analyzed]
- Total mentions: [count]

### Key Findings
1. [Finding 1]
2. [Finding 2]
3. [Finding 3]

### Sentiment Breakdown
- Positive: X%
- Neutral: Y%
- Negative: Z%

### Top Topics
1. [Topic 1] - [mention count]
2. [Topic 2] - [mention count]
3. [Topic 3] - [mention count]

### Actionable Insights
- [Insight 1]
- [Insight 2]
- [Insight 3]

### Recommended Actions
1. [Action 1]
2. [Action 2]
```

## Advanced Usage

### Multi-Brand Comparison

Compare multiple competitors:

```bash
npx karis chat "Compare [brand_a], [brand_b], and [brand_c] on Reddit.
Show mention volume, sentiment, and key differentiators."
```

### Time-Based Analysis

Track sentiment over time:

```bash
npx karis chat "Analyze Reddit sentiment for [brand] over the past 3 months.
Show trends and significant events."
```

### Topic-Specific Analysis

Focus on specific topics:

```bash
npx karis chat "Analyze Reddit discussions about [brand]'s [feature/product].
Include user feedback and feature requests."
```

## Output Files

Karis CLI automatically saves analysis results:

- Reports: `.karis/reports/reddit-listening-[brand]-[date].md`
- Raw data: `.karis/data/reddit-[brand]-[date].csv`

Access saved files:

```bash
ls .karis/reports/
cat .karis/reports/reddit-listening-[brand]-[date].md
```

## Best Practices

1. **Be Specific**: Include specific topics or features in your queries
2. **Set Timeframes**: Specify time ranges for trend analysis
3. **Compare Strategically**: Focus on 2-3 competitors max for clarity
4. **Follow Up**: Use insights to ask deeper questions
5. **Track Over Time**: Run regular analyses to spot trends

## Limitations

- Analysis depends on Karis API data availability
- Reddit data may have delays (typically 24-48 hours)
- Private subreddits are not accessible
- Deleted posts/comments may not be included

## Examples

See [examples/](examples/) for sample analyses and reports.

## Related Skills

- **brand-intel**: Build brand profile before analysis
- **aeo-geo**: Measure AI search visibility (complements Reddit insights)
