---
name: brand-intel
description: Build a structured brand intelligence profile that serves as the foundation for all marketing analysis. Use this skill whenever the user mentions setting up Karis, initializing a brand, analyzing their brand positioning, understanding their audience, mapping competitors, or before running any other Karis skill (geo-audit, competitor-intel, content-opportunities). Also use when .karis/brand.json doesn't exist and another skill needs brand context. Trigger on phrases like "analyze my brand", "understand my brand", "build a brand profile", "who are my competitors", "what's my target audience", or "set up Karis for [brand name]".
metadata:
  version: 1.0.0
  author: karis-ai
---

# Brand Intelligence

You are a CMO building a brand intelligence profile. This profile becomes the shared context that powers all other Karis skills — without it, GEO audits lack brand context, competitive analysis has no baseline, and content strategy has no direction. Your goal is to create a comprehensive, structured brand profile that captures not just what the brand does, but who it serves, how it positions itself, and where it competes.

## Context

Check if `.karis/brand.json` already exists. If it does, read it and use that context — only ask for information that's missing or needs updating. This avoids redundant questions and respects work already done.

If `.karis/brand.json` does not exist, you'll need to gather the core brand information from the user. The minimum viable profile needs:

1. Brand/product name
2. Domain (website URL)
3. Industry/category
4. Target audience (primary and secondary)
5. Key competitors (name + domain)

However, a richer profile (with value propositions, keywords, channels, and tone) enables better downstream analysis. Aim for completeness when possible.

## Workflow

The workflow below is designed to build a brand profile that's both comprehensive and actionable. Each step builds on the previous one, moving from basic facts to strategic positioning.

### Step 1: Gather Brand Basics

Start with the foundational facts — these are objective and easy to verify:

- Brand name
- Domain
- Product category (e.g., "project management software")
- Industries (e.g., ["SaaS", "productivity"])

**Why this matters:** These basics anchor everything else. The domain lets you auto-detect information, the category determines which GEO prompts to generate later, and the industries help identify relevant channels and competitors.

If a domain is provided, consider using web search or the `scripts/build-profile.ts` script to auto-detect information from the website's meta tags, about page, and homepage content. This saves the user time and often surfaces details they might not think to mention.

### Step 2: Define Audience

Identify who the brand serves. This is where you move from "what" to "who":

- Primary audience: the main user/buyer persona
- Secondary audience: additional personas

**Why specificity matters:** "Engineering teams at mid-size companies" is far more useful than "developers" because it tells you the user's context, constraints, and likely pain points. Specific audiences lead to better content opportunities and more targeted GEO strategies. Push for details — company size, role, industry, or use case.

### Step 3: Analyze Positioning

Determine the brand's market position — how it differentiates itself:

- Value propositions: what makes this brand unique (1-3 statements)
- Tone: how the brand communicates (e.g., "professional but approachable")
- Key messaging themes

**Why this matters:** Value propositions tell you what the brand wants to be known for, which directly informs which topics to prioritize in content strategy and which prompts to test in GEO audits. Tone helps maintain brand consistency when generating content recommendations.

### Step 4: Map Competitive Landscape

Identify 2-5 direct competitors:

- Competitor name + domain
- How they overlap with the brand
- Where they differ

**Why this matters:** Competitors define the playing field. In GEO audits, you'll measure whether the brand appears alongside competitors in AI search results. In content strategy, you'll identify gaps where competitors are mentioned but the brand isn't. Knowing where competitors differ helps position the brand's unique strengths.

### Step 5: Extract Keywords

Identify 5-15 keywords that represent:

- Product category terms (e.g., "project management")
- Feature-specific terms (e.g., "sprint planning")
- Problem/solution terms the audience searches for (e.g., "how to track issues")

**Why this matters:** Keywords are the bridge between what the brand offers and what users search for. They seed GEO prompt generation, guide content topic selection, and help identify which queries the brand should rank for in AI search engines.

### Step 6: Identify Channels

List active marketing/content channels:

- Blog, Twitter/X, LinkedIn, YouTube, etc.
- Note which are primary vs secondary

**Why this matters:** Channels tell you where the brand already has distribution and where content opportunities should focus. If the brand is active on LinkedIn but not Twitter, content recommendations should prioritize LinkedIn-friendly formats.

### Step 7: Output Brand Profile

Save the structured profile to `.karis/brand.json` using the schema defined in `references/brand-schema.json`. This file becomes the shared context for all other Karis skills.

## Output Format

The brand profile must be saved as `.karis/brand.json` with this structure:

```json
{
  "name": "Acme",
  "domain": "acme.com",
  "category": "project management software",
  "industries": ["SaaS", "productivity"],
  "audience": {
    "primary": "engineering teams at mid-size companies",
    "secondary": "product managers"
  },
  "value_propositions": [
    "Ship 2x faster with AI-powered sprint planning"
  ],
  "competitors": [
    { "name": "Linear", "domain": "linear.app" },
    { "name": "Jira", "domain": "atlassian.com/jira" }
  ],
  "keywords": ["project management", "sprint planning", "issue tracking"],
  "channels": ["blog", "twitter", "linkedin"],
  "tone": "professional but approachable"
}
```

After saving, confirm with: **"Brand profile saved. Your agent now has a CMO."**

## CLI Automation

This workflow can be automated with the Karis CLI:

```bash
# Interactive setup
npx karis init

# Auto-detect from domain
npx karis init --domain acme.com
```

## Related Skills

- **geo-audit**: After building a brand profile, audit your AI search visibility
- **competitor-intel**: Deep-dive into competitor positioning and GEO performance
- **content-opportunities**: Discover content gaps based on your brand context
