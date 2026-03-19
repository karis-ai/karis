# Karis

**First CMO for AI Agents** — marketing intelligence as CLI tools, agent skills, and strategic orchestration.

---

## Installation

### Quick Install (Recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/karis-ai/karis/main/install.sh | bash
```

### npm

```bash
# Run without installing
npx @karis-ai/cli setup

# Or install globally (then use `karis` directly)
npm install -g @karis-ai/cli
karis setup
karis chat
```

### Claude Code

```bash
/plugin marketplace add https://github.com/karis-ai/karis
/plugin install brand-intel@karis
```

### Cursor / Windsurf / Codex

Point your agent to `agents/AGENTS.md` for skill descriptions.

Or add this to your agent's system prompt / rules:

```
Read https://karis.im/skill.md and follow instructions
```

---

## Architecture — Layer Cake

Karis exposes three tiers of capability:

| Layer | What | How |
|-------|------|-----|
| **Layer 1 — Tool Runtime** | Atomic read-only operations (search, fetch, list) | `karis <namespace> <action>` — direct execution, JSON response, no LLM |
| **Layer 2 — Domain Agent** | Skills with strategy (brand audit, reddit growth) | `karis chat --skill <name>` — LLM-powered, SSE stream |
| **Layer 3 — CMO Orchestrator** | Multi-channel strategic planning | `karis chat` — free-form, full agent reasoning |

---

## Quick Start

```bash
# First-time setup
karis setup

# Interactive agent chat (Layer 3)
karis chat

# Direct tool calls (Layer 1)
karis web search "AI coding tools"
karis reddit search "AI agents" --subreddit SaaS
karis x tweets elonmusk

# Skill-guided chat (Layer 2)
karis chat --skill brand-intel "Analyze my brand"
karis chat --skill aeo-geo "Audit AI search visibility"
```

---

## CLI Commands

### Tool Commands (Layer 1)

```bash
# Web
karis web search <query>                   # Search the web
karis web read <url> [--focus <keyword>]   # Read a webpage

# X / Twitter
karis x search <query> [--max-results <n>] # Search X posts
karis x tweets <username>                  # Get user's tweets

# Reddit
karis reddit search <query> [--subreddit]  # Search Reddit
karis reddit posts <subreddit> [--sort]    # Browse a subreddit
karis reddit comments <post_id>            # Get comment tree
karis reddit rules <subreddit>             # Subreddit rules

# YouTube
karis youtube search <query>               # Search YouTube

# Influencer Search
karis influencer search --keywords "fitness,workout" --platform instagram
karis influencer search --keywords "tech" --min-followers 100000 --max-followers 1000000
karis influencer results --record-id <id>              # Browse page 1
karis influencer results --record-id <id> --session-id <sid> --page 2  # Paginate
karis influencer list                                  # List recent searches

# Brand & GEO
karis brand info                           # Brand profile (via tool)
karis geo data [--domain] [--time-range]   # GEO visibility data

# Utility
karis schedule list                        # List scheduled tasks
karis memory recall [query]                # Search saved facts
```

### Agent Chat (Layer 2/3)

```bash
karis chat                                 # Free-form CMO agent
karis chat --skill <name> "message"        # Skill-guided agent
karis chat -t <tool> --tool-args '{...}'   # Escape hatch for any tool
```

### Brand Management

```bash
karis brand init <domain>                  # Create brand profile
karis brand show                           # View brand profile
karis brand list                           # List all brands
karis brand select                         # Switch active brand
karis brand customize                      # Override brand fields
karis brand refresh                        # Refresh from source
```

### Infrastructure

```bash
karis setup                                # First-time wizard
karis doctor                               # Verify environment
karis config list                          # View config
karis config set api-key sk-ka-...         # Set API key
karis tools list                           # Discover tools & skills
karis capabilities                         # Layer Cake overview
```

### Output Formats

All commands support multiple output formats:

```bash
karis reddit search "AI" -f table          # Table (default in TTY)
karis reddit search "AI" -f json           # JSON
karis reddit search "AI" -f yaml           # YAML
karis reddit search "AI" -f csv            # CSV
karis reddit search "AI" -f md             # Markdown table
karis reddit search "AI" --json            # Legacy JSON flag
```

---

## Available Skills (Layer 2)

| Skill | Description |
|-------|-------------|
| `brand-intel` | Analyze positioning and recommend growth actions |
| `aeo-geo` | Audit visibility in ChatGPT, Perplexity, Claude |
| `reddit-listening` | Monitor discussions and community sentiment |
| `reddit-growth` | Generate posts, comments, and engagement strategies |
| `elonmusk-repost` | Optimize tweets for maximum reach on X |
| `page-seo` | Traditional SEO audit |

See [agents/AGENTS.md](agents/AGENTS.md) for full skill documentation.

---

## Prerequisites

- **Karis API key** — Get from [app.karis.im/agent](https://app.karis.im/agent)
- **Node.js 18+**

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

### For CLI Users

The CLI connects to Karis Platform for enhanced marketing intelligence.

**Setup:**
```bash
karis setup
```

Interactive wizard guides you through:
1. Configuring your Karis API key
2. Creating your brand profile

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

Get your API key at [app.karis.im/agent](https://app.karis.im/agent)

---

## Configuration

Karis stores configuration globally in `~/.karis/`:

```
~/.karis/
└── config.json             # api-key and base-url
```

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

MIT License — see [LICENSE](LICENSE) for details.

---

## Links

- **Website:** [karis.im](https://karis.im)
- **GitHub:** [github.com/karis-ai/karis](https://github.com/karis-ai/karis)

---

**Your agent now has a CMO. You build, Karis grows.**
