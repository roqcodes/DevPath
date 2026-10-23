# Route: `/start`

| Field | Value |
| --- | --- |
| File | `src/app/start/page.tsx` |
| Layout | Root (full-bleed, no `AppLayout`) |
| Auth | Public (`/start` excluded from session gate) |
| Owner | Agent X (App Experience) |

## Purpose
4-step first-run: goal → level → daily minutes → **path ready** moment. Persists `localStorage` key `devpath_start_v1` with `{ goal, level, minutes, complete }`.

## Signature moment
Step 4 / completion: `m-unlock` node, `celebrate({ kind: "big" })`, `dispatchEngine({ type: "onboarding_completed", ... })`, then CTAs to `/path` and `/dashboard`.

## Demo
Auto `enableDemoCookie()` on mount when not already in demo mode.
