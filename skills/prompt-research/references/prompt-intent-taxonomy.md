# Prompt Intent Taxonomy

Classification framework for user search intent in AI queries.

---

## The 4 Intent Types

User prompts fall into 4 categories based on what the user wants to accomplish:

### 1. Informational Intent (40% of queries)

**User goal:** Learn, understand, or get definitions

**Characteristics:**
- Seeks knowledge without immediate action
- Often starts with "What", "How", "Why", "Explain"
- User is in research/learning mode
- No immediate purchase or implementation intent

**Patterns:**

| Pattern | Example |
|---------|---------|
| What is [concept]? | "What is AI sprint planning?" |
| How does [feature] work? | "How does automated capacity prediction work?" |
| Why do [users] use [tool]? | "Why do remote teams use AI for sprint planning?" |
| Explain [concept] for [audience] | "Explain agile sprint planning for beginners" |
| [Concept] vs [concept] (conceptual) | "AI sprint planning vs traditional planning" |

**Content to create:**
- Comprehensive guides
- Explainer articles
- Concept definitions
- How-it-works breakdowns

**Example prompts:**
- "What is generative engine optimization and how does it work?"
- "How do AI search engines decide what to cite?"
- "Why do brands need to optimize for AI search?"
- "Explain the difference between SEO and GEO"

---

### 2. Comparative Intent (30% of queries)

**User goal:** Compare options, evaluate alternatives, make decisions

**Characteristics:**
- User is considering multiple options
- Often includes "vs", "best", "alternatives", "compare"
- User is closer to decision-making than informational queries
- Wants pros/cons, feature comparisons, recommendations

**Patterns:**

| Pattern | Example |
|---------|---------|
| [Tool A] vs [Tool B] | "Acme vs Jira for remote teams" |
| Best [tool] for [use case] | "Best project management tool for AI features" |
| Alternatives to [tool] | "Alternatives to Jira for agile teams" |
| [Tool] vs [manual approach] | "AI sprint planning vs manual planning" |
| Top [N] [tools] for [use case] | "Top 5 project management tools for startups" |

**Content to create:**
- Comparison articles
- "Best of" lists
- Alternative guides
- Feature comparison tables

**Example prompts:**
- "Karis vs Semrush for AI search optimization"
- "Best GEO tools for content marketers"
- "Alternatives to traditional SEO for AI search"
- "AI search optimization vs traditional SEO: which is better?"

---

### 3. Transactional Intent (20% of queries)

**User goal:** Take action, buy, sign up, implement, configure

**Characteristics:**
- User is ready to act
- Often includes "how to", "setup", "pricing", "buy", "migrate"
- User wants step-by-step instructions or purchase information
- High commercial intent

**Patterns:**

| Pattern | Example |
|---------|---------|
| How to set up [tool] | "How to set up AI sprint planning in Acme" |
| Getting started with [feature] | "Getting started with GEO optimization" |
| [Tool] pricing and plans | "Acme pricing for small teams" |
| How to migrate from [old] to [new] | "Migrate from Jira to Acme step-by-step" |
| [Tool] tutorial | "Acme tutorial for beginners" |

**Content to create:**
- Setup guides
- Tutorials
- Pricing pages
- Migration guides
- Onboarding documentation

**Example prompts:**
- "How to optimize content for AI search step-by-step"
- "Karis pricing and plans"
- "Getting started with GEO optimization"
- "How to migrate from SEO to GEO strategy"

---

### 4. Navigational Intent (10% of queries)

**User goal:** Find specific brand, product, or page

**Characteristics:**
- User already knows what they want
- Often includes brand name + feature/page
- User wants to navigate to a specific destination
- Low discovery intent (already aware of brand)

**Patterns:**

| Pattern | Example |
|---------|---------|
| [Brand] [feature] | "Acme AI sprint planning features" |
| [Brand] login | "Acme login page" |
| [Brand] documentation | "Acme API documentation" |
| [Brand] customer support | "Acme help center" |
| [Brand] [specific page] | "Acme pricing page" |

