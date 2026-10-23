-- SAIT DSA platform schema (extends DevPath profiles)

CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO departments (id, name) VALUES
  ('IT', 'Information Technology'),
  ('AI', 'Artificial Intelligence')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS department_id TEXT REFERENCES departments(id),
  ADD COLUMN IF NOT EXISTS academic_year TEXT,
  ADD COLUMN IF NOT EXISTS batch TEXT CHECK (batch IS NULL OR batch IN ('A', 'B')),
  ADD COLUMN IF NOT EXISTS student_id TEXT,
  ADD COLUMN IF NOT EXISTS profile_public BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS weekly_goal_problems INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS ranking_score INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unique_solved_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS admin_roles (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'content_reviewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS syllabus_modules (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  prerequisite_module_ids TEXT[] DEFAULT '{}',
  difficulty_min TEXT,
  difficulty_max TEXT,
  estimated_hours NUMERIC(4,1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES syllabus_modules(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  content_json JSONB NOT NULL DEFAULT '{}',
  estimated_minutes INTEGER NOT NULL DEFAULT 15,
  UNIQUE (module_id, slug)
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  mastery_passed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS problems (
  id TEXT PRIMARY KEY,
  current_revision INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  topics TEXT[] NOT NULL DEFAULT '{}',
  estimated_minutes INTEGER NOT NULL DEFAULT 30,
  review_status TEXT NOT NULL DEFAULT 'draft' CHECK (review_status IN ('draft', 'review', 'published', 'archived')),
  provenance JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS problem_revisions (
  problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  revision INTEGER NOT NULL,
  schema_version TEXT NOT NULL,
  statement TEXT NOT NULL,
  constraints_text TEXT,
  examples_json JSONB NOT NULL DEFAULT '[]',
  execution_json JSONB NOT NULL DEFAULT '{}',
  hints_json JSONB NOT NULL DEFAULT '[]',
  editorial TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (problem_id, revision)
);

CREATE TABLE IF NOT EXISTS problem_test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  revision INTEGER NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  input_text TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (problem_id, revision) REFERENCES problem_revisions(problem_id, revision) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reference_solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  revision INTEGER NOT NULL,
  language TEXT NOT NULL,
  source_code TEXT NOT NULL,
  FOREIGN KEY (problem_id, revision) REFERENCES problem_revisions(problem_id, revision) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_problem_progress (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unsolved' CHECK (status IN ('unsolved', 'attempted', 'solved')),
  best_submission_id UUID,
  attempts INTEGER NOT NULL DEFAULT 0,
  solved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, problem_id)
);

CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL REFERENCES problems(id),
  problem_revision INTEGER NOT NULL,
  language TEXT NOT NULL,
  source_code TEXT NOT NULL,
  verdict TEXT NOT NULL,
  passed_tests INTEGER NOT NULL DEFAULT 0,
  total_tests INTEGER NOT NULL DEFAULT 0,
  runtime_ms INTEGER,
  memory_kb INTEGER,
  judge_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookmarks (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, problem_id)
);

CREATE TABLE IF NOT EXISTS practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL CHECK (context_type IN ('problem', 'lesson')),
  context_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  active_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_goals (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  goal_date DATE NOT NULL,
  target_lessons INTEGER NOT NULL DEFAULT 1,
  target_problems INTEGER NOT NULL DEFAULT 2,
  completed_lessons INTEGER NOT NULL DEFAULT 0,
  completed_problems INTEGER NOT NULL DEFAULT 0,
  review_done BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (user_id, goal_date)
);

CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('daily', 'weekly', 'contest')),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  problem_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenge_participants (
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (challenge_id, user_id)
);

CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  criteria_json JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS user_achievements (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_profiles_department_batch ON profiles(department_id, batch);
CREATE INDEX IF NOT EXISTS idx_profiles_ranking ON profiles(ranking_score DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_problem_progress_status ON user_problem_progress(user_id, status);

ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_problem_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own lesson progress"
  ON lesson_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own problem progress"
  ON user_problem_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own submissions"
  ON submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own submissions"
  ON submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own bookmarks"
  ON bookmarks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own practice sessions"
  ON practice_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own daily goals"
  ON daily_goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Published problems readable"
  ON problems FOR SELECT
  USING (review_status = 'published');

CREATE POLICY "Published revisions readable"
  ON problem_revisions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM problems p
      WHERE p.id = problem_id AND p.review_status = 'published'
    )
  );

CREATE POLICY "Public test cases only"
  ON problem_test_cases FOR SELECT
  USING (
    is_public = TRUE
    AND EXISTS (
      SELECT 1 FROM problems p
      WHERE p.id = problem_id AND p.review_status = 'published'
    )
  );

-- reference_solutions: no SELECT policy for regular users (service role only)

CREATE POLICY "Public profiles for rankings"
  ON profiles FOR SELECT
  USING (profile_public = TRUE OR auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR profile_public = TRUE);
