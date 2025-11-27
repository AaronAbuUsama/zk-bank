# Story 1.2: Add Jotai State Management

**Status:** Draft

---

## User Story

As a **developer**,
I want **centralized atomic state management with persistence**,
So that **application state is predictable, components have minimal re-renders, and user preferences survive CLI restarts**.

---

## Acceptance Criteria

1. **AC #1:** Jotai 2.12.2 is installed and importable
2. **AC #2:** Atoms are importable from `@/state` path alias
3. **AC #3:** Theme preference persists to `~/.config/zk-bank/preferences.json`
4. **AC #4:** Layout mode preference persists across CLI restarts
5. **AC #5:** No React Context boilerplate required for state access
6. **AC #6:** Path aliases work in tsconfig.json (`@/state`, `@/ui`, `@/hooks`)

---

## Implementation Details

### Tasks / Subtasks

- [ ] Install Jotai (AC: #1)
  - [ ] Run `bun add jotai`
  - [ ] Verify version 2.12.2 or compatible
- [ ] Configure path aliases in tsconfig.json (AC: #6)
  - [ ] Add `@/state` alias
  - [ ] Add `@/ui` alias
  - [ ] Add `@/hooks` alias
  - [ ] Add `@/shared` alias
  - [ ] Add `@/services` alias
- [ ] Create state directory structure (AC: #2)
  - [ ] Create `cli/state/index.ts`
  - [ ] Create `cli/state/atoms/` directory
- [ ] Implement theme atom with persistence (AC: #3)
  - [ ] Create `cli/state/atoms/theme.ts`
  - [ ] Use `atomWithStorage` for persistence
  - [ ] Define ThemeName type
  - [ ] Define LayoutMode type
  - [ ] Default theme: 'terminal-classic'
  - [ ] Default layout: 'chat'
- [ ] Implement navigation atom (AC: #5)
  - [ ] Create `cli/state/atoms/navigation.ts`
  - [ ] Define activePageAtom ('dashboard' | 'trollbox' | 'chain')
  - [ ] Define inputModeAtom ('chat' | 'agent')
- [ ] Implement user atom placeholder (AC: #5)
  - [ ] Create `cli/state/atoms/user.ts`
  - [ ] Define userProfileAtom (initially null)
  - [ ] Define walletAtom (initially null)
- [ ] Create local config service (AC: #3, #4)
  - [ ] Create `cli/services/config/local.ts`
  - [ ] Implement readPreferences()
  - [ ] Implement writePreferences()
  - [ ] Use XDG Base Directory spec (~/.config/zk-bank/)
- [ ] Create re-export index (AC: #2)
  - [ ] Export all atoms from `cli/state/index.ts`
- [ ] Verify persistence works (AC: #3, #4)
  - [ ] Set theme, restart CLI, verify theme restored
  - [ ] Set layout mode, restart CLI, verify mode restored

### Technical Summary

This story implements ADR-002 (Jotai Over Context). Jotai provides atomic state without Provider boilerplate - atoms are importable anywhere and trigger surgical re-renders.

**Key Implementation:**

```typescript
// cli/state/atoms/theme.ts
import { atomWithStorage } from 'jotai/utils'
import type { ThemeName, LayoutMode } from '@/ui/themes/types'

// Custom storage adapter for Bun.file
const bunStorage = {
  getItem: async (key: string) => { /* read from ~/.config/zk-bank/ */ },
  setItem: async (key: string, value: string) => { /* write to ~/.config/zk-bank/ */ },
  removeItem: async (key: string) => { /* delete from ~/.config/zk-bank/ */ },
}

export const themeAtom = atomWithStorage<ThemeName>('theme', 'terminal-classic', bunStorage)
export const layoutModeAtom = atomWithStorage<LayoutMode>('layoutMode', 'chat', bunStorage)
```

**Directory Structure:**
```
cli/state/
├── index.ts              # Re-export all atoms
└── atoms/
    ├── theme.ts          # themeAtom, layoutModeAtom
    ├── navigation.ts     # activePageAtom, inputModeAtom
    └── user.ts           # userProfileAtom, walletAtom
```

### Project Structure Notes

- **Files to modify:** `tsconfig.json`
- **Files to create:**
  - `cli/state/index.ts`
  - `cli/state/atoms/theme.ts`
  - `cli/state/atoms/navigation.ts`
  - `cli/state/atoms/user.ts`
  - `cli/services/config/local.ts`
- **Expected test locations:** `cli/__tests__/state/`
- **Estimated effort:** 3 story points
- **Prerequisites:** Story 1.1 (clean entry point)

### Key Code References

| File | Lines | Reference |
|------|-------|-----------|
| `cli/shared/errors.ts` | 1-45 | Pattern for utility module structure |
| `cli/services/config/config.ts` | 44-82 | Existing config loading pattern |

---

## Context References

**Tech-Spec:** [tech-spec.md](../tech-spec.md) - Primary context document containing:
- ADR-002: Jotai Over Context rationale
- Atom structure and persistence strategy
- Local config service implementation
- Path alias configuration

**Architecture:** [architecture.md](../architecture.md) - State management decisions

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
