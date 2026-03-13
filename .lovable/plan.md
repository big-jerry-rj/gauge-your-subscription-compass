

# Plan: Remove Auth, Reposition FAB, Update Color Palette

## Changes

### 1. Remove authentication gate
- **`src/pages/Index.tsx`**: Remove the auth check and `Auth` import. Always render the dashboard directly (no login screen).
- **`src/hooks/useSubscriptions.tsx`**: Remove `user` dependency from queries. For now, use a hardcoded placeholder user_id or remove user_id filtering so it works without auth.
- Keep auth files in place for later use, just bypass them.

### 2. Reposition FAB to bottom-center, above nav bar
- **`src/components/layout/FAB.tsx`**: Change from `fixed bottom-20 right-5` to centered horizontally (`left-1/2 -translate-x-1/2`) and positioned just above the bottom nav bar. The FAB should visually "float" above the tab bar center, similar to the reference screenshot.

### 3. Update bottom nav layout
- **`src/components/layout/BottomNav.tsx`**: Split tabs into 2 left + 2 right with a gap in the center for the FAB to sit above, similar to the reference screenshot where the FAB occupies the center space.

### 4. Update color palette
Based on the uploaded palette:
- **Pitch Black** `#100B00` — dark mode background
- **Yellow Green** `#85CB33` — primary accent (replaces `#22C55E`)
- **Frosted Mint** `#EFFFC8` — light tints, chip backgrounds
- **Ash Grey** `#A5CBC3` — muted/secondary text or accents
- **Dark Khaki** `#3B341F` — dark mode card/foreground tones

Update **`src/index.css`** CSS variables (both light and dark) and **`tailwind.config.ts`** to use these new HSL values. Update gradient utilities accordingly.

### Files to modify
1. `src/index.css` — new color palette HSL values
2. `src/pages/Index.tsx` — remove auth gate
3. `src/hooks/useSubscriptions.tsx` — work without auth
4. `src/components/layout/FAB.tsx` — center position
5. `src/components/layout/BottomNav.tsx` — split layout for center FAB
6. `tailwind.config.ts` — if any hardcoded color refs need updating

