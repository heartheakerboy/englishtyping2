-- 1. Create external_resources table
CREATE TABLE IF NOT EXISTS public.external_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  category TEXT NOT NULL,
  country TEXT,
  language TEXT,
  is_dofollow BOOLEAN DEFAULT false,
  open_in_new_tab BOOLEAN DEFAULT true,
  is_sponsored BOOLEAN DEFAULT false,
  is_ugc BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.external_resources ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active resources
CREATE POLICY "Allow public read access to active resources"
  ON public.external_resources
  FOR SELECT
  USING (is_active = true);

-- Allow authenticated users to perform all operations
CREATE POLICY "Allow all access to authenticated users on external_resources"
  ON public.external_resources
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 2. Create anchor_texts table (Internal Linking suggestions/mapping)
CREATE TABLE IF NOT EXISTS public.anchor_texts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.anchor_texts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active anchor texts
CREATE POLICY "Allow public read access to active anchor texts"
  ON public.anchor_texts
  FOR SELECT
  USING (is_active = true);

-- Allow all access to authenticated users on anchor_texts
CREATE POLICY "Allow all access to authenticated users on anchor_texts"
  ON public.anchor_texts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Create error_404_logs table (404 Monitor)
CREATE TABLE IF NOT EXISTS public.error_404_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  referrer TEXT,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.error_404_logs ENABLE ROW LEVEL SECURITY;

-- Allow insert from public (so we can log 404s on the client side or SSR middleware)
CREATE POLICY "Allow public insert to error_404_logs"
  ON public.error_404_logs
  FOR INSERT
  WITH CHECK (true);

-- Allow all access to authenticated users on error_404_logs
CREATE POLICY "Allow all access to authenticated users on error_404_logs"
  ON public.error_404_logs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Create link_analytics table
CREATE TABLE IF NOT EXISTS public.link_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_type TEXT NOT NULL, -- 'internal' or 'external'
  source_path TEXT NOT NULL,
  target_url TEXT NOT NULL,
  anchor_text TEXT NOT NULL,
  clicks_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (link_type, source_path, target_url, anchor_text)
);

-- Enable RLS
ALTER TABLE public.link_analytics ENABLE ROW LEVEL SECURITY;

-- Allow insert/update from public (so we can record clicks)
CREATE POLICY "Allow public insert/update to link_analytics"
  ON public.link_analytics
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Create broken_links table
CREATE TABLE IF NOT EXISTS public.broken_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  status_code INTEGER,
  link_type TEXT NOT NULL, -- 'internal' or 'external'
  is_fixed BOOLEAN NOT NULL DEFAULT false,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.broken_links ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated
CREATE POLICY "Allow all access to authenticated users on broken_links"
  ON public.broken_links
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add some initial anchor texts to populate internal linking
INSERT INTO public.anchor_texts (keyword, target_url) VALUES
  ('typing test', '/typing-test'),
  ('memory sequence game', '/games/memory'),
  ('wpm calculator', '/calculators/wpm'),
  ('cpm calculator', '/calculators/cpm'),
  ('reaction time test', '/games/reaction'),
  ('clicks per second', '/games/cps'),
  ('spacebar speed test', '/games/spacebar'),
  ('keyboard trainer', '/games/trainer')
ON CONFLICT (keyword) DO NOTHING;
