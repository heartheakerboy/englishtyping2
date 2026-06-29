
-- Challenge Builder & Test Builder schema

-- Extend role enum (premium, teacher, hr) if missing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'premium' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'premium';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'teacher' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'teacher';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'hr' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'hr';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'org_admin' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'org_admin';
  END IF;
END $$;

-- custom_tests
CREATE TABLE IF NOT EXISTS public.custom_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  banner_url TEXT,
  category TEXT DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  content TEXT NOT NULL DEFAULT '',
  content_source TEXT DEFAULT 'paste',
  language TEXT DEFAULT 'english',
  duration_seconds INT NOT NULL DEFAULT 60,
  difficulty TEXT DEFAULT 'medium',
  allow_numbers BOOLEAN DEFAULT true,
  allow_symbols BOOLEAN DEFAULT true,
  allow_punctuation BOOLEAN DEFAULT true,
  allow_capitals BOOLEAN DEFAULT true,
  allow_quotes BOOLEAN DEFAULT true,
  allow_linebreaks BOOLEAN DEFAULT true,
  backspace_mode TEXT DEFAULT 'allowed',
  backspace_limit INT DEFAULT 0,
  spell_check BOOLEAN DEFAULT false,
  access_type TEXT DEFAULT 'public',
  password_hash TEXT,
  email_whitelist TEXT[] DEFAULT '{}',
  org_id UUID,
  attempts_limit INT,
  start_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  timezone TEXT DEFAULT 'UTC',
  auto_close BOOLEAN DEFAULT false,
  leaderboard_enabled BOOLEAN DEFAULT true,
  leaderboard_visibility TEXT DEFAULT 'public',
  leaderboard_size INT DEFAULT 100,
  certificate_enabled BOOLEAN DEFAULT false,
  certificate_template_id UUID,
  cert_min_wpm INT DEFAULT 30,
  cert_min_accuracy NUMERIC DEFAULT 90,
  result_visible_stats JSONB DEFAULT '{"wpm":true,"accuracy":true,"mistakes":true,"heatmap":true,"graphs":true,"consistency":true,"ranking":true,"certificate":true,"pdf":true}'::jsonb,
  anticheat_flags JSONB DEFAULT '{"tab_switch":true,"copy_paste":true,"auto_typer":true,"macros":true,"bots":true,"multi_window":true,"suspicious_speed":true}'::jsonb,
  monetization_enabled BOOLEAN DEFAULT false,
  price_cents INT DEFAULT 0,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'draft',
  featured BOOLEAN DEFAULT false,
  pinned BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  views_count INT DEFAULT 0,
  attempts_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_tests TO authenticated;
GRANT SELECT ON public.custom_tests TO anon;
GRANT ALL ON public.custom_tests TO service_role;
ALTER TABLE public.custom_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public can read published public tests" ON public.custom_tests
  FOR SELECT TO anon, authenticated
  USING (status = 'published' AND access_type IN ('public','password'));
CREATE POLICY "creators can read own tests" ON public.custom_tests
  FOR SELECT TO authenticated USING (creator_id = auth.uid());
CREATE POLICY "admins can read all tests" ON public.custom_tests
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "creators can insert" ON public.custom_tests
  FOR INSERT TO authenticated WITH CHECK (creator_id = auth.uid());
CREATE POLICY "creators can update own" ON public.custom_tests
  FOR UPDATE TO authenticated USING (creator_id = auth.uid()) WITH CHECK (creator_id = auth.uid());
CREATE POLICY "admins can update all" ON public.custom_tests
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "creators can delete own" ON public.custom_tests
  FOR DELETE TO authenticated USING (creator_id = auth.uid());
CREATE POLICY "admins can delete all" ON public.custom_tests
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE INDEX IF NOT EXISTS idx_custom_tests_creator ON public.custom_tests(creator_id);
CREATE INDEX IF NOT EXISTS idx_custom_tests_status ON public.custom_tests(status);
CREATE INDEX IF NOT EXISTS idx_custom_tests_slug ON public.custom_tests(slug);

-- attempts
CREATE TABLE IF NOT EXISTS public.custom_test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.custom_tests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  wpm NUMERIC DEFAULT 0,
  raw_wpm NUMERIC DEFAULT 0,
  accuracy NUMERIC DEFAULT 0,
  consistency NUMERIC DEFAULT 0,
  mistakes INT DEFAULT 0,
  duration_actual INT DEFAULT 0,
  flagged BOOLEAN DEFAULT false,
  flag_reasons TEXT[] DEFAULT '{}',
  device TEXT,
  browser TEXT,
  country TEXT,
  ip_hash TEXT,
  completed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_test_attempts TO authenticated;
GRANT INSERT ON public.custom_test_attempts TO anon;
GRANT SELECT ON public.custom_test_attempts TO anon;
GRANT ALL ON public.custom_test_attempts TO service_role;
ALTER TABLE public.custom_test_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can insert attempts" ON public.custom_test_attempts
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "users see own attempts" ON public.custom_test_attempts
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "creator sees test attempts" ON public.custom_test_attempts
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.custom_tests t WHERE t.id = test_id AND t.creator_id = auth.uid())
  );
CREATE POLICY "admin sees all attempts" ON public.custom_test_attempts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "public can read leaderboard attempts" ON public.custom_test_attempts
  FOR SELECT TO anon, authenticated USING (
    completed = true AND NOT flagged AND EXISTS (
      SELECT 1 FROM public.custom_tests t
      WHERE t.id = test_id AND t.status = 'published' AND t.leaderboard_enabled AND t.leaderboard_visibility = 'public'
    )
  );

CREATE INDEX IF NOT EXISTS idx_cta_test ON public.custom_test_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_cta_user ON public.custom_test_attempts(user_id);

-- passage library
CREATE TABLE IF NOT EXISTS public.passage_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  language TEXT DEFAULT 'english',
  difficulty TEXT DEFAULT 'medium',
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.passage_library TO authenticated;
GRANT SELECT ON public.passage_library TO anon;
GRANT ALL ON public.passage_library TO service_role;
ALTER TABLE public.passage_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read public passages" ON public.passage_library
  FOR SELECT TO anon, authenticated USING (is_public = true);
CREATE POLICY "creator read own" ON public.passage_library
  FOR SELECT TO authenticated USING (creator_id = auth.uid());
CREATE POLICY "creator insert" ON public.passage_library
  FOR INSERT TO authenticated WITH CHECK (creator_id = auth.uid());
CREATE POLICY "creator update own" ON public.passage_library
  FOR UPDATE TO authenticated USING (creator_id = auth.uid());
CREATE POLICY "creator delete own" ON public.passage_library
  FOR DELETE TO authenticated USING (creator_id = auth.uid());

-- updated_at trigger
CREATE TRIGGER set_custom_tests_updated_at BEFORE UPDATE ON public.custom_tests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- helper to bump views/attempts atomically
CREATE OR REPLACE FUNCTION public.increment_custom_test_views(_test_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.custom_tests SET views_count = views_count + 1 WHERE id = _test_id;
$$;
GRANT EXECUTE ON FUNCTION public.increment_custom_test_views(UUID) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.increment_custom_test_attempts(_test_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.custom_tests SET attempts_count = attempts_count + 1 WHERE id = _test_id;
$$;
GRANT EXECUTE ON FUNCTION public.increment_custom_test_attempts(UUID) TO anon, authenticated;
