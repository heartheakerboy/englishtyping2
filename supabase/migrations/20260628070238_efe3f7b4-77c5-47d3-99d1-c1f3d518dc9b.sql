
-- ===== Multiplayer rooms =====
CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL DEFAULT 'Race',
  visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','private')),
  ranked boolean NOT NULL DEFAULT false,
  language text NOT NULL DEFAULT 'english',
  text text NOT NULL,
  max_players int NOT NULL DEFAULT 6,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','countdown','racing','finished')),
  host_id uuid NOT NULL,
  starts_at timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX rooms_status_idx ON public.rooms(status, visibility, created_at DESC);
CREATE INDEX rooms_code_idx ON public.rooms(code);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT SELECT ON public.rooms TO anon;
GRANT ALL ON public.rooms TO service_role;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rooms public read" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "rooms host insert" ON public.rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "rooms host update" ON public.rooms FOR UPDATE TO authenticated USING (auth.uid() = host_id) WITH CHECK (auth.uid() = host_id);
CREATE POLICY "rooms host delete" ON public.rooms FOR DELETE TO authenticated USING (auth.uid() = host_id);

-- ===== Room members =====
CREATE TABLE public.room_members (
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  display_name text,
  avatar_url text,
  is_spectator boolean NOT NULL DEFAULT false,
  progress int NOT NULL DEFAULT 0,
  wpm numeric(6,2) NOT NULL DEFAULT 0,
  accuracy numeric(5,2) NOT NULL DEFAULT 0,
  finished_at timestamptz,
  finish_rank int,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);
CREATE INDEX room_members_user_idx ON public.room_members(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.room_members TO authenticated;
GRANT SELECT ON public.room_members TO anon;
GRANT ALL ON public.room_members TO service_role;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rm public read" ON public.room_members FOR SELECT USING (true);
CREATE POLICY "rm self join" ON public.room_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rm self update" ON public.room_members FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rm self leave" ON public.room_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ===== Tournaments =====
CREATE TABLE public.tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','live','finished')),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  prize_xp int NOT NULL DEFAULT 500,
  prize_coins int NOT NULL DEFAULT 200,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tournaments TO anon, authenticated;
GRANT ALL ON public.tournaments TO service_role;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tour read" ON public.tournaments FOR SELECT USING (true);

CREATE TABLE public.tournament_entries (
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  best_wpm numeric(6,2) NOT NULL DEFAULT 0,
  best_accuracy numeric(5,2) NOT NULL DEFAULT 0,
  score numeric(8,2) NOT NULL DEFAULT 0,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tournament_id, user_id)
);
GRANT SELECT, INSERT, UPDATE ON public.tournament_entries TO authenticated;
GRANT SELECT ON public.tournament_entries TO anon;
GRANT ALL ON public.tournament_entries TO service_role;
ALTER TABLE public.tournament_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "te read" ON public.tournament_entries FOR SELECT USING (true);
CREATE POLICY "te self join" ON public.tournament_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "te self update" ON public.tournament_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===== Missions =====
CREATE TABLE public.missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  scope text NOT NULL CHECK (scope IN ('daily','weekly','monthly')),
  title text NOT NULL,
  description text NOT NULL,
  metric text NOT NULL,
  threshold int NOT NULL,
  xp_reward int NOT NULL DEFAULT 50,
  coin_reward int NOT NULL DEFAULT 10,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.missions TO anon, authenticated;
GRANT ALL ON public.missions TO service_role;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "missions read" ON public.missions FOR SELECT USING (true);

CREATE TABLE public.user_missions (
  user_id uuid NOT NULL,
  mission_id uuid NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  period_key text NOT NULL,
  progress int NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  claimed boolean NOT NULL DEFAULT false,
  claimed_at timestamptz,
  PRIMARY KEY (user_id, mission_id, period_key)
);
CREATE INDEX um_user_period_idx ON public.user_missions(user_id, period_key);
GRANT SELECT, INSERT, UPDATE ON public.user_missions TO authenticated;
GRANT ALL ON public.user_missions TO service_role;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "um self read" ON public.user_missions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "um self insert" ON public.user_missions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "um self update" ON public.user_missions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===== Notifications =====
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notif_user_idx ON public.notifications(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif self read" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notif self insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notif self update" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notif self delete" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ===== Realtime =====
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER TABLE public.room_members REPLICA IDENTITY FULL;

-- ===== Seed missions =====
INSERT INTO public.missions (code, scope, title, description, metric, threshold, xp_reward, coin_reward) VALUES
  ('daily_3_tests', 'daily', 'Warm Up', 'Complete 3 typing tests today.', 'tests', 3, 50, 10),
  ('daily_wpm_50', 'daily', 'Cruise Control', 'Hit 50+ WPM on a test today.', 'wpm', 50, 75, 15),
  ('daily_accuracy_95', 'daily', 'Sharp Shooter', 'Reach 95%+ accuracy on a test today.', 'accuracy', 95, 75, 15),
  ('weekly_20_tests', 'weekly', 'On a Roll', 'Complete 20 tests this week.', 'tests', 20, 250, 75),
  ('weekly_wpm_70', 'weekly', 'Speed Demon', 'Hit 70+ WPM on a test this week.', 'wpm', 70, 300, 100),
  ('weekly_race_wins', 'weekly', 'Pole Position', 'Win 3 multiplayer races this week.', 'race_wins', 3, 350, 120),
  ('monthly_100_tests', 'monthly', 'Marathoner', 'Complete 100 tests this month.', 'tests', 100, 1000, 400),
  ('monthly_wpm_90', 'monthly', 'Triple Digits Incoming', 'Hit 90+ WPM this month.', 'wpm', 90, 1500, 600);
