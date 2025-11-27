# Architecture

## Executive Summary

zk-bank is a CLI-native social trading application for a CDP protocol, built with Ink (React for terminal) and Bun. The architecture centers on three pillars: (1) an interactive terminal UI with the trollbox as the primary trading interface, (2) real-time sync via Convex for chat, liquidations, and AI agents, and (3) Foundry `cast` CLI wrapping for all blockchain operations with self-custody principles.

## Project Initialization

**Foundation:** Existing `/cli` boilerplate (Ink 5 + React 19 + Bun)

**Modifications from existing boilerplate:**
- Remove Commander.js (Ink-only, no dual-mode)
- Extend cast wrapper service for CDP operations
- Add Convex for real-time backend
- Add theme system with 5 built-in themes
- Add page navigation (Dashboard, Trollbox, Chain)

**First implementation story should:**
1. Remove Commander dependency and dual-mode logic from `cli/index.ts`
2. Install Convex: `bun add convex`
3. Initialize Convex project structure

## Decision Summary

| Category | Decision | Version | Affects FRs | Rationale |
| -------- | -------- | ------- | ----------- | --------- |
| Runtime | Bun | 1.0+ | All | Fast, native TypeScript, built-in APIs |
| CLI Framework | Ink | 5.1.0 | All UI | React for terminal, Flush Grid design |
| React | React | 19 | All UI | Latest, concurrent features |
| State Management | Jotai | 2.12.2 | All | Atomic state, no Context boilerplate, minimal re-renders |
| Real-time Backend | Convex | 1.25+ | FR23-28, FR65-67 | Real-time sync, serverless, Bun support |
| AI/LLM | Groq (Llama 3.3 70B) | API | FR29-35, FR55-60 | Fastest inference (~276 tok/s), tool use support |
| Blockchain CLI | Foundry cast (wrapped) | Latest | FR6-9, FR40-54 | Self-custody, keystore management, tx signing |
| Error Handling | Result<T,E> pattern | - | All | Discriminated unions, no try/catch sprawl |
| Local Persistence | Bun.file + JSON | - | NFR13 | ~/.config/zk-bank/, XDG standard |
| Price Feeds | Convex cache + on-chain | - | FR3, FR21-22 | Fast display, authoritative for calcs |
| Keystore | Foundry native | - | FR6-9 | Delegate to cast, never touch keys |

## Project Structure

```
zk-bank/
├── cli/
│   ├── index.ts                 # Entry point (Ink-only)
│   ├── app.tsx                  # Root App component
│   │
│   ├── state/                   # Centralized Jotai atoms
│   │   ├── index.ts             # Re-export all atoms
│   │   └── atoms/
│   │       ├── theme.ts         # themeAtom, layoutModeAtom
│   │       ├── navigation.ts    # activePageAtom, inputModeAtom
│   │       ├── user.ts          # userProfileAtom, walletAtom
│   │       ├── trading.ts       # positionPreviewAtom, pendingTxAtom
│   │       └── chat.ts          # Local chat state
│   │
│   ├── ui/
│   │   ├── components/          # Reusable Ink components
│   │   │   ├── layout/          # AppShell, Banner, Footer, TabNav
│   │   │   ├── chat/            # ChatStream, ChatMessage, ChatInput
│   │   │   ├── trading/         # PositionPreview, VaultCard, PriceDisplay
│   │   │   ├── feedback/        # LiquidationAlert, Toast, Spinner
│   │   │   └── forms/           # TextInput, SelectInput, ConfirmDialog
│   │   │
│   │   ├── pages/               # Dashboard, Trollbox, Chain, Onboarding
│   │   └── themes/              # Theme definitions (5 themes)
│   │
│   ├── services/
│   │   ├── cast/                # Foundry cast wrapper (extended)
│   │   ├── convex/              # Convex client setup
│   │   ├── groq/                # Groq LLM client + prompts
│   │   └── config/              # Local config (~/.config/zk-bank/)
│   │
│   ├── hooks/                   # useConvex, useKeyboard, useCast, useAgent
│   ├── shared/                  # errors.ts, types.ts, constants.ts
│   └── utils/                   # format.ts, validation.ts
│
├── convex/                      # Convex backend
│   ├── schema.ts                # Database schema
│   ├── users.ts                 # User profiles
│   ├── messages.ts              # Chat messages
│   ├── agents.ts                # AI agent definitions
│   ├── liquidations.ts          # Liquidation events
│   └── prices.ts                # Price feed cache
│
├── src/                         # Solidity contracts (existing)
└── test/                        # Solidity tests (existing)
```

