# SAIT DSA — student beta release checklist

Use this before inviting a small cohort. A passing production build alone is **not** sufficient.

## Baseline (verified in repo)

- `npm test` — unit/integration tests (no live Supabase or Judge0 required for most).
- `npm run build` — TypeScript + Next.js production bundle.

Record the commit SHA and test count in your release notes.

## Environment

| Check | Action |
|-------|--------|
| Supabase URL + publishable key | Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or legacy `ANON_KEY`) |
| Service role | Set `SUPABASE_SERVICE_ROLE_KEY` on server only — onboarding complete, scoring, feedback insert, rankings |
| Judge0 | Set `JUDGE0_API_URL` + `JUDGE0_API_KEY` or `JUDGE0_RAPIDAPI_KEY`; smoke-submit one problem after deploy |
| Admin import | Optional `SAIT_ADMIN_IMPORT_KEY` for content ops |

Never commit secrets. Never use `NEXT_PUBLIC_*` for service role or Judge0 keys.

## Database

1. Apply migrations in order through `20251017400000_phase7_beta_feedback.sql`.
2. Confirm RLS enabled on `profiles`, `lesson_progress`, `user_problem_progress`, `submissions`, `score_events`, `beta_feedback`.
3. Confirm `handle_new_user` trigger creates profiles on Supabase signup.

## Authentication

- [ ] Email/password signup and sign-in work against Supabase Auth.
- [ ] Protected routes redirect to `/login?next=…` when unauthenticated.
- [ ] After login, `next` redirects to intended path (open redirect blocked).
- [ ] Onboarding completes via `POST /api/onboarding/complete` (requires service role).
- [ ] Local demo (`local-*` user ids) shows banner; rankings/feedback server features disabled or limited.

## Judge and practice

- [ ] Submit on a pilot problem returns real verdict (not permanent `judge_unavailable`).
- [ ] Run does not write submissions or award progress.
- [ ] Rate limit: 20 submissions/min/user per app instance (see limitations below).

## Rankings (two-account manual test)

With two real Supabase accounts in the **same batch**:

- [ ] User A cannot see User B’s submissions via API (`GET /api/submissions` scoped).
- [ ] Solving a problem once awards points once; repeat accepts do not duplicate (`score_events` idempotency).
- [ ] Weekly board aggregates `score_events` in Asia/Kolkata window.
- [ ] Tie-break: higher score first, then alphabetical display name.

## Feedback

- [ ] `POST /api/feedback` from Settings saves row for Supabase users.
- [ ] Local demo receives 403 with clear message.
- [ ] Students cannot read another user’s reports (RLS).

## Deployment verification

- [ ] Deploy preview/production (e.g. Vercel) with env vars set.
- [ ] Hit `/api/me` authenticated — `sessionMode: supabase`.
- [ ] Complete one lesson quiz + one problem submit; refresh — progress persists.
- [ ] Desktop + narrow viewport smoke: login, learn workspace, practice Run/Submit, rankings, settings feedback.

## Monitoring and ops

- **Monitoring:** Supabase dashboard (auth errors, DB CPU), Vercel/runtime logs for 5xx on `/api/submissions`, `/api/rankings`.
- **Backups:** Supabase project backup policy per institution policy.
- **Feedback review:** Query `beta_feedback` with service role (no student UI for others’ reports).

## Rollback

1. Redeploy previous known-good build artifact.
2. Do **not** roll back migrations that dropped columns without a forward plan; beta_feedback is additive-only.
3. If judge provider fails, disable invites temporarily rather than faking verdicts.

## Known limitations (document to students)

- **Per-instance rate limits** on submissions and feedback (not global across serverless instances). Scale-out requires Redis/KV or edge rate limiting.
- **Local demo mode** — progress in browser storage; not suitable for graded beta.
- **11 judged problems** — most lessons are sandbox/concept; see `docs/curriculum-problem-gaps.md`.
- **No Playwright E2E in CI** — full auth+judge paths need manual or staged environment tests.

## Blockers before invite (prioritized)

1. Supabase + service role + migrations applied in target project.
2. Judge0 credentials verified on production host.
3. Two-account isolation manual pass (submissions + rankings).
4. Onboarding completion works for a fresh signup (profile `onboarding_completed`).
5. Student-facing copy distinguishes demo vs persisted account (banner + login).
