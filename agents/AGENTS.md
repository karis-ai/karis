# Karis Agent Skills

Available marketing intelligence skills for AI agents.

## Layer Cake

- **Layer 1 (Tools):** `npx @karis-ai/cli <namespace> <action>` — direct data retrieval (web, x, reddit, youtube, brand, geo, schedule, memory)
- **Layer 2 (Skills):** `npx @karis-ai/cli chat --skill <name> "prompt"` — LLM-powered domain agents
- **Layer 3 (CMO):** `npx @karis-ai/cli chat "prompt"` — full agent reasoning

For the complete tool list, run `npx @karis-ai/cli tools list`.

## Skills

### brand-intel

Analyze a brand and recommend high-leverage growth actions. Use when users provide a brand or URL for analysis, ask what marketing actions to take, want to understand their competitive position, or need help increasing visibility and traffic. Also use before running other Karis skills to establish brand context.

**Documentation:** [skills/brand-intel/SKILL.md](../skills/brand-intel/SKILL.md)

### aeo-geo

Audit your brand's AI search visibility and website GEO readiness. Supports two modes — visibility audit (are you being mentioned by AI?) and site audit (is your site optimized for AI?). Use when users ask about AI search performance, GEO/AEO scores, brand mentions in ChatGPT/Perplexity/Claude, AI crawler accessibility, llms.txt, or content optimization for generative engines.

**Documentation:** [skills/aeo-geo/SKILL.md](../skills/aeo-geo/SKILL.md)

### reddit-growth

Generate Reddit growth content including viral posts, comment strategies, and engagement plans. Use when founders or marketers want to create Reddit content for brand awareness, product launches, or community building. Works by calling Karis CLI which provides content strategy, post drafts, and engagement recommendations.

**Documentation:** [skills/reddit-growth/SKILL.md](../skills/reddit-growth/SKILL.md)

### reddit-listening

Analyze Reddit discussions for brand intelligence, competitor insights, and community sentiment. Use when users want to understand Reddit conversations about their brand, track competitor mentions, discover community pain points, analyze sentiment trends, or monitor brand health on Reddit. Works by calling Karis CLI which connects to Reddit data via Karis API.

**Documentation:** [skills/reddit-listening/SKILL.md](../skills/reddit-listening/SKILL.md)

### elonmusk-repost

Analyze Elon Musk's repost patterns on X and generate tweets optimized for getting reposted by @elonmusk. Use when users want to craft viral AI/tech product launches targeting Musk's attention, go viral on X/Twitter, or optimize tweets for maximum reach.

**Documentation:** [skills/elonmusk-repost/SKILL.md](../skills/elonmusk-repost/SKILL.md)

### page-seo

Optimize a webpage for traditional search engines (Google, Bing). Covers keyword research, competitor page analysis, on-page SEO audit with scoring, content optimization, and schema markup recommendations. Use when users ask about SEO scores, title tags, meta descriptions, keyword optimization, heading structure, internal linking, or structured data for search engines.

**Documentation:** [skills/page-seo/SKILL.md](../skills/page-seo/SKILL.md)

