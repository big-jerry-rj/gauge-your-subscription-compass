

# Plan: Animated Floating Gradient Background

Replace the current static radial `.glow-background` with a multi-blob animated gradient component inspired by Arc browser / Stripe aesthetics — slow-drifting, organic color clouds.

## Approach

Create a new `AnimatedBackground` React component with 4–5 absolutely positioned gradient blobs, each animated independently via CSS keyframes at different speeds (26–40s). Heavy blur applied. Dark/light mode adapts colors.

## New File: `src/components/layout/AnimatedBackground.tsx`

- Renders 4–5 `div` blobs, each with:
  - Large size (60–80% of viewport)
  - Radial gradient fill using brand colors
  - `filter: blur(80–120px)` for soft diffusion
  - Individual CSS animation class (different duration, path, scale)
  - `will-change: transform` for GPU acceleration
- Wrapper div: `fixed inset-0 overflow-hidden pointer-events-none z-0`
- Light mode base: `#EFFFC8` tinted blobs with `#85CB33`, `#A5CBC3`
- Dark mode base: `#100B00` with subtle `#85CB33`, `#3B341F`, `#A5CBC3` glows
- Use `mix-blend-mode` (multiply for light, screen for dark)

## CSS Changes: `src/index.css`

- Remove old `.glow-background` and `gradientMove` keyframe
- Add 4 new keyframes (`blob1`–`blob4`) with different translate/scale/rotate paths, 32s/26s/40s/35s durations, infinite loops
- Keep performance-safe: only `transform` animations

## Update: `src/pages/Index.tsx`

- Replace `<div className="glow-background ...">` with `<AnimatedBackground />`

## Files to create/modify
1. **Create** `src/components/layout/AnimatedBackground.tsx`
2. **Edit** `src/index.css` — remove `.glow-background`, add blob keyframes
3. **Edit** `src/pages/Index.tsx` — swap in `<AnimatedBackground />`

