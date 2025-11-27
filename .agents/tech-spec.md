# zk-bank - Technical Specification

**Author:** AbuUsama
**Date:** 2025-11-27
**Project Level:** Enterprise (Quick-Flow slice)
**Change Type:** Foundation Epic
**Development Context:** Brownfield - extending existing CLI

---

## Context

### Available Documents

| Document | Path | Status |
|----------|------|--------|
| Product Brief | `.agents/product-brief-zk-bank-2025-11-26.md` | ✓ Loaded |
| PRD | `.agents/prd.md` | ✓ Loaded (67 FRs, 24 NFRs) |
| Architecture | `.agents/architecture.md` | ✓ Loaded (ADR-001 to ADR-006) |
| UX Design | `.agents/ux-design-specification.md` | ✓ Loaded (Flush Grid, 5 themes) |
| Research | N/A | Not required (domain expert) |

### Project Stack

| Layer | Technology | Version | Source |
|-------|------------|---------|--------|
| Runtime | Bun | 1.0+ | package.json |
| Language | TypeScript | ^5 | package.json peerDependencies |
| CLI Framework | Ink | 5.1.0 | package.json |
| React | React | 19.2.0 | package.json |
| UI Components | @inkjs/ui | 2.0.0 | package.json |
| Command Parser | Commander | 13.1.0 | package.json (TO BE REMOVED) |
| Solidity | Solc | 0.8.28 | foundry.toml |
| Aragon OSx | @aragon/osx | 1.4.0 | package.json |

**Dependencies to Add (per Architecture):**
- `jotai` 2.12.2 - Atomic state management
- `convex` 1.25+ - Real-time backend
- `groq-sdk` - LLM for trade parsing (future story)

### Existing Codebase Structure

```
cli/
├── index.ts                    # Entry point - DUAL MODE (Commander + Ink)
├── app.tsx                     # Ink app - command selector UI
├── commands/                   # Commander subcommands
│   ├── build.ts
│   ├── test.ts
│   ├── test-tree.ts
│   ├── deploy.ts
│   ├── verify.ts
│   ├── prompts.ts
│   ├── utils.ts
│   ├── chain.ts
│   └── registry.ts
├── components/                 # Existing Ink components
│   ├── Header.tsx              # Simple header (hardcoded colors)
│   ├── CommandRunner.tsx       # Command executor with streaming
│   └── types.ts                # CommandDefinition interface
├── services/
│   ├── cast/index.ts           # Cast wrapper (basic functions)
│   ├── config/config.ts        # Env config loader
│   ├── forge/index.ts
│   └── verifier/index.ts
├── shared/
│   └── errors.ts               # Result<T,E> pattern ✓
├── lib/                        # Legacy location (being migrated)
│   ├── cast.ts
│   ├── config.ts
│   ├── forge.ts
│   ├── templates.ts
│   ├── test-tree-parser.ts
│   └── verifier.ts
├── ui/                         # New structure (empty scaffolds)
│   └── components/
│       ├── Header.tsx
│       ├── CommandRunner.tsx
│       └── types.ts
└── types/index.ts
```

**Existing Patterns (MUST RESPECT):**

| Pattern | Implementation | Location |
|---------|----------------|----------|
| Error Handling | `Result<T, E>` discriminated union | `cli/shared/errors.ts` |
| Async Errors | `tryCatch(promise)` wrapper | `cli/shared/errors.ts` |
| Sync Errors | `tryCatchSync(fn)` wrapper | `cli/shared/errors.ts` |
| Component Export | Named exports, no defaults | All `.tsx` files |
| File Naming | PascalCase for components | `Header.tsx`, `CommandRunner.tsx` |
| Utility Naming | kebab-case | `test-tree-parser.ts` |

**Current Dual-Mode Behavior (to be removed):**
```typescript
// cli/index.ts - lines 14-42
const hasArgs = process.argv.length > 2;
if (hasArgs) {
  // Commander mode
} else {
  // Ink mode
}
```

---

## The Change

### Problem Statement

The current CLI architecture has extensive Commander commands (build, test, deploy, verify, etc.) that were scaffolded for Foundry development but don't align with the product vision. zk-bank is primarily an interactive trading experience, but like Claude Code, it should still support essential CLI commands for configuration, help, and quick status checks.

Additionally, the codebase lacks:
- Centralized state management (currently using React useState scattered across components)
- Real-time backend connectivity (Convex)
- Theme system (hardcoded colors in components)
- Proper layout architecture (AppShell with Banner/Footer/TabNav)

### Proposed Solution

Implement the **Foundation Epic** - architectural infrastructure that enables all subsequent features:

1. **Simplify CLI to Ink-First** - Default to interactive, keep essential commands (help, version, config)
2. **Add Jotai** - Centralized atomic state management
3. **Add Convex** - Real-time backend infrastructure
4. **Implement Theme System** - 5 selectable themes with semantic tokens
5. **Create AppShell** - Banner, Footer, TabNav, page routing

### Scope

**In Scope:**

- Simplify Commander to essential commands only (help, version, config)
- Install and configure Jotai for state management
- Install and configure Convex (schema, client setup)
- Implement theme system with 5 themes from UX spec
- Create AppShell layout components (Banner, Footer, TabNav)
- Create placeholder pages (Dashboard, Trollbox, Chain)
- Implement keyboard navigation (Ctrl+1, Ctrl+2, Ctrl+3 for tabs)
- Expand error infrastructure with named error classes
- Local config persistence (~/.config/zk-bank/)

**Out of Scope:**

- Page content implementation (Dashboard stats, Trollbox chat, Chain explorer)
- Convex functions beyond schema (users, messages, etc.)
- Groq/LLM integration
- Cast CDP operations
- Onboarding flow
- Agent mode / trade-from-chat

---

## Implementation Details

### Source Tree Changes

| File | Action | Description |
|------|--------|-------------|
| `cli/index.ts` | MODIFY | Ink-first with minimal Commander commands |
| `cli/app.tsx` | MODIFY | Replace command selector with AppShell |
| `package.json` | MODIFY | Add jotai + convex (keep commander) |
| `cli/state/index.ts` | CREATE | Re-export all atoms |
| `cli/state/atoms/theme.ts` | CREATE | themeAtom, layoutModeAtom |
| `cli/state/atoms/navigation.ts` | CREATE | activePageAtom, inputModeAtom |
| `cli/state/atoms/user.ts` | CREATE | userProfileAtom, walletAtom |
| `cli/shared/errors.ts` | MODIFY | Add named error classes, multi-error support |
| `cli/shared/errors/index.ts` | CREATE | Re-export error utilities |
| `cli/shared/errors/types.ts` | CREATE | Error class definitions |
| `cli/ui/themes/index.ts` | CREATE | Theme definitions (5 themes) |
| `cli/ui/themes/types.ts` | CREATE | Theme interface |
| `cli/ui/components/layout/AppShell.tsx` | CREATE | Root layout component |
| `cli/ui/components/layout/Banner.tsx` | CREATE | Top bar (prices, status) |
| `cli/ui/components/layout/Footer.tsx` | CREATE | Bottom bar (tabs, hints) |
| `cli/ui/components/layout/TabNav.tsx` | CREATE | Tab navigation component |
| `cli/ui/components/layout/index.ts` | CREATE | Re-export layout components |
| `cli/ui/pages/Dashboard.tsx` | CREATE | Placeholder page |
| `cli/ui/pages/Trollbox.tsx` | CREATE | Placeholder page |
| `cli/ui/pages/Chain.tsx` | CREATE | Placeholder page |
| `cli/ui/pages/index.ts` | CREATE | Re-export pages |
| `cli/hooks/useKeyboard.ts` | CREATE | Global keyboard handler |
| `cli/hooks/useTheme.ts` | CREATE | Theme access hook |
| `cli/hooks/index.ts` | CREATE | Re-export hooks |
| `cli/services/config/local.ts` | CREATE | Local config persistence |
| `convex/schema.ts` | CREATE | Convex database schema |
| `convex/tsconfig.json` | CREATE | Convex TypeScript config |
| `cli/commands/config.ts` | CREATE | Config management command (theme, etc.) |
| `cli/commands/build.ts` | DELETE | Not needed for trading app |
| `cli/commands/test.ts` | DELETE | Not needed for trading app |
| `cli/commands/test-tree.ts` | DELETE | Not needed for trading app |
| `cli/commands/deploy.ts` | DELETE | Not needed for trading app |
| `cli/commands/verify.ts` | DELETE | Not needed for trading app |
| `cli/commands/prompts.ts` | DELETE | Not needed for trading app |
| `cli/commands/utils.ts` | DELETE | Not needed for trading app |
| `cli/commands/chain.ts` | KEEP | Useful for chain status/control |
| `cli/commands/registry.ts` | DELETE | Not needed for trading app |
| `cli/components/Header.tsx` | DELETE | Replaced by Banner |
| `cli/components/CommandRunner.tsx` | DELETE | No longer needed |
| `cli/components/types.ts` | DELETE | CommandDefinition obsolete |

