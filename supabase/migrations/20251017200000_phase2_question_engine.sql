-- Phase 2: question engine (extends problems schema)

ALTER TABLE problems DROP CONSTRAINT IF EXISTS problems_difficulty_check;

ALTER TABLE problems
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS difficulty_label TEXT NOT NULL DEFAULT 'easy',
  ADD COLUMN IF NOT EXISTS difficulty_score INTEGER NOT NULL DEFAULT 500,
  ADD COLUMN IF NOT EXISTS content_hash TEXT,
  ADD COLUMN IF NOT EXISTS io_format_json JSONB;

UPDATE problems
SET difficulty_label = difficulty,
    difficulty_score = CASE difficulty
      WHEN 'easy' THEN 300
      WHEN 'medium' THEN 600
      WHEN 'hard' THEN 850
      ELSE 500
    END
WHERE slug IS NULL;

ALTER TABLE problem_revisions
  ADD COLUMN IF NOT EXISTS io_format_json JSONB,
  ADD COLUMN IF NOT EXISTS complexity_json JSONB,
  ADD COLUMN IF NOT EXISTS content_hash TEXT;

CREATE TABLE IF NOT EXISTS question_import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  manifest_json JSONB,
  status TEXT NOT NULL DEFAULT 'preview'
    CHECK (status IN ('preview', 'published', 'failed', 'partial')),
  report_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_problems_id_hash ON problems(id, content_hash);
CREATE INDEX IF NOT EXISTS idx_problems_published_list
  ON problems(review_status, difficulty_label, updated_at DESC)
  WHERE review_status = 'published';

CREATE TABLE IF NOT EXISTS student_activity_daily (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  active_seconds INTEGER NOT NULL DEFAULT 0,
  problems_solved INTEGER NOT NULL DEFAULT 0,
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, activity_date)
);

ALTER TABLE student_activity_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own activity"
  ON student_activity_daily FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins read import batches"
  ON question_import_batches FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admin_roles ar WHERE ar.user_id = auth.uid())
  );

-- Service role bypasses RLS for import writes
