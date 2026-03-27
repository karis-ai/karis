# Karis

**First CMO for AI Agents** — marketing intelligence as CLI tools, agent skills, and strategic orchestration.

![Karis Demo](assets/demo.gif)

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

# Local CLI (http://localhost:8000)
karis-local setup
karis-local chat

# Staging CLI
karis-staging setup
karis-staging chat
```

### Claude Code

```bash
/plugin marketplace add https://github.com/karis-ai/karis
/plugin install brand-intel@karis
```

### Cursor / Windsurf / Codex / Any Agent (via Skills)

Install all Karis capabilities as a single skill:

```bash
npx skills add karis-ai/karis
```

Or install individual skills (brand intelligence, GEO audit, SEO, Reddit, etc.) separately:

```bash
npx skills add karis-ai/karis --full-depth
```

Then just ask your agent naturally:

```
"Analyze my brand for acme.com"
"Run a GEO audit"
"Write a Reddit post for our product launch"
```

Or point your agent to `agents/AGENTS.md` directly, or add to your system prompt / rules:

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

# First-time setup against local API
karis-local setup

# First-time setup against staging
karis-staging setup

# Interactive agent chat (Layer 3)
karis chat
karis-local chat
karis-staging chat

# Direct tool calls (Layer 1)
karis web search "AI coding tools"
karis reddit search "AI agents" --subreddit SaaS
karis x tweets elonmusk
karis browser status

# Skill-guided chat (Layer 2)
karis chat --skill brand-intel "Analyze my brand"
karis chat --skill aeo-geo "Audit AI search visibility"

# Browser relay write actions
karis browser connect --extension-id <id>
karis x post "hello world" --confirm
karis reddit post --subreddit test --title "Hello" --confirm
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
karis x post <text> --confirm              # Post through browser relay
karis x reply --url <tweetUrl> <text> --confirm
karis x follow <profiles...> --confirm

# Reddit
karis reddit search <query> [--subreddit]  # Search Reddit
karis reddit posts <subreddit> [--sort]    # Browse a subreddit
karis reddit comments <post_id>            # Get comment tree
karis reddit rules <subreddit>             # Subreddit rules
karis reddit post --subreddit <name> --title <text> --confirm
karis reddit comment --url <postUrl> <text> --confirm

# Browser relay
karis browser status                       # Show extension relay state
karis browser connect --extension-id <id> # Pair CLI to browser extension
karis browser navigate --url <url>        # Open a page in the connected browser
karis browser get-state                    # Inspect page state + accessibility tree
karis browser get-content [-o file]        # Extract readable page markdown
karis browser click [--element-index|--text|--selector]
karis browser type --text <text> [--clear]
karis browser scroll [--direction] [--amount]
karis browser screenshot [-o file]
karis browser post-x --text <text> --confirm
karis browser reply-x --url <tweetUrl> --text <text> --confirm
karis browser follow-x --profile <value> --confirm
karis browser post-reddit --subreddit <name> --title <text> --confirm
karis browser comment-reddit --url <postUrl> --text <text> --confirm

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
karis config set browser-extension-id <id> # Save browser extension ID
karis tools list                           # Discover tools & skills
karis capabilities                         # Layer Cake overview
```

### Browser Relay Notes

- `karis doctor` now includes browser relay status as an optional check.
- Browser write commands require a connected browser extension and a backend that exposes `/api/browser-actions/*` and `/api/browser-relay/relay-token`.
- High-risk commands such as posting, replying, commenting, and following require `--confirm`.
- `karis browser connect` resolves the extension ID from `--extension-id`, `KARIS_BROWSER_EXTENSION_ID`, `SOPHIA_BROWSER_EXTENSION_ID`, or `karis config set browser-extension-id <id>`.

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

The staging wrapper stores its own config in `~/.karis-staging/` so it does not overwrite your production login:

```text
~/.karis-staging/
└── config.json             # staging api-key and base-url
```

The local wrapper stores its own config in `~/.karis-local/` and defaults to `http://localhost:8000`:

```text
~/.karis-local/
└── config.json             # local api-key and base-url
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
