# Recon: Operation Next Level

## What the app actually is
The repo `roqcodes/DevPath` currently ships **SAIT DSA**: a DSA (data structures & algorithms) learning + practice platform for CUSAT students. Next 16.3.4 App Router, React 19.2, Tailwind v4, Supabase, OpenRouter AI, Judge0 code runner.

## Dashboard "V14"
No file, route, commit, or doc mentions `V14`. Commit history is `init → v2 → v3`. The current `/dashboard` (`src/app/dashboard/page.tsx`) is the newest, most designed screen ("Inspired by Reference 1/2/3" comments) and is treated as the V14 north star.

### V14 design DNA (extracted)
- **Surface:** `slate-50/60` app background, white cards, `border-slate-200/80`, `rounded-2xl` cards, `rounded-3xl` hero.
- **Hero:** deep `indigo-900 → indigo-950 → slate-950` gradient with blurred indigo/cyan orbs; white text, `cyan-300` highlight, glass capsule (`bg-white/10 backdrop-blur border-white/15`).
- **Accent:** indigo-600 (`#4f46e5`) primary; cyan for "live/next"; amber/orange for streak & fire; emerald for success; purple for rankings; sky for time.
- **Type:** Geist Sans / Geist Mono. Dense: `text-xs` body, `text-[11px]` meta, `text-[10px] uppercase tracking-wider font-bold` eyebrow labels, `text-2xl font-bold tracking-tight` numbers, `tabular-nums`.
- **Icon tiles:** `h-9 w-9 rounded-xl bg-{c}-50 text-{c}-600 ring-1 ring-{c}-100`.
- **Motion:** `cubic-bezier(0.16,1,0.3,1)` ease-out-expo, 200–350 ms, `hover-lift` (-2px + soft shadow), fade-in-up 6px.
- **Density:** `p-5` cards, `gap-4` grids, `space-y-8` sections, max-w-6xl content.

## Route map (pre-change)
| Route | Notes |
|---|---|
| `/` | landing |
| `/login`, `/signup` | Supabase auth |
| `/onboarding` | 647-line flow (academic profile) |
| `/dashboard` | V14 |
| `/learn`, `/learn/[module]`, `/learn/[module]/[lesson]` | 12-module DSA curriculum (`src/lib/curriculum`) with lesson workspace + tutor panel |
| `/practice`, `/practice/[problemId]` | Judge0 problems |
| `/challenges`, `/rankings`, `/profile`, `/settings` | |
| legacy DevOps-era: `/assessment`, `/journey`, `/skills`, `/project`, `/workspace/*`, `/certificate`, `/readiness-report`, `/preferences` | mock-data driven, off-theme |
| API: `/api/ai/chat` (auth-only lesson tutor, non-streaming, OpenRouter), `/api/progress`, `/api/me`, `/api/rankings`, `/api/submissions`, ... | |

## Critical blockers for "demo mode"
- `src/middleware.ts` redirects every protected route to `/login?error=auth_not_configured` when Supabase env is missing → app unusable with zero config. Also `middleware` is **deprecated in Next 16 → `proxy.ts`**.
- `/api/ai/chat` requires a session and an OpenRouter key; no fallback.

## State & data
- `AppContext` (`src/lib/context/app-context.tsx`) + localStorage `sait_dsa_app_state`; server sync via `/api/progress`, `/api/me`.
- New: **engine** (`src/lib/engine/*`): event-sourced XP / streak / quests / achievements / review queue / companion memory, localStorage key `devpath_engine_v1`. Everything emits `dispatchEngine(event)`.

## File-ownership map (parallel agents never touch each other's files)
| Agent | Owns (exclusive write) |
|---|---|
| Lead | `src/components/providers.tsx`, `docs/next-level/RECON.md`, `DECISIONS.md`, `SUMMARY.md`, `NEXT.md`, `src/lib/engine/types.ts`, `src/lib/engine/index.ts` |
| R Research | `docs/next-level/RESEARCH.md` |
| D Design System | `src/app/globals.css`, `src/components/ui/**`, `src/app/design/**`, `src/app/layout.tsx` |
| A AI Companion | `src/lib/ai/**`, `src/app/api/ai/**`, `src/components/companion/**`, `src/lib/companion/**`, `src/components/dsa-workspace/lesson-tutor-panel.tsx` |
| X App Experience | `src/app/dashboard/**`, `src/app/page.tsx`, `src/components/layout/**`, `src/components/dashboard/**`, `src/components/command/**`, `src/app/start/**` (new first-run), `src/components/onboarding/onboarding-gate.tsx` |
| L Learning Core | `src/app/learn/**`, `src/app/review/**`, `src/app/path/**`, `src/components/learn/**`, `src/components/dsa-workspace/**` (except tutor panel) |
| G Progression | `src/lib/engine/reducer.ts`, `src/lib/engine/store.ts`, `src/lib/engine/rules/**`, `src/components/progression/**`, `src/app/achievements/**`, `src/lib/context/app-context.tsx` |
| M Motion | `src/components/motion/**`, `src/styles/motion.css`, `src/lib/motion/**` |
| B Big Bets | `src/app/wrapped/**`, `src/app/arena/**`, `src/components/wrapped/**`, `src/components/arena/**` |
| S Data | `supabase/migrations/2026*`, `src/proxy.ts` (+ delete `src/middleware.ts`), `src/lib/auth/**`, `src/lib/persistence/**`, `src/lib/engine/bridge.tsx`, `src/app/api/engine/**`, `.env.example` |
