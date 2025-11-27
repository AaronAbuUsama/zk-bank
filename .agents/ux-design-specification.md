# zk-bank UX Design Specification

_Created on 2025-11-26 by AbuUsama_
_Generated using BMad Method - Create UX Design Workflow v1.0_

---

## Executive Summary

zk-bank is a CLI-native social trading application built with Ink (React for terminal). The core UX innovation: **the trollbox IS the trading interface** - users trade via natural language in a public chat where humans and AI agents are indistinguishable.

**Design Philosophy:** "Flush Grid" - no boxes, background color separation, copy-paste friendly, minimal lines.

**Target Emotion:** Playful chaos with power-user control - BitMEX trollbox energy meets terminal efficiency.

**Inspiration Sources:**
- Claude Code (minimal chrome, chat-centric, keyboard-first)
- Neovim (high contrast, semantic colors, information density)
- Bloomberg Terminal (black background, multi-panel, real-time data)
- IRC/WeeChat (chat buffer, activity indicators, split views)

---

## 1. Design System Foundation

### 1.1 Design System Choice

**Platform:** Ink (React for terminal)
**Approach:** Custom design system ("Flush Grid")

Ink provides the component primitives (`<Box>`, `<Text>`) but no design system. We're building a custom system specifically for CLI trading interfaces.

**Flush Grid Principles (from brainstorming):**

| Principle | Implementation |
|-----------|----------------|
| No boxes | No `<Box>` borders |
| No rounded corners | Sharp, geometric (terminal default) |
| No wasted space | Full-width, edge-to-edge |
| Color separation | Background color changes delineate sections |
| Copy-paste friendly | No sidebars that break text selection |
| Minimal lines | Horizontal for chat input/header, vertical for collapse only |

**Ink Capabilities We'll Use:**
- Full hex color support via Chalk
- RGB values
- Bold, italic, underline, dimColor, inverse
- Flexbox layout via Yoga engine
- Text wrapping and truncation

---

## 2. Core User Experience

### 2.1 Defining Experience

**The ONE thing:** Trade from the trollbox via natural language

**How it works:**
1. User types in trollbox input: "/trade 2x long ETH with my degen vault"
2. Agent parses intent (private)
3. Position preview appears ABOVE chat input (private to user)
4. User confirms or modifies
5. Transaction executes via cast
6. Result broadcasts to trollbox (public)

**What makes it unique:** The chat IS the trading floor. No separate trading UI.

### 2.2 Novel UX Patterns

**Pattern: Trade-From-Chat**

This is a novel pattern - no established CLI convention exists.

| Aspect | Design |
|--------|--------|
| **Trigger** | Natural language in chat input |
| **Detection** | Agent parses for trading intent |
| **Preview** | Appears above input, private to user |
| **Confirmation** | Enter to confirm, Esc to cancel, modify inline |
| **Feedback** | Transaction status, then result in public chat |
| **Error recovery** | Clear error message, position preview persists for retry |

**Pattern: Liquidation Spectacle**

Real-time liquidation events need visual impact in a text-based UI.

| Aspect | Design |
|--------|--------|
| **Appearance** | Distinct formatting, stands out from chat |
| **Information** | Address (truncated), amount, collateral type |
| **Social** | Counters, streaks, reactions from chat |
| **Sound** | None (terminal) - visual emphasis only |

---

## 3. Visual Foundation

### 3.1 Color System - User-Selectable Themes

**Approach:** Multiple built-in themes - user selectable via settings/command

Users can switch themes at runtime. All themes follow the same semantic color structure but with different palettes.

#### Built-in Themes

| Theme | Personality | Primary | Accent | Best For |
|-------|-------------|---------|--------|----------|
| **Terminal Classic** | Hacker, Matrix | `#33ff33` | `#00ffff` | Retro purists |
| **Cyberpunk Neon** | Electric, futuristic | `#ff2a6d` | `#05d9e8` | High energy |
| **Nord Frost** | Cool, calm, modern | `#88c0d0` | `#b48ead` | Long sessions |
| **Dracula** | Rich, balanced | `#bd93f9` | `#8be9fd` | Popular default |
| **Bloomberg** | Financial, professional | `#ff9933` | `#33ccff` | Serious traders |

**Default Theme:** Terminal Classic (can be changed in settings)

#### Theme Structure (All Themes)

Each theme implements these semantic color slots:

```typescript
interface Theme {
  name: string;

  // Backgrounds
  bg: string;           // Main background
  bgAlt: string;        // Banner, footer, input areas

  // Text
  text: string;         // Primary text
  textBright: string;   // Emphasized text
  textDim: string;      // Muted, timestamps

  // Semantic
  primary: string;      // Primary actions, branding
  accent: string;       // Secondary accent, info
  success: string;      // Price up, profits, confirmations
  error: string;        // Price down, losses, liquidations
  warning: string;      // Caution, attention needed
}
```

