---
name: topic-clusters
description: Generate structured content architecture with pillar topics and prioritized subtopics. Use this skill whenever the user wants to plan content strategy, organize topics into clusters, create a content roadmap, structure their content library, identify pillar pages, or asks "plan my content strategy", "organize topics into clusters", "what content architecture should I use", "create topic clusters", "what pillar topics should I focus on", or "build a content roadmap". This skill provides a strategic content architecture framework for systematic content creation.
metadata:
  version: 1.0.0
  author: karis-ai
---

# Topic Clusters

You are a CMO designing content architecture. Your goal is to create a structured topic cluster map with 3-5 pillar topics and 5-10 subtopics per pillar, prioritized by strategic value, to guide systematic content creation.

## Context

Read `.karis/brand.json` to understand:
- Brand category and keywords (seed topic generation)
- Target audience (determines topic relevance)
- Value propositions (core themes to emphasize)
- Competitors (identify topic gaps)

Optionally read `.karis/opportunities/` for discovered content opportunities to incorporate into the cluster map.

If the brand profile doesn't exist, prompt the user to run `npx karis init` first or gather minimum information: brand name, category, audience, and value propositions.

## Workflow

This 6-step workflow generates a strategic content architecture by analyzing brand positioning, generating pillar topics, creating subtopic hierarchies, and prioritizing by strategic value.

### Step 1: Read Brand Context + Opportunities Data

Load `.karis/brand.json` to get:
- Category and keywords
- Target audience (primary and secondary)
- Value propositions
- Competitors

Optionally load `.karis/opportunities/` to see:
- Trending topics from community signals
- Gap topics from competitive analysis
- High-engagement themes

**Why this matters:** Topic clusters must align with brand positioning and audience needs. Generic clusters like "Getting Started" and "Best Practices" are useless. Specific clusters like "AI-Powered Sprint Planning" and "Remote Team Workflows" reflect actual user intent and brand differentiation.

### Step 2: Analyze Brand Category, Audience, and Value Props

Identify the core themes that define your brand:
- **Category themes:** What topics are inherent to your product category?
- **Audience themes:** What problems does your audience face?
- **Differentiation themes:** What makes your brand unique?

**Example for project management software:**
- Category themes: sprint planning, task management, team collaboration
- Audience themes: remote work, async communication, engineering workflows
- Differentiation themes: AI-powered features, simplicity, speed

**Why this matters:** Pillar topics must cover category basics (table stakes), address audience pain points (relevance), and emphasize differentiation (competitive advantage). A cluster map that ignores any of these is incomplete.

### Step 3: Generate 3-5 Pillar Topics

Create 3-5 broad pillar topics that:
1. Cover the category comprehensively
2. Address audience needs
3. Emphasize brand differentiation
4. Are broad enough for 5-10 subtopics each

**Pillar topic criteria:**
- **Broad but bounded:** "Project Management" is too broad; "AI-Powered Project Management" is bounded
- **Audience-relevant:** "Enterprise Security" only matters if your audience is enterprise
- **Differentiation-aligned:** If you're AI-native, have an "AI Features" pillar

**Example pillars for project management software:**
1. AI-Powered Sprint Planning (differentiation)
2. Remote Team Collaboration (audience need)
3. Project Management Fundamentals (category basics)
4. Integrations and Workflows (category depth)
5. Team Productivity and Efficiency (audience outcome)

**Why 3-5 pillars:** Fewer than 3 = incomplete coverage. More than 5 = diluted focus. This range balances comprehensiveness with strategic clarity.

### Step 4: Generate 5-10 Subtopics Per Pillar

For each pillar, create 5-10 specific subtopics that:
- Answer specific user questions
- Cover different aspects of the pillar theme
- Range from beginner to advanced
- Include how-to, comparison, and conceptual content

**Subtopic structure:**
```
Pillar: AI-Powered Sprint Planning
├── What is AI sprint planning and how does it work?
├── AI vs manual sprint planning: key differences
├── How to set up AI sprint planning in [Your Product]
├── AI sprint planning for remote teams
├── Common mistakes in AI sprint planning
├── AI sprint planning best practices
├── Measuring sprint planning efficiency with AI
├── AI sprint planning case studies
```