### Technical Approach

**1. Ink-First CLI with Essential Commands (ADR-001 revised)**

Keep Commander for essential commands, but default to Ink interactive mode. Similar to Claude Code pattern:

```typescript
// cli/index.ts - UPDATED
#!/usr/bin/env bun
import { Command } from 'commander'
import { render } from 'ink'
import React from 'react'

const program = new Command()

program
  .name('zk-bank')
  .description('Social trading CLI for DeFi')
  .version('1.0.0')

// Essential commands (non-interactive)
program
  .command('config')
  .description('Manage configuration')
  .argument('[key]', 'Config key to get/set')
  .argument('[value]', 'Value to set')
  .action(async (key, value) => {
    const { handleConfig } = await import('./commands/config')
    await handleConfig(key, value)
  })

program
  .command('chain')
  .description('Chain status and control')
  .argument('[action]', 'status|mine|warp|reset')
  .action(async (action) => {
    const { handleChain } = await import('./commands/chain')
    await handleChain(action)
  })

// Default: Launch interactive Ink app (no subcommand)
program.action(async () => {
  const { App } = await import('./app')
  render(<App />)
})

program.parse()
```

**Supported CLI Commands:**

| Command | Description | Example |
|---------|-------------|---------|
| `zk-bank` | Launch interactive app (default) | `zk-bank` |
| `zk-bank --help` | Show help | `zk-bank --help` |
| `zk-bank --version` | Show version | `zk-bank --version` |
| `zk-bank config` | Show all config | `zk-bank config` |
| `zk-bank config theme` | Get theme | `zk-bank config theme` |
| `zk-bank config theme dracula` | Set theme | `zk-bank config theme dracula` |
| `zk-bank chain status` | Quick chain status | `zk-bank chain status` |
| `zk-bank chain mine 10` | Mine blocks | `zk-bank chain mine 10` |

**2. Jotai State Management (ADR-002)**

Atomic state with persistence for user preferences:

```typescript
// cli/state/atoms/theme.ts
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { ThemeName, LayoutMode } from '@/ui/themes/types'

// Persisted to ~/.config/zk-bank/preferences.json
export const themeAtom = atomWithStorage<ThemeName>('theme', 'terminal-classic')
export const layoutModeAtom = atomWithStorage<LayoutMode>('layoutMode', 'chat')
```

**3. Convex Setup (ADR-005)**

Initialize Convex project structure:

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

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

**4. Theme System (per UX Spec)**

5 themes with semantic color tokens:

```typescript
// cli/ui/themes/types.ts
export interface Theme {
  name: string
  bg: string
  bgAlt: string
  text: string
  textBright: string
  textDim: string
  primary: string
  accent: string
  success: string
  error: string
  warning: string
}

export type ThemeName = 'terminal-classic' | 'cyberpunk-neon' | 'nord-frost' | 'dracula' | 'bloomberg'
export type LayoutMode = 'chat' | 'dense'
```

**5. AppShell Architecture**

```
┌─────────────────────────────────────────┐
│ BANNER - prices, connection status      │
├─────────────────────────────────────────┤
│                                         │
│           ACTIVE PAGE                   │
│   (Dashboard | Trollbox | Chain)        │
│                                         │
├─────────────────────────────────────────┤
│ FOOTER - [^1] [^2] [^3] tabs, hints     │
└─────────────────────────────────────────┘
```

### Existing Patterns to Follow

**Error Handling (from cli/shared/errors.ts):**
```typescript
import { tryCatch, Result } from '@/shared/errors'

async function loadConfig(): Promise<Result<Config, ConfigError>> {
  return tryCatch(readConfigFile())
}

// Call site
const result = await loadConfig()
if (result.error) {
  // Handle error
  return
}
// result.data is typed as Config
```

**Component Structure:**
```typescript
// 1. External imports
import { Box, Text } from 'ink'
import { useAtom } from 'jotai'
// 2. Internal imports
import { themeAtom } from '@/state'
// 3. Types
interface Props { ... }
// 4. Named export (no default)
export function Component({ ... }: Props) { }
```

