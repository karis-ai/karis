---
name: reddit-growth
description: Generate Reddit growth content including viral posts, comment strategies, and engagement plans. Use when founders or marketers want to create Reddit content for brand awareness, product launches, or community building. Works by calling Karis CLI which provides content strategy, post drafts, and engagement recommendations.
metadata:
  version: 2.0.0
  author: karis-ai
---

# Reddit Growth

Generate Reddit growth content — posts, comments, and engagement strategies.

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
- Optional: Brand profile (`karis brand init`)

## Workflow

```
Task Progress:
- [ ] Step 1: Choose mode
- [ ] Step 2: Collect inputs (karma, product)
- [ ] Step 3: Generate content
- [ ] Step 4: Review with pre-flight checklist
```

### Step 1: Choose Mode

- **Mode 1: Post only** — Generate a Reddit post
- **Mode 2: Comment only** — Find threads to engage with
- **Mode 3: Both** — Generate a post AND find comment opportunities

If user says "write a post" or "go viral," infer the mode directly.

### Step 2: Collect Inputs

**Required:**
1. **Karma** — determines what you can post and where
2. **Product URL or description** — what's being promoted

**Optional:** target audience, key differentiators, specific subreddits, goal (awareness/signups/feedback)

### Step 3: Generate Content

```bash
npx karis chat "Write a Reddit post for [product]. Context:
- Product: [description]
- Karma: [level]
- Target audience: [who]
- Goal: [awareness/signups/feedback]
- Follow the post formulas and subreddit rules from the reddit-growth skill."
```

---

## Karma Guidelines

**Karma 0-50 (Warm-up required):**

Do NOT generate a product post. Generate a warm-up plan first.

Real data: one account went from 0 to 132 Karma in 4 months, 40,000+ total views.

Week 1: Post 2-3 lightweight pieces. A pet photo in r/aww gets upvotes fast. A "let's promote each other" post in a founder subreddit got 3,970 views at 100% upvote rate. These establish account trust before professional content.

Week 2: Start professional content and comment actively. Find posts 1-3 hours old. Write real answers from personal experience.

Week 3+: Main focus on professional content. Occasional lightweight post mixed in.

What gets 100% upvote rate: pure value with zero promotion. 10 posts in real data hit 100% — all had no pitch. Posts with promotion dropped to 50-79%.

**Karma 50-200:** Most subreddits accessible. Avoid r/Entrepreneur and r/startups main feed initially.

**Karma 200+:** Full access to all subreddits.

---

## Subreddit Selection (Real Data)

| Subreddit | Top Post | Best For | Notes |
|-----------|----------|----------|-------|
| r/SideProject | 1345 upvotes | Any side project with a demo | Video/GIF required — every top post had one |
| r/buildinpublic | 871 upvotes | Journey stories, milestones | Emotion beats data. Cross-post to r/microsaas |
| r/microsaas | 446 upvotes | Milestone posts, MRR updates | Best cross-post partner for r/buildinpublic |
| r/SaaS | 798 upvotes, 756 comments | MRR milestones, failure lessons | Highest comment density. Real numbers required |
| r/indiehackers | 128 upvotes | Lessons, distribution tactics | Friday Share Fever thread has highest intent density |
| r/IMadeThis | 48 upvotes, 227 comments | Showcase threads, low-karma-friendly | Good for new accounts |
| r/Entrepreneur | 1180 upvotes | Personal stories, contrarian takes | No direct product plugs |
| r/alphaandbetausers | 51 upvotes | Beta testers, early adopters | Weekend Showcase thread is best entry |
| r/roastmystartup | 15 upvotes | Brutal feedback, validation | Low upvotes, highest comment quality |
| r/startups | 324 upvotes | Personal stories ONLY | Any product mention gets removed |
| r/InternetIsBeautiful | 6077 upvotes | Viral tool exposure | Only if: free, no signup, visually impressive |

**Select by goal:**
- Need beta users this week: r/alphaandbetausers Weekend Showcase, r/indiehackers Friday Share Fever
- Have a video demo: r/SideProject
- Have MRR data: r/SaaS + r/microsaas + r/buildinpublic (cross-post all three)
- Building long-term presence: r/buildinpublic + r/microsaas (milestone cross-post)
- Pre-launch validation: r/roastmystartup first, then r/indiehackers

---

## The 5 Post Formulas

### Formula 1: "I Built" Demo

Best for r/SideProject. Requires video or GIF.

Title pattern: I built [specific thing] [concrete detail or contrast]

