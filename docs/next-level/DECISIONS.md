# Decisions (one line each, with the why)

- Treated current `/dashboard` as "Dashboard V14": no artifact named V14 exists anywhere; it is the newest, most deliberate design in the repo.
- Committed the large pre-existing uncommitted tree as a `baseline` commit on `next-level`: per-workstream commits must be revertable without losing the user's prior work.
- Kept the product identity as the DSA-focused app (SAIT DSA → DevPath brand surfaces): that's what the code actually is; reinventing the domain in 40 min would ship nothing.
- Introduced an event-sourced client **engine** (`dispatchEngine(event)`) as the single spine for XP, streaks, quests, achievements, review queue and companion memory: lets 8 agents build in parallel against one contract, and works fully in localStorage.
- Lead pre-wrote stub modules with fixed exports (`@/components/companion`, `@/components/motion`, `@/components/ui/toast`, `progress-ring`) so every agent compiles from minute one and owners swap in real implementations.
- Companion is "Kip", a living graph node (the app's DSA node motif) rather than an animal mascot: original, on-brand, and expressive with only SVG transforms.
- Agents may not run `npm run build`/`next dev` concurrently (shared `.next` on Windows); they typecheck with `tsc`; the lead runs the build at integration.
- First-wave subagents hit model usage limits before finishing; Composer 2.5 respin plus lead integration shipped the stack, with `/path` and `/review` added where Learning Core stalled.
- Wired `reduceEvent` to the rules modules Agent G left on disk so XP, streaks, quests, achievements, review queue, and celebrations actually run.
