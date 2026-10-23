# Phase 6 audit — playground, judge, submissions

## Editor

- **Component:** `SimpleCodeEditor` (textarea + line-number gutter). No Monaco/CodeMirror — keeps bundle small; no syntax highlighting or autocomplete.
- **Languages:** `python`, `java`, `cpp` (lesson playground); problem pages use each problem’s `execution.languages`.
- **Drafts:** `localStorage` key `sait_lesson_editor_drafts` — lessons use `{lessonId}::{lang}`; practice uses `problem:{id}::{lang}`.

## Run vs Submit

| | Run (`mode: "run"`) | Submit (`mode: "submit"`) |
|--|---------------------|---------------------------|
| Tests | Public (`is_public`) only | Full suite |
| DB row | No | Yes (Supabase auth users) |
| Progress / scoring | No | Yes on full accept |
| `accepted` in API | Always `false` even if public tests pass | `true` only when all tests pass |
| `submissionId` | Empty string | UUID |

**API:** `POST /api/submissions` body `{ problemId, language, sourceCode, mode? }` → `SubmissionResult` including `tests[]` (hidden I/O redacted on submit).

**History:** `GET /api/submissions?problemId=&limit=` — RLS-scoped SELECT; local `local-*` users get empty list (client session fallback).

## Judge

- **Orchestrator:** `runAllTests` sequential stop on first failure; `Judge0Provider` when keys set, else `judge_unavailable`.
- **Limits:** Per-problem `time_limit_ms`, `memory_limit_kb`; source max 100KB; 20 submissions/min/user in-memory rate limit.
- **Execution:** Remote Judge0 only — not in the Next.js process.

## Security notes

- Hidden test inputs/outputs are not returned on failed submit.
- Problem-not-found returns `internal_error`, not `wrong_answer`.
- Admin client inserts submissions (service role); reads use user session + RLS.

## Known limitations

- In-memory rate limit is per server instance, not global.
- Local demo users do not persist submission history server-side.
- Curriculum lesson prose examples are mostly static; see `executable-examples.ts` for the small auto-run registry.
