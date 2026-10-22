# Route: `/`

| Field | Value |
| --- | --- |
| File | `src/app/page.tsx` |
| Layout | Root (`src/app/layout.tsx`) |
| Auth | Public |
| Owner | Agent X (App Experience) |

## Purpose
Marketing landing for DevPath / SAIT DSA. Primary CTA **Try without an account** sets `devpath_demo=1` and routes to `/start`.

## Key integrations
- `@/lib/auth/demo` — `enableDemoCookie()`
- `@/components/motion` — `Reveal` stagger / rise

## Related
- `/start` — first-run onboarding
- `/dashboard` — logged-in or demo workspace entry
