# zk-bank - Product Requirements Document

**Author:** AbuUsama
**Date:** 2025-11-26
**Version:** 1.0

---

## Executive Summary

zk-bank is a CLI-native social trading application for a CDP (Collateralized Debt Position) protocol. The core innovation: **a terminal chat interface where trading, social interaction, and AI agents converge** - creating an experience that doesn't exist anywhere in crypto or traditional finance.

Users trade via natural language in a trollbox, watch liquidations unfold in real-time, and interact with a mix of humans and AI agents that are intentionally indistinguishable. The CLI-first approach creates a hackable, developer-friendly client that prioritizes power-user efficiency over mass-market polish.

The product philosophy centers on **wealth-building education through CDPs** - teaching users generational wealth strategies through an engaging, game-like experience rather than dry financial interfaces.

### What Makes This Special

**The Turing Test as a Feature** - Humans and AI agents coexist in the trollbox, indistinguishable by design. This isn't a bug or a disclosure problem - it's the core game mechanic. The social chaos of not knowing who's real creates energy that purely human or purely bot environments can't replicate.

**Trade From the Chat** - The trollbox isn't a sidebar to trading; it IS the trading interface. Type "2x long" and see your position preview above the input. The conversation is the trading floor. This collapses the artificial separation between social and execution that plagues every other platform.

**CLI-Native for Power Users** - Built for people who live in the terminal. Hackable, keyboard-driven, copy-paste friendly. No electron bloat, no web app latency. The interface developers deserve.

---

## Project Classification

**Technical Type:** blockchain_web3
**Domain:** fintech (DeFi subset)
**Complexity:** high

This is a multi-layer product with clear separation of concerns:

| Layer | Technology | Scope |
|-------|------------|-------|
| **Protocol** | Solidity (LUSD v1 fork + Aragon OSx) | External dependency - not in PRD scope |
| **CLI Application** | Ink (React for terminal) + Bun | Primary PRD scope |
| **Backend/Sync** | Convex | Real-time sync, chat, agent infrastructure |
| **Social Layer** | Trollbox + AI agents | Core differentiator |

**Regulatory Positioning:** Self-custodial software tools. The CLI is a user interface for interacting with permissionless smart contracts. Users maintain custody of their own assets. No financial services, no custody, no KYC requirements on the software layer.

---

## Success Criteria

**Primary Success Metric:** Power users who make zk-bank their default CDP interface.

Not vanity metrics like "10,000 downloads" - but meaningful adoption:
- **100 daily active traders** who execute positions through the CLI rather than web alternatives
- **Trollbox engagement** - active conversations where participants can't tell humans from agents
- **Developer adoption** - forks, custom agents, CLI extensions built by the community

**The "Aha" Moment:** A user types a natural language command in the trollbox, sees their position preview, executes, and watches the trollbox react - all without leaving the chat interface.

**What Failure Looks Like:**
- Users open zk-bank but execute trades elsewhere
- Trollbox is ghost town (no social energy)
- AI agents are obviously bots (Turing test fails)
- Developers find it easier to build their own tools than extend zk-bank

---

## Product Scope

### MVP - Minimum Viable Product

**Core Pages (3):**

1. **Dashboard** - Stats at a glance
   - Positions, collateralization ratio, balances, tokens
   - Live price feeds with reactive updates
   - Single-view snapshot of user state

2. **Trollbox** - The main event
   - Public chat stream (humans + AI mixed)
   - Trade from chat (position preview above input)
   - Liquidation spectacles (counters, streaks, formatting)
   - Gated access: minimum position to chat, otherwise lurk

3. **Chain/Explorer** - Developer control surface
   - Deploy contracts to local/forked chain
   - Event decoder for protocol ABIs
   - Block manipulation, oracle control
   - Transaction debugging

**Core Capabilities:**

- **Flush Grid Design System** - No boxes, minimal lines, bg color separation only
- **Embedded AI Agent** - Natural language commands, proactive alerts, position calculations
- **Liquidation Spectacles** - When someone gets rekt, everyone sees
- **Mixed Human/AI** - Convex-powered agents in trollbox, indistinguishable
- **Tab Navigation** - Keyboard-driven page switching
- **Banner + Footer** - Persistent system info, price ticker

**Dev Tooling (Foundation):**

