
-- typing_texts additions
ALTER TABLE public.typing_texts
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS publish_at timestamptz,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS collection text,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- typing_text_versions
CREATE TABLE IF NOT EXISTS public.typing_text_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text_id uuid NOT NULL REFERENCES public.typing_texts(id) ON DELETE CASCADE,
  snapshot jsonb NOT NULL,
  edited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.typing_text_versions TO authenticated;
GRANT ALL ON public.typing_text_versions TO service_role;
ALTER TABLE public.typing_text_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "editors read versions" ON public.typing_text_versions FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "editors insert versions" ON public.typing_text_versions FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'editor'));
CREATE INDEX IF NOT EXISTS idx_text_versions_text ON public.typing_text_versions(text_id, created_at DESC);

-- game_configs
CREATE TABLE IF NOT EXISTS public.game_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  timer_seconds integer,
  scoring jsonb NOT NULL DEFAULT '{}'::jsonb,
  levels jsonb NOT NULL DEFAULT '[]'::jsonb,
  xp_reward integer NOT NULL DEFAULT 0,
  coin_reward integer NOT NULL DEFAULT 0,
  difficulty text NOT NULL DEFAULT 'medium',
  icon_url text,
  banner_url text,
  audio_url text,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.game_configs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_configs TO authenticated;
GRANT ALL ON public.game_configs TO service_role;
ALTER TABLE public.game_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active games" ON public.game_configs FOR SELECT USING (is_active = true);
CREATE POLICY "editors manage games" ON public.game_configs FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'editor'))
  WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'editor'));
CREATE TRIGGER trg_game_configs_updated BEFORE UPDATE ON public.game_configs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- badges
CREATE TABLE IF NOT EXISTS public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  icon_url text,
  color text,
  rarity text NOT NULL DEFAULT 'common',
  xp_reward integer NOT NULL DEFAULT 0,
  coin_reward integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.badges TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.badges TO authenticated;
GRANT ALL ON public.badges TO service_role;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read badges" ON public.badges FOR SELECT USING (is_active = true);
CREATE POLICY "admins manage badges" ON public.badges FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- certificate_templates
CREATE TABLE IF NOT EXISTS public.certificate_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  template jsonb NOT NULL DEFAULT '{}'::jsonb,
  preview_url text,
  is_active boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.certificate_templates TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.certificate_templates TO authenticated;
GRANT ALL ON public.certificate_templates TO service_role;
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read templates" ON public.certificate_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage templates" ON public.certificate_templates FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER trg_cert_tpl_updated BEFORE UPDATE ON public.certificate_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- media_assets
CREATE TABLE IF NOT EXISTS public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  bucket text NOT NULL DEFAULT 'media',
  path text NOT NULL,
  url text NOT NULL,
  filename text NOT NULL,
  mime_type text,
  size_bytes bigint,
  width integer,
  height integer,
  alt text,
  tags text[] NOT NULL DEFAULT '{}',
  folder text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
GRANT ALL ON public.media_assets TO service_role;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "editors read media" ON public.media_assets FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "editors write media" ON public.media_assets FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'editor'))
  WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'editor'));

-- ad_placements
CREATE TABLE IF NOT EXISTS public.ad_placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_key text NOT NULL UNIQUE,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'custom',
  adsense_client text,
  adsense_slot text,
  custom_html text,
  page_match text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ad_placements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.ad_placements TO authenticated;
GRANT ALL ON public.ad_placements TO service_role;
ALTER TABLE public.ad_placements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active ads" ON public.ad_placements FOR SELECT USING (is_active = true);
CREATE POLICY "admins manage ads" ON public.ad_placements FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER trg_ad_placements_updated BEFORE UPDATE ON public.ad_placements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- redirects
CREATE TABLE IF NOT EXISTS public.redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL UNIQUE,
  destination text NOT NULL,
  status_code integer NOT NULL DEFAULT 301,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.redirects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.redirects TO authenticated;
GRANT ALL ON public.redirects TO service_role;
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read redirects" ON public.redirects FOR SELECT USING (is_active = true);
CREATE POLICY "admins manage redirects" ON public.redirects FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  href text,
  variant text NOT NULL DEFAULT 'info',
  dismissible boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active announcements" ON public.announcements FOR SELECT
  USING (is_active = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at > now()));
CREATE POLICY "admins manage announcements" ON public.announcements FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- scheduled_publishes
CREATE TABLE IF NOT EXISTS public.scheduled_publishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  publish_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduled_publishes TO authenticated;
GRANT ALL ON public.scheduled_publishes TO service_role;
ALTER TABLE public.scheduled_publishes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "editors manage schedule" ON public.scheduled_publishes FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'editor'))
  WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'editor'));

-- seo_overrides
CREATE TABLE IF NOT EXISTS public.seo_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL UNIQUE,
  title text,
  description text,
  og_title text,
  og_description text,
  og_image text,
  twitter_card text,
  schema_json jsonb,
  noindex boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.seo_overrides TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.seo_overrides TO authenticated;
GRANT ALL ON public.seo_overrides TO service_role;
ALTER TABLE public.seo_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read seo" ON public.seo_overrides FOR SELECT USING (is_active = true);
CREATE POLICY "editors manage seo" ON public.seo_overrides FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'editor'))
  WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'editor'));
CREATE TRIGGER trg_seo_updated BEFORE UPDATE ON public.seo_overrides
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- page_views (analytics)
CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  path text NOT NULL,
  referrer text,
  device text,
  browser text,
  os text,
  country text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.page_views TO anon, authenticated;
GRANT SELECT ON public.page_views TO authenticated;
GRANT ALL ON public.page_views TO service_role;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone insert pv" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read pv" ON public.page_views FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));
CREATE INDEX IF NOT EXISTS idx_page_views_created ON public.page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON public.page_views(path, created_at DESC);

-- profile moderation fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS banned_at timestamptz,
  ADD COLUMN IF NOT EXISTS ban_reason text,
  ADD COLUMN IF NOT EXISTS suspended_until timestamptz,
  ADD COLUMN IF NOT EXISTS admin_notes text;
