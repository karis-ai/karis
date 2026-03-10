---
name: reddit-growth
description: Generate Reddit growth content including viral posts, comment strategies, and engagement plans. Use when founders or marketers want to create Reddit content for brand awareness, product launches, or community building. Works by calling Karis CLI which provides content strategy, post drafts, and engagement recommendations.
metadata:
  version: 1.0.0
  author: karis-ai
---

# Reddit Growth

Generate Reddit growth content using Karis CLI — posts, comments, and engagement strategies.

## When to Use

| User Says | Use This Skill |
|-----------|----------------|
| "Write a Reddit post for my product" | reddit-growth |
| "Help me go viral on Reddit" | reddit-growth |
| "Find threads to comment on" | reddit-growth |
| "Create a Reddit launch strategy" | reddit-growth |
| "Reddit growth advice" | reddit-growth |

## Prerequisites

- Karis CLI installed (`npx karis`)
- Karis API key configured (`karis setup`)
- Optional: Reddit account for karma checking

## Workflow

Copy this checklist and track progress:

```
Task Progress:
- [ ] Step 1: Determine content mode
- [ ] Step 2: Gather product/context info
- [ ] Step 3: Research relevant subreddits
- [ ] Step 4: Generate content via Karis CLI
- [ ] Step 5: Provide engagement strategy
```

### Step 1: Determine Content Mode

Ask the user which mode:

- **Mode 1: Post only** — Generate a Reddit post
- **Mode 2: Comment only** — Find threads to engage with
- **Mode 3: Both** — Generate a post AND find comment opportunities

If user says "write a post" or "go viral," infer the mode directly.

### Step 2: Gather Product Info

Collect these inputs:

**Required:**
1. **Product/Brand name** — What's being promoted?
2. **Product URL or description** — What does it do?

**Optional:**
- Target audience
- Key differentiators
- Specific subreddits (if any)
- Goal (awareness, signups, feedback)

### Step 3: Research Relevant Subreddits

Find relevant communities via Karis:

```bash
npx karis chat "Find Reddit communities discussing [industry/topic]. Include member counts and activity levels."
```

Select subreddits based on:
- Relevance to product
- Member count (bigger = more reach, more competition)
- Activity level
- Rules and restrictions

### Step 4: Generate Content via Karis CLI

**Generate a Post:**
```bash
npx karis chat "Write a Reddit post for [product]. Context:
- Product: [description]
- Target audience: [who]
- Goal: [awareness/signups/feedback]
- Subreddit: r/[name]
- Include: hook, body, call-to-action"
```

**Find Comment Opportunities:**
```bash
npx karis chat "Find Reddit threads about [topic] where I can add value. Include:
- Relevant posts from last 7 days
- Suggested comment angles
- What not to do in comments"
```

**Create Full Strategy:**
```bash
npx karis chat "Create a Reddit growth strategy for [product]. Include:
- Best subreddits to target
- Post topic ideas
- Optimal posting times
- Comment engagement plan
- Karma building recommendations"
```

### Step 5: Provide Engagement Strategy

Karis CLI returns content. Add these recommendations:

**Post Timing:**
- Weekdays: 9am-12pm EST (highest engagement)
- Avoid Mondays (low) and weekends (variable)

**Title Formulas That Work:**
- "I built [X], here's what I learned"
- "[X] is dead, here's what's next"
- "Ask Me Anything about [X]"
- "[X] vs [Y] — which is better?"

**Comment Strategy:**
- Add value first, pitch second
- Don't pitch in the first comment
- Ask questions to continue conversation

## Output Format

### Post Draft
```markdown
## Reddit Post Draft: [Product Name]

### Subreddit
r/[subreddit] ([members] members)

### Title
[Attention-grabbing title]

### Body
[Post content with:
- Hook
- Story/Context
- Value provided
- Call-to-action]

### Tags
[Relevant tags]

### Best Time to Post
[Recommended timing]

### Notes
- [Any subreddit-specific considerations]
```

### Comment Draft
```markdown
## Comment Opportunities: [Topic]

### Thread 1: [Post Title]
- URL: [link]
- Angle: [unique perspective to add]
- Draft: [ready-to-copy comment]

### Thread 2: [Post Title]
- URL: [link]
- Angle: [unique perspective to add]
- Draft: [ready-to-copy comment]
```

### Growth Strategy
```markdown
## Reddit Growth Strategy: [Product]

### Recommended Subreddits
1. r/[name] — [reason] — [members]
2. r/[name] — [reason] — [members]

### Content Calendar
- Week 1: [Action plan]
- Week 2: [Action plan]
- Week 3: [Action plan]

### Karma Building
- [If karma < 50]: Warm-up plan included
- [If karma > 50]: Ready to post

### Key Do's and Don'ts
- ✅ Do: [recommendations]
- ❌ Don't: [warnings]
```

## Karma Guidelines

Include this based on user's karma:

**Karma 0-50 (Warm-up required):**
```
⚠️ Your Reddit karma is low. Before posting product content:

Week 1-2: Build trust
- Comment on 3-5 posts daily in relevant subreddits
- Share value without pitching
- Aim for 10+ upvotes per comment

Week 3-4: Start soft posts
- Post non-product content in your niche
- Build credibility

Week 5+: Ready for product posts
```

**Karma 50-200:**
```
✅ You can post in most subreddits.
Avoid r/Entrepreneur and r/startups main feed initially.
```

**Karma 200+:**
```
✅ Full access to all subreddits.
```

## Best Practices

1. **Always check subreddit rules** before posting
2. **Don't pitch immediately** — provide value first
3. **Use authentic voice** — Reddit users detect spam
4. **Time your posts** — Weekday mornings EST best
5. **Engage before promoting** — Comment first, post later
6. **Track results** — Note which posts/subreddits work

## Browser Extension (Future)

The Karis browser extension can help:
- One-click import drafts to Reddit
- Track post performance
- Monitor comments on your posts

## Examples

See [examples/](examples/) for sample posts and strategies.

## Related Skills

- **reddit-listening**: Analyze Reddit discussions before creating content
- **brand-intel**: Build brand context before growth strategy