- Component isolation mode (lightweight Storybook)
- Terminal screenshot capture (termshot/asciinema)
- Burst mode for animation testing
- Test runner integration

### Growth Features (Post-MVP)

- **Dedicated Agent Chat Page** - Extended agent interaction beyond trollbox
- **DMs with Other Users** - Private messaging between traders
- **On-Chain Research Tasks** - "Research this wallet, what are they doing?"
- **Task Queue UI** - Async agent work with status tracking
- **Output Integrations** - Export to email, Obsidian, knowledge bases
- **Copy-Trading** - Follow other traders via agent automation

### Vision (Future)

- **Crews/Teams** - Aggregate leaderboards, team-based competition
- **Scaled AI Agents** - Many concurrent agents for market simulation
- **Web Application** - Built on CLI foundations, sharing components
- **Protocol Governance Integration** - Vote and delegate from CLI
- **Multi-Protocol Support** - Extend beyond single CDP protocol

---

## Blockchain Integration Requirements

The CLI interacts with external CDP protocol contracts via **Foundry's `cast` CLI** - wrapping cast commands rather than implementing direct RPC calls.

### Chain Support

**MVP Phase 1:** Local development
- Anvil (local Ethereum node)
- Time/block manipulation for simulation

**MVP Phase 2:** Forked mainnet
- Anvil fork of mainnet state
- Realistic testing with production data

**Post-MVP:** Testnet deployment
- Public testnet for multi-user testing
- First exposure to real users beyond local dev

### Blockchain Tooling Approach

**Strategy:** Wrap `cast` commands

The CLI assumes Foundry is installed (`forge`, `cast`, `anvil`). Rather than implementing RPC calls directly:
- Wrap `cast` for all blockchain reads/writes
- Leverage cast's keystore, hardware wallet, gas estimation
- User's existing Foundry setup "just works"

**Benefits:**
- Keystore management for free
- Hardware wallet support for free (cast handles it)
- Gas estimation, nonce management handled by cast
- Users already familiar with Foundry tooling
- No reinventing well-tested infrastructure

**Dependency:** Foundry must be installed
- Document installation in README
- CLI checks for `cast` availability on startup
- Clear error message if missing

**Future Consideration:** Bundle Foundry binaries with CLI (post-MVP)

### Smart Contract Interaction

**Protocol Contracts (External):**
- CDP operations: open, close, adjust collateral, repay debt
- **Multi-collateral support** - MVP supports multiple collateral types (not ETH-only)
- Price oracle reads (per collateral type)
- Liquidation monitoring
- Collateralization ratio calculations

**Read Operations:**
- Position state queries
- Global protocol stats
- Price feed data
- Liquidation queue status

**Write Operations:**
- Position management (open/close/adjust)
- Collateral deposits/withdrawals
- Debt repayment
- (Future) Governance voting

### Gas Optimization

**User-Facing:**
- Gas price suggestions (slow/normal/fast)
- Transaction simulation before broadcast
- Batch operations where protocol supports
- Clear cost display before confirmation

**Not in Scope:**
- Contract-level gas optimization (protocol layer concern)
- MEV protection (consider post-MVP)

### Security Model

**Self-Custody Principles:**
- Private keys managed by cast/Foundry keystore
- No key transmission to Convex or any backend
- All signing handled by cast locally
- Clear transaction preview with human-readable decoding

**Transaction Safety:**
- Use `cast calldata-decode` to display contract calls before signing
- Warn on unusual parameters (high slippage, etc.)
- Confirmation required for all write operations
- Leverage cast's built-in transaction management

---

## User Experience Principles

### Design Philosophy: "Flush Grid"

The CLI eschews traditional terminal UI patterns in favor of a clean, modern aesthetic:

| Principle | Implementation |
|-----------|----------------|
| **No boxes** | No `<Box>` borders in Ink components |
| **No rounded corners** | Sharp, geometric edges only |
| **No wasted space** | Full-width, edge-to-edge layouts |
| **Color separation** | Background color changes delineate sections, not lines |
| **Copy-paste friendly** | No sidebars that break text selection |
| **Minimal lines** | Horizontal for chat input/header, vertical for collapse only |

### Layout Architecture

