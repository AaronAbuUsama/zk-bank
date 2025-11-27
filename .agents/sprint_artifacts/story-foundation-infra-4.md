# Story 1.4: Implement Theme System

**Status:** Draft

---

## User Story

As a **user**,
I want **5 selectable color themes with persistence**,
So that **I can customize the CLI appearance to my preference and have it remember my choice**.

---

## Acceptance Criteria

1. **AC #1:** All 5 themes are defined with correct hex values from UX spec
2. **AC #2:** Theme interface includes all semantic tokens (bg, text, primary, accent, success, error, warning)
3. **AC #3:** `Ctrl+T` cycles through themes
4. **AC #4:** Theme persists to `~/.config/zk-bank/preferences.json`
5. **AC #5:** `useTheme()` hook provides current theme object
6. **AC #6:** Components use `theme.tokenName`, never hardcoded hex colors
7. **AC #7:** Default theme is 'terminal-classic'

---

## Implementation Details

### Tasks / Subtasks

- [ ] Create theme types (AC: #2)
  - [ ] Create `cli/ui/themes/types.ts`
  - [ ] Define Theme interface with all tokens
  - [ ] Define ThemeName union type
  - [ ] Define LayoutMode type
- [ ] Implement all 5 themes (AC: #1)
  - [ ] Create `cli/ui/themes/index.ts`
  - [ ] Implement Terminal Classic theme (default)
  - [ ] Implement Cyberpunk Neon theme
  - [ ] Implement Nord Frost theme
  - [ ] Implement Dracula theme
  - [ ] Implement Bloomberg theme
  - [ ] Export themes map and getTheme() function
- [ ] Create useTheme hook (AC: #5, #6)
  - [ ] Create `cli/hooks/useTheme.ts`
  - [ ] Return current theme object from themeAtom
  - [ ] Return setTheme function
  - [ ] Return cycleTheme function
- [ ] Implement theme cycling (AC: #3)
  - [ ] Create `cli/hooks/useKeyboard.ts`
  - [ ] Handle Ctrl+T to cycle themes
  - [ ] Update themeAtom on cycle
- [ ] Create hooks re-export (AC: #5)
  - [ ] Create `cli/hooks/index.ts`
  - [ ] Export useTheme, useKeyboard
- [ ] Verify persistence (AC: #4, #7)
  - [ ] Set theme to 'dracula'
  - [ ] Restart CLI
  - [ ] Verify 'dracula' is restored
- [ ] Document theme usage pattern (AC: #6)
  - [ ] Add comment in useTheme.ts showing correct usage

### Technical Summary

This story implements the theme system per UX Design Specification. All 5 themes use semantic color tokens that map to specific UI purposes.

**Theme Interface:**

```typescript
// cli/ui/themes/types.ts
export interface Theme {
  name: string
  bg: string           // Main background
  bgAlt: string        // Banner, footer, input areas
  text: string         // Primary text
  textBright: string   // Emphasized text
  textDim: string      // Muted, timestamps
  primary: string      // Primary actions, branding
  accent: string       // Secondary accent, info
  success: string      // Price up, profits
  error: string        // Price down, liquidations
  warning: string      // Caution, attention
}

export type ThemeName =
  | 'terminal-classic'
  | 'cyberpunk-neon'
  | 'nord-frost'
  | 'dracula'
  | 'bloomberg'

export type LayoutMode = 'chat' | 'dense'
```

**Theme Definitions:**

```typescript
// cli/ui/themes/index.ts
export const themes: Record<ThemeName, Theme> = {
  'terminal-classic': {
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
  },
  'nord-frost': {
    name: 'Nord Frost',
    bg: '#2e3440',
    bgAlt: '#3b4252',
    text: '#d8dee9',
    textBright: '#eceff4',
    textDim: '#4c566a',
    primary: '#88c0d0',
    accent: '#b48ead',
    success: '#a3be8c',
    error: '#bf616a',
    warning: '#ebcb8b',
  },
  // ... other themes
}
```

**Usage Pattern:**

```typescript
// In any component
const { theme } = useTheme()
<Text color={theme.primary}>Username</Text>  // Good
<Text color="#33ff33">Username</Text>         // Bad - never do this
```

### Project Structure Notes

- **Files to create:**
  - `cli/ui/themes/types.ts`
  - `cli/ui/themes/index.ts`
  - `cli/hooks/useTheme.ts`
  - `cli/hooks/useKeyboard.ts`
  - `cli/hooks/index.ts`
- **Expected test locations:** `cli/__tests__/hooks/`, `cli/__tests__/ui/themes/`
- **Estimated effort:** 3 story points
- **Prerequisites:** Story 1.2 (Jotai atoms for persistence)

### Key Code References

| File | Lines | Reference |
|------|-------|-----------|
| `cli/state/atoms/theme.ts` | - | themeAtom (from Story 1.2) |
| UX Spec | Section 3.1 | Complete theme hex values |

---

## Context References

**Tech-Spec:** [tech-spec.md](../tech-spec.md) - Primary context document containing:
- Theme interface definition
- All 5 theme color values
- Theme switching implementation
- Usage patterns

**UX Design:** [ux-design-specification.md](../ux-design-specification.md) - Complete theme specifications with hex values

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
