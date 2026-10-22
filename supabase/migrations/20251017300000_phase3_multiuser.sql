-- Phase 3: multi-user identity, activity, scoring, rankings

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS admission_cohort TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_status TEXT NOT NULL DEFAULT 'pending_onboarding'
    CHECK (onboarding_status IN ('pending_onboarding', 'pending_verification', 'active', 'restricted', 'suspended')),
  ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active'
    CHECK (account_status IN ('active', 'restricted', 'suspended')),
  ADD COLUMN IF NOT EXISTS membership_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK (membership_status IN ('unverified', 'pending', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'python',
  ADD COLUMN IF NOT EXISTS dsa_experience TEXT,
  ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_qualifying_activity_date DATE;

UPDATE profiles
SET onboarding_status = CASE WHEN onboarding_completed THEN 'active' ELSE 'pending_onboarding' END
WHERE onboarding_status = 'pending_onboarding';

CREATE TABLE IF NOT EXISTS platform_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO platform_config (key, value) VALUES
  ('ranking_timezone', '"Asia/Kolkata"'),
  ('allowed_email_domains', '[]'),
  ('require_membership_verification', 'false')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS score_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  period_date DATE NOT NULL DEFAULT (CURRENT_DATE),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_score_events_user_period ON score_events(user_id, period_date DESC);
CREATE INDEX IF NOT EXISTS idx_score_events_type ON score_events(event_type, created_at DESC);

CREATE TABLE IF NOT EXISTS lesson_completion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  mastery_passed BOOLEAN NOT NULL DEFAULT FALSE,
  idempotency_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES profiles(id),
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS membership_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_ranking_eligible
  ON profiles(department_id, batch, admission_cohort)
  WHERE account_status = 'active' AND profile_public = TRUE;

ALTER TABLE score_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_completion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own score events"
  ON score_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users read own lesson events"
  ON lesson_completion_events FOR SELECT
  USING (auth.uid() = user_id);

-- Inserts to score_events only via service role (no user INSERT policy)

CREATE OR REPLACE FUNCTION public.protect_profile_privileged_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() = OLD.id THEN
    IF NEW.account_status IS DISTINCT FROM OLD.account_status
      OR NEW.membership_status IS DISTINCT FROM OLD.membership_status
      OR NEW.onboarding_status IS DISTINCT FROM OLD.onboarding_status
      OR NEW.ranking_score IS DISTINCT FROM OLD.ranking_score
      OR NEW.unique_solved_count IS DISTINCT FROM OLD.unique_solved_count
    THEN
      NEW.account_status := OLD.account_status;
      NEW.membership_status := OLD.membership_status;
      NEW.onboarding_status := OLD.onboarding_status;
      NEW.ranking_score := OLD.ranking_score;
      NEW.unique_solved_count := OLD.unique_solved_count;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_privileged ON profiles;
CREATE TRIGGER profiles_protect_privileged
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_privileged_fields();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, onboarding_status, account_status, membership_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'pending_onboarding',
    'active',
    'unverified'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