**Naming Conventions:**
- Components: PascalCase (`Banner.tsx`)
- Atoms: camelCaseAtom (`themeAtom`)
- Hooks: useCamelCase (`useTheme`)
- Utilities: kebab-case (`test-tree-parser.ts`)

### Integration Points

| Integration | Type | Description |
|-------------|------|-------------|
| Jotai → Ink | State | Atoms consumed via `useAtom()` in components |
| Convex → CLI | Backend | Client initialized in app, context provided |
| Theme → Components | Styling | All colors via `theme.tokenName` |
| Keyboard → Navigation | Input | Global handler updates `activePageAtom` |
| Config → Jotai | Persistence | `atomWithStorage` reads/writes local config |

---

## Development Context

### Relevant Existing Code

| File | Lines | Reference For |
|------|-------|---------------|
| `cli/shared/errors.ts` | 1-45 | Result<T,E> pattern implementation |
| `cli/services/config/config.ts` | 44-82 | Config loading pattern |
| `cli/components/Header.tsx` | 1-19 | Simple Ink component structure |
| `cli/app.tsx` | 183-268 | Current App component (to be replaced) |

### Dependencies

**Framework/Libraries:**

| Package | Version | Purpose |
|---------|---------|---------|
| ink | 5.1.0 | CLI React framework (existing) |
| react | 19.2.0 | Component model (existing) |
| @inkjs/ui | 2.0.0 | UI components (existing) |
| jotai | 2.12.2 | Atomic state management (ADD) |
| convex | 1.25+ | Real-time backend (ADD) |

**Internal Modules:**

| Module | Purpose |
|--------|---------|
| `@/shared/errors` | Result<T,E> error handling |
| `@/state` | Jotai atoms (NEW) |
| `@/ui/themes` | Theme definitions (NEW) |
| `@/ui/components/layout` | AppShell components (NEW) |
| `@/hooks` | Custom hooks (NEW) |

### Configuration Changes

| File | Change |
|------|--------|
| `package.json` | Remove `commander`, add `jotai`, `convex` |
| `tsconfig.json` | Add path aliases (`@/state`, `@/ui`, `@/hooks`) |
| `.env` | Add `CONVEX_URL` (auto-set by `bunx convex dev`) |
| `~/.config/zk-bank/preferences.json` | Created by atomWithStorage |

### Existing Conventions (Brownfield)

**Code Style (MUST CONFORM):**
- No semicolons (existing codebase style)
- Tabs for indentation
- Double quotes for strings
- Named exports only
- React 19 patterns (no legacy lifecycle)

**Import Organization:**
1. External packages (ink, react, jotai)
2. Internal absolute imports (@/...)
3. Relative imports (./)

### Test Framework & Standards

**Current State:** No CLI tests exist (Solidity tests only via Foundry)

**For This Epic:**
- Unit tests for atoms (state initialization, persistence)
- Component tests for layout (render without crash)
- Integration test for keyboard navigation

**Test Location:** `cli/__tests__/` (to be created)

---

## Implementation Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Runtime | Bun | 1.0+ |
| Language | TypeScript | 5.0+ |
| UI Framework | Ink | 5.1.0 |
| React | React | 19.2.0 |
| State Management | Jotai | 2.12.2 |
| Backend | Convex | 1.25+ |
| Local Storage | Bun.file + JSON | - |

---

## Technical Details

### Theme Implementation

Each theme implements the `Theme` interface with specific hex values:

**Terminal Classic (Default):**
```typescript
export const terminalClassic: Theme = {
  name: 'Terminal Classic',
  bg: '#0a0a0a',
  bgAlt: '#0f0f0f',
  text: '#b0b0b0',
  textBright: '#ffffff',
  textDim: '#666666',
  primary: '#33ff33',
  accent: '#00ffff',
  success: '#33ff33',
  error: '#ff3333',
  warning: '#ffff33',
}
```

**Theme Switching:**
- Command: `/theme <name>` or `/theme` to cycle
- Keyboard: `Ctrl+T` to cycle
- Persisted to local config

### Local Config Persistence

Using XDG Base Directory spec:

