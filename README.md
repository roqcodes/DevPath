# SAIT DSA

Peer DSA learning and practice platform for SAIT (IT & AI) at CUSAT — evolved from the DevPath codebase.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — development server
- `npm run build` — production build + TypeScript check

## Documentation

See [docs/SAIT-DSA.md](docs/SAIT-DSA.md) for environment variables, question JSON schema, migrations, judging, and rankings.

## Main routes

| Route | Purpose |
|-------|---------|
| `/` | Landing |
| `/login` | Auth (Supabase or local demo) |
| `/onboarding` | Student setup |
| `/dashboard` | Daily overview |
| `/learn` | Syllabus |
| `/practice` | Question bank |
| `/challenges` | Goals & streaks |
| `/rankings` | Leaderboards |
| `/profile` | Student profile |
| `/settings` | Preferences |

Legacy DevPath routes redirect to the equivalents above.
