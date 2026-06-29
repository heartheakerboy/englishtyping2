
-- ============= PROFILES extension =============
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text UNIQUE,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS xp integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS coins integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_date date,
  ADD COLUMN IF NOT EXISTS best_wpm numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tests_completed integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS profiles_username_lower_idx ON public.profiles (lower(username));
CREATE INDEX IF NOT EXISTS profiles_best_wpm_idx ON public.profiles (best_wpm DESC);
CREATE INDEX IF NOT EXISTS profiles_country_idx ON public.profiles (country);

-- ============= TYPING_RESULTS indexes for leaderboards =============
CREATE INDEX IF NOT EXISTS typing_results_user_created_idx ON public.typing_results (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS typing_results_wpm_idx ON public.typing_results (wpm DESC);
CREATE INDEX IF NOT EXISTS typing_results_created_idx ON public.typing_results (created_at DESC);

-- ============= ACHIEVEMENTS catalog =============
CREATE TABLE IF NOT EXISTS public.achievements (
  code text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'trophy',
  category text NOT NULL DEFAULT 'general',
  xp_reward integer NOT NULL DEFAULT 50,
  coins_reward integer NOT NULL DEFAULT 10,
  threshold integer NOT NULL DEFAULT 1,
  metric text NOT NULL DEFAULT 'tests_completed',
  sort_order integer NOT NULL DEFAULT 0
);

GRANT SELECT ON public.achievements TO anon, authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Achievements are public" ON public.achievements;
CREATE POLICY "Achievements are public" ON public.achievements FOR SELECT USING (true);

-- ============= USER ACHIEVEMENTS =============
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL REFERENCES public.achievements(code) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, code)
);
CREATE INDEX IF NOT EXISTS user_achievements_user_idx ON public.user_achievements (user_id);

GRANT SELECT ON public.user_achievements TO anon, authenticated;
GRANT INSERT, DELETE ON public.user_achievements TO authenticated;
GRANT ALL ON public.user_achievements TO service_role;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User achievements visible to all" ON public.user_achievements;
CREATE POLICY "User achievements visible to all" ON public.user_achievements FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service manages user achievements" ON public.user_achievements;
CREATE POLICY "Service manages user achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============= FOLLOWS =============
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);
CREATE INDEX IF NOT EXISTS follows_following_idx ON public.follows (following_id);

GRANT SELECT ON public.follows TO anon, authenticated;
GRANT INSERT, DELETE ON public.follows TO authenticated;
GRANT ALL ON public.follows TO service_role;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Follows are public" ON public.follows;
CREATE POLICY "Follows are public" ON public.follows FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can follow on their behalf" ON public.follows;
CREATE POLICY "Users can follow on their behalf" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
DROP POLICY IF EXISTS "Users can unfollow on their behalf" ON public.follows;
CREATE POLICY "Users can unfollow on their behalf" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- ============= CERTIFICATES =============
CREATE TABLE IF NOT EXISTS public.certificates (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  wpm numeric NOT NULL,
  accuracy numeric NOT NULL,
  cpm numeric NOT NULL,
  mode text NOT NULL,
  mode_value integer NOT NULL,
  language text NOT NULL DEFAULT 'english',
  issued_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS certificates_user_idx ON public.certificates (user_id, issued_at DESC);

GRANT SELECT ON public.certificates TO anon, authenticated;
GRANT INSERT, DELETE ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Certificates are public" ON public.certificates;
CREATE POLICY "Certificates are public" ON public.certificates FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users issue their own certificates" ON public.certificates;
CREATE POLICY "Users issue their own certificates" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their certificates" ON public.certificates;
CREATE POLICY "Users can delete their certificates" ON public.certificates FOR DELETE USING (auth.uid() = user_id);

-- ============= TRIGGER: after typing result inserted =============
CREATE OR REPLACE FUNCTION public.after_typing_result_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prof record;
  earned_xp integer;
  earned_coins integer;
  today date := (NEW.created_at AT TIME ZONE 'UTC')::date;
  new_streak integer;
  ach record;
BEGIN
  -- XP: floor(wpm) + accuracy bonus; Coins: 1 per 10 wpm
  earned_xp := GREATEST(5, floor(NEW.wpm)::int + CASE WHEN NEW.accuracy >= 95 THEN 20 ELSE 0 END);
  earned_coins := GREATEST(1, floor(NEW.wpm / 10)::int);

  SELECT * INTO prof FROM public.profiles WHERE id = NEW.user_id FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO public.profiles (id) VALUES (NEW.user_id)
    ON CONFLICT (id) DO NOTHING;
    SELECT * INTO prof FROM public.profiles WHERE id = NEW.user_id FOR UPDATE;
  END IF;

  -- Streak
  IF prof.last_active_date IS NULL THEN
    new_streak := 1;
  ELSIF prof.last_active_date = today THEN
    new_streak := prof.current_streak;
  ELSIF prof.last_active_date = today - 1 THEN
    new_streak := prof.current_streak + 1;
  ELSE
    new_streak := 1;
  END IF;

  UPDATE public.profiles
  SET
    xp = prof.xp + earned_xp,
    coins = prof.coins + earned_coins,
    tests_completed = prof.tests_completed + 1,
    best_wpm = GREATEST(prof.best_wpm, NEW.wpm),
    current_streak = new_streak,
    longest_streak = GREATEST(prof.longest_streak, new_streak),
    last_active_date = today,
    level = 1 + floor(sqrt((prof.xp + earned_xp) / 100.0))::int,
    updated_at = now()
  WHERE id = NEW.user_id;

  -- Achievements: unlock any whose threshold is met
  FOR ach IN
    SELECT a.code, a.metric, a.threshold
    FROM public.achievements a
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_achievements ua
      WHERE ua.user_id = NEW.user_id AND ua.code = a.code
    )
  LOOP
    IF ach.metric = 'tests_completed' AND prof.tests_completed + 1 >= ach.threshold THEN
      INSERT INTO public.user_achievements (user_id, code) VALUES (NEW.user_id, ach.code) ON CONFLICT DO NOTHING;
    ELSIF ach.metric = 'best_wpm' AND GREATEST(prof.best_wpm, NEW.wpm) >= ach.threshold THEN
      INSERT INTO public.user_achievements (user_id, code) VALUES (NEW.user_id, ach.code) ON CONFLICT DO NOTHING;
    ELSIF ach.metric = 'accuracy' AND NEW.accuracy >= ach.threshold THEN
      INSERT INTO public.user_achievements (user_id, code) VALUES (NEW.user_id, ach.code) ON CONFLICT DO NOTHING;
    ELSIF ach.metric = 'streak' AND new_streak >= ach.threshold THEN
      INSERT INTO public.user_achievements (user_id, code) VALUES (NEW.user_id, ach.code) ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS typing_results_after_insert ON public.typing_results;
CREATE TRIGGER typing_results_after_insert
AFTER INSERT ON public.typing_results
FOR EACH ROW EXECUTE FUNCTION public.after_typing_result_insert();

-- ============= Seed achievements catalog =============
INSERT INTO public.achievements (code, name, description, icon, category, xp_reward, coins_reward, threshold, metric, sort_order) VALUES
  ('first_test', 'First Keystroke', 'Complete your first typing test', 'sparkles', 'getting-started', 50, 10, 1, 'tests_completed', 1),
  ('ten_tests', 'Warming Up', 'Complete 10 tests', 'flame', 'getting-started', 100, 20, 10, 'tests_completed', 2),
  ('hundred_tests', 'Centurion', 'Complete 100 tests', 'medal', 'milestones', 500, 100, 100, 'tests_completed', 3),
  ('thousand_tests', 'Marathoner', 'Complete 1000 tests', 'crown', 'milestones', 2500, 500, 1000, 'tests_completed', 4),
  ('wpm_40', 'Steady Hands', 'Reach 40 WPM', 'zap', 'speed', 100, 20, 40, 'best_wpm', 10),
  ('wpm_60', 'Quick Fingers', 'Reach 60 WPM', 'zap', 'speed', 200, 40, 60, 'best_wpm', 11),
  ('wpm_80', 'Speed Demon', 'Reach 80 WPM', 'rocket', 'speed', 400, 80, 80, 'best_wpm', 12),
  ('wpm_100', 'Triple Digits', 'Reach 100 WPM', 'rocket', 'speed', 800, 160, 100, 'best_wpm', 13),
  ('wpm_120', 'Lightning', 'Reach 120 WPM', 'bolt', 'speed', 1500, 300, 120, 'best_wpm', 14),
  ('acc_95', 'Sharpshooter', 'Score 95% accuracy', 'target', 'accuracy', 150, 30, 95, 'accuracy', 20),
  ('acc_99', 'Pinpoint', 'Score 99% accuracy', 'target', 'accuracy', 300, 60, 99, 'accuracy', 21),
  ('streak_3', 'On a Roll', '3-day streak', 'flame', 'streaks', 100, 20, 3, 'streak', 30),
  ('streak_7', 'Week Warrior', '7-day streak', 'flame', 'streaks', 250, 50, 7, 'streak', 31),
  ('streak_30', 'Unstoppable', '30-day streak', 'flame', 'streaks', 1000, 200, 30, 'streak', 32)
ON CONFLICT (code) DO NOTHING;

-- ============= updated_at trigger on profiles =============
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