```typescript
// cli/services/config/local.ts
import { homedir } from 'os'
import { join } from 'path'

const CONFIG_DIR = join(homedir(), '.config', 'zk-bank')
const PREFS_FILE = join(CONFIG_DIR, 'preferences.json')

export async function readPreferences(): Promise<Preferences> {
  const file = Bun.file(PREFS_FILE)
  if (await file.exists()) {
    return await file.json()
  }
  return defaultPreferences
}

export async function writePreferences(prefs: Preferences): Promise<void> {
  await Bun.write(PREFS_FILE, JSON.stringify(prefs, null, 2))
}
```

### Keyboard Navigation

Global handler for tab switching and shortcuts. **Important:** Tab navigation uses `Ctrl+` modifiers to avoid conflicts with text input fields.

```typescript
// cli/hooks/useKeyboard.ts
import { useInput } from 'ink'
import { useSetAtom } from 'jotai'
import { activePageAtom } from '@/state'

export function useKeyboard() {
  const setActivePage = useSetAtom(activePageAtom)

  useInput((input, key) => {
    // Tab navigation (Ctrl+number to avoid text input conflicts)
    if (key.ctrl && input === '1') setActivePage('dashboard')
    if (key.ctrl && input === '2') setActivePage('trollbox')
    if (key.ctrl && input === '3') setActivePage('chain')

    // Theme cycling
    if (key.ctrl && input === 't') {
      // Cycle theme
    }

    // Layout toggle
    if (key.ctrl && input === 'd') {
      // Toggle layout mode
    }
  })
}
```

### Error Infrastructure

Expand the existing `Result<T, E>` pattern with named error classes for consistent error handling across the codebase:

```typescript
// cli/shared/errors/types.ts

/** Base error class for all zk-bank errors */
export class ZkBankError extends Error {
  readonly code: string
  readonly context?: Record<string, unknown>

  constructor(message: string, code: string, context?: Record<string, unknown>) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.context = context
  }
}

/** Configuration/environment errors */
export class ConfigError extends ZkBankError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFIG_ERROR', context)
  }
}

/** Network/RPC errors */
export class NetworkError extends ZkBankError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'NETWORK_ERROR', context)
  }
}

/** Convex backend errors */
export class ConvexError extends ZkBankError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONVEX_ERROR', context)
  }
}

/** Wallet/signing errors */
export class WalletError extends ZkBankError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'WALLET_ERROR', context)
  }
}

/** Validation errors (can contain multiple issues) */
export class ValidationError extends ZkBankError {
  readonly issues: ValidationIssue[]

  constructor(message: string, issues: ValidationIssue[]) {
    super(message, 'VALIDATION_ERROR', { issues })
    this.issues = issues
  }
}

export interface ValidationIssue {
  field: string
  message: string
  code?: string
}

/** Multi-error container for operations that can fail in multiple ways */
export class AggregateError extends ZkBankError {
  readonly errors: ZkBankError[]

  constructor(message: string, errors: ZkBankError[]) {
    super(message, 'AGGREGATE_ERROR', { errorCount: errors.length })
    this.errors = errors
  }
}
```

```typescript
// cli/shared/errors/index.ts - updated exports
export * from './types'
export { tryCatch, tryCatchSync, type Result } from '../errors'

// Helper for creating validation errors
export function validationError(issues: ValidationIssue[]): ValidationError {
  const message = issues.map(i => `${i.field}: ${i.message}`).join('; ')
  return new ValidationError(message, issues)
}

// Helper for aggregating multiple errors
export function aggregateErrors(errors: ZkBankError[]): AggregateError {
  return new AggregateError(`${errors.length} errors occurred`, errors)
}

// Type guard for checking error types
export function isZkBankError(error: unknown): error is ZkBankError {
  return error instanceof ZkBankError
}
```

**Usage Pattern:**
```typescript
import { tryCatch, ConfigError, ValidationError, validationError } from '@/shared/errors'

// Single typed error
async function loadConfig(): Promise<Result<Config, ConfigError>> {
  const file = Bun.file(configPath)
  if (!await file.exists()) {
    return { data: null, error: new ConfigError('Config file not found', { path: configPath }) }
  }
  return tryCatch(file.json())
}

// Multiple validation issues
function validateUser(input: unknown): Result<User, ValidationError> {
  const issues: ValidationIssue[] = []
  if (!input.username) issues.push({ field: 'username', message: 'Required' })
  if (!input.wallet) issues.push({ field: 'wallet', message: 'Required' })

  if (issues.length > 0) {
    return { data: null, error: validationError(issues) }
  }
  return { data: input as User, error: null }
}
```

### Convex Client Setup

