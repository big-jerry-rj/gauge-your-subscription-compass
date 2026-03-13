

# Plan: Add Logo, Remove Ash Grey, Apply Glow/Glass UI

## 1. Add Gauge logo as favicon and in-app branding
- Copy uploaded logo to `public/gauge-logo.png`
- Update `index.html`: set favicon, title to "Gauge", update meta tags
- Optionally show logo in the app header area

## 2. Remove Ash Grey from color palette
- Replace all `167 24% 42%` (muted-foreground light) and `167 24% 62%` (muted-foreground dark) references with neutral tones derived from the existing palette (e.g. `45 10% 46%` for light, `45 10% 60%` for dark)
- Replace border/input `167 15% 88%` with neutral `79 15% 88%` (light) and keep dark as-is
- Remove sidebar refs that use ash grey tones

## 3. Add floating glow background effect
- **`src/index.css`**: Add a new `.glow-background` utility class using the specified multi-layer radial gradients with `rgba(133,203,51,...)` colors
- Add `@keyframes gradientMove` animation (8s ease-in-out infinite alternate) that shifts the gradient positions
- Apply a fixed glow layer behind the main content in `src/pages/Index.tsx` using an absolutely positioned div with `filter: blur(60px)`, `opacity: 0.8`, `mix-blend-mode: multiply`

## 4. Update card styling to glass effect
- **`src/index.css`**: Update `.card-shadow` and add a `.glass-card` utility with `backdrop-filter: blur(40px)`, `background: rgba(255,255,255,0.6)`, `border-radius: 24px`, and the specified box-shadow with green glow
- Dark mode variant: `background: rgba(30,25,15,0.6)` 
- Apply glass-card styling to `SubscriptionCard.tsx`, `InsightsPage.tsx` cards, and other card components

## Files to modify
1. `index.html` — favicon + title
2. `src/index.css` — remove ash grey, add glow/glass utilities, add keyframes
3. `src/pages/Index.tsx` — add glow background layer
4. `src/components/subscriptions/SubscriptionCard.tsx` — glass card style
5. `src/pages/InsightsPage.tsx` — glass card style
6. `src/pages/SubscriptionsPage.tsx` — glass card style on filter area
7. Copy logo to `public/gauge-logo.png`