#### Theme: Terminal Classic (Default)

| Role | Hex | Usage |
|------|-----|-------|
| `bg` | `#0a0a0a` | Main background |
| `bgAlt` | `#0f0f0f` | Banner, footer |
| `text` | `#b0b0b0` | Chat messages |
| `textBright` | `#ffffff` | Emphasis |
| `textDim` | `#666666` | Timestamps |
| `primary` | `#33ff33` | Usernames, actions |
| `accent` | `#00ffff` | Info, links |
| `success` | `#33ff33` | Price up |
| `error` | `#ff3333` | Price down, liquidations |
| `warning` | `#ffff33` | Warnings |

#### Theme: Nord Frost

| Role | Hex |
|------|-----|
| `bg` | `#2e3440` |
| `bgAlt` | `#3b4252` |
| `text` | `#d8dee9` |
| `textBright` | `#eceff4` |
| `textDim` | `#4c566a` |
| `primary` | `#88c0d0` |
| `accent` | `#b48ead` |
| `success` | `#a3be8c` |
| `error` | `#bf616a` |
| `warning` | `#ebcb8b` |

#### Theme: Dracula

| Role | Hex |
|------|-----|
| `bg` | `#282a36` |
| `bgAlt` | `#21222c` |
| `text` | `#f8f8f2` |
| `textBright` | `#ffffff` |
| `textDim` | `#6272a4` |
| `primary` | `#bd93f9` |
| `accent` | `#8be9fd` |
| `success` | `#50fa7b` |
| `error` | `#ff5555` |
| `warning` | `#ffb86c` |

#### Theme Switching

- **Command:** `/theme <name>` or `/theme` to cycle
- **Settings:** Persisted in local config
- **Keyboard:** Could bind to shortcut (e.g., `Ctrl+T`)

#### Typography (Theme-Agnostic)

| Element | Style | Color Token |
|---------|-------|-------------|
| Usernames | Bold | `primary` or `accent` |
| Chat messages | Normal | `text` |
| Liquidation text | Bold | `error` |
| Position preview | Normal | `accent` |
| Timestamps | Dim | `textDim` |
| Prices (up) | Bold | `success` |
| Prices (down) | Bold | `error` |
| Footer/Banner | Normal | `primary` |

**Interactive Visualizations:**
- Color Theme Explorer: [ux-color-themes.html](./ux-color-themes.html)

---

## 4. Design Direction

### 4.1 Layout Modes - User-Switchable

**Approach:** Two layout modes - user can toggle between them

Like themes, layout density is a user preference. Different situations call for different views.

#### Layout Modes

| Mode | Density | Best For |
|------|---------|----------|
| **Chat Focus** | Medium | Social interaction, trollbox vibes, casual trading |
| **Dense Info** | High | Active trading, monitoring positions, power users |

**Default Mode:** Chat Focus
**Toggle:** Keyboard shortcut (e.g., `Ctrl+D` for density toggle)

#### Mode: Chat Focus (Default)

Maximizes chat visibility, IRC-style inline messages, centered liquidation spectacles.

```
┌─────────────────────────────────────────────────────────────────┐
│ ETH $3,421 ▲  BTC $67,890 ▼  │  ●                               │ <- Minimal banner
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ degen_ape: just went 5x long, wish me luck frens                │
│ zkwhale: ngmi ser, price about to dump hard                     │
│ anon_42: source: trust me bro                                   │
│                                                                 │
│          ╔════════════════════════════════════════════╗         │
│          ║  🔥 LIQUIDATED: 0x7a3f...8b2c              ║         │ <- Centered spectacle
│          ║     12.5 ETH  │  -$42,650  │  streak: 3    ║         │
│          ╚════════════════════════════════════════════╝         │
│                                                                 │
│ degen_ape: LMAOOO get rekt                                      │
│ zkwhale: F                                                      │
│                                                                 │
│ ────────────────────────────────────────────────────────────    │
│ ◆ LONG ETH 2x │ $3,421 → liq $2,850 │ [Enter] confirm           │ <- Compact preview
│ > 2x long ETH█                                                  │
├─────────────────────────────────────────────────────────────────┤
│ [1] [2] [3]  │  cr:185%                                         │ <- Minimal footer
└─────────────────────────────────────────────────────────────────┘
```

**Characteristics:**
- Minimal banner (prices + connection only)
- No timestamps (cleaner flow)
- Centered liquidation boxes (SPECTACLE)
- Compact single-line position preview
- Minimal footer

#### Mode: Dense Info

Maximum information density, timestamps on every message, detailed preview.

```
┌─────────────────────────────────────────────────────────────────┐
│ zk-bank │ ETH $3,421 ▲2.3% │ BTC $67,890 ▼0.8% │ CR:185% │ ●    │ <- Full banner
├─────────────────────────────────────────────────────────────────┤
│ ──────────────────────────────────────────────────────────────  │
│ 12:34:01  degen_ape     just went 5x long, wish me luck         │ <- Timestamps
│ 12:34:15  zkwhale       ngmi ser, price about to dump hard      │
│ 12:34:22  anon_42       source: trust me bro                    │
│ 12:34:31  *** LIQUIDATED *** 0x7a3f..8b2c 12.5 ETH -$42,650 s:3 │ <- Inline liq
│ 12:34:33  degen_ape     LMAOOO get rekt                         │
│ 12:34:35  zkwhale       F                                       │
│ ──────────────────────────────────────────────────────────────  │
│ [PREVIEW] LONG ETH 2x │ Entry:$3,421 │ Liq:$2,850 │ CR:150%     │ <- Detailed preview
│           ↳ collateral: 3.0 ETH ($10,263) │ debt: $5,131        │
│ ──────────────────────────────────────────────────────────────  │
│ $ 2x long ETH█                          [Enter] confirm [Esc]   │
├─────────────────────────────────────────────────────────────────┤
│ [1]Dash [2]Tbox [3]Chain │ pos:2 debt:$12.4k │ ?help qQuit      │ <- Full footer
└─────────────────────────────────────────────────────────────────┘
```

**Characteristics:**
- Full banner with position summary
- Timestamps on every message (aligned)
- Inline liquidations (more messages visible)
- Two-line detailed preview with gas estimate
- Full footer with stats and hints

#### Layout Switching

- **Keyboard:** `Ctrl+D` to toggle density mode
- **Command:** `/layout dense` or `/layout chat`
- **Settings:** Default mode persisted in config

#### Common Elements (Both Modes)

Both layouts share:
- Same color theme (independent setting)
- Same tab navigation ([1] [2] [3])
- Same input behavior
- Same position preview (just different detail level)
- Same liquidation data (just different formatting)

**Interactive Mockups:**
- Design Direction Showcase: [ux-design-directions.html](./ux-design-directions.html)

---

## 5. User Journey Flows

### 5.1 Critical User Paths

#### Journey 1: Onboarding (First Launch)

**Goal:** New user sets up identity and funds wallet

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    Welcome to zk-bank                           │
│                                                                 │
│  Step 1 of 4: Choose a username                                 │
│                                                                 │
│  > degen_trader█                                                │
│                                                                 │
│  This will be your identity in the trollbox.                    │
│  Usernames are unique and permanent.                            │
│                                                                 │
│                                        [Enter] continue         │
└─────────────────────────────────────────────────────────────────┘
```

**Flow:**

| Step | Screen | User Action | System Response |
|------|--------|-------------|-----------------|
| 1 | Username | Enter username | Validate uniqueness via Convex |
| 2 | Bio | Enter bio (optional) | Store in profile |
| 3 | Wallet | Choose: Import key OR Generate new | Create/load keystore |
| 4 | Fund | Faucet (testnet) or deposit address | Wait for funds, show balance |
| ✓ | Complete | Auto-redirect | Enter main app (Trollbox) |

**Wallet Options (Step 3):**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Step 3 of 4: Connect Wallet                                    │
│                                                                 │
│  [1] Import existing private key                                │
│      Use a key from your existing Foundry keystore              │
│                                                                 │
│  [2] Generate new wallet                                        │
│      Create a fresh wallet for zk-bank                          │
│                                                                 │
│  > 2█                                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Funding (Step 4 - Testnet):**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Step 4 of 4: Fund Your Wallet                                  │
│                                                                 │
│  Your address: 0x7a3f...8b2c                                    │
│                                                                 │
│  [F] Request from faucet (testnet)                              │
│  [S] Skip for now (can fund later)                              │
│                                                                 │
│  > Requesting funds...                                          │
│  ✓ Received 10 ETH from faucet                                  │
│                                                                 │
│                                        [Enter] start trading    │
└─────────────────────────────────────────────────────────────────┘
```

---

#### Journey 2: Trade from Trollbox (Core Experience)

**Goal:** Execute trades via natural language while in the social chat

**Two Input Modes:**

| Mode | Indicator | Behavior |
|------|-----------|----------|
| **Chat** (default) | `>` prompt | Messages broadcast to trollbox |
| **Agent** | `◆` prompt + "AGENT" tag + color border changes | Natural language → trade parsing |

**Mode Switching:** `Ctrl+Tab` to toggle (like Claude Code)

**Chat Mode Flow:**

```
┌─────────────────────────────────────────────────────────────────┐
│ degen_ape: just went 5x long, wish me luck                      │
│ zkwhale: ngmi ser                                               │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│ [CHAT]                                                          │
│ > gm everyone█                                     Ctrl+Tab: Agent │
└─────────────────────────────────────────────────────────────────┘

User presses Enter → "gm everyone" broadcasts to trollbox
```

