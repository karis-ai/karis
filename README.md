# Karis

**You Build, Karis Grows**

Karis gives any AI agent a Chief Marketing Officer — one that runs audits, discovers content opportunities, tracks competitors, and delivers actionable insights. Not advice. Execution.

---

## Quick Start

Choose how you want to use Karis:

### Option 1: Skills for AI Agents

Give your AI agent (Cursor, Claude Code, Codex) CMO knowledge:

```bash
npx skills add karis-ai/karis
```

Then ask your agent: *"Audit my brand's AI search visibility"* — it knows how to execute.

**How it works:** Skills teach your agent marketing workflows. Your agent executes using Karis CLI.

**Requirements:** Karis API key (free tier at [karis.im](https://karis.im))

### Option 2: CLI Tool

Run marketing analysis directly from your terminal:

```bash
# Verify your environment
npx karis doctor

# First-time setup
npx karis setup

# Run commands
npx karis geo audit mybrand.com
npx karis content discover mybrand.com
npx karis chat

# Structured output for automation
npx karis --json config list
npx karis --jsonl geo audit mybrand.com
```

**Requires:** Node.js 18+ and a Karis API key (free tier at [karis.im](https://karis.im))

---

## What is Karis?

Karis is an open-source marketing intelligence system built on 8 specialized skills:

- **GEO Audit** - Measure your visibility in AI search engines (ChatGPT, Perplexity)
- **Content Discovery** - Find content opportunities from Reddit and X community discussions
- **Competitor Analysis** - Compare your AI search performance against competitors
- **Topic Clusters** - Generate content architecture with pillar topics and subtopics
- **Content Optimizer** - Optimize articles for AI search visibility
- **Prompt Research** - Understand how users ask AI about your category
- **Brand Intelligence** - Build structured brand profiles with positioning and competitors
- **CMO Orchestration** - Strategic decision-making that coordinates all skills

**Key Principles:**

- **Executable, not advisory** - Runs real audits and generates reports, not just suggestions
- **Context-aware** - Remembers your brand across all marketing tasks
- **Data-driven** - Delivers metrics (Answer Share, Citation Rate) not opinions
- **Integrated** - 8 skills that work together, sharing brand context

---

## How It Works

### For AI Agent Users (Skills)

Skills are knowledge bases that teach your AI agent how to execute marketing tasks.

**Installation:**
```bash
npx skills add karis-ai/karis
```

**Usage:**
```
You: Audit my brand's AI search visibility for acme.com

Agent: [Uses geo-audit skill]
       I'll run a GEO audit for acme.com...
       [Calls Karis API to execute audit]

       Your Answer Share is 32.5%
       Citation Rate: 15%
       Gap Topics identified: 3
```

**Works with:** Cursor, Claude Code, Codex, Windsurf, and any agent supporting skills

**Requirements:** Karis API key (free tier at [karis.im](https://karis.im))

---

### For CLI Users

The current CLI runtime connects to Karis Platform for enhanced marketing intelligence.

`karis` v0.2 is designed for both humans and agents:
- Human-friendly text output by default
- `--json` for structured single-result commands
- `--jsonl` for streaming agent events
- `doctor`, `schema`, `explain`, and `examples` for debugging and self-discovery

**Setup:**
```bash
npx karis setup
```

Interactive wizard guides you through:
1. Configuring your Karis API key
2. Creating your brand profile

Get your API key at [karis.im/settings/api-keys](https://karis.im/settings/api-keys)

**Commands:**

```bash
# Diagnose your setup
npx karis doctor

# GEO optimization
npx karis geo audit mybrand.com
npx karis geo prompts "project management"
npx karis geo optimize https://mybrand.com/blog

# Content strategy
npx karis content discover mybrand.com
npx karis content clusters mybrand.com

# Competitive intelligence
npx karis competitor analyze mybrand.com

# Interactive CMO chat
npx karis chat

# Inspect command metadata
npx karis schema geo.audit
npx karis explain content.discover
npx karis examples chat

# Natural language commands
npx karis "analyze my brand's AI search visibility"
```

**Platform Features:**
- Strategic CMO with skill orchestration
- Multi-model GEO audits (50+ prompts × 2 models)
- Full Reddit + X data access
- Historical trend tracking
- Journey × Aspect matrix mapping

**Configuration:**
```bash
# Set API key
npx karis config set api-key sk-ka-...

# Set custom API base URL
npx karis config set base-url https://api.karis.im

# View config
npx karis config list

# JSON output for scripts
npx karis --json config list
```

Brand profiles are stored on Karis Platform and synced across your team

---

## The 8 Skills

Each skill is a specialized marketing capability that can be used independently or orchestrated together.

### 1. cmo
**Strategic marketing orchestration**

Trigger: Any marketing request that requires decision-making or multiple skills

The CMO skill acts as a strategic decision-maker that understands your goals and orchestrates other skills to achieve them. It decides which skills to invoke, in what order, and how to combine their outputs.

### 2. brand-intel
**Build a structured brand profile**

Trigger: "analyze my brand", "understand my positioning", "who are my competitors"

Creates a structured brand profile with your brand's category, audience, competitors, keywords, and tone. This context can be used by other skills.

### 3. geo-audit
**Measure AI search visibility**

Trigger: "audit my brand in AI search", "what's my Answer Share", "do AI engines mention me"

Generates test prompts, queries AI search engines, calculates core metrics:
- Answer Share (% of responses mentioning your brand)
- Citation Rate (% citing your website)
- Mention Position (where you appear in responses)
- Sentiment (how you're described)
- Gap Topics (where competitors appear but you don't)

### 4. competitor-intel
**Analyze competitor GEO performance**

Trigger: "how do my competitors rank in AI search", "compare my brand to [competitor]"

Runs GEO audits on competitors, identifies where they outperform you, and surfaces their content strategies.

### 5. content-opportunities
**Discover content gaps from community signals**

Trigger: "what should I write about", "find content opportunities", "what's trending in [category]"

Searches Reddit and X for discussions in your category. Clusters by theme, classifies by Visibility Driver:
- 🔴 **trending_opportunity**: Rising demand, create fast
- 🟢 **on_track**: You're covering it well
- 🟡 **distribution_gap**: Content exists, needs promotion
- 🟠 **perception_gap**: Misconceptions to correct

### 6. topic-clusters
**Generate content architecture**

Trigger: "plan my content strategy", "organize topics into clusters"

Creates 3-5 pillar topics with 5-10 subtopics each, prioritized by competition and relevance.

### 7. content-optimizer
**Optimize content for AI search**

Trigger: "optimize this article for GEO", "improve AI search visibility"

Analyzes content for GEO-friendliness (structure, entity clarity, citation potential) and provides specific improvements.

### 8. prompt-research
**Understand how users ask AI**

Trigger: "how do people ask AI about [topic]", "research prompts for [category]"

Generates prompt variations users might ask AI engines, classified by intent (informational, comparative, transactional).

---

## Skill Dependencies

```
                    cmo
              (orchestrator)
                    │
          ┌─────────┼─────────────┐
          ▼         ▼             ▼
    geo-audit  competitor-intel  prompt-research
          │         │             │
          └────┬────┘─────────────┘
               ▼
      content-opportunities
               │
        ┌──────┴──────┐
        ▼             ▼
  topic-clusters  content-optimizer
```

The **cmo** skill orchestrates all other skills based on user goals. When using skills with your agent, the CMO decides which skills to invoke and in what order.

---

## CLI Command Reference

### Brand Profile Management

Brand profiles are stored on Karis Platform and synced across your team.

```bash
# Create brand profile
npx karis brand init

# View current profile
npx karis brand show

# Edit profile
npx karis brand edit              # Edit all fields
npx karis brand edit keywords     # Edit specific field

# Manage competitors
npx karis brand competitor add "Linear:linear.app"
npx karis brand competitor remove "Linear"
```

### GEO Commands

**Run GEO Audit:**

```bash
npx karis geo audit mybrand.com
```

**Research Prompts:**

```bash
npx karis geo prompts "project management"
```

**Optimize Content:**

```bash
npx karis geo optimize https://mybrand.com/blog/post
```

### Content Commands

**Discover Opportunities:**

```bash
npx karis content discover mybrand.com
```

**Generate Topic Clusters:**

```bash
npx karis content clusters mybrand.com
```

### Competitor Analysis

```bash
npx karis competitor analyze mybrand.com
```

### Interactive Chat

```bash
npx karis chat
```

Multi-turn conversation with CMO Agent.

**Example:**
```
🧠 CMO ready. What can I help you with?

You: What's my current AI search visibility?
CMO: Let me run a GEO audit...
     Your Answer Share is 30%...

You: How can I improve it?
CMO: I'll analyze content opportunities...
     Focus on these 3 gap topics...
```

### Natural Language Commands

```bash
npx karis "analyze my brand's AI search visibility"
npx karis "find content opportunities in project management"
```

### Diagnostics And Introspection

```bash
# Diagnose auth, connectivity, runtime, and brand readiness
npx karis doctor

# Machine-readable command metadata
npx karis schema geo.audit

# Human-readable explanations
npx karis explain content.discover

# Usage examples
npx karis examples chat
```

### Structured Output

```bash
# JSON result envelope
npx karis --json brand show
npx karis --json content result <task-id>

# JSON Lines event stream
npx karis --jsonl geo audit mybrand.com
printf "What's my visibility?\nexit\n" | npx karis --jsonl chat
```

---

## Configuration Files

Karis stores configuration globally in `~/.karis/`:

```
~/.karis/
└── config.json             # api-key and base-url
```

Brand profiles and marketing data are managed on Karis Platform, not stored locally.

### Resolution Order

The CLI resolves runtime settings in this order:

1. Environment variables
2. `~/.karis/config.json`
3. Built-in defaults

Current keys:

```bash
KARIS_API_KEY
KARIS_API_URL
```

---

## Karis Platform

The CLI connects to Karis Platform for professional marketing intelligence:

| Feature | Skills (Open Source) | CLI via Platform |
|---------|---------------------|------------------|
| GEO Audit | Agent executes locally | 50+ prompts × 2 models |
| Community Data | Agent's web access | Full Reddit + X data |
| Tracking | One-time analysis | Historical trends |
| Analysis | Basic insights | Journey × Aspect matrix |
| CMO Agent | Knowledge base only | Strategic orchestration |

**Skills are fully functional knowledge bases.** The CLI + Platform adds scale, depth, and strategic intelligence.

**Free tier includes:**
- Strategic CMO with skill orchestration
- Multi-model GEO audits
- Historical tracking
- Community data access

Get your API key at [karis.im/settings/api-keys](https://karis.im/settings/api-keys)

---

## Examples

### Using Skills with Your Agent

```
You: Audit my brand's AI search visibility for acme.com

Agent: [Uses geo-audit skill]
       Running GEO audit for acme.com...

       Answer Share: 32.5%
       Citation Rate: 15%
       Gap Topics: 3 identified
```

### CLI Workflow

```bash
# Setup
npx karis setup

# Discover opportunities
npx karis content discover mybrand.com

# Generate topic clusters
npx karis content clusters mybrand.com

# Optimize content
npx karis geo optimize https://mybrand.com/blog/post
```

---

## Contributing

Karis is open source (MIT License). Contributions welcome!

- **Report issues:** [github.com/karis-ai/karis/issues](https://github.com/karis-ai/karis/issues)
- **Submit PRs:** Skill improvements, new skills, CLI enhancements
- **Share feedback:** What's working? What's missing?

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Links

- **Website:** [karis.im](https://karis.im)
- **Documentation:** [docs.karis.im](https://docs.karis.im)
- **Platform:** [app.karis.im](https://app.karis.im)
- **GitHub:** [github.com/karis-ai/karis](https://github.com/karis-ai/karis)

---

**Your agent now has a CMO. You build, Karis grows.**