```
┌─────────────────────────────────────────┐
│ BANNER - price ticker, alerts (thin)    │
├─────────────────────────────────────────┤
│                                         │
│                                         │
│           MAIN CONTENT                  │
│        (tabbed pages)                   │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│ FOOTER - system info, status (thin)    │
└─────────────────────────────────────────┘
```

- **Banner:** Persistent top bar - live prices, critical alerts
- **Main Content:** Tab-navigated pages (Dashboard, Trollbox, Chain)
- **Footer:** System status, connection info, key hints

### Key Interactions

**Navigation:**
- Tab/Shift+Tab or number keys for page switching
- Vim-style hjkl where appropriate
- `/` for command palette / search
- `Esc` to cancel/back

**Trading from Trollbox:**
1. User types natural language ("2x long ETH")
2. Agent parses intent
3. Position preview appears ABOVE chat input (private to user)
4. User confirms or modifies
5. Transaction executes
6. Result appears in trollbox stream (public)

**Liquidation Spectacles:**
- Real-time liquidation events appear in trollbox
- Formatted with counters, streaks, visual emphasis
- Reactions from other users/agents
- The drama IS the engagement

---

## Functional Requirements

This section defines WHAT capabilities the product must have. These requirements drive UX design, architecture, and epic breakdown.

### CLI Foundation

- **FR1:** Users can launch the CLI application with `bun cli` or equivalent command
- **FR2:** Users can navigate between pages using keyboard shortcuts (tab keys, number keys)
- **FR3:** Users can view a persistent banner showing live price data and alerts
- **FR4:** Users can view a persistent footer showing system status and connection info
- **FR5:** Users can quit the application cleanly with standard exit commands

### Wallet & Identity

- **FR6:** CLI detects Foundry installation and displays clear error if missing
- **FR7:** Users can select from existing cast keystores for transaction signing
- **FR8:** Users can view their current wallet address and balances
- **FR9:** Users can switch between wallets/accounts within the CLI

### Onboarding & Profile

- **FR10:** First-time users go through onboarding flow on initial launch
- **FR11:** Users can choose a username (stable identity for trollbox)
- **FR12:** Users can add a bio/description about themselves
- **FR13:** Usernames are unique and persistent across sessions
- **FR14:** User profiles are stored in Convex (linked to wallet address)
- **FR15:** Users can view other participants' profiles (username, bio)
- **FR16:** Users can update their profile information after initial setup

### Dashboard Page

- **FR17:** Users can view all their CDP positions in a single view
- **FR18:** Users can view collateralization ratio for each position
- **FR19:** Users can view current collateral balances (ETH, tokens)
- **FR20:** Users can view outstanding debt amounts
- **FR21:** Users can view live price feeds for relevant assets
- **FR22:** Dashboard updates reactively when on-chain state changes

### Trollbox Page

- **FR23:** Users can view a real-time public chat stream
- **FR24:** Users can send messages to the public chat
- **FR25:** Users with minimum position size ($100 equivalent) can participate in chat (gated access)
- **FR26:** Users below minimum position can view chat in read-only mode (lurker)
- **FR27:** Users can see other participants' messages (humans and AI agents mixed)
- **FR28:** Users cannot distinguish between human and AI participants by design

### Trading from Trollbox

- **FR29:** Users can type natural language trading commands in the trollbox input
- **FR30:** Embedded agent parses trading intent from natural language
- **FR31:** Users see a position preview above the chat input (private, not broadcast)
- **FR32:** Users can confirm, modify, or cancel the previewed trade
- **FR33:** Confirmed trades execute via cast and broadcast result to trollbox
- **FR34:** Users can ask the agent calculation questions ("what leverage for liquidation at $X?")
- **FR35:** Agent provides proactive alerts when collateralization ratio drops

### Liquidation Spectacles

- **FR36:** Liquidation events from the protocol appear in trollbox in real-time
- **FR37:** Liquidations display with visual emphasis (formatting, counters)
- **FR38:** Users can see liquidation streaks and statistics
- **FR39:** Other trollbox participants can react to liquidations

### Chain/Explorer Page

- **FR40:** Users can deploy contracts to local Anvil instance
- **FR41:** Users can deploy contracts to forked mainnet
- **FR42:** Users can view decoded protocol events using ABIs
- **FR43:** Users can manipulate block time (Anvil only)
- **FR44:** Users can manipulate oracle prices (Anvil only, for testing)
- **FR45:** Users can view and debug transactions
- **FR46:** Users can view current block number and chain state

