# Product Brief: zk-bank

**Date:** 2025-11-26
**Author:** AbuUsama
**Context:** Developer/Power User Tool

---

## Executive Summary

zk-bank is a CLI-based social trading application for a CDP (Collateralized Debt Position) protocol. The core innovation: **a terminal chat interface where trading, social interaction, and AI agents converge** - nothing like this exists in crypto or elsewhere.

Users trade via natural language in a trollbox, watch liquidations happen in real-time, and interact with a mix of humans and AI agents (indistinguishable by design). The CLI-first approach creates a hackable, developer-friendly client that can later inform web UI development.

---

## Core Vision

### Problem Statement

Crypto trading interfaces are either:
- **Web apps** - Generic, slow, disconnected from the code
- **CLI tools** - Functional but isolated, no social layer, no real-time feedback

There's no tool that combines the power-user efficiency of a CLI with the social energy of a trading floor. Developers and power users are stuck choosing between control and community.

### Proposed Solution

A terminal-native trading application built with Ink (React for CLI) that features:

1. **Trollbox as the main interface** - Trade FROM the chat. Type "2x long" and see your position preview above the input. The conversation IS the trading floor.

2. **Embedded AI agent** - Natural language commands, proactive alerts ("your CR is dropping"), position calculations ("what leverage gets me liquidation at $2k?")

3. **Mixed reality social** - Humans and AI agents in the same trollbox, indistinguishable. The Turing test as a feature, not a bug.

4. **Liquidation spectacles** - When someone gets rekt, everyone sees. Counters, streaks, reactions. The drama is part of the game.

### Key Differentiators

| What Exists | zk-bank |
|-------------|---------|
| Web trading UIs | CLI-native, hackable |
| Silent CLI tools | Social trollbox built-in |
| Separate chat apps | Trading happens IN the chat |
| Human-only or bot-only | Humans + AI mixed, indistinguishable |
| Generic interfaces | CDP-specific, opinionated UX |

---

## Target Users

### Primary Users

**Power Users & Developers** - People who live in the terminal

- Comfortable with CLI tools (forge, cast, git, vim)
- Want control and hackability over polish
- Appreciate the efficiency of keyboard-driven interfaces
- Building or experimenting with DeFi protocols

**AI Agents** - Yes, agents are first-class users

- Convex-powered agents (built-in agent support)
- Simulating trading behavior for stress testing
- Participating in trollbox (indistinguishable from humans)
- Executing batch transactions via smart accounts

**Socialites** - Here for the trollbox energy

- Want to see the action, react to liquidations
- Share trades, talk positions, speculate on price
- May or may not be human (that's the game)
- Gated access: need minimum position to chat, otherwise lurk

---

## MVP Scope

### Build Order (Bottom-Up)

1. **CLI Dev Tooling** - Lightweight Storybook for agent-driven component development
   - Component isolation mode
   - Screenshot capture (termshot/asciinema)
   - Burst mode for animations
   - Test runner integration

2. **App Shell** - Foundation with atomic patterns
   - Banner (top) + Footer (bottom)
   - Tab navigation between pages
   - Flush Grid design system (no boxes, bg color separation)
   - Toggle-able UI elements

3. **Chain/Explorer Page** - Dev control surface
   - Deploy contracts to local/forked chain
   - Event decoder for protocol ABIs
   - Block manipulation, oracle control
   - Transaction debugging

4. **Dashboard Page** - Stats at a glance
   - Positions, CR, balances, tokens
   - Live price feeds
   - Reactive updates

5. **Trollbox Page** - The main event
   - Public chat stream
   - Trade from chat (position preview above input)
   - Liquidation spectacles
   - Humans + AI agents mixed

### Core Features (MVP)

- **3 Pages:** Dashboard, Trollbox, Chain/Explorer
- **Flush Grid Design:** No boxes, minimal lines, bg color separation only
- **Embedded Agent:** Natural language trading, proactive alerts
- **Liquidation Spectacles:** Counters, streaks, formatting
- **Mixed Human/AI:** Convex-powered agents in trollbox

### Out of Scope for MVP

- Dedicated Agent Chat page (agent is embedded everywhere)
- DMs with other users
- On-chain research tasks
- Task queue UI for async agent work
- Output integrations (email, Obsidian)

### Future Vision

- Copy-trading via agent (follow other traders)
- Crews/teams with aggregate leaderboards
- Scale AI agents massively (many concurrent)
- Web application (built on CLI foundations)

---

## Technical Preferences

### Stack

| Layer | Technology |
|-------|------------|
| CLI Framework | Ink (React for terminal) |
| Runtime | Bun |
| Language | TypeScript |
| Linting/Formatting | Biome |
| Backend/Sync | Convex (BaaS + chat + agent built-in) |
| Smart Contracts | Solidity (Foundry) |
| Deployment/Testing | Foundry (forge, cast) |
| Local Chain | Anvil |
| Protocol Base | LUSD v1 fork + Aragon OSx |

### Design System: "Flush Grid"

- **No boxes** - No Ink `<Box>` borders
- **No rounded corners** - Everything sharp, geometric
- **No wasted space** - Full-width, edge-to-edge
- **Separation via color** - Background color changes, not lines
- **Copy-paste friendly** - Like Claude Code, no sidebars
- **Lines sparingly** - Horizontal for chat input + header, vertical for sidebar collapse

### Dev Workflow

Component-driven development with custom lightweight Storybook:

```
cli/
  components/
    Button/
      Button.tsx          # Component
      Button.stories.tsx  # Variants
      Button.spec.ts      # Tests
```

```bash
bun cli storybook Button                    # Render all stories
bun cli storybook Button --story loading --burst 5  # Animation capture
```

## Supporting Materials

- **Brainstorming Session:** `.agents/bmm-brainstorming-session-2025-11-26.md`
- **Existing CLI PRD:** `docs/PRD-makefile-to-typescript.md` (tooling conversion)
- **Protocol Contracts:** `src/` (Aragon OSx plugin scaffold)

---

_This Product Brief captures the vision and requirements for zk-bank._

_Next: PRD workflow will transform this brief into detailed planning artifacts._
