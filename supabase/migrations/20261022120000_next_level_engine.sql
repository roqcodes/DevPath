-- Next Level: engine persistence (XP, streaks, review queue, companion memory, achievements).
-- Additive only. Every table is private per user via RLS on auth.uid().

CREATE TABLE IF NOT EXISTS engine_snapshots (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xp_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_cards (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  topic TEXT,
  ease REAL NOT NULL DEFAULT 2.5,
  interval_days INTEGER NOT NULL DEFAULT 0,
  due_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reps INTEGER NOT NULL DEFAULT 0,
  lapses INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, card_id)
);

CREATE TABLE IF NOT EXISTS companion_memory (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  goal TEXT,
  level TEXT,
  minutes_per_day INTEGER,
  weak_spots JSONB NOT NULL DEFAULT '{}'::jsonb,
  wins JSONB NOT NULL DEFAULT '[]'::jsonb,
  personality TEXT NOT NULL DEFAULT 'concise',
  nudges_muted BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- user_achievements already exists in 20251017100000_sait_dsa_schema.sql (legacy shape).

CREATE INDEX IF NOT EXISTS idx_xp_events_user_created ON xp_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_cards_user_due ON review_cards(user_id, due_at);

ALTER TABLE engine_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE companion_memory ENABLE ROW LEVEL SECURITY;

-- Own-row policies (select / insert / update / delete) for authenticated users.
-- DO blocks keep the migration re-runnable (CREATE POLICY has no IF NOT EXISTS).
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['engine_snapshots', 'xp_events', 'review_cards', 'companion_memory']
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = t AND policyname = 'Users select own ' || t) THEN
      EXECUTE format('CREATE POLICY %I ON %I FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id)', 'Users select own ' || t, t);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = t AND policyname = 'Users insert own ' || t) THEN
      EXECUTE format('CREATE POLICY %I ON %I FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id)', 'Users insert own ' || t, t);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = t AND policyname = 'Users update own ' || t) THEN
      EXECUTE format('CREATE POLICY %I ON %I FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id)', 'Users update own ' || t, t);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = t AND policyname = 'Users delete own ' || t) THEN
      EXECUTE format('CREATE POLICY %I ON %I FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id)', 'Users delete own ' || t, t);
    END IF;
  END LOOP;
END
$$;