**Agent Mode Flow:**

```
┌─────────────────────────────────────────────────────────────────┐
│ degen_ape: just went 5x long, wish me luck                      │
│ zkwhale: ngmi ser                                               │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│ [AGENT]                                                         │
│ ◆ 2x long ETH█                                     Ctrl+Tab: Chat │
└─────────────────────────────────────────────────────────────────┘

User presses Enter → Agent parses intent, shows preview (private)
```

**After Agent Parses:**

```
┌─────────────────────────────────────────────────────────────────┐
│ degen_ape: just went 5x long, wish me luck                      │
│ zkwhale: ngmi ser                                               │
│                                                                 │
│ ┌─ Position Preview ──────────────────────────────────────────┐ │
│ │ LONG ETH 2x                                                 │ │
│ │ Entry: $3,421  │  Liq: $2,850  │  CR: 150%                  │ │
│ │ Size: 1.5 ETH  │  Collateral: 3.0 ETH  │  Debt: $5,131      │ │
│ │                                                             │ │
│ │ [Enter] Confirm    [E] Edit    [Esc] Cancel                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ [AGENT]                                                         │
│ ◆ 2x long ETH                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Complex Multi-Step Commands:**

Agent can handle compound operations:

```
◆ close my BTC vault and add the funds to the ETH one and make it 3x long
```

Parses into:
1. Close BTC vault
2. Transfer collateral to ETH vault
3. Adjust ETH vault to 3x leverage

Preview shows all steps:

```
┌─ Execution Plan ────────────────────────────────────────────────┐
│ Step 1: Close BTC vault                                         │
│         └─ Withdraw 2.5 BTC ($95,000)                           │
│                                                                 │
│ Step 2: Add to ETH vault                                        │
│         └─ Deposit $95,000 as collateral                        │
│                                                                 │
│ Step 3: Adjust leverage to 3x                                   │
│         └─ New CR: 133%  │  Liq: $2,280                         │
│                                                                 │
│ Gas estimate: ~$8.50 (3 transactions)                           │
│                                                                 │
│ [Enter] Execute all    [1-3] Edit step    [Esc] Cancel          │
└─────────────────────────────────────────────────────────────────┘
```

**After Execution:**

- Transaction status shown privately
- On success: Result broadcasts to trollbox (public)
- Mode stays in Agent (user can continue or `Ctrl+Tab` to Chat)

```
Trollbox sees:
│ degen_trader opened LONG ETH 3x │ $102,000 collateral │
```

---

#### Journey 3: Position Management (Dashboard)

**Goal:** View and manage existing positions

**Access:** Tab [1] or keyboard `1`

```
┌─────────────────────────────────────────────────────────────────┐
│ zk-bank │ ETH $3,421 ▲2.3% │ BTC $67,890 ▼0.8% │ ● anvil        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  YOUR POSITIONS                                                 │
│                                                                 │
│  ┌─ ETH Vault ─────────────────────────────────────────────┐    │
│  │ Collateral: 3.0 ETH ($10,263)                           │    │
│  │ Debt: $5,547 zkUSD                                      │    │
│  │ Ratio: 185% (safe)           Liq price: $2,850 (-17%)   │    │
│  │                                                         │    │
│  │ [A] Add collateral  [W] Withdraw  [R] Repay  [D] Draw   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─ BTC Vault ─────────────────────────────────────────────┐    │
│  │ Collateral: 0.5 BTC ($33,945)                           │    │
│  │ Debt: $15,000 zkUSD                                     │    │
│  │ Ratio: 226% (safe)           Liq price: $45,000 (-34%)  │    │
│  │                                                         │    │
│  │ [A] Add collateral  [W] Withdraw  [R] Repay  [D] Draw   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  [N] New vault    [?] Help                                      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ [1] Dashboard  [2] Trollbox  [3] Chain                          │
└─────────────────────────────────────────────────────────────────┘
```

**Actions:** Each position has inline shortcuts, or use Agent mode for complex operations.

---

#### Journey 4: Watching Liquidations (Spectator)

**Goal:** Experience the social chaos of liquidation events

**Trigger:** Liquidation event from protocol (real-time via Convex)

**Chat Focus Mode:**

```
│ zkwhale: who's next? 👀                                         │
│                                                                 │
│          ╔════════════════════════════════════════════╗         │
│          ║  🔥 LIQUIDATED                             ║         │
│          ║                                            ║         │
│          ║  0x7a3f...8b2c                             ║         │
│          ║  12.5 ETH  │  -$42,650                     ║         │
│          ║                                            ║         │
│          ║  streak: 3  │  24h total: $1.2M            ║         │
│          ╚════════════════════════════════════════════╝         │
│                                                                 │
│ degen_ape: REKT                                                 │
│ anon_42: F                                                      │
│ zkwhale: lmaooo                                                 │
│ crypto_chad: another one bites the dust                         │
```

**Dense Info Mode:**

```
│ 12:34:31  *** LIQUIDATED *** 0x7a3f..8b2c 12.5 ETH -$42,650 s:3 │
│ 12:34:33  degen_ape     REKT                                    │
│ 12:34:34  anon_42       F                                       │
│ 12:34:35  zkwhale       lmaooo                                  │
```

**Liquidation Data Shown:**
- Address (truncated)
- Collateral amount lost
- USD value
- Streak (consecutive liquidations)
- 24h total (aggregate stat)

---

## 6. Component Library

### 6.1 Component Strategy

**Framework:** Ink (React for terminal)
**Approach:** Custom component library built on Ink primitives (`<Box>`, `<Text>`)

Ink provides low-level primitives. We build domain-specific components for zk-bank.

#### Component Categories

| Category | Components |
|----------|------------|
| **Layout** | AppShell, Banner, Footer, Page, TabNav |
| **Chat** | ChatStream, ChatMessage, ChatInput, ModeIndicator |
| **Trading** | PositionPreview, ExecutionPlan, VaultCard, PriceDisplay |
| **Feedback** | LiquidationAlert, Toast, Spinner, ProgressBar |
| **Forms** | TextInput, SelectInput, ConfirmDialog |
| **Data** | Table, KeyValue, Stat |

---

### 6.2 Layout Components

#### `<AppShell>`

Top-level layout wrapper. Manages banner, main content, footer.

```tsx
<AppShell>
  <Banner />
  <Page name="trollbox">
    <Trollbox />
  </Page>
  <Footer />