## FR Category to Architecture Mapping

| FR Category | Architecture Component | Location |
|-------------|----------------------|----------|
| CLI Foundation (FR1-5) | AppShell, TabNav, Banner, Footer | `cli/ui/components/layout/` |
| Wallet & Identity (FR6-9) | Cast wallet service, walletAtom | `cli/services/cast/`, `cli/state/atoms/user.ts` |
| Onboarding & Profile (FR10-16) | Onboarding page, Convex users | `cli/ui/pages/Onboarding.tsx`, `convex/users.ts` |
| Dashboard Page (FR17-22) | Dashboard page, VaultCard, PriceDisplay | `cli/ui/pages/Dashboard.tsx` |
| Trollbox Page (FR23-28) | Trollbox page, ChatStream, ChatMessage | `cli/ui/pages/Trollbox.tsx`, `cli/ui/components/chat/` |
| Trading from Trollbox (FR29-35) | ChatInput, PositionPreview, Groq, useAgent | `cli/services/groq/`, `cli/hooks/useAgent.ts` |
| Liquidation Spectacles (FR36-39) | LiquidationAlert, Convex liquidations | `cli/ui/components/feedback/`, `convex/liquidations.ts` |
| Chain/Explorer Page (FR40-46) | Chain page, Cast chain service | `cli/ui/pages/Chain.tsx`, `cli/services/cast/` |
| Position Management (FR47-54) | Cast CDP service, ExecutionPlan | `cli/services/cast/` |
| AI Agent Integration (FR55-60) | Groq service, Convex agents | `cli/services/groq/`, `convex/agents.ts` |
| Real-Time Sync (FR65-67) | Convex subscriptions | `convex/`, `cli/hooks/useConvex.ts` |

## Technology Stack Details

### Core Technologies

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Runtime | Bun | 1.0+ | Fast JS runtime, native TS |
| UI | Ink | 5.1.0 | React for terminal |
| React | React | 19 | Component model |
| State | Jotai | 2.12.2 | Atomic state management |
| Backend | Convex | 1.25+ | Real-time database |
| AI | Groq (Llama 3.3 70B) | API | Trade parsing |
| Blockchain | Foundry cast | Latest | Chain interaction |

### Integration Points

```
┌─────────────────────────────────────────────────────────────┐
│                     CLI (Ink + Jotai)                       │
├─────────────┬─────────────┬─────────────┬─────────────┬─────┤
│   Convex    │    Groq     │    Cast     │  Bun.file   │     │
│  (realtime) │   (LLM)     │  (wallet)   │  (config)   │     │
├─────────────┴─────────────┴──────┬──────┴─────────────┴─────┤
│         Convex Cloud             │      Ethereum/Fork       │
│   (users, messages, agents)      │   (CDP contracts)        │
└──────────────────────────────────┴──────────────────────────┘
```

## Novel Pattern Designs

### Pattern: Trade-From-Chat

Natural language → Groq parse → position preview → cast execute → trollbox broadcast

```
User: "2x long ETH" → Groq tool call → { action: 'open', leverage: 2 }
                                              ↓
                                   PositionPreview (private)
                                              ↓
                                   User confirms → cast send
                                              ↓
                                   Convex broadcast to trollbox
```

### Pattern: Human/AI Indistinguishable Chat

AI agents in `convex/agents.ts` write to same `messages` table as humans. No visual distinction in UI. Convex scheduled functions trigger agent activity.

## Implementation Patterns

These patterns ensure consistent implementation across all AI agents:

### Naming Conventions

| Entity | Convention | Example |
|--------|------------|---------|
| Component files | PascalCase.tsx | `ChatMessage.tsx` |
| Utility files | kebab-case.ts | `test-tree-parser.ts` |
| Atom files | camelCase.ts | `navigation.ts` |
| Components | PascalCase | `<ChatStream />` |
| Atoms | camelCaseAtom | `themeAtom` |
| Hooks | useCamelCase | `useAgent` |
| Convex functions | camelCase | `sendMessage` |
| Convex tables | snake_case | `user_profiles` |
| Types | PascalCase | `ChatMessage` |
| Constants | SCREAMING_SNAKE | `MIN_POSITION_SIZE` |

### Error Handling

**Result<T, E> everywhere** - no try/catch in business logic:

```typescript
import { tryCatch, Result } from '@/shared/errors'

async function openPosition(params): Promise<Result<TxReceipt, CastError>> {
  return tryCatch(castCdp.open(params))
}

// Call site - handle both cases
const result = await openPosition(params)
if (result.error) {
  toastAtom.set({ type: 'error', message: result.error.message })
  return
}
// result.data is typed
```

