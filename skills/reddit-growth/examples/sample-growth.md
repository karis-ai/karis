# Reddit Growth Examples

## Example 1: Product Launch Post

**User Request:**
> "Write a Reddit post to launch my AI coding assistant"

**Agent Action:**
```bash
npx karis chat --skill reddit-growth "Write a Reddit post for my AI coding assistant. Context:
- Product: AI pair programmer that reviews PRs
- Target: Developers
- Goal: Signups and feedback
- Subreddit: r/programming
- Include hook, story, features, CTA"
```

**Sample Output:**
```markdown
## Reddit Post Draft: AI Coding Assistant

### Subreddit
r/programming (5.4M members)

### Title
I built an AI that reviews PRs so you don't have to — here's what it found

### Body
After 6 months of debugging and 47 cups of coffee, I finally shipped my AI code reviewer.

**The problem:** My team spent 3 hours/day reviewing PRs. That's 15 hours/week of my life I'll never get back.

**What it does:**
- Reviews PRs in < 30 seconds
- Catches bugs before they hit production
- Suggests improvements with code examples
- Learns from your team's coding style

**The weirdest bug it found:** A variable named `x` that had been causing silent failures for 2 years.

Try it free: [URL]

AMA about building AI tools for developers.

### Tags
- ai, programming, tools, opensource

### Best Time to Post
Tuesday 10am EST (highest engagement in r/programming)

### Notes
- r/programming allows personal projects on Showoff Saturday
- Avoid excessive self-promotion (follow 10:1 rule)
```

---

## Example 2: Comment Strategy

**User Request:**
> "Find threads about no-code tools I can comment on"

**Agent Action:**
```bash
npx karis chat --skill reddit-growth "Find Reddit threads about no-code tools from last 7 days. Include comment angles and draft responses."
```

**Sample Output:**
```markdown
## Comment Opportunities: No-Code Tools

### Thread 1: "Why I switched from Airtable to Notion"
- URL: reddit.com/r/productivity/comments/...
- Upvotes: 234
- Angle: Share a different perspective on the trade-offs

**Draft Comment:**
> Interesting choice! We went the opposite direction — Notion for personal, Airtable for the complex stuff.
>
> The real winner for us was figuring out when to use each: Notion = docs & wikis, Airtable = anything with relationships.
>
> What made you consolidate?

### Thread 2: "Best no-code tools for MVP?"
- URL: reddit.com/r/startups/comments/...
- Upvotes: 567
- Angle: Practical, experience-based recommendations

**Draft Comment:**
> Built 3 MVPs with no-code this year:
>
> - **Bubble**: Full web apps, steeper learning curve
> - **Glide**: Fastest for mobile, limited to simple data
> - **Retool**: Internal tools, great for dashboards
>
> Happy to share more details about any of these.

---

## Example 3: Full Growth Strategy

**User Request:**
> "Create a Reddit growth strategy for my B2B SaaS"

**Agent Action:**
```bash
npx karis chat --skill reddit-growth "Create a Reddit growth strategy for my B2B SaaS. Product: AI meeting assistant for sales teams."
```

**Sample Output:**
```markdown
## Reddit Growth Strategy: AI Meeting Assistant

### Recommended Subreddits

| Subreddit | Members | Reason | Priority |
|-----------|---------|--------|----------|
| r/sales | 89K | Direct target audience | High |
| r/startups | 1.2M | Early adopters | High |
| r/b2b | 45K | B2B context | Medium |
| r/artificial | 780K | AI interest | Medium |
| r/SaaS | 62K | Product context | High |

### Content Calendar

**Week 1-2: Build presence**
- Comment on 3-5 posts daily in r/sales
- Share insights without pitching
- Target: 10+ karma per comment

**Week 3-4: Soft content**
- Post: "Mistakes I made building an AI sales tool"
- Comment on threads about AI in sales
- Target: 50+ karma

**Week 5+: Product launch**
- Launch post in r/startups (Showoff Saturday)
- Cross-post to r/sales
- Target: 200+ upvotes

### Karma Building (If karma < 50)

**Day 1-7:**
- Comment on popular posts in target subreddits
- Share useful resources
- Avoid any product mentions

**Day 8-14:**
- Answer questions where you have expertise
- Provide value consistently

**Day 15+:**
- Ready for product content

### Key Do's and Don'ts

✅ **Do:**
- Lead with value, not pitch
- Be authentic about your journey
- Engage before promoting
- Follow subreddit rules

❌ **Don't:**
- Spam across multiple subreddits
- Pitch in first comment
- Use clickbait titles
- Ignore community feedback
```
