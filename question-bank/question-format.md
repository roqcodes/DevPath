# SAIT DSA question package format (v2)

## Overview

Each problem is one JSON file validated against `question.schema.json` (JSON Schema Draft 2020-12).

- **Execution mode:** `stdin_stdout` only in v2. Function-signature problems are not mixed in this schema.
- **Languages:** `python`, `cpp`, `java` (mapped to Judge0 language IDs server-side).
- **Content safety:** Statements are plain text / light Markdown. HTML and executable scripts are rejected at import.

## Required fields

See `question-template.json` for a full skeleton.

| Field | Purpose |
|-------|---------|
| `schema_version` | Semver of this format (currently `2.0.0`) |
| `id` / `slug` | Stable identifiers (`a-z`, `0-9`, hyphen) |
| `difficulty.label` | One of: beginner, easy, intermediate, advanced, expert |
| `difficulty.score` | Numeric weight (1–1000) for sorting and rankings config |
| `status` | draft → review → published → archived |
| `revision` | Increments when published content changes |
| `test_cases` | At least 2 cases; mark `is_public` for samples shown to students |
| `reference_solutions` | Server-only; verified on import when judge is configured |

## Folder layout (optional)

```
question-bank/
  manifest.json
  arrays/beginner/array-sum.json
  strings/easy/reverse-string.json
```

Folder paths are not required if `topics` and `difficulty` are set in JSON.

## Import workflow

1. `POST /api/admin/import` — upload JSON array or ZIP (max size enforced).
2. Review `report` (valid, invalid, duplicate, changed, idempotent).
3. Optional reference verification runs against Judge0.
4. `POST /api/admin/import/publish` — publish approved IDs (admin auth required).

## Idempotency

- Same `content_hash` as an existing published revision → **idempotent** (no duplicate row).
- Same `id` with different hash → **changed** (requires explicit publish approval).
- Missing files in a ZIP → **never deletes** existing problems.

## Environment

- `SUPABASE_SERVICE_ROLE_KEY` — server-only DB writes for import and hidden tests.
- `JUDGE0_API_KEY` or `JUDGE0_RAPIDAPI_KEY` — isolated execution.
- `SAIT_ADMIN_IMPORT_KEY` — legacy bearer for scripted imports (prefer Supabase admin role).