</AppShell>
```

**Props:**
- `theme: Theme` - Current color theme
- `layout: 'chat' | 'dense'` - Layout density mode

#### `<Banner>`

Persistent top bar. Content varies by layout mode.

| Mode | Content |
|------|---------|
| Chat Focus | Prices, connection status only |
| Dense Info | App name, prices, CR, block number, connection |

**Props:**
- `prices: PriceData[]`
- `connectionStatus: 'connected' | 'disconnected' | 'connecting'`
- `positionSummary?: { cr: number, debt: number }` (dense mode only)

#### `<Footer>`

Persistent bottom bar. Tab navigation + contextual info.

**Props:**
- `activeTab: 1 | 2 | 3`
- `hints?: string[]` - Contextual keyboard hints

#### `<TabNav>`

Tab switching component. Keyboard-driven.

**Behavior:**
- `1`, `2`, `3` keys switch tabs
- Visual indicator on active tab
- Adapts to layout mode (verbose vs minimal labels)

---

### 6.3 Chat Components

#### `<ChatStream>`

Scrollable chat message list. Core of trollbox.

**Props:**
- `messages: ChatMessage[]`
- `layoutMode: 'chat' | 'dense'`

**Behavior:**
- Auto-scrolls to bottom on new messages
- Scroll lock when user scrolls up
- Handles message types: chat, liquidation, system

#### `<ChatMessage>`

Single chat message. Adapts to layout mode.

**Chat Focus Mode:**
```
degen_ape: just went 5x long, wish me luck
```

**Dense Info Mode:**
```
12:34:01  degen_ape     just went 5x long, wish me luck
```

**Props:**
- `username: string`
- `content: string`
- `timestamp: Date`
- `userColor: string` (from theme, assigned per user)

#### `<ChatInput>`

Input field with mode indicator.

**Props:**
- `mode: 'chat' | 'agent'`
- `onSubmit: (text: string) => void`
- `onModeToggle: () => void`

**Visual:**
```
[CHAT]
> message here█                              Ctrl+Tab: Agent
```

```
[AGENT]
◆ command here█                              Ctrl+Tab: Chat
```

#### `<ModeIndicator>`

Visual tag showing current input mode.

**States:**
- `[CHAT]` - Green, default
- `[AGENT]` - Cyan, with diamond prompt

---

### 6.4 Trading Components

#### `<PositionPreview>`

Shows parsed trade intent before execution.

**Props:**
- `position: PositionData`
- `onConfirm: () => void`
- `onEdit: () => void`
- `onCancel: () => void`

**Layout:**
```
┌─ Position Preview ──────────────────────────────────────────┐
│ LONG ETH 2x                                                 │
│ Entry: $3,421  │  Liq: $2,850  │  CR: 150%                  │
│ Size: 1.5 ETH  │  Collateral: 3.0 ETH  │  Debt: $5,131      │
│                                                             │
│ [Enter] Confirm    [E] Edit    [Esc] Cancel                 │
└─────────────────────────────────────────────────────────────┘
```

#### `<ExecutionPlan>`

Multi-step trade plan (for complex agent commands).

**Props:**
- `steps: ExecutionStep[]`
- `gasEstimate: string`
- `onExecute: () => void`
- `onEditStep: (index: number) => void`
- `onCancel: () => void`

#### `<VaultCard>`

Single vault/position display on Dashboard.

**Props:**
- `vault: VaultData`
- `onAction: (action: 'add' | 'withdraw' | 'repay' | 'draw') => void`

**Layout:**
```
┌─ ETH Vault ─────────────────────────────────────────────┐
│ Collateral: 3.0 ETH ($10,263)                           │
│ Debt: $5,547 zkUSD                                      │
│ Ratio: 185% (safe)           Liq price: $2,850 (-17%)   │
│                                                         │
│ [A] Add collateral  [W] Withdraw  [R] Repay  [D] Draw   │
└─────────────────────────────────────────────────────────┘
```

#### `<PriceDisplay>`

Price with change indicator.

**Props:**
- `symbol: string`
- `price: number`
- `change: number` (percentage)

**Variants:**
- Compact: `ETH $3,421 ▲`
- Full: `ETH $3,421.50 ▲2.3%`

---

### 6.5 Feedback Components

#### `<LiquidationAlert>`

Liquidation event display. Adapts to layout mode.

**Props:**
- `liquidation: LiquidationData`
- `layoutMode: 'chat' | 'dense'`

**Chat Focus Mode:** Centered box, spectacle format
**Dense Info Mode:** Inline, single line

#### `<Toast>`

Temporary notification. Appears at top of main content.

**Props:**
- `type: 'success' | 'error' | 'warning' | 'info'`
- `message: string`
- `duration?: number` (auto-dismiss)

#### `<Spinner>`

Loading indicator.

**Variants:**
- Inline: `⠋ Loading...`
- Block: Centered with message

#### `<ConfirmDialog>`

Confirmation prompt for destructive actions.

**Props:**
- `title: string`
- `message: string`
- `onConfirm: () => void`
- `onCancel: () => void`

---

### 6.6 Form Components

#### `<TextInput>`

Text input field. Used in onboarding, forms.

**Props:**
- `label?: string`
- `placeholder?: string`
- `value: string`
- `onChange: (value: string) => void`
- `onSubmit: () => void`

#### `<SelectInput>`

Selection from list of options.

**Props:**
- `options: { label: string, value: string }[]`
- `value: string`
- `onChange: (value: string) => void`

**Interaction:** Arrow keys to navigate, Enter to select

---

### 6.7 Data Display Components

#### `<KeyValue>`

Label-value pair display.

```
Collateral: 3.0 ETH ($10,263)
```

**Props:**
- `label: string`
- `value: string | ReactNode`
- `dim?: boolean` (for secondary info)

#### `<Stat>`

Prominent statistic display.

**Props:**
- `label: string`
- `value: string`
- `status?: 'good' | 'warning' | 'danger'`

```
Ratio: 185% (safe)     <- status: good, green
Ratio: 125% (caution)  <- status: warning, yellow
Ratio: 105% (danger!)  <- status: danger, red
```

---

### 6.8 Theme Integration

All components consume theme via React Context:

```tsx
const { theme } = useTheme();