### Logging

- Use `console.error` (stdout is Ink UI)
- JSON structured: `{ level, context, message, ts }`
- Never log keys, truncate addresses: `0x7a3f...8b2c`
- `LOG_LEVEL` env controls verbosity

## Consistency Rules

### Theme Usage

Always via atom, never hardcode:
```typescript
const [theme] = useAtom(themeAtom)
<Text color={theme.error}>-$42,650</Text>  // Good
<Text color="#ff3333">...</Text>            // Bad
```

### Date/Time

- Storage: Unix timestamps (ms)
- Display: Relative for recent ("2m ago"), absolute for old
- No external libs - native `Date` + `Intl.DateTimeFormat`

### Component Structure

```typescript
// 1. External imports
import { Box, Text } from 'ink'
// 2. Internal imports
import { themeAtom } from '@/state'
// 3. Types
interface Props { ... }
// 4. Named export (no default)
export function Component({ ... }: Props) { }
```

## Data Architecture

### Convex Schema

```typescript
// convex/schema.ts
export default defineSchema({
  users: defineTable({
    wallet_address: v.string(),
    username: v.string(),
    bio: v.optional(v.string()),
    created_at: v.number(),
  }).index('by_wallet', ['wallet_address']),

  messages: defineTable({
    user_id: v.optional(v.id('users')),
    agent_id: v.optional(v.id('agents')),
    content: v.string(),
    message_type: v.union(v.literal('chat'), v.literal('trade'), v.literal('liquidation')),
    created_at: v.number(),
  }).index('by_created', ['created_at']),

  agents: defineTable({
    name: v.string(),
    persona: v.string(),
    activity_level: v.number(),
    is_active: v.boolean(),
  }),

  liquidations: defineTable({
    address: v.string(),
    collateral_type: v.string(),
    collateral_amount: v.string(),
    usd_value: v.number(),
    tx_hash: v.string(),
    created_at: v.number(),
  }).index('by_created', ['created_at']),

  prices: defineTable({
    symbol: v.string(),
    price_usd: v.number(),
    change_24h: v.number(),
    updated_at: v.number(),
  }).index('by_symbol', ['symbol']),
})
```

### Local State (Jotai)

```typescript
// Persisted (atomWithStorage)
themeAtom, layoutModeAtom  // ~/.config/zk-bank/

// Session
activePageAtom, inputModeAtom, walletAtom, positionPreviewAtom
```

## Security Architecture

### Self-Custody Model

- Private keys: Foundry keystore only (`~/.foundry/keystores/`)
- CLI never reads/stores/transmits keys
- Signing via `cast --account <name>` (Foundry handles decryption)
- Convex stores only public wallet addresses

### Auth Flow

1. User selects Foundry keystore account
2. CLI gets public address via `cast wallet address`
3. Convex issues challenge, cast signs it
4. Session token stored locally

## Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| Startup | <2s | Lazy load pages |
| Chat latency | <500ms | Convex subscriptions |
| Trade preview | <1s | Groq 276 tok/s |
| UI responsive | Non-blocking | Async all cast ops |

## Development Environment

### Prerequisites

- Bun 1.0+
- Foundry (cast, anvil)
- Git

### Setup

```bash
bun install
bun add jotai convex groq-sdk

# Terminal 1: Convex
bunx convex dev

# Terminal 2: Local chain
anvil --fork-url $RPC_URL

# Terminal 3: CLI
bun cli
```

### Environment Variables

```bash
GROQ_API_KEY=gsk_...
CONVEX_URL=https://...  # Auto-set by convex dev
RPC_URL=http://localhost:8545
LOG_LEVEL=info
```

## Architecture Decision Records

### ADR-001: Ink-Only (No Commander)

Remove dual-mode. The product IS the interactive experience.

### ADR-002: Jotai Over Context

No Provider boilerplate, surgical re-renders, atoms importable anywhere.

### ADR-003: Cast Wrapper Over Direct RPC

Keystore, hardware wallet, gas estimation all handled by Foundry.

### ADR-004: Groq for Speed

~276 tok/s. Trade parsing must feel instant.

### ADR-005: Convex for Real-Time

Built-in subscriptions, serverless, Bun support.

### ADR-006: Result<T,E> Pattern

Discriminated unions force explicit error handling.

---

_Generated by BMAD Decision Architecture Workflow v1.0_
_Date: 2025-11-26_
_For: AbuUsama_