Real titles that hit 500+:
- "I built an offline survival AI [Update]" (1238 upvotes)
- "I built a virtual office where 8 AI agents show up to work every day" (904 upvotes)

Body: video/GIF first, 1-2 sentences on the personal problem, what it does in plain English, one honest challenge, link, one specific question.

### Formula 2: Quit-My-Job / Journey Story

Best for r/buildinpublic. Highest-performing: 860 upvotes, 277 comments.

Title pattern: My [time period] after quitting my 9-5 to [build/go indie]. Here's what happened.

Body structure: no formatting, flows like a message to a friend. Metrics in Key: Value format. What's working, what's not (required). Ends with a real question, not a pitch.

### Formula 3: Milestone / MRR Share

Best for r/SaaS, r/indiehackers.

Title pattern: [Achievement] in [timeframe] — [honest hook]

Body: screenshot proof, product one-liner, numbers breakdown in Key: Value format, what moved the needle, what didn't work (required), AMA invitation.

### Formula 4: Contrarian / Honest Insight

Best for r/Entrepreneur, r/GrowthHacking.

Title pattern: [Common belief]. [Your counterpoint or what actually happened.]

Body: the common belief, what actually happened, the honest insight, optional soft product mention, question inviting community experience.

### Formula 5: Beta Recruitment

Best for r/alphaandbetausers.

Title pattern: Looking for early users to test [product] — [one-line value prop]

Body: who you are and why you built this (2-3 sentences, human not bio), the specific pain, what you built + link/screenshot, who you're looking for, what testers get, what you want from them, TL;DR.

---

## Story Post Writing Framework

Use this 4-part structure for any story-driven post:

**Part 1: Make a friend first.** Don't open with the product. One or two sentences on who you are and why you built this. Goal: make the reader think "this person is just like me."

**Part 2: Introduce the product naturally.** Lead into it: "So I spent three months building [name]." Show a GIF or screenshots. Describe what it does in plain English.

**Part 3: Behind the scenes.** Include one of: a lesson learned the hard way, a technical tradeoff, something counterintuitive about the market, a near-failure moment. This is the part people save and share.

**Part 4: Community offer and CTA.** Community-exclusive offer, clear link, one open question, signal you'll be in comments.

---

## Post Writing Rules

**Address "this already exists" before someone else does.** The most common skeptic signal on Reddit. Every post must include one sentence early on: "I tried [X] but the problem was [specific thing]."

**Formatting — no exceptions:**
No bullet points or dashes in the post body. **NEVER use em-dashes (—) or en-dashes (–).** No numbered lists. No bold subheadings inside the body. Write as flowing paragraphs. Only exception: raw metrics (Key: Value lines).

**Language — never use:** "leverage", "utilize", "seamlessly", "cutting-edge", "innovative", "I'm excited to announce"

**Banned sentence structures:** The em-dash explanation. The setup-pivot ("Not wrong, just [reframe]"). The fake-casual opener ("It's funny how...", "Here's what nobody tells you...").

**Write like a person talking:** First person, past tense. Contractions. Vary sentence length. One honest failure required. End with a real question, not "thoughts?"

**Be imperfect on purpose:** Leave one small flaw or gap. Reddit readers love to "help" — that engagement is the algorithm signal you need.

---

## Cross-Posting Strategy

Wait 24-48h between posts. Rewrite title per community, never copy-paste identical.

**Validated combinations:**
- r/buildinpublic + r/microsaas: highest-ROI. One milestone post generated 735 combined upvotes.
- r/SaaS + r/indiehackers: for lessons and distribution content.
- r/Entrepreneur + r/SaaS: for contrarian takes. 777 combined upvotes.

**Per-subreddit emphasis:**
- r/SideProject: demo, tech, "I built"
- r/buildinpublic: journey, struggles, transparency
- r/microsaas: milestone numbers front and center
- r/SaaS: numbers, MRR, lessons
- r/Entrepreneur: insight, contrarian angle
- r/startups: pure personal story, zero product mention

---

## Timing

| Window | Days | US Eastern | Recommendation |
|--------|------|------------|----------------|
| Optimal | Tue–Thu | 9–11 AM | Post now |
| Good | Mon | 10–11 AM | Post now |
| Acceptable | Mon–Thu | 7–9 AM or 11 AM–1 PM | Okay, not peak |
| Avoid | Fri after 2 PM, Sat, Sun | any | Wait until next Tue–Thu 9 AM ET |

---

## Post Pre-Flight Checklist