```typescript
// cli/services/convex/client.ts
import { ConvexClient } from 'convex/browser'
import { ConfigError } from '@/shared/errors'

let client: ConvexClient | null = null

export function getConvexClient(): ConvexClient {
  if (!client) {
    const url = process.env.CONVEX_URL
    if (!url) {
      throw new ConfigError('CONVEX_URL not set. Run: bunx convex dev', {
        envVar: 'CONVEX_URL'
      })
    }
    client = new ConvexClient(url)
  }
  return client
}
```

---

## Development Setup

```bash
# 1. Install new dependencies (keep commander)
bun add jotai convex

# 2. Initialize Convex
bunx convex init

# 3. Start Convex dev server (Terminal 1)
bunx convex dev

# 4. Start local chain (Terminal 2) - optional for this epic
anvil --fork-url $RPC_URL

# 5. Run CLI (Terminal 3)
bun cli
```

---

## Implementation Guide

### Setup Steps

1. Create feature branch: `git checkout -b feat/foundation-epic`
2. Install dependencies: `bun add jotai convex`
3. Initialize Convex: `bunx convex init`
4. Create directory structure for new files
5. Add path aliases to tsconfig.json

### Implementation Steps

**Story 1: Simplify CLI to Ink-First (ADR-001 revised)**
1. Delete unnecessary command files (build, test, deploy, verify, prompts, utils, registry)
2. Keep and update `cli/commands/chain.ts` for chain control
3. Create `cli/commands/config.ts` for configuration management
4. Update `cli/index.ts` to Ink-first with essential Commander commands
5. Test: `zk-bank` launches interactive, `zk-bank --help` shows commands

**Story 2: Add Jotai State Management (ADR-002)**
1. Create `cli/state/` directory structure
2. Implement theme atom with persistence
3. Implement navigation atom
4. Implement user atom (placeholder)
5. Create re-export index

**Story 3: Add Convex Infrastructure (ADR-005)**
1. Run `bunx convex init`
2. Create `convex/schema.ts` with all tables
3. Create client setup in `cli/services/convex/`
4. Add CONVEX_URL to .env.example

**Story 4: Implement Theme System**
1. Create `cli/ui/themes/types.ts`
2. Create `cli/ui/themes/index.ts` with 5 themes
3. Create `useTheme` hook
4. Implement theme cycling (Ctrl+T)
5. Test all themes render correctly

**Story 5: Create AppShell + Page Routing**
1. Create Banner component
2. Create Footer component
3. Create TabNav component
4. Create AppShell wrapper
5. Create placeholder pages (Dashboard, Trollbox, Chain)
6. Implement keyboard navigation (Ctrl+1, Ctrl+2, Ctrl+3)
7. Wire up in app.tsx

### Testing Strategy

| Test Type | Coverage |
|-----------|----------|
| Unit | Atom initialization, theme values |
| Component | Layout components render |
| Integration | Tab navigation, theme switching |
| Manual | Visual inspection of all 5 themes |

### Acceptance Criteria

**Story 1 - Ink-First CLI:**
- [ ] `bun cli` launches Ink app directly (default action)
- [ ] `bun cli --help` shows available commands
- [ ] `bun cli --version` shows version
- [ ] `bun cli config theme` gets current theme
- [ ] `bun cli config theme dracula` sets theme
- [ ] `bun cli chain status` shows chain status
- [ ] Foundry-specific commands removed (build, test, deploy, verify)

**Story 2 - Jotai Setup:**
- [ ] Atoms importable from `@/state`
- [ ] Theme persists across CLI restarts
- [ ] Layout mode persists across CLI restarts
- [ ] No React Context boilerplate

**Story 3 - Convex Setup:**
- [ ] `bunx convex dev` starts successfully
- [ ] Schema defines all 5 tables
- [ ] Client connects without errors
- [ ] CONVEX_URL documented in .env.example

**Story 4 - Theme System:**
- [ ] All 5 themes defined with correct colors
- [ ] Ctrl+T cycles through themes
- [ ] Theme persists to ~/.config/zk-bank/
- [ ] Components use theme tokens, not hardcoded colors

**Story 5 - AppShell:**
- [ ] Banner shows at top
- [ ] Footer shows at bottom with [Ctrl+1] [Ctrl+2] [Ctrl+3]
- [ ] Ctrl+1, Ctrl+2, Ctrl+3 switch pages
- [ ] Active tab visually indicated
- [ ] Placeholder pages render

