# Operation Next Level — Summary

Branch: `next-level`

## What changed
- **Demo mode**: No Supabase env → all protected routes work via `src/proxy.ts` (Next 16 proxy, replaces middleware). Optional `NEXT_PUBLIC_DEVPATH_DEMO=1` or `?demo=1` cookie when Supabase is configured.
- **Engine**: Event-sourced XP, streaks (with freezes), daily/weekly quests, achievements, spaced-repetition review queue, celebrations — `dispatchEngine()` + localStorage, optional sync via `GET/PUT /api/engine` after migration `20261022120000_next_level_engine.sql`.
- **Kip**: AI companion (avatar, assist chips, briefing, dock), `/api/ai` streaming + `/api/ai/generate` with scripted demo when no API key.
- **Motion**: Reveal, CountUp, confetti `celebrate()`, `CelebrationLayer`, page `template.tsx` transitions.
- **Design**: V14 tokens in `globals.css`, UI primitives, `/design` QA route.
- **App shell**: Updated sidebar + mobile nav, command palette (where implemented), landing + `/start` onboarding.
- **Features**: `/path`, `/review`, `/achievements`, `/arena` (boss interview), `/wrapped` (shareable recap).

## Try first (zero config)
1. `/` → **Start in 30 seconds** → `/start`
2. `/dashboard` after onboarding
3. `/path` and `/review`
4. `/arena` — mock interview boss fight
5. `/wrapped` — story recap + PNG export
6. Kip dock (bottom-left) on any app page

## Env (optional)
| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_DEVPATH_DEMO=1` | Demo without login when Supabase is set |
| `OPENROUTER_API_KEY` or `AI_API_KEY` | Live AI (else demo scripts) |
| `AI_BASE_URL`, `AI_MODEL` | Provider override |
| Supabase trio | Auth + engine snapshot sync |

## Migration
Apply `supabase/migrations/20261022120000_next_level_engine.sql` on your project (additive RLS tables only).

## Build
`npm run build` passes as of integration.
