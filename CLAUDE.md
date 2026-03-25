# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

Gauge is an iOS subscription tracker that gives users a single, clean source of truth for all their recurring subscriptions. The core problem it solves: consumers typically manage 5–10 subscriptions and spend $90+/month without visibility — leading to forgotten subscriptions, unexpected renewals, and no centralized tool.

**Core functionality**: Users manually log subscriptions (service, plan, price, billing cycle, renewal date, payment method, free trial status). The app calculates total monthly/yearly spend, tracks upcoming renewals, sends configurable reminders, and surfaces spending insights.

**Key features**: Renewal reminders, free trial expiry alerts, spending analytics by category, monthly budget cap with overage warnings, price history tracking.

**Design principles**: Privacy-first (no bank linking), manual-first input, minimal iOS-native UI, actionable insights over complex dashboards.

**Target user**: Productivity-focused individuals who use to-do, finance, or habit apps and want zero "loose ends."

**Interface**: List view, card view, calendar view for upcoming charges; colour-coded status indicators (safe / upcoming / urgent).

## Commands

```bash
npm run dev        # Start dev server on port 8080
npm run build      # Production build
npm run build:dev  # Development build
npm run lint       # ESLint validation
npm run test       # Run unit tests (Vitest)
npm run test:watch # Run unit tests in watch mode
npm run preview    # Preview production build
```

## Architecture

**Gauge** is a mobile-first subscription tracker built with React + TypeScript + Vite.

### Stack
- **Backend**: Supabase (auth + database)
- **State**: TanStack React Query for server state; custom React hooks for local state
- **Forms**: React Hook Form + Zod
- **UI**: shadcn-ui (Radix UI primitives) + Tailwind CSS + Framer Motion
- **Charts**: Recharts
- **Path alias**: `@/*` maps to `./src/*`

### Key Architectural Patterns

**Routing**: React Router v6 with `BrowserRouter`. `Index.tsx` is the main shell — it renders tab-based navigation (Subscriptions, Insights, Calendar, Settings) with a persistent `BottomNav` and floating `FAB` for adding subscriptions.

**Auth flow**: `useAuth` hook (in `src/hooks/useAuth.tsx`) provides an auth context. The `Auth.tsx` page handles login/signup. Protected content lives inside the main tab pages.

**Data layer**: All Supabase interactions go through custom hooks in `src/hooks/` (`useSubscriptions`, `useProfile`). The auto-generated DB types are in `src/integrations/supabase/types.ts` — don't hand-edit this file.

**Subscription domain logic**: Constants for currencies (11 options), categories (15), billing cycles (weekly/monthly/quarterly/yearly), and ~20 popular pre-filled services live in `src/lib/constants.ts`.

### TypeScript Config
TypeScript is configured loosely: `noImplicitAny: false` and `strictNullChecks: false`. Don't tighten these without discussion.

### Animated Background
`src/components/layout/AnimatedBackground.tsx` uses CSS blob animations defined in `tailwind.config.ts` under the `blob` keyframe. The blobs are rendered in `Index.tsx`.

### Testing
- Unit tests: Vitest with jsdom, configured in `vitest.config.ts`. Test files go in `src/test/`.
- E2E tests: Playwright, configured in `playwright.config.ts`.

## Design Context

### Brand Personality
**Confident & Alive.** Three words: *sharp*, *reactive*, *trusted*. Data is the hero — zero decoration. The interface has pulse: bold numbers, a single punchy accent (electric lime `hsl(74 100% 50%)`), and enough motion to feel reactive without being noisy. Think: Bloomberg terminal that grew up on iOS.

### Aesthetic Direction
- Dark-first. Light mode is a clean fallback, never the primary experience.
- Primary accent: Electric lime — used sparingly on CTAs, active states, positive trends, healthy Gauge Score ring only. Never as background fill.
- Typography: Plus Jakarta Sans, weights 600–900 for data, 400–500 for labels. Numbers are always the largest element.
- Radius: iOS squircle language — `rounded-2xl` (24px) cards, `rounded-xl` (20px) inputs, `rounded-full` chips.
- Motion: Framer Motion spring (`stiffness: 300, damping: 30`) for positional; `0.18–0.25s ease-out` for fades. Never decorative.
- Anti-patterns: No glassmorphism, no gradient card fills, no emoji in UI chrome, no heavy drop shadows.

### Design Principles
1. **Numbers first.** Every screen leads with the most important number.
2. **Density with breathing room.** 4px-base spacing; generous vertical rhythm.
3. **One accent, used deliberately.** Lime on CTAs, active states, positive indicators — nothing else.
4. **Motion communicates, never decorates.** Spring physics for drag; ease-out for entrances.
5. **Progressive disclosure.** Critical summary above the fold; pull down for detail.