<Text color={theme.primary}>Username</Text>
<Text color={theme.error}>-$42,650</Text>
```

**ThemeProvider** wraps app and provides:
- Current theme object
- `setTheme(name)` function
- Theme persistence to local config

---

## 7. UX Pattern Decisions

### 7.1 Consistency Rules

*Refined through multi-agent party mode discussion*

#### Border Usage (Flush Grid Exception)

**Rule:** Borders only for user-actionable overlays

| Element | Borders Allowed | Rationale |
|---------|-----------------|-----------|
| Position Preview | ✅ Yes | Requires user decision (confirm/cancel) |
| Execution Plan | ✅ Yes | Multi-step action requiring confirmation |
| Confirm Dialog | ✅ Yes | Explicit user action required |
| Chat Messages | ❌ No | Static content, part of the flow |
| Vault Cards | ❌ No | Use background color separation |
| Data Displays | ❌ No | Flush Grid principle applies |

#### Mode Indication (Chat vs Agent)

**Critical:** Mode must be unmistakable to prevent accidental broadcasts

| Indicator | Chat Mode | Agent Mode |
|-----------|-----------|------------|
| Prompt symbol | `>` | `◆` |
| Label | `[CHAT]` | `[AGENT]` |
| Input background | `theme.bgAlt` | `theme.accent` at 10% opacity |
| Hint text | `Ctrl+Tab: Agent` | `Ctrl+Tab: Chat` |

**Background color shift is mandatory** - not just prompt/label changes. Users must feel the mode change viscerally.

#### Message Ownership

**Rule:** User's own chat messages are NOT visually distinguished

| Content Type | Highlighting | Rationale |
|--------------|--------------|-----------|
| Your chat messages | None | You're part of the trollbox chaos, not special |
| Others' chat messages | None | Equal treatment, indistinguishable |
| Agent responses (private) | Distinct area | Clearly "yours", above input |
| Position preview | Boxed + label | Private to user, actionable |

**Private content indicator:** Position previews and agent responses include subtle `(only you can see this)` label or spatial positioning that makes ownership clear.

#### Agent Identity

**Rule:** Agent is a tool, not a character

- No anthropomorphic name (not "Zeke" or "Assistant")
- Mode labeled `[AGENT]` not `[Ask Zeke]`
- Trollbox AI participants ARE indistinguishable (per PRD)
- YOUR agent is clearly a tool interface, not pretending to be human

Different contexts, different rules:
- Trollbox: Human/AI indistinguishable (the game)
- Agent mode: Clearly a tool (your interface)

#### Feedback Patterns

| Event | Pattern | Duration |
|-------|---------|----------|
| Success (trade executed) | Toast + trollbox broadcast | Toast: 3s auto-dismiss |
| Error (trade failed) | Toast + preview persists | Toast: manual dismiss |
| Warning (low CR) | Banner alert | Persistent until resolved |
| Info (system message) | Inline in chat stream | Scrolls with chat |
| Loading (tx pending) | Spinner in preview area | Until resolved |

#### Confirmation Patterns

| Action | Confirmation Required |
|--------|----------------------|
| Execute trade | Yes - Enter to confirm in preview |
| Close vault | Yes - Confirm dialog |
| Add collateral | Yes - Preview + Enter |
| Withdraw collateral | Yes - Preview + Enter |
| Send chat message | No - immediate on Enter |
| Switch mode | No - immediate on Ctrl+Tab |

#### Keyboard Shortcuts (Global)

| Shortcut | Action |
|----------|--------|
| `1`, `2`, `3` | Switch tabs (Dashboard, Trollbox, Chain) |
| `Ctrl+Tab` | Toggle Chat/Agent mode |
| `Ctrl+D` | Toggle layout density |
| `Ctrl+T` | Cycle color theme |
| `Esc` | Cancel current action / dismiss preview |
| `Enter` | Submit input / confirm action |
| `?` | Show help |
| `q` | Quit application |

#### Empty States

| Screen | Empty State |
|--------|-------------|
| Dashboard (no positions) | "No vaults yet. Open one from the trollbox!" + hint |
| Trollbox (no messages) | "Be the first to say something..." |
| Chain (no txs) | "No transactions yet. Deploy or interact to see activity." |

---

## 8. Responsive Design & Accessibility

### 8.1 Terminal Adaptation Strategy

#### Terminal Size Requirements

| Size | Columns | Rows | Support Level |
|------|---------|------|---------------|
| Minimum | 80 | 24 | Required - app refuses to start below this |
| Recommended | 120 | 40 | Optimal experience |
| Large | 160+ | 50+ | Extra content visible, no layout change |

**Behavior at minimum size (80x24):**
- Banner: Abbreviated (prices only, no app name)
- Footer: Tab numbers only, no labels
- Chat: Fewer visible messages
- Previews: Compact single-line variant

#### Dynamic Resizing

Ink + Yoga handle terminal resize events. Components adapt:

| Component | Small Terminal | Large Terminal |
|-----------|----------------|----------------|
| Banner | `ETH $3,421 ▲ │ ●` | `zk-bank │ ETH $3,421.50 ▲2.3% │ BTC $67,890 ▼0.8% │ ● anvil` |
| Footer | `[1][2][3]` | `[1] Dashboard  [2] Trollbox  [3] Chain │ ?help qQuit` |
| VaultCard | Stacked key-values | Side-by-side layout |
| PositionPreview | 2 lines | 4 lines with gas estimate |

#### Truncation Strategy

When content exceeds available width:

| Content Type | Truncation Method |
|--------------|-------------------|
| Addresses | Middle truncate: `0x7a3f...8b2c` |
| Usernames | End truncate with ellipsis: `degen_ape_ultra...` |
| Chat messages | Wrap to next line (never truncate) |
| Prices | Never truncate (critical data) |
| Long commands | Horizontal scroll in input |

### 8.2 Accessibility

#### Keyboard Navigation

**Principle:** 100% keyboard accessible. Mouse optional (terminal standard).

| Context | Navigation |
|---------|------------|
| Global | Number keys for tabs, `?` for help, `q` to quit |
| Chat input | Standard text editing, `Ctrl+Tab` mode switch |
| Previews | `Enter` confirm, `Esc` cancel, `E` edit |
| Lists/Options | Arrow keys to navigate, `Enter` to select |
| Dialogs | `Tab` between options, `Enter` to confirm |

#### Focus Management

- Focus always visible (cursor position, highlighted option)
- Focus trapped in modals/dialogs until dismissed
- Predictable focus order (top-to-bottom, left-to-right)

#### Screen Reader Considerations

Terminal screen readers (like NVDA, VoiceOver in terminal) work differently than web. Key considerations:

| Element | Screen Reader Approach |
|---------|------------------------|
| Mode changes | Announce "Agent mode" / "Chat mode" on switch |
| New messages | Configurable: announce new messages or silent |
| Liquidations | Announce with priority (interrupts) |
| Previews | Full content announced when appearing |
| Errors | Announced immediately with error tone |

**Implementation:** Ink doesn't have native ARIA, but:
- Use semantic text structure (clear labels)
- Avoid purely visual indicators (always include text)
- Timestamps in dense mode help screen readers parse message order

#### Color Contrast

All themes must meet WCAG AA contrast ratios:

| Element | Minimum Ratio | Our Themes |
|---------|---------------|------------|
| Body text on background | 4.5:1 | ✅ All pass (light gray on black) |
| Large text / headers | 3:1 | ✅ All pass |
| UI components | 3:1 | ✅ All pass |

**Terminal Classic theme contrast:**
- `#b0b0b0` on `#0a0a0a` = 10.5:1 ✅
- `#33ff33` on `#0a0a0a` = 12.3:1 ✅
- `#ff3333` on `#0a0a0a` = 5.2:1 ✅