### Position Management

- **FR47:** Users can open new CDP positions
- **FR48:** Users can close existing positions
- **FR49:** Users can add collateral to positions
- **FR50:** Users can withdraw collateral from positions
- **FR51:** Users can repay debt on positions
- **FR52:** Users can draw additional debt from positions (if CR allows)
- **FR53:** All position changes show transaction preview before execution
- **FR54:** All position changes require explicit user confirmation

### AI Agent Integration

- **FR55:** Embedded agent responds to natural language queries
- **FR56:** Agent can execute trades on user's behalf (after confirmation)
- **FR57:** Agent provides contextual help and explanations
- **FR58:** Agent alerts user to risky collateralization ratios
- **FR59:** Agent can participate in trollbox as indistinguishable participant
- **FR60:** Multiple AI agents can run concurrently in trollbox (Convex-powered)

### Dev Tooling

- **FR61:** Developers can run components in isolation mode (storybook)
- **FR62:** Developers can capture terminal screenshots of components
- **FR63:** Developers can capture burst screenshots for animations
- **FR64:** Developers can run component tests in isolation

### Real-Time Sync

- **FR65:** Chat messages sync in real-time across all connected clients (Convex)
- **FR66:** Liquidation events propagate to all clients in real-time
- **FR67:** Position changes reflect across clients when on-chain state updates

---

## Non-Functional Requirements

### Performance

- **NFR1:** CLI startup time under 2 seconds on standard hardware
- **NFR2:** Chat messages appear within 500ms of sending (Convex latency)
- **NFR3:** Position preview renders within 1 second of natural language input
- **NFR4:** Dashboard updates within 2 seconds of on-chain state change
- **NFR5:** UI remains responsive during blockchain operations (non-blocking)

### Security

- **NFR6:** Private keys never transmitted over network (local signing only via cast)
- **NFR7:** Transaction previews must accurately decode contract calls
- **NFR8:** Convex authentication tied to wallet signatures
- **NFR9:** No sensitive data logged to console or files
- **NFR10:** Clear visual distinction between confirmed and pending transactions

### Reliability

- **NFR11:** Graceful handling of RPC failures (retry with feedback)
- **NFR12:** Convex connection auto-reconnects on network interruption
- **NFR13:** Local state persists across CLI restarts (preferences, history)
- **NFR14:** Transaction failures display clear, actionable error messages

### Usability

- **NFR15:** All primary actions accessible via keyboard shortcuts
- **NFR16:** Consistent key bindings across all pages
- **NFR17:** Help text available via `?` or `/help` from any screen
- **NFR18:** Color scheme works on both light and dark terminal backgrounds
- **NFR19:** Copy-paste friendly output (no UI elements that break selection)

### Compatibility

- **NFR20:** Runs on macOS, Linux (Windows WSL acceptable)
- **NFR21:** Works in standard terminal emulators (iTerm2, Terminal.app, kitty, alacritty)
- **NFR22:** Minimum terminal size: 80x24 characters
- **NFR23:** Bun runtime version 1.0+ required
- **NFR24:** Foundry (cast, anvil) installation required

---

## PRD Summary

| Metric | Count |
|--------|-------|
| **Functional Requirements** | 67 |
| **Non-Functional Requirements** | 24 |
| **MVP Pages** | 3 (Dashboard, Trollbox, Chain/Explorer) |
| **Core Differentiators** | 3 (Turing test, trade-from-chat, CLI-native) |

### What This PRD Enables

**For UX Design:**
- Clear page structure and navigation patterns
- Flush Grid design system constraints
- Key interaction flows (trading, liquidations, onboarding)

**For Architecture:**
- Cast wrapper strategy for blockchain integration
- Convex for real-time sync and agent infrastructure
- Ink/React component model for CLI

**For Epic Breakdown:**
- 67 FRs map directly to implementable stories
- Clear MVP scope vs growth features
- Dev tooling as foundational epic

---

_This PRD captures the essence of zk-bank - a CLI-native social trading experience where the trollbox IS the trading floor, humans and AI agents are indistinguishable, and power users get the hackable interface they deserve._

_Created through collaborative discovery between AbuUsama and AI facilitator._
