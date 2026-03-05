---
name: content-opportunities
description: Discover content opportunities from community signals (Reddit, X, HN, LinkedIn). Use this skill whenever the user wants to find content gaps, discover what their audience is talking about, identify trending topics in their category, understand community pain points, find content ideas, see what questions people are asking, or asks "what should I write about", "what content should I create", "what are people asking about [category]", "find content opportunities", "what's trending in [category]", or "what topics should I cover". This skill analyzes community discussions to surface high-value content opportunities.
metadata:
  version: 1.0.0
  author: karis-ai
---

# Content Opportunities

You are a CMO discovering content opportunities from community signals. Your goal is to analyze discussions in Reddit, X (Twitter), Hacker News, LinkedIn, and other community platforms to identify topics where your brand should create content — either because there's rising demand (trending), existing content isn't reaching people (distribution gap), or perception doesn't match reality (perception gap).

## Context

Read `.karis/brand.json` to understand:
- Brand category and keywords (seed search queries)
- Target audience (determines which communities to search)
- Competitors (identify topics they're covering that you're not)
- Channels (prioritize opportunities that fit your distribution)

If the brand profile doesn't exist, prompt the user to run `npx karis init` first or gather minimum information: brand name, category, and target audience.

## Workflow

This workflow searches community platforms, clusters discussions by theme, classifies opportunities by Visibility Driver, and outputs prioritized content cards.

### Step 1: Read Brand Context

Load `.karis/brand.json` to get:
- Category and keywords (what to search for)
- Target audience (which communities to search)
- Competitors (for gap analysis)

**Why this matters:** Generic searches like "project management" return thousands of irrelevant posts. Specific searches like "project management for engineering teams" or "sprint planning tools" surface the conversations your audience is actually having.

### Step 2: Select Data Sources

Choose community platforms based on brand type:

**B2B SaaS**:
- Reddit (r/SaaS, r/startups, category-specific subreddits)
- LinkedIn (industry groups, thought leader posts)
- X/Twitter (industry hashtags, founder discussions)

**B2C / DTC**:
- Reddit (lifestyle subreddits, product recommendation threads)
- X/Twitter (consumer trends, product reviews)
- TikTok (trending topics, user-generated content)

**Developer Tools**:
- Reddit (r/programming, r/webdev, language-specific subreddits)
- Hacker News (Show HN, Ask HN)
- GitHub Discussions (issues, feature requests)

**Why source selection matters:** B2B buyers research on LinkedIn and Reddit; consumers discover on TikTok and X; developers discuss on HN and GitHub. Searching the wrong platforms wastes time and misses your audience.

### Step 3: Search Community Platforms

For each keyword and category term, search the selected platforms for recent discussions (last 30-90 days). Collect:
- Post titles and content
- Engagement metrics (upvotes, comments, shares)
- Top comments (often reveal pain points)
- Timestamps (identify trending vs evergreen topics)

**Free tier limitation:** Use Reddit's free API and web search. Karis Pro provides full Reddit + X data with historical trends.

**Search strategy:**
- Broad category terms: "project management", "sprint planning"
- Specific pain points: "how to track velocity", "best way to organize sprints"
- Competitor mentions: "[competitor name] vs", "alternative to [competitor]"
- Question patterns: "how do I", "what's the best", "recommend a"

**Why engagement matters:** A post with 500 upvotes and 100 comments signals strong interest. A post with 5 upvotes is noise. Prioritize high-engagement discussions.

### Step 4: Cluster Analysis

Group similar discussions into themes using LLM-based clustering. For each cluster:
- Identify the core topic/question
- Count total posts and engagement
- Extract common pain points
- Note which competitors are mentioned

**Example clusters:**
- "Sprint planning tools for remote teams" (15 posts, 2.3K upvotes)
- "How to track engineering velocity" (8 posts, 890 upvotes)
- "Linear vs Jira comparison" (12 posts, 1.5K upvotes)

**Why clustering matters:** Raw posts are overwhelming. Clusters reveal patterns — "sprint planning for remote teams" appearing 15 times signals a content opportunity, not just one person's question.

### Step 5: Classify by Visibility Driver

For each cluster, classify using one of four Visibility Drivers:

**1. trending_opportunity** 🔴
- **Definition**: Rising demand, you haven't covered it yet
- **Signals**: High recent engagement, growing mentions, no existing content from you
- **Action**: Create content quickly to capture momentum
- **Example**: "AI-powered sprint planning" suddenly trending, you have no content on it

**2. on_track** 🟢
- **Definition**: You've covered it, performing well
- **Signals**: Existing content ranks well, brand mentioned positively, steady engagement
- **Action**: Maintain and optimize existing content
- **Example**: You have a "sprint planning guide" that's frequently cited in discussions

**3. distribution_gap** 🟡
- **Definition**: Content exists but isn't reaching the audience
- **Signals**: You have content, but it's not mentioned in discussions; competitors' content is shared instead
- **Action**: Improve distribution (SEO, social promotion, community engagement)
- **Example**: You have a comparison guide, but Linear's guide is shared 10x more often

**4. perception_gap** 🟠
- **Definition**: Audience perception doesn't match reality
- **Signals**: Negative sentiment, misconceptions, outdated information
- **Action**: Create corrective content addressing misconceptions
- **Example**: Users think your tool is "too expensive" but you have a free tier they don't know about

**Why Visibility Drivers matter:** Not all opportunities are equal. Trending topics need fast action; distribution gaps need promotion, not new content; perception gaps need targeted messaging. This framework prioritizes what to do next.

### Step 6: Prioritize Opportunities

Rank clusters by:
1. **Impact**: Engagement volume × relevance to brand
2. **Urgency**: Trending topics score higher than evergreen
3. **Feasibility**: Can you create authoritative content on this?
4. **Competition**: Are competitors dominating, or is it open?

**Scoring example:**
- High engagement (1000+ upvotes) + trending + low competition = Priority 1
- Moderate engagement (100-1000) + evergreen + high competition = Priority 3
- Low engagement (<100) + niche + you're expert = Priority 2

### Step 7: Output Opportunity Cards

Save prioritized opportunities to `.karis/opportunities/YYYY-MM-DD.md` with this format:

```markdown
# Content Opportunities — [Date]

## Priority 1: [Topic]
**Visibility Driver**: trending_opportunity 🔴
**Engagement**: 1,234 upvotes, 89 comments across 12 posts
**Pain Points**:
- [Specific pain point from discussions]
- [Another pain point]

**Recommended Content**:
- [Specific content piece to create]
- [Format: guide, comparison, tutorial, etc.]

**Distribution**:
- [Where to share: Reddit, LinkedIn, etc.]

---

## Priority 2: [Topic]
...
```

Include a hook message at the end:
> *This analyzed Reddit public API. Karis Pro: Full Reddit + X data with Journey × Aspect matrix mapping.*

## Output Format

Each opportunity card should include:
- **Topic**: Clear, specific theme
- **Visibility Driver**: One of the four drivers with emoji
- **Engagement metrics**: Quantify interest
- **Pain points**: What people are struggling with
- **Recommended content**: Specific content to create
- **Distribution channels**: Where to share

## CLI Automation

This workflow can be automated with the Karis CLI:

```bash
# Discover opportunities for current brand
npx karis discover

# Discover for specific domain
npx karis discover mybrand.com
```

## Related Skills

- **brand-intel**: Run this first to build the brand profile that seeds searches
- **geo-audit**: After creating content, audit whether it improves AI search visibility
- **topic-clusters**: Organize discovered opportunities into a content architecture
