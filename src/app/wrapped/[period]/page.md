# `/wrapped/[period]`

Spotify-style learning recap. `period` is a year (`2026`) or month (`2026-10`).

- **UI:** `WrappedExperience` — story slides, sample-data toggle, Kip note
- **Data:** Live stats from `useEngine()` via `deriveWrappedStats`; sample via `sampleWrappedStats`
- **Export:** Canvas `1080×1350` PNG (`src/components/wrapped/export-card.ts`)
- **Motion:** `celebrate()` on export

`/wrapped` redirects to `/wrapped/2026`.

Protected route prefix `/wrapped`.