---

## Developer Resources

### File Paths Reference

**New Files:**
- `/cli/shared/errors/types.ts`
- `/cli/shared/errors/index.ts`
- `/cli/state/index.ts`
- `/cli/state/atoms/theme.ts`
- `/cli/state/atoms/navigation.ts`
- `/cli/state/atoms/user.ts`
- `/cli/ui/themes/index.ts`
- `/cli/ui/themes/types.ts`
- `/cli/ui/components/layout/AppShell.tsx`
- `/cli/ui/components/layout/Banner.tsx`
- `/cli/ui/components/layout/Footer.tsx`
- `/cli/ui/components/layout/TabNav.tsx`
- `/cli/ui/components/layout/index.ts`
- `/cli/ui/pages/Dashboard.tsx`
- `/cli/ui/pages/Trollbox.tsx`
- `/cli/ui/pages/Chain.tsx`
- `/cli/ui/pages/index.ts`
- `/cli/hooks/useKeyboard.ts`
- `/cli/hooks/useTheme.ts`
- `/cli/hooks/index.ts`
- `/cli/services/config/local.ts`
- `/convex/schema.ts`
- `/convex/tsconfig.json`

**Modified Files:**
- `/cli/index.ts`
- `/cli/app.tsx`
- `/package.json`
- `/tsconfig.json`

**Modified/Kept Files:**
- `/cli/commands/chain.ts` - KEEP and update for new structure
- `/cli/commands/config.ts` - CREATE for config management

**Deleted Files:**
- `/cli/commands/build.ts`
- `/cli/commands/test.ts`
- `/cli/commands/test-tree.ts`
- `/cli/commands/deploy.ts`
- `/cli/commands/verify.ts`
- `/cli/commands/prompts.ts`
- `/cli/commands/utils.ts`
- `/cli/commands/registry.ts`
- `/cli/components/Header.tsx`
- `/cli/components/CommandRunner.tsx`
- `/cli/components/types.ts`

### Key Code Locations

| Purpose | File | Line |
|---------|------|------|
| Result<T,E> implementation | `cli/shared/errors.ts` | 5-15 |
| tryCatch wrapper | `cli/shared/errors.ts` | 22-31 |
| Current App component | `cli/app.tsx` | 183-268 |
| Existing Header pattern | `cli/components/Header.tsx` | 6-18 |

### Testing Locations

| Type | Location |
|------|----------|
| Unit tests | `cli/__tests__/state/` |
| Component tests | `cli/__tests__/components/` |
| Integration tests | `cli/__tests__/integration/` |

### Documentation to Update

- `README.md` - Update CLI usage (no more command args)
- `.env.example` - Add CONVEX_URL
- `CLAUDE.md` - Note Convex dev requirement

---

## UX/UI Considerations

**UI Components Affected:**
- Banner (CREATE) - Top bar with prices, connection status
- Footer (CREATE) - Bottom bar with tab navigation
- TabNav (CREATE) - Visual tab indicators
- AppShell (CREATE) - Layout wrapper

**Keyboard Interactions:**
- `Ctrl+1` - Switch to Dashboard
- `Ctrl+2` - Switch to Trollbox
- `Ctrl+3` - Switch to Chain
- `Ctrl+T` - Cycle theme
- `Ctrl+D` - Toggle layout density
- `Ctrl+Q` - Quit application

**Visual Patterns:**
- Flush Grid design (no boxes, bg color separation)
- Theme colors via semantic tokens
- Active tab highlighted with `primary` color

---

## Testing Approach

**Test Framework:** Bun test (built-in)

**Test Files:**
```
cli/__tests__/
├── state/
│   ├── theme.test.ts
│   └── navigation.test.ts
├── components/
│   ├── Banner.test.tsx
│   ├── Footer.test.tsx
│   └── AppShell.test.tsx
└── integration/
    └── navigation.test.tsx
```

**Coverage Targets:**
- Unit: 80%+ for atoms
- Component: Render without crash
- Integration: Happy path navigation

---

## Deployment Strategy

### Deployment Steps

N/A - This is local CLI development. No deployment required.

### Rollback Plan

```bash
git checkout main
bun install
```

### Monitoring

Manual testing:
- All 5 themes render correctly
- Tab navigation works
- Preferences persist across restarts

---

_Generated by BMad Tech-Spec Workflow_
_Date: 2025-11-27_
_For: AbuUsama_
