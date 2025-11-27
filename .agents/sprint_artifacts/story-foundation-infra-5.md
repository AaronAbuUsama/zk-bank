# Story 1.5: Create AppShell + Page Routing

**Status:** Draft

---

## User Story

As a **user**,
I want **a consistent layout with Banner, Footer, and tab navigation**,
So that **I can navigate between Dashboard, Trollbox, and Chain pages using keyboard shortcuts**.

---

## Acceptance Criteria

1. **AC #1:** Banner displays at top of screen
2. **AC #2:** Footer displays at bottom with tab indicators [1] [2] [3]
3. **AC #3:** Keys `1`, `2`, `3` switch between pages
4. **AC #4:** Active tab is visually highlighted with primary color
5. **AC #5:** Placeholder pages render for Dashboard, Trollbox, Chain
6. **AC #6:** Layout follows Flush Grid design (no boxes, bg color separation)
7. **AC #7:** `q` key quits the application
8. **AC #8:** `Ctrl+D` toggles layout density mode

---

## Implementation Details

### Tasks / Subtasks

- [ ] Create Banner component (AC: #1, #6)
  - [ ] Create `cli/ui/components/layout/Banner.tsx`
  - [ ] Display placeholder price data
  - [ ] Display connection status indicator
  - [ ] Use theme colors (no hardcoded hex)
  - [ ] Follow Flush Grid (no borders)
- [ ] Create Footer component (AC: #2, #4, #6)
  - [ ] Create `cli/ui/components/layout/Footer.tsx`
  - [ ] Display tab indicators [1] [2] [3]
  - [ ] Highlight active tab with theme.primary
  - [ ] Show keyboard hints
  - [ ] Follow Flush Grid design
- [ ] Create TabNav component (AC: #3, #4)
  - [ ] Create `cli/ui/components/layout/TabNav.tsx`
  - [ ] Accept activeTab prop
  - [ ] Visual indicator for active state
- [ ] Create AppShell wrapper (AC: #1, #2, #6)
  - [ ] Create `cli/ui/components/layout/AppShell.tsx`
  - [ ] Compose Banner + content + Footer
  - [ ] Accept children for page content
  - [ ] Use theme.bg for background
- [ ] Create layout re-export
  - [ ] Create `cli/ui/components/layout/index.ts`
  - [ ] Export AppShell, Banner, Footer, TabNav
- [ ] Create placeholder pages (AC: #5)
  - [ ] Create `cli/ui/pages/Dashboard.tsx`
  - [ ] Create `cli/ui/pages/Trollbox.tsx`
  - [ ] Create `cli/ui/pages/Chain.tsx`
  - [ ] Each shows page name and "Coming soon" message
- [ ] Create pages re-export
  - [ ] Create `cli/ui/pages/index.ts`
  - [ ] Export Dashboard, Trollbox, Chain
- [ ] Implement keyboard navigation (AC: #3, #7, #8)
  - [ ] Update `cli/hooks/useKeyboard.ts`
  - [ ] Handle `1` → Dashboard
  - [ ] Handle `2` → Trollbox
  - [ ] Handle `3` → Chain
  - [ ] Handle `q` → quit
  - [ ] Handle `Ctrl+D` → toggle layout mode
- [ ] Update app.tsx (AC: #1-#5)
  - [ ] Replace command selector with AppShell
  - [ ] Render active page based on activePageAtom
  - [ ] Wire up useKeyboard hook
- [ ] Verify navigation works (AC: #3, #4)
  - [ ] Press 1, 2, 3 and verify pages switch
  - [ ] Verify active tab highlights correctly
- [ ] Verify quit works (AC: #7)
  - [ ] Press q and verify CLI exits
- [ ] Verify layout toggle (AC: #8)
  - [ ] Press Ctrl+D and verify layout changes

### Technical Summary

This story creates the complete layout architecture per the Architecture document and UX Design Specification.

**AppShell Structure:**

```
┌─────────────────────────────────────────┐
│ BANNER - prices, connection status      │
├─────────────────────────────────────────┤
│                                         │
│           ACTIVE PAGE                   │
│   (Dashboard | Trollbox | Chain)        │
│                                         │
├─────────────────────────────────────────┤
│ FOOTER - [1] [2] [3] tabs, hints        │
└─────────────────────────────────────────┘
```

**AppShell Implementation:**

```typescript
// cli/ui/components/layout/AppShell.tsx
import { Box } from 'ink'
import { useAtom } from 'jotai'
import { themeAtom } from '@/state'
import { useTheme } from '@/hooks'
import { Banner } from './Banner'
import { Footer } from './Footer'

interface Props {
  children: React.ReactNode
}

export function AppShell({ children }: Props) {
  const { theme } = useTheme()

  return (
    <Box
      flexDirection="column"
      width="100%"
      height="100%"
      backgroundColor={theme.bg}
    >
      <Banner />
      <Box flexGrow={1} flexDirection="column">
        {children}
      </Box>
      <Footer />
    </Box>
  )
}
```

**Page Routing:**

```typescript
// cli/app.tsx
import { useAtom } from 'jotai'
import { activePageAtom } from '@/state'
import { AppShell } from '@/ui/components/layout'
import { Dashboard, Trollbox, Chain } from '@/ui/pages'
import { useKeyboard } from '@/hooks'

export function App() {
  const [activePage] = useAtom(activePageAtom)
  useKeyboard() // Enables all keyboard shortcuts

  return (
    <AppShell>
      {activePage === 'dashboard' && <Dashboard />}
      {activePage === 'trollbox' && <Trollbox />}
      {activePage === 'chain' && <Chain />}
    </AppShell>
  )
}
```

### Project Structure Notes

- **Files to modify:** `cli/app.tsx`, `cli/hooks/useKeyboard.ts`
- **Files to create:**
  - `cli/ui/components/layout/AppShell.tsx`
  - `cli/ui/components/layout/Banner.tsx`
  - `cli/ui/components/layout/Footer.tsx`
  - `cli/ui/components/layout/TabNav.tsx`
  - `cli/ui/components/layout/index.ts`
  - `cli/ui/pages/Dashboard.tsx`
  - `cli/ui/pages/Trollbox.tsx`
  - `cli/ui/pages/Chain.tsx`
  - `cli/ui/pages/index.ts`
- **Expected test locations:** `cli/__tests__/ui/components/layout/`, `cli/__tests__/ui/pages/`
- **Estimated effort:** 3 story points
- **Prerequisites:** Story 1.2 (Jotai), Story 1.4 (Themes)

### Key Code References

| File | Lines | Reference |
|------|-------|-----------|
| `cli/state/atoms/navigation.ts` | - | activePageAtom (from Story 1.2) |
| `cli/hooks/useTheme.ts` | - | Theme access (from Story 1.4) |
| UX Spec | Section 4 | Layout architecture |

---

## Context References

**Tech-Spec:** [tech-spec.md](../tech-spec.md) - Primary context document containing:
- AppShell architecture diagram
- Component structure
- Keyboard navigation implementation
- Flush Grid design principles

**UX Design:** [ux-design-specification.md](../ux-design-specification.md) - Layout modes, component specs

**Architecture:** [architecture.md](../architecture.md) - FR Category to Architecture Mapping

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