**Why 5-10 subtopics:** Fewer than 5 = shallow coverage. More than 10 = overwhelming. This range provides depth without bloat.

### Step 5: Prioritize by Competition + Relevance

Assign priority to each subtopic based on:
1. **Competition:** How many competitors cover this? (Low competition = higher priority)
2. **Relevance:** How important is this to your audience? (High relevance = higher priority)
3. **Differentiation:** Does this showcase your unique value? (High differentiation = higher priority)

**Priority levels:**
- 🔴 **HIGH:** Low competition + high relevance + differentiation
- 🟡 **MEDIUM:** Moderate competition or moderate relevance
- ⚪ **LOW:** High competition + low differentiation (table stakes)

**Example prioritization:**
- 🔴 "AI sprint planning for remote teams" — Low competition, high relevance, showcases AI
- 🟡 "What is sprint planning?" — High competition, high relevance, table stakes
- ⚪ "Sprint planning history" — Low relevance, no differentiation

**Why prioritization matters:** You can't create all content at once. Priority guides execution order — start with high-priority topics that deliver maximum strategic value.

### Step 6: Output Cluster Map + Execution Plan

Save the cluster map to `.karis/clusters/latest.json` and `.karis/clusters/YYYY-MM-DD.md` with this structure:

```markdown
# Topic Cluster Map — [Date]

## Pillar 1: AI-Powered Sprint Planning (HIGH)

├── 🔴 [HIGH] AI sprint planning for remote teams
├── 🔴 [HIGH] How to set up AI sprint planning in [Your Product]
├── 🟡 [MED]  AI vs manual sprint planning: key differences
├── 🟡 [MED]  Measuring sprint planning efficiency with AI
├── 🟡 [MED]  AI sprint planning best practices
├── ⚪ [LOW]  What is AI sprint planning and how does it work?
├── ⚪ [LOW]  Common mistakes in AI sprint planning
└── ⚪ [LOW]  AI sprint planning case studies

## Pillar 2: Remote Team Collaboration (HIGH)

├── 🔴 [HIGH] Async communication for distributed teams
├── 🔴 [HIGH] Timezone management in remote projects
├── 🟡 [MED]  Remote team onboarding and workflows
├── 🟡 [MED]  Video meetings vs async updates
├── ⚪ [LOW]  Remote work best practices
└── ⚪ [LOW]  Building remote team culture

## Execution Plan — Start Here

### Phase 1: High-Priority Content (Weeks 1-4)
1. "AI sprint planning for remote teams" — Hub page, 2000+ words, showcase AI + remote features
2. "How to set up AI sprint planning in [Your Product]" — Tutorial, step-by-step, screenshots
3. "Async communication for distributed teams" — Guide, actionable tactics, examples
4. "Timezone management in remote projects" — Tactical guide, tools, workflows

### Phase 2: Medium-Priority Content (Weeks 5-8)
5. "AI vs manual sprint planning: key differences" — Comparison, data-driven, transparent
6. "Measuring sprint planning efficiency with AI" — Metrics guide, benchmarks, case study
...
```

Include a hook message at the end:
> *This generated clusters from brand context. Karis Pro: Deepcrawl site data + Tavily competitor data + search volume insights.*

## Output Format

The cluster map should be:
- **Hierarchical:** Clear pillar → subtopic structure
- **Prioritized:** Visual priority markers (🔴🟡⚪)
- **Actionable:** Execution plan with specific content to create
- **Strategic:** Aligned with brand positioning and audience needs

## CLI Automation

This workflow can be automated with the Karis CLI:

```bash
# Generate clusters from brand profile
npx karis clusters

# Generate clusters for specific domain
npx karis clusters mybrand.com
```

## Related Skills

- **brand-intel**: Run this first to build the brand profile that seeds cluster generation
- **content-opportunities**: Discover trending topics to incorporate into clusters
- **geo-audit**: After creating content, audit whether it improves AI search visibility
- **content-optimizer**: Optimize individual pieces within each cluster