**Content to create:**
- Product pages
- Documentation
- Login/signup pages
- Support pages

**Example prompts:**
- "Karis GEO audit tool"
- "Karis login"
- "Karis documentation"
- "Karis customer support"

---

## Intent Distribution

Typical distribution across categories:

| Intent | % of Queries | Priority | Why |
|--------|--------------|----------|-----|
| Informational | 40% | HIGH | Largest volume, top-of-funnel awareness |
| Comparative | 30% | HIGH | Mid-funnel, high conversion potential |
| Transactional | 20% | MEDIUM | Bottom-funnel, ready to act |
| Navigational | 10% | LOW | Brand-specific, already aware |

**Strategy:**
- **Informational:** Build awareness, establish authority
- **Comparative:** Win consideration, differentiate from competitors
- **Transactional:** Convert intent to action, reduce friction
- **Navigational:** Ensure brand pages are optimized, easy to find

---

## Intent Ambiguity

Some prompts have mixed intent:

**Example:** "How to choose the best project management tool"
- **Primary intent:** Informational (learning how to evaluate)
- **Secondary intent:** Comparative (implies comparison)

**Resolution:** Classify by primary intent, but address secondary intent in content.

---

## Volume Estimation Heuristics

| Intent | Volume Indicators |
|--------|-------------------|
| Informational | Broad category terms → HIGH; Specific concepts → MEDIUM |
| Comparative | Popular tools → HIGH; Niche tools → MEDIUM |
| Transactional | Core features → MEDIUM; Specific edge cases → LOW |
| Navigational | Brand-specific → LOW (unless brand is very popular) |

**Examples:**
- "What is project management?" → HIGH (broad category)
- "How does AI sprint planning work?" → MEDIUM (specific concept)
- "Acme vs Jira" → HIGH (popular tools)
- "Acme vs obscure-tool" → LOW (niche comparison)
- "How to set up sprint planning" → MEDIUM (core feature)
- "Acme login" → LOW (brand-specific)

---

## Content Strategy by Intent

### Informational Content
- **Format:** Long-form guides (1500-3000 words)
- **Structure:** Clear headings, definitions, examples
- **Goal:** Educate, build authority
- **Metrics:** Time on page, scroll depth

### Comparative Content
- **Format:** Comparison tables, pros/cons lists
- **Structure:** Side-by-side feature comparison, use case recommendations
- **Goal:** Win consideration, differentiate
- **Metrics:** Click-through to product pages, conversions

### Transactional Content
- **Format:** Step-by-step tutorials, setup guides
- **Structure:** Numbered steps, screenshots, code examples
- **Goal:** Convert intent to action
- **Metrics:** Sign-ups, trial starts, purchases

### Navigational Content
- **Format:** Product pages, documentation, support pages
- **Structure:** Clear navigation, search functionality
- **Goal:** Reduce friction, provide quick access
- **Metrics:** Bounce rate, task completion

---

## Prompt Research Workflow

1. **Generate prompts** across all 4 intent types (40% informational, 30% comparative, 20% transactional, 10% navigational)
2. **Estimate volume** (HIGH, MEDIUM, LOW) based on intent + specificity
3. **Annotate mentions** (if audit data exists: ✅ mentioned, ❌ not mentioned, 🔴 competitor mentioned)
4. **Prioritize** (HIGH: high volume + not mentioned; MEDIUM: medium volume; LOW: low volume or navigational)
5. **Create content** starting with high-priority prompts

---

## Related Frameworks

- **AIDA (Awareness, Interest, Desire, Action):** Maps to Informational → Comparative → Transactional
- **Buyer's Journey (Awareness, Consideration, Decision):** Maps to Informational → Comparative → Transactional
- **Search Intent (Know, Know Simple, Do, Website):** Google's classification, similar to our 4 types
