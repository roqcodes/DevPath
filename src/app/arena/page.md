# `/arena`

Boss-fight mock interview: three DSA bosses, three `interview_round` engine events.

- **UI:** `ArenaExperience` (`src/components/arena/arena-experience.tsx`)
- **AI:** `POST /api/ai/generate` with `interview_round` / `interview_grade`; falls back to `src/components/arena/local-fallback.ts`
- **Progression:** `dispatchEngine({ type: "interview_round", roundId, score, maxScore })` after each graded answer
- **Motion:** `celebrate()` on strong scores and arena clear
- **Companion:** Kip `CompanionNote` on surface `arena`

Protected route (see `src/lib/auth/protected-routes.ts`).