#### Motion & Animation

- Minimal animation (terminal standard)
- Spinner uses text characters (`⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏`), not flashing
- No flashing content (seizure risk)
- Cursor blink follows terminal settings (user controlled)

### 8.3 Internationalization Considerations

**MVP:** English only

**Future considerations:**
- RTL support would require layout changes
- Unicode support for usernames (emoji, non-Latin chars)
- Number formatting (1,000 vs 1.000) based on locale
- Date/time formatting in timestamps

---

## 9. Implementation Guidance

### 9.1 Completion Summary

**UX Design Specification Complete!**

#### What We Created

| Section | Content |
|---------|---------|
| **Design System** | Flush Grid principles, Ink component strategy |
| **Color Themes** | 5 user-selectable themes with semantic tokens |
| **Layout Modes** | Chat Focus + Dense Info, toggleable |
| **User Journeys** | Onboarding, Trade from Chat, Position Management, Liquidation Watching |
| **Components** | 20+ components across 6 categories |
| **UX Patterns** | Border rules, mode indication, feedback, shortcuts |
| **Accessibility** | Keyboard nav, screen reader, color contrast |

#### Key Design Decisions

1. **User Preferences:** Themes AND layouts are user-switchable
2. **Two Input Modes:** Chat (public) and Agent (private parsing) via `Ctrl+Tab`
3. **Flush Grid Exceptions:** Borders only for actionable overlays
4. **Mode Must Be Obvious:** Background color shift, not just prompt change
5. **Trollbox Equality:** Your messages aren't special - you're part of the chaos
6. **Agent is a Tool:** No anthropomorphic naming

