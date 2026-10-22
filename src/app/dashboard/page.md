# Route: `/dashboard`

| Field | Value |
| --- | --- |
| File | `src/app/dashboard/page.tsx` |
| Shell | `AppLayout` (sidebar, header, ⌘K, mobile bottom nav) |
| Auth | Protected (demo cookie bypasses Supabase) |
| Owner | Agent X (App Experience) |

## Purpose
V14 home: hero briefing, engine snapshot, quick links to `/path`, `/review`, `/arena`, `/achievements`, `/wrapped`.

## Components
- `dashboard-hero.tsx` — companion briefing, progression rings, continue CTA
- `dashboard-hub.tsx` — next-level tiles + engine widgets

## Integrations (import only)
- `@/components/companion`, `@/components/progression`, `@/components/motion`, `@/lib/engine`
