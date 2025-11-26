# Brainstorming Session Results

**Session Date:** 2025-11-26
**Facilitator:** Analyst Agent
**Participant:** AbuUsama

## Session Start

**Approach Selected:** AI-Recommended Techniques

**Techniques Planned:**
1. Role Playing (collaborative) - Multi-persona UX exploration
2. SCAMPER Method (structured) - Systematic CLI innovation
3. What If Scenarios (creative) - Bold social feature ideation
4. (Optional) Alien Anthropologist - Question CLI conventions

## Executive Summary

**Topic:** CLI UX + Social/Community Features for zk-bank CDP Protocol

**Session Goals:**
- Design the Ink-based CLI experience for interacting with the CDP protocol
- Explore social/community features (trollbox energy, collective experiences)
- Define the agent concept - anything user can do, agent can also do
- Make wealth-building through CDPs feel like a game people want to play

**Techniques Used:** Role Playing, SCAMPER (partial), What If Scenarios

**Total Ideas Generated:** 30+

### Key Themes Identified:

1. **Trollbox-First Design** - The social layer IS the product
2. **Agent as Invisible Co-pilot** - Embedded everywhere, not separate
3. **The Turing Test Game** - Humans + AI indistinguishable = secret sauce
4. **Clean Brutalism** - Flush grid, no boxes, function over decoration
5. **Hackable Client Philosophy** - Built for devs, reusable for web

## Technique Sessions

### Technique 1: Role Playing

**Key Insight:** The personas collapse into something more interesting than traditional user types.

| Actual User | What They're Doing |
|-------------|-------------------|
| **Power User / Socialite / Agent** | All converge in the trollbox. The secret sauce: *you don't know who's who*. Humans and AI agents interact, talk positions, laugh at liquidations, speculate on price - indistinguishable. |
| **Dev** | Running simulations. Claude Code on a loop with different avatar personas. Stress testing with time/price manipulation. Watching agents talk to each other. |

**Trollbox Access Model:**
- Need minimum credit/position size to chat
- Otherwise: listen-only (lurker mode)
- Prevents noise, creates status/incentive

**The Game:** Like a Telegram group where bots are indistinguishable from humans. The chaos IS the feature.

---

### Technique 2: SCAMPER (Partial - S and C)

**Design System: "Flush Grid"**

| Principle | Implementation |
|-----------|----------------|
| No boxes | No Ink `<Box>` borders |
| No rounded corners | Everything sharp, geometric |
| No wasted space | Full-width, edge-to-edge |
| Separation via color | Background color changes, not lines |
| Copy-paste friendly | Like Claude Code - no sidebars |

**Layout Architecture:**
- BANNER (thin, pinned) - price, live updates
- MAIN CONTENT (tabbable pages)
- FOOTER (thin, pinned) - system info
- All delineated by background color only

**Pages (Tab Navigation):**
1. **Dashboard** - Your stats, positions, tokens (single view)
2. **Agent Chat** - MAIN interface, do everything here, generative UI, domain-specific tools
3. **Chain/Explorer** - Deploy, blocks, oracles, tx parsing, debug (combined dev page)
4. **Trollbox** - Public room, liquidations, shared trades, social view

**Agent Chat = Primary Interface:**
- Natural language commands
- Domain-specific tools (not bash)
- Generative UI (markdown formatted)
- Can manage chains, positions, everything
- Split view option

**Trollbox Behavior:**
- Your actions private unless shared
- See others' trades, liquidations
- Mixed humans + agents (the secret sauce)

---

### Technique 3: What If Scenarios

**What If #1: Trollbox = Trading Interface** ✓

The chat IS where you trade. Smart separation:
- **Chat stream** (public) - messages, liquidations, shared trades
- **Agent UI preview** (private, above input) - position previews, calculations, confirmations
- **Input** - natural language commands OR chat messages

Your agent is your private calculator/executor living inside the social interface.

**What If #2: Proactive Agent + Research Tasks**

| Feature | Description | MVP? |
|---------|-------------|------|
| Liquidation alerts | Agent proactively warns you | Yes |
| Price action alerts | "Hey, ETH moving, your CR is..." | Yes |
| Trading advice | Agent gives suggestions based on position | Maybe |
| On-chain research | "Research this account, what are they doing" | Future |
| Task queue UI | Give tasks, agent brings back info | Future |
| Output to external | Email, Obsidian vault, knowledge base | Future |
| DMs | Chat with other users | Future |

**Spectacles Decision:** Keep clean - text-based formatting for liquidations, let trollbox reaction BE the spectacle. Maybe counters/streaks.

## Idea Categorization

### Immediate Opportunities (MVP CLI)

**Core Architecture:**
- Flush Grid design system (bg color separation, minimal lines)
- Lines: horizontal for chat input + header, vertical for sidebar collapse
- Toggle-able UI elements (clean view mode)
- Tab navigation: Dashboard → Trollbox → Chain/Explorer
- Banner (top) + Footer (bottom)

**Pages (3 for MVP):**

| Page | Purpose |
|------|---------|
| **Dashboard** | Stats, positions, CR, tokens, balances |
| **Trollbox** | MAIN PAGE - public chat, trade from here, liquidation spectacles |
| **Chain/Explorer** | Deploy, blocks, oracles, tx parsing, debug - unified control surface |

**Trollbox (Main Interface):**
- Public chat stream
- Trade from trollbox (position preview above input)
- Liquidation spectacles (counters, streaks, formatting)
- Gated access (min position to chat)
- **Humans + AI agents mixed** - core game mechanic
- AI agents running on loop (Claude Code SDK)

**Agent Capabilities (embedded, not separate page):**
- Natural language commands ("2x long")
- Position preview UI (above input)
- Liquidation/price alerts (proactive)

### Future Innovations (Post-MVP)

- Dedicated Agent Chat page
- DMs with other users
- On-chain research tasks
- Task queue UI
- Output integrations (email, Obsidian)

### Moonshots

- Copy-trading via agent
- Crews/teams with leaderboards
- Scale AI agents massively (many concurrent)

### Insights and Learnings

**Key Themes:**

1. **Trollbox-First Design** - The social layer IS the product. Trading happens inside the conversation.

2. **Agent as Invisible Co-pilot** - Not a separate interface, but embedded everywhere. Preview above input, proactive alerts, natural language execution.

3. **The Turing Test Game** - Humans and AI agents coexisting indistinguishably is the secret sauce, not a feature.

4. **Clean Brutalism** - Flush grid, no boxes, minimal lines, bg color separation. Function over decoration.

5. **Hackable Client Philosophy** - Built for you (the dev), reusable for web later. All the low-level stuff exposed.

## Action Planning

### Build Order (Bottom-Up)

#### #1 Priority: CLI Dev Tooling (Lightweight Storybook)

**Rationale:** Enables agent-driven component development. Can't efficiently build components without the workflow to test/iterate on them. No MCP bloat - built into the CLI itself.

**Workflow:**
1. Agent builds component
2. CLI renders component in isolation
3. Automated test runs
4. Screenshot capture (burst for animations)
5. Agent analyzes screenshots
6. Agent iterates or moves on

**Next steps:**
- Component isolation mode in CLI
- Terminal screenshot capture → image
- Burst mode for reactive/animated components
- Test runner integration
- Output format for agent analysis

---

#### #2 Priority: App Shell

**Rationale:** Foundation for everything. Atomic patterns, Ink/React structure.

**Next steps:**
- Set up atomic folder structure (atoms → molecules → organisms)
- Banner, footer, main content area, tab navigation
- Flush Grid design system implementation
- Toggle-able UI elements

---

#### #3 Priority: Chain/Explorer Page

**Rationale:** Low-level primitives. Deploy, events, block explorer. Everything else depends on this.

**Next steps:**
- Forge/Anvil integration
- Event decoder for protocol ABIs
- Unified control surface UI
- Chain manipulation (blocks, oracles)

---

#### #4 Priority: Dashboard

**Rationale:** Build up from primitives. Stats view.

**Next steps:**
- Connect to deployed protocol
- Position stats, CR, balances, tokens
- Live price feeds, reactive updates

---

#### #5 Priority: Trollbox

**Rationale:** The vision. Built last on solid foundations.

**Next steps:**
- Public chat stream
- Trade from chat (position preview above input)
- Liquidation spectacles
- AI agents mixed with humans

## Reflection and Follow-up

### What Worked Well

- Role Playing clarified that personas collapse into the trollbox (humans + agents indistinguishable)
- SCAMPER produced the Flush Grid design system
- What If pushed the "trade from trollbox" concept and proactive agent alerts
- Bottom-up prioritization revealed dev tooling as the true #1 priority

### Questions Resolved

**Terminal Screenshots:**
- Use **termshot** or **asciinema → svg-term** for high fidelity captures
- asciinema handles animation timing naturally
- Start simple, upgrade if needed

**Spec Format (Lightweight Storybook):**

```
cli/
  components/
    Button/
      Button.tsx          # The component
      Button.stories.tsx  # Stories/variants
      Button.spec.ts      # Optional test assertions
```

**Stories format:**
```tsx
export const stories = {
  default: () => <Button>Click me</Button>,
  disabled: () => <Button disabled>Disabled</Button>,
  loading: () => <Button loading>Loading...</Button>,
}

export const meta = {
  burst: ['loading'], // Animation capture
  delay: 100,         // ms between frames
}
```

**CLI commands:**
```bash
bun cli storybook Button                           # Render all
bun cli storybook Button --story loading --burst 5 # 5 frames
```

### Areas for Further Exploration

- Protocol contract integration (ABIs, event decoding)
- AI agent persona design for trollbox simulations
- VE-style tokenomics integration (reference sibling contracts)

### Next Session Planning

- **Suggested topics:** Research workflow - deep dive into LUSD v1 architecture, MakerDAO stability mechanism
- **Preparation needed:** Have protocol contracts available for reference

---

_Session facilitated using the BMAD CIS brainstorming framework_
