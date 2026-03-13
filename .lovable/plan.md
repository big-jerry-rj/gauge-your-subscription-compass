# Gauge: Subscription Tracker App

## Overview

A privacy-first, mobile-first subscription tracking web app with magic link auth, green-themed fintech design, dark/light mode, and Supabase backend.

## Design System

- Light mode: White (#FFFFFF) / warm gray (#FAFAFA) backgrounds, green gradient accents (#22C55E → #4ADE80)
- Dark mode: Deep dark backgrounds with green gradient accents
- Inter font, large bold stats, floating white cards with subtle shadows, 16-20px rounded corners
- Green gradient hero/insight card with frosted glass effect
- Bottom tab navigation with 4 tabs + floating action button

## Authentication

- Magic link (passwordless) sign-in via Supabase Auth
- Simple auth page with email input and magic link flow
- Protected routes — redirect to auth if not logged in

## Database (Supabase)

- **subscriptions** table: id, user_id, name, amount, currency, billing_cycle (monthly/weekly/yearly/quarterly), category, start_date, status (active/paused/cancelled), logo_url, next_billing_date, created_at
- **profiles** table: id (FK to auth.users), display_name, preferred_currency (default EUR), created_at
- RLS policies so users only see their own data

## Pages & Navigation

### Bottom Tab Bar (fixed, 4 tabs)

1. **Subscriptions** — List of all subscriptions with filter chips (All, Active, Paused, Cancelled), search, category filter. Each card shows logo, name, amount, next billing date, status badge
2. **Insights** — Hero green gradient insight card ("You're spending €X on Y subscriptions"), monthly spending trend chart (recharts), category breakdown donut chart, top 3 most expensive, yearly projection
3. **Calendar** — Monthly calendar view with dots on billing dates, tapping a date shows subscriptions due that day
4. **Settings** — Currency selector (EUR default, USD, GBP, etc.), dark/light mode toggle, export data, about section

### Floating Action Button (+)

- Opens "Add Subscription" sheet/modal
- Fields: name (with popular service logo picker — Netflix, Spotify, YouTube, etc.), amount, billing cycle, category dropdown, start date, status
- Logo picker: grid of popular service logos that auto-fill name + logo

### Popular Service Logo Picker

- Pre-built list of ~20 popular services (Netflix, Spotify, Disney+, YouTube Premium, Apple Music, iCloud, Google One, Adobe, Microsoft 365, etc.) with logos from public CDN URLs
- Selecting one auto-fills name and logo; user can also type custom name

## Features

- Auto-calculate next billing date from start date + cycle
- Currency formatting with EUR (€) default, changeable in settings
- Dark mode / light mode toggle (persisted)
- Subscription CRUD (add, edit, delete, pause/resume)
- Smooth animations: fade-in on load, tab transitions, card hover scale

## Currency Support

- Default: EUR (€)
- Available: USD, GBP, JPY, CAD, AUD, CHF, etc.
- Changeable in Settings, stored in user profile