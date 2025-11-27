# Story 1.1: Remove Commander.js

**Status:** Draft

---

## User Story

As a **developer**,
I want **the CLI to launch directly into the Ink interactive app**,
So that **the codebase is simpler and aligned with the product vision of an interactive-only experience**.

---

## Acceptance Criteria

1. **AC #1:** `bun cli` launches Ink app directly without argument parsing
2. **AC #2:** `bun cli build` and other command-line arguments no longer work (expected behavior)
3. **AC #3:** No Commander.js code remains in the codebase
4. **AC #4:** package.json has no `commander` dependency
5. **AC #5:** CLI entry point is under 10 lines of code

---

## Implementation Details

### Tasks / Subtasks

- [ ] Delete all Commander command files (AC: #3)
  - [ ] Delete `cli/commands/build.ts`
  - [ ] Delete `cli/commands/test.ts`
  - [ ] Delete `cli/commands/test-tree.ts`
  - [ ] Delete `cli/commands/deploy.ts`
  - [ ] Delete `cli/commands/verify.ts`
  - [ ] Delete `cli/commands/prompts.ts`
  - [ ] Delete `cli/commands/utils.ts`
  - [ ] Delete `cli/commands/chain.ts`
  - [ ] Delete `cli/commands/registry.ts`
- [ ] Delete obsolete component files (AC: #3)
  - [ ] Delete `cli/components/Header.tsx`
  - [ ] Delete `cli/components/CommandRunner.tsx`
  - [ ] Delete `cli/components/types.ts`
- [ ] Simplify `cli/index.ts` to direct Ink render (AC: #1, #5)
- [ ] Remove Commander from package.json (AC: #4)
  - [ ] Run `bun remove commander`
- [ ] Update `cli/app.tsx` to export App component properly
- [ ] Verify CLI launches correctly (AC: #1)
- [ ] Verify old commands don't work (AC: #2)

### Technical Summary

This story implements ADR-001 (Ink-Only, No Commander). The current dual-mode architecture checks `process.argv.length > 2` to decide between Commander and Ink modes. We're removing this entirely - zk-bank IS the interactive experience.

**New cli/index.ts:**
```typescript
#!/usr/bin/env bun
import { render } from 'ink'
import React from 'react'
import { App } from './app'

render(<App />)
```

The current `app.tsx` command selector UI will be replaced in Story 1.5 with AppShell. For now, we'll create a minimal placeholder.

### Project Structure Notes

- **Files to modify:** `cli/index.ts`, `cli/app.tsx`, `package.json`
- **Files to delete:** 12 files in `cli/commands/` and `cli/components/`
- **Expected test locations:** `cli/__tests__/` (to be created later)
- **Estimated effort:** 2 story points
- **Prerequisites:** None

### Key Code References

| File | Lines | Reference |
|------|-------|-----------|
| `cli/index.ts` | 14-42 | Current dual-mode logic to remove |
| `cli/app.tsx` | 183-268 | Current App component with command selector |
| `cli/components/Header.tsx` | 1-19 | Component to delete |

---

## Context References

**Tech-Spec:** [tech-spec.md](../tech-spec.md) - Primary context document containing:
- ADR-001: Ink-Only (No Commander) rationale
- Complete file deletion list
- New index.ts implementation
- Existing code patterns to follow

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
