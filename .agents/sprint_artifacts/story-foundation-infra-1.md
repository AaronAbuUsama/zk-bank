# Story 1.1: Simplify CLI to Ink-First

**Status:** Draft

---

## User Story

As a **user**,
I want **the CLI to launch the interactive app by default while still supporting essential commands**,
So that **I get the full interactive experience normally, but can also use quick commands like `zk-bank config` or `zk-bank chain status` without entering interactive mode**.

---

## Acceptance Criteria

1. **AC #1:** `bun cli` (no args) launches Ink app directly
2. **AC #2:** `bun cli --help` shows available commands
3. **AC #3:** `bun cli --version` shows version
4. **AC #4:** `bun cli config` shows all configuration
5. **AC #5:** `bun cli config theme dracula` sets theme without entering interactive mode
6. **AC #6:** `bun cli chain status` shows chain status (quick check)
7. **AC #7:** Foundry-specific commands removed (build, test, deploy, verify, prompts, utils, registry)
8. **AC #8:** Commander remains as dependency (not removed)

---

## Implementation Details

### Tasks / Subtasks

- [ ] Delete unnecessary Foundry command files (AC: #7)
  - [ ] Delete `cli/commands/build.ts`
  - [ ] Delete `cli/commands/test.ts`
  - [ ] Delete `cli/commands/test-tree.ts`
  - [ ] Delete `cli/commands/deploy.ts`
  - [ ] Delete `cli/commands/verify.ts`
  - [ ] Delete `cli/commands/prompts.ts`
  - [ ] Delete `cli/commands/utils.ts`
  - [ ] Delete `cli/commands/registry.ts`
- [ ] Delete obsolete component files
  - [ ] Delete `cli/components/Header.tsx`
  - [ ] Delete `cli/components/CommandRunner.tsx`
  - [ ] Delete `cli/components/types.ts`
- [ ] Keep and update `cli/commands/chain.ts` (AC: #6)
  - [ ] Refactor to export `handleChain(action)` function
  - [ ] Support: status, mine, warp, reset
- [ ] Create `cli/commands/config.ts` (AC: #4, #5)
  - [ ] Implement `handleConfig(key?, value?)` function
  - [ ] No args: show all config
  - [ ] One arg: get config value
  - [ ] Two args: set config value
  - [ ] Use local config service from Story 1.2
- [ ] Update `cli/index.ts` to Ink-first pattern (AC: #1, #2, #3)
  - [ ] Keep Commander for --help, --version, and subcommands
  - [ ] Default action (no subcommand) launches Ink app
  - [ ] Register `config` and `chain` subcommands
- [ ] Update `cli/app.tsx` to export App component properly
- [ ] Verify all acceptance criteria
  - [ ] Test `bun cli` launches interactive (AC: #1)
  - [ ] Test `bun cli --help` shows help (AC: #2)
  - [ ] Test `bun cli --version` shows version (AC: #3)
  - [ ] Test `bun cli config` works (AC: #4)
  - [ ] Test `bun cli chain status` works (AC: #6)

### Technical Summary

This story implements a revised ADR-001 (Ink-First, not Ink-Only). Like Claude Code, zk-bank should support essential CLI commands while defaulting to interactive mode.

**Pattern:** Commander handles routing, Ink is the default action.

**New cli/index.ts:**
```typescript
#!/usr/bin/env bun
import { Command } from 'commander'
import { render } from 'ink'
import React from 'react'

const program = new Command()

program
  .name('zk-bank')
  .description('Social trading CLI for DeFi')
  .version('1.0.0')

// Config command (non-interactive)
program
  .command('config')
  .description('Manage configuration')
  .argument('[key]', 'Config key to get/set')
  .argument('[value]', 'Value to set')
  .action(async (key, value) => {
    const { handleConfig } = await import('./commands/config')
    await handleConfig(key, value)
  })

// Chain command (non-interactive)
program
  .command('chain')
  .description('Chain status and control')
  .argument('[action]', 'status|mine|warp|reset')
  .argument('[args...]', 'Action arguments')
  .action(async (action, args) => {
    const { handleChain } = await import('./commands/chain')
    await handleChain(action, args)
  })

// Default: Launch interactive Ink app
program.action(async () => {
  const { App } = await import('./app')
  render(<App />)
})

program.parse()
```

**Supported Commands:**

| Command | Description |
|---------|-------------|
| `zk-bank` | Launch interactive app (default) |
| `zk-bank --help` | Show help |
| `zk-bank --version` | Show version |
| `zk-bank config` | Show all config |
| `zk-bank config theme` | Get theme |
| `zk-bank config theme dracula` | Set theme |
| `zk-bank chain status` | Show chain status |
| `zk-bank chain mine 10` | Mine 10 blocks |

### Project Structure Notes

- **Files to modify:** `cli/index.ts`, `cli/app.tsx`, `cli/commands/chain.ts`
- **Files to create:** `cli/commands/config.ts`
- **Files to delete:** 8 command files + 3 component files
- **Expected test locations:** `cli/__tests__/commands/`
- **Estimated effort:** 2 story points
- **Prerequisites:** None

### Key Code References

| File | Lines | Reference |
|------|-------|-----------|
| `cli/index.ts` | 14-42 | Current dual-mode logic to replace |
| `cli/commands/chain.ts` | all | Existing chain commands to refactor |
| `cli/app.tsx` | 183-268 | Current App component |

---

## Context References

**Tech-Spec:** [tech-spec.md](../tech-spec.md) - Primary context document containing:
- ADR-001 revised: Ink-First with essential CLI commands
- Complete CLI command table
- index.ts implementation pattern
- Files to keep vs delete

**Architecture:** [architecture.md](../architecture.md) - ADR-001 decision record

---

## Dev Agent Record

### Agent Model Used

<!-- Will be populated during dev-story execution -->

### Debug Log References

<!-- Will be populated during dev-story execution -->

### Completion Notes

<!-- Will be populated during dev-story execution -->

### Files Modified

<!-- Will be populated during dev-story execution -->

### Test Results

<!-- Will be populated during dev-story execution -->

---

## Review Notes

<!-- Will be populated during code review -->
