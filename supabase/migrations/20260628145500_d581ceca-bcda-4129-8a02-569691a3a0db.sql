
-- Game scores table for arcade leaderboards
CREATE TABLE public.game_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  game_slug text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  wpm numeric(6,2) NOT NULL DEFAULT 0,
  accuracy numeric(5,2) NOT NULL DEFAULT 0,
  duration_seconds integer NOT NULL DEFAULT 0,
  level_reached integer NOT NULL DEFAULT 1,
  combo_max integer NOT NULL DEFAULT 0,
  words_typed integer NOT NULL DEFAULT 0,
  difficulty text NOT NULL DEFAULT 'medium',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.game_scores TO authenticated;
GRANT SELECT ON public.game_scores TO anon;
GRANT ALL ON public.game_scores TO service_role;

ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read game scores"
  ON public.game_scores FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users insert own scores"
  ON public.game_scores FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX game_scores_game_score_idx ON public.game_scores (game_slug, score DESC, created_at DESC);
CREATE INDEX game_scores_user_idx ON public.game_scores (user_id, created_at DESC);
CREATE INDEX game_scores_created_idx ON public.game_scores (created_at DESC);

-- Function: submit_game_score
-- Inserts a score row and awards xp/coins atomically using the game_configs reward config.
CREATE OR REPLACE FUNCTION public.submit_game_score(
  _game_slug text,
  _score integer,
  _wpm numeric,
  _accuracy numeric,
  _duration_seconds integer,
  _level_reached integer DEFAULT 1,
  _combo_max integer DEFAULT 0,
  _words_typed integer DEFAULT 0,
  _difficulty text DEFAULT 'medium',
  _metadata jsonb DEFAULT '{}'::jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _cfg public.game_configs%ROWTYPE;
  _xp integer := 0;
  _coins integer := 0;
  _row_id uuid;
  _rank integer;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO _cfg FROM public.game_configs WHERE slug = _game_slug;
  -- Reward formula: base + score-scaled bonus + accuracy bonus
  _xp := COALESCE(_cfg.xp_reward, 0) + GREATEST(0, FLOOR(_score / 100.0)::int)
         + CASE WHEN _accuracy >= 95 THEN 25 WHEN _accuracy >= 85 THEN 10 ELSE 0 END;
  _coins := COALESCE(_cfg.coin_reward, 0) + GREATEST(0, FLOOR(_score / 250.0)::int);

  INSERT INTO public.game_scores (
    user_id, game_slug, score, wpm, accuracy, duration_seconds,
    level_reached, combo_max, words_typed, difficulty, metadata
  ) VALUES (
    _uid, _game_slug, _score, _wpm, _accuracy, _duration_seconds,
    _level_reached, _combo_max, _words_typed, _difficulty, _metadata
  ) RETURNING id INTO _row_id;

  -- Award XP + coins; bump level using existing sqrt curve
  UPDATE public.profiles p
  SET xp = p.xp + _xp,
      coins = p.coins + _coins,
      level = 1 + floor(sqrt((p.xp + _xp) / 100.0))::int,
      updated_at = now()
  WHERE p.id = _uid;

  -- Compute all-time rank for this score
  SELECT COUNT(*) + 1 INTO _rank
  FROM public.game_scores
  WHERE game_slug = _game_slug AND score > _score;

  RETURN jsonb_build_object(
    'id', _row_id,
    'xp_awarded', _xp,
    'coins_awarded', _coins,
    'rank', _rank
  );
END $$;

GRANT EXECUTE ON FUNCTION public.submit_game_score(text,integer,numeric,numeric,integer,integer,integer,integer,text,jsonb) TO authenticated;

-- Seed Phase 1 games
INSERT INTO public.game_configs (slug, title, description, difficulty, xp_reward, coin_reward, is_active, is_featured, sort_order, rules, scoring)
VALUES
  ('falling-words', 'Falling Words', 'Type words before they hit the ground. Speed ramps up every wave.', 'medium', 30, 5, true, true, 10,
   '{"lives":3,"spawnRateMs":1800,"fallSpeed":40,"speedRamp":0.08}'::jsonb,
   '{"perWord":10,"perChar":1,"comboBonus":2}'::jsonb),
  ('zombie-typing', 'Zombie Typing', 'Survive the horde — every correctly typed word vaporizes a zombie before it reaches you.', 'hard', 45, 8, true, true, 20,
   '{"hp":100,"waveDurationS":30,"bossEveryWave":5,"spawnRateMs":1600}'::jsonb,
   '{"perKill":15,"bossKill":150,"comboBonus":3}'::jsonb),
  ('balloon-burst', 'Balloon Burst', 'Pop floating balloons by typing their word before they drift off screen.', 'easy', 25, 4, true, true, 30,
   '{"lives":5,"spawnRateMs":1500,"riseSpeed":35,"speedRamp":0.06}'::jsonb,
   '{"perPop":8,"comboBonus":2,"streakBonus":50}'::jsonb)
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    difficulty = EXCLUDED.difficulty,
    xp_reward = EXCLUDED.xp_reward,
    coin_reward = EXCLUDED.coin_reward,
    is_active = EXCLUDED.is_active,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    rules = EXCLUDED.rules,
    scoring = EXCLUDED.scoring;

-- Public read access to game_configs (currently editor-only; players need to see active games)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read active game configs' AND tablename = 'game_configs') THEN
    CREATE POLICY "Anyone can read active game configs"
      ON public.game_configs FOR SELECT
      USING (is_active = true OR is_admin(auth.uid()) OR has_role(auth.uid(), 'editor'::app_role));
  END IF;
END $$;

GRANT SELECT ON public.game_configs TO anon;
