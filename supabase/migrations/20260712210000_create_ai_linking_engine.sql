-- Create internal_link_suggestions table
CREATE TABLE IF NOT EXISTS public.internal_link_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path TEXT NOT NULL,
  target_path TEXT NOT NULL,
  keyword TEXT NOT NULL,
  anchor_type TEXT NOT NULL DEFAULT 'exact', -- 'exact', 'partial', 'branded', 'generic', 'long-tail'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  score NUMERIC NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_path, target_path, keyword)
);

-- Enable RLS on suggestions
ALTER TABLE public.internal_link_suggestions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to approved suggestions
CREATE POLICY "Allow public read access to approved suggestions"
  ON public.internal_link_suggestions
  FOR SELECT
  USING (status = 'approved');

-- Allow all access to authenticated users on internal_link_suggestions
CREATE POLICY "Allow all access to authenticated users on internal_link_suggestions"
  ON public.internal_link_suggestions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create seo_linking_settings table
CREATE TABLE IF NOT EXISTS public.seo_linking_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on settings
ALTER TABLE public.seo_linking_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to settings
CREATE POLICY "Allow public read access to settings"
  ON public.seo_linking_settings
  FOR SELECT
  USING (true);

-- Allow all access to authenticated users on seo_linking_settings
CREATE POLICY "Allow all access to authenticated users on seo_linking_settings"
  ON public.seo_linking_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed initial settings
INSERT INTO public.seo_linking_settings (key, value) VALUES
  ('auto_linking_enabled', 'true'::jsonb),
  ('max_links_per_page', '5'::jsonb),
  ('whitelist_paths', '["/typing-test", "/games", "/blog", "/calculators"]'::jsonb),
  ('blacklist_paths', '["/auth", "/profile", "/admin", "/legal/privacy", "/legal/terms"]'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