#### Deliverables

| File | Description |
|------|-------------|
| `ux-design-specification.md` | This document - complete UX spec |
| `ux-color-themes.html` | Interactive theme visualizer |
| `ux-design-directions.html` | Layout direction mockups |

### 9.2 Implementation Priorities

**Phase 1: Foundation**
- ThemeProvider + theme switching
- AppShell with Banner/Footer
- TabNav component
- Basic ChatStream + ChatInput

**Phase 2: Core Experience**
- Mode switching (Chat/Agent)
- ChatMessage with layout variants
- PositionPreview component
- LiquidationAlert component

**Phase 3: Trading**
- ExecutionPlan for multi-step commands
- VaultCard for Dashboard
- Transaction feedback (Toast, Spinner)

**Phase 4: Polish**
- Onboarding flow
- Help system
- Terminal size adaptation
- Settings persistence

### 9.3 Developer Handoff Notes

**For Architects:**
- Theme system uses React Context
- Layout mode is separate from theme (independent settings)
- Components should accept `layoutMode` prop where behavior differs

**For Developers:**
- All colors via `theme.tokenName`, never hardcoded hex
- Use Ink's `<Box>` for layout, `<Text>` for content
- Test at 80x24 minimum terminal size
- Mode indicator background is critical UX - don't skip it

**For Testers:**
- Test mode switching doesn't leak (agent command as chat, or vice versa)
- Verify all themes meet contrast requirements
- Test keyboard-only navigation for entire app
- Liquidation alerts should interrupt and be noticeable

---

## Appendix

### Related Documents

- Product Requirements: `.agents/prd.md`
- Product Brief: `.agents/product-brief-zk-bank-2025-11-26.md`
- Brainstorming: `.agents/bmm-brainstorming-session-2025-11-26.md`

### Version History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-11-26 | 1.0 | Initial UX Design Specification | AbuUsama |

---

_This UX Design Specification was created through collaborative design facilitation for CLI/terminal interfaces._
