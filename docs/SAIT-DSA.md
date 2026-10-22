# SAIT DSA — architecture notes

## Product

CUSAT peer DSA platform for SAIT (IT & AI): syllabus (`/learn`), question bank (`/practice`), challenges, rankings, and student profiles.

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Client + server | **Preferred.** Dashboard “publishable” key (same as anon JWT) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + server | Legacy env name; use if you already have it — same value as publishable |

Never put the **secret** (service role) key in any `NEXT_PUBLIC_*` variable.
| `JUDGE0_API_URL` | Server only | Judge0 API base (self-hosted or RapidAPI URL) |
| `JUDGE0_API_KEY` | Server only | Judge0 `X-Auth-Token` |
| `JUDGE0_RAPIDAPI_KEY` | Server only | RapidAPI key (uses default CE host when URL omitted) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Onboarding completion, score events, rankings, import, hidden tests |
| `SAIT_ADMIN_IMPORT_KEY` | Server only | Bearer token for admin import (or use `admin_roles` table) |
| `OPENROUTER_API_KEY` | Server only | OpenRouter API key for lesson AI guide (`POST /api/ai/chat`) |
| `OPENROUTER_MODEL` | Server only | Model id (default `openrouter/free` — free-tier router; or e.g. `meta-llama/llama-4-maverick:free`) |
| `NEXT_PUBLIC_APP_URL` | Server | Site URL sent as OpenRouter `HTTP-Referer` (default `http://localhost:3000`) |

Copy `.env.example` to `.env` and fill in values.

Without Judge0, `/api/submissions` returns `judge_unavailable` and does **not** execute student code on the Next.js server.

## Question bank (v2)

- Schema: `question-bank/question.schema.json`
- Authoring guide: `question-bank/question-format.md`
- Template: `question-bank/question-template.json`
- Pilot packages: `question-bank/**/*.json` (10 problems; expand toward 100+ via import only)
- Validation: `src/lib/questions/validate.ts` (AJV + extra rules)
- Import preview: `POST /api/admin/import` (JSON body, or `multipart/form-data` with `file` / `package` ZIP)
- Publish: `POST /api/admin/import/publish` with `{ batchId, approvedIds, files }`
- List (paginated): `GET /api/problems?page=1&limit=20&q=&topic=&difficulty=&sort=`
- Public detail: `GET /api/problems/:id` (no hidden tests or reference solutions)

Legacy v1 files under `src/lib/data/problems/` are superseded by `question-bank/`.

Hidden tests and `reference_solutions` are stripped client-side via `getPublicProblem()`.

## Database

Apply migrations in order:

1. `supabase/migrations/20250909100000_initial_schema.sql`
2. `supabase/migrations/20251017100000_sait_dsa_schema.sql`
3. `supabase/migrations/20251017200000_phase2_question_engine.sql`
4. `supabase/migrations/20251017300000_phase3_multiuser.sql`
5. `supabase/migrations/20251017400000_phase7_beta_feedback.sql`

Local demo mode still mirrors progress in `localStorage` (`sait_dsa_app_state`). Supabase users sync submissions, lessons, scores, and rankings via server APIs.

## Phase 3 — identity, activity, rankings

### User lifecycle

- Account fields: `onboarding_status`, `account_status`, `membership_status` (see migration).
- New users complete a 4-step onboarding (`/onboarding`); progress is saved in `sait_onboarding_draft_v1`.
- `POST /api/onboarding/complete` persists profile (requires service role for Supabase auth users).
- Protected routes require login (`middleware.ts`); incomplete onboarding redirects via `OnboardingGate`.

### Scoring (policy v1)

Authoritative rules in `src/lib/scoring/scoring-policy.ts`. Points are written only through `awardScoreEvent` into `score_events` with per-user idempotency keys.

- First accepted solution per problem: difficulty-based points from problem metadata.
- Repeat accepts on the same problem: 0 additional practice points.
- Lesson mastery checkpoint: +15 points once per lesson (`lesson_completion_events`).
- Profile `ranking_score` / `unique_solved_count` updated server-side; users cannot self-edit (DB trigger).

### Rankings API

`GET /api/rankings?scope=batch|department|cohort|college&period=weekly|monthly|all-time&category=practice_points|unique_solved|consistency`

- Period boundaries use platform timezone `Asia/Kolkata` (`platform-config.ts`).
- Weekly/monthly boards aggregate `score_events` in range; all-time uses profile totals.
- Eligibility: `account_status = active`, onboarding complete, scope membership from profile fields (not URL params).
- No fabricated demo peers on the rankings page.

### Practice time

`POST /api/activity/heartbeat` validates session heartbeats (30s, 2m inactivity cap, tab visibility). Client `usePracticeTimer` does not send raw elapsed totals. Active time is an engagement estimate, not proof of attention.

### Streaks

Qualifying days update via `recordQualifyingDay` on accepted solves and meaningful lesson completion (platform date in Asia/Kolkata).

### Tests

`npm test` includes scoring idempotency keys and streak date helpers. Extend with RLS integration tests against a local Supabase stack when available.

## Phase 4 — interactive learning workspace

- Route: `/learn/[module]/[lesson]` — full-height workspace (no sidebar).
- Curriculum: `src/lib/curriculum/` — 12 modules, 80+ lessons; detailed content in **Foundations** and **Arrays** modules; stubs elsewhere via `buildStubLesson`.
- Panels: Learn / Visualize / Examples / Complexity / Practice / Review tabs with distinct content; topic visualizers in `src/components/dsa-workspace/visualizers.tsx`.
- Playground: dark editor, language select, **Run** (public tests only via `mode: run`) vs **Submit** (full judge + progress). Drafts persist per lesson in `sait_lesson_editor_drafts`.
- AI Guide: OpenRouter-backed tutor (`LessonTutorPanel` → `POST /api/ai/chat`), lesson context on the server.
- Lesson completion: knowledge-check quiz or checkpoint in Review — not on page open. Progress fields: `viewedLessons`, `lessonQuizPassed`, `lessonCheckpointDone`, `lastVisitedLesson`.
- Syllabus re-exports: `@/lib/data/dsa-syllabus` → `@/lib/curriculum`.
- Phase 5: all **89** lessons have full `DsaLessonContent` in `src/lib/curriculum/content/` (modules 3–12 expanded). Question-bank gaps: `docs/curriculum-problem-gaps.md`.

## Phase 6 — playground and judge

- Run vs Submit: `docs/phase6-judge-audit.md`
- `GET /api/submissions` for authorized history; editor drafts in `sait_lesson_editor_drafts`

## Phase 7 — student beta readiness

- Beta release checklist: `docs/beta-release-checklist.md`
- `GET /api/me` returns `sessionMode`: `supabase` | `local_demo` (banner in app shell for demo)
- `POST /api/feedback` — categories bug/content/judge/usability/other; RLS on `beta_feedback`
- Login honors `?next=` after sign-in (open redirect blocked)
- Dashboard **Continue** prefers `lastVisitedLesson` then syllabus order
- Automated journey tests: onboarding validation, module lock, ranking scope/ties, lesson visit vs completion, RLS snapshot, protected routes
- **Not in CI:** live two-account Supabase, Judge0 E2E — manual per checklist
