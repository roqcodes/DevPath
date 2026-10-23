-- Phase 7: beta feedback (private per user; staff reads via service role)

CREATE TABLE IF NOT EXISTS beta_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('bug', 'content', 'judge', 'usability', 'other')),
  message TEXT NOT NULL CHECK (char_length(message) >= 10 AND char_length(message) <= 2000),
  context_path TEXT,
  lesson_id TEXT,
  problem_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beta_feedback_user_created ON beta_feedback(user_id, created_at DESC);

ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own beta feedback"
  ON beta_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own beta feedback"
  ON beta_feedback FOR SELECT
  USING (auth.uid() = user_id);
