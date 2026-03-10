# Karis

**AI-powered marketing intelligence** for brand analysis, content strategy, and competitive research.

---

## Installation

```bash
npx skills add karis-ai/karis
```

### Claude Code

```bash
/plugin marketplace add https://github.com/karis-ai/karis
/plugin install brand-intel@karis
```

### Cursor / Windsurf / Codex

Point your agent to `agents/AGENTS.md` for skill descriptions.

---

## What is Karis?

Karis provides AI agents with marketing intelligence capabilities:

- **Brand Intelligence** (`brand-intel`) - Analyze positioning and recommend growth actions
- **AI Search Optimization** (`aeo-geo`) - Audit visibility in ChatGPT, Perplexity, Claude
- **Reddit Listening** (`reddit-listening`) - Monitor discussions and community sentiment
- **Reddit Growth** (`reddit-growth`) - Generate posts, comments, and engagement strategies
- **Viral Launch** (`elonmusk-repost`) - Optimize tweets for maximum reach on X

---

## Quick Start

### For AI Agents (Skills)

```bash
npx skills add karis-ai/karis
```

Then ask your agent:
- *"Analyze my brand and suggest growth actions"*
- *"Audit my brand's AI search visibility"*
- *"Help me go viral on X"*

**How it works:** Skills teach your agent marketing workflows. Your agent executes using Karis CLI.

### For Direct CLI Use

```bash
# First-time setup
npx karis setup

# Natural language interface (primary)
npx karis chat
> "Audit my brand's AI search visibility"
> "Find content opportunities for mybrand.com"

# Brand management
npx karis brand init mybrand.com
npx karis brand show

# Utilities
npx karis doctor
npx karis config list
```

---

## Available Skills

See [agents/AGENTS.md](agents/AGENTS.md) for the complete list of marketing intelligence skills.

---

## Prerequisites

- **Karis API key** - Get from [karis.im](https://karis.im)
- **Node.js 18+**

---

## CLI Commands

```bash
karis setup              # First-time configuration
karis chat               # Natural language interface (primary)
karis brand init         # Create brand profile
karis brand show         # View brand profile
karis doctor             # Verify environment
karis config             # Manage configuration
```

---

## How It Works

### For AI Agent Users

Skills are knowledge bases that teach your AI agent how to execute marketing tasks.

**Installation:**
```bash
npx skills add karis-ai/karis
```

**Usage:**
```
You: Audit my brand's AI search visibility for acme.com

Agent: [Uses aeo-geo skill]
       Running GEO audit for acme.com...

       Answer Share: 32.5%
       Citation Rate: 15%
       Gap Topics: 3 identified
```

**Works with:** Claude Code, Cursor, Codex, Windsurf, and any agent supporting skills.

---

### For CLI Users

The CLI connects to Karis Platform for enhanced marketing intelligence.

**Setup:**
```bash
npx karis setup
```

Interactive wizard guides you through:
1. Configuring your Karis API key
2. Creating your brand profile

**Configuration:**
```bash
# Set API key
npx karis config set api-key sk-ka-...

# View config
npx karis config list

# JSON output for scripts
npx karis --json config list
```

---

## Karis Platform

The CLI connects to Karis Platform for professional marketing intelligence:

| Feature | Skills (Open Source) | CLI via Platform |
|---------|---------------------|------------------|
| GEO Audit | Agent executes locally | 50+ prompts × 2 models |
| Community Data | Agent's web access | Full Reddit + X data |
| Tracking | One-time analysis | Historical trends |
| Analysis | Basic insights | Strategic intelligence |

**Skills are fully functional knowledge bases.** The CLI + Platform adds scale, depth, and strategic intelligence.

Get your API key at [karis.im](https://karis.im)

---

## Examples

### Using Skills with Your Agent

```
You: Write a viral product launch tweet for X

Agent: [Uses elonmusk-repost skill]
       Repost Score: 74/100

       Variant 1: "Built an AI that designs logos in 10 seconds..."
       Variant 2: ...

       Best time to post: 10 PM - 2 AM PT
```

### CLI Workflow

```bash
# Setup
npx karis setup

# Interactive chat
npx karis chat
> "What's my AI search visibility?"
> "Find content opportunities"
> "Compare with competitors"
```

---

## Configuration Files

Karis stores configuration globally in `~/.karis/`:

```
~/.karis/
└── config.json             # api-key and base-url
```

Brand profiles and marketing data are managed on Karis Platform.

### Environment Variables

```bash
KARIS_API_KEY
KARIS_API_URL
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
- **GitHub:** [github.com/karis-ai/karis](https://github.com/karis-ai/karis)

---

**Your agent now has marketing intelligence. You build, Karis grows.**