- [ ] Title has specific number or time constraint
- [ ] Title uses first person ("I built/made/quit")
- [ ] r/SideProject post has video/GIF
- [ ] Body has at least one concrete metric
- [ ] Includes one honest struggle or failure
- [ ] Ends with specific question (not "thoughts?")
- [ ] No bullet points, dashes, or bold subheadings in body
- [ ] No em-dashes anywhere
- [ ] No marketing buzzwords
- [ ] Product link goes in first comment, not post body
- [ ] Has TL;DR

---

## Comment Mode

### Finding Posts to Comment On

**Showcase threads first (highest intent density):**
- r/indiehackers: "Friday Share Fever" — every Friday
- r/alphaandbetausers: "Weekend Showcase" — every weekend
- r/IMadeThis: "Have a Project? Share it below!" — regular

```bash
npx karis chat "Find Reddit threads about [topic] where I can add value.
- Focus on posts from last 7 days
- Score by relevance to [product]
- Include suggested comment angles"
```

**Score posts before engaging:**

| Signal | Weight |
|--------|--------|
| Mentions your keywords | +3 |
| Mentions your competitors | +3 |
| Describes your pain point | +3 |
| In target subreddit | +2 |
| Asking for tool recommendations | +2 |
| Complaining about problem you solve | +2 |

Threshold: score 4+ to engage. Post age under 24h: engage. Over 48h: skip.

### How to Write Comments

**Where to aim:** Marketing speak → Helpful but scripted → Real person building something → Just a person. Aim for "real person building something."

**Generic vs Specific:** Generic = AI. Specific = Human. Every claim needs a receipt.

Bad: "Content marketing works well"
Good: "our blog post on X got 12k views, converted 340 to email, 23 became customers"

**The Bar Test:** Imagine saying this out loud to someone at a bar. Would you actually say "Great question! Here's what I'd recommend..."? No. You'd say "oh yeah we dealt with that..."

**Length:** 3-6 sentences. If you can't say it in a short paragraph, you're saying too much.

**No em-dashes:** NEVER use em-dashes (—) or en-dashes (–). Use a period or new sentence.

### Product Mention Levels

- **Level 0** — No mention (80% of comments). Just help. Build karma.
- **Level 1** — Oblique: "we built something for this" (no name, no link)
- **Level 2** — Name drop with disclosure: "full disclosure I work on [Product] so I'm biased, but..."
- **Level 3** — Soft pitch: "I'm building [Product] which handles this, though honestly for your use case [Competitor] might be better"
- **Level 4** — Direct (only when explicitly asked "what tools do you recommend")

The math: 100 pushy comments → 2 clicks → 0 customers. 100 valuable comments → 0 clicks → 5 followers → 2 inbound DMs → 1 customer + reputation.

### Real Examples: Bad vs Good

**Tool Recommendation:**
- Bad: "Great question! I'd recommend checking out [MyTool]. We built it specifically for this use case!"
- Good: "depends on your volume honestly. we use lemlist for outreach, apollo for emails. if you're doing less than 100/week you probably don't need a fancy tool. what's your current volume?"

**Someone Shares a Win:**
- Bad: "Congratulations! We're building [MyTool] to help founders like you scale even faster!"
- Good: "nice, congrats. what was the unlock that got you from ~5k to 10k? always curious about that middle phase"

**Someone is Frustrated:**
- Bad: "I understand your frustration! Have you tried [MyTool]?"
- Good: "eh I don't think it's dead but it's definitely harder. what worked for us: shorter emails, no 'hope you're well' garbage. what's your current response rate?"

### Comment Red Flags Checklist

- [ ] No "Great question!" or "Love this!"
- [ ] No "I understand your frustration"
- [ ] No "game-changer" or "amazing results"
- [ ] No em-dashes or en-dashes
- [ ] Product not in first 2 sentences if mentioned at all
- [ ] Has specific details or numbers
- [ ] Under 10 sentences
- [ ] Passes the bar test

---

## Best Practices

1. **Always check subreddit rules** before posting
2. **Don't pitch immediately** — provide value first
3. **Use authentic voice** — Reddit users detect spam
4. **Time your posts** — Weekday mornings EST best
5. **Engage before promoting** — Comment first, post later
6. **Track results** — Note which posts/subreddits work

## Related Skills

- **reddit-listening**: Analyze Reddit discussions before creating content
- **brand-intel**: Build brand context before growth strategy
- **elonmusk-repost**: Cross-promote on X/Twitter alongside Reddit launch
