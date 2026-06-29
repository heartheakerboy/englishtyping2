
-- Footer sections (each is a column in the footer)
CREATE TABLE public.footer_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  title text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.footer_sections TO anon, authenticated;
GRANT ALL ON public.footer_sections TO service_role;
ALTER TABLE public.footer_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "footer_sections public read" ON public.footer_sections FOR SELECT USING (true);
CREATE POLICY "footer_sections admin write" ON public.footer_sections FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER trg_footer_sections_updated BEFORE UPDATE ON public.footer_sections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Footer links inside a section
CREATE TABLE public.footer_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.footer_sections(id) ON DELETE CASCADE,
  label text NOT NULL,
  href text NOT NULL,
  icon text,
  open_in_new_tab boolean NOT NULL DEFAULT false,
  rel text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.footer_links TO anon, authenticated;
GRANT ALL ON public.footer_links TO service_role;
ALTER TABLE public.footer_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "footer_links public read" ON public.footer_links FOR SELECT USING (true);
CREATE POLICY "footer_links admin write" ON public.footer_links FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER trg_footer_links_updated BEFORE UPDATE ON public.footer_links FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_footer_links_section ON public.footer_links(section_id, sort_order);

-- Legal pages CMS
CREATE TABLE public.legal_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  format text NOT NULL DEFAULT 'markdown',
  status text NOT NULL DEFAULT 'draft',
  publish_at timestamptz,
  meta_title text,
  meta_description text,
  og_image text,
  schema_jsonld jsonb,
  canonical_url text,
  robots text DEFAULT 'index,follow',
  breadcrumbs jsonb,
  show_in_footer boolean NOT NULL DEFAULT true,
  show_in_nav boolean NOT NULL DEFAULT false,
  attachments jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.legal_pages TO anon, authenticated;
GRANT ALL ON public.legal_pages TO service_role;
ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "legal_pages public published" ON public.legal_pages FOR SELECT USING (status = 'published' AND (publish_at IS NULL OR publish_at <= now()));
CREATE POLICY "legal_pages admin all" ON public.legal_pages FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER trg_legal_pages_updated BEFORE UPDATE ON public.legal_pages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Version history
CREATE TABLE public.legal_page_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES public.legal_pages(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  snapshot jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.legal_page_versions TO authenticated;
GRANT ALL ON public.legal_page_versions TO service_role;
ALTER TABLE public.legal_page_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "legal_page_versions admin all" ON public.legal_page_versions FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Footer site settings (logo, name, description, bottom text, version)
-- These slot into existing site_settings table (key/value json)

-- Seed default sections + links
INSERT INTO public.footer_sections (key, title, sort_order) VALUES
  ('quick_links', 'Quick Links', 1),
  ('legal', 'Legal', 2),
  ('resources', 'Resources', 3),
  ('social', 'Follow Us', 4);

INSERT INTO public.footer_links (section_id, label, href, sort_order)
SELECT id, x.label, x.href, x.so FROM public.footer_sections s
JOIN (VALUES
  ('quick_links','Home','/',1),
  ('quick_links','Typing Tests','/typing-test',2),
  ('quick_links','Practice','/test',3),
  ('quick_links','Games','/games',4),
  ('quick_links','Leaderboards','/leaderboard',5),
  ('quick_links','Blog','/blog',6),
  ('quick_links','Contact','/contact',7),
  ('resources','FAQ','/faq',1),
  ('resources','Help Center','/help',2),
  ('resources','Tutorials','/tutorials',3),
  ('resources','Keyboard Guide','/keyboard-guide',4),
  ('resources','API Documentation','/api-docs',5)
) AS x(skey,label,href,so) ON x.skey = s.key;

INSERT INTO public.footer_links (section_id, label, href, icon, open_in_new_tab, sort_order)
SELECT id, x.label, x.href, x.icon, true, x.so FROM public.footer_sections s
JOIN (VALUES
  ('social','Facebook','https://facebook.com','facebook',1),
  ('social','Instagram','https://instagram.com','instagram',2),
  ('social','X (Twitter)','https://x.com','twitter',3),
  ('social','YouTube','https://youtube.com','youtube',4),
  ('social','LinkedIn','https://linkedin.com','linkedin',5),
  ('social','Discord','https://discord.com','message-circle',6),
  ('social','GitHub','https://github.com','github',7)
) AS x(skey,label,href,icon,so) ON x.skey = s.key;

INSERT INTO public.legal_pages (slug, title, content, status, sort_order) VALUES
  ('privacy-policy','Privacy Policy','# Privacy Policy\n\nEdit this content from the admin panel.','published',1),
  ('terms','Terms & Conditions','# Terms & Conditions\n\nEdit this content from the admin panel.','published',2),
  ('disclaimer','Disclaimer','# Disclaimer\n\nEdit this content from the admin panel.','published',3),
  ('cookie-policy','Cookie Policy','# Cookie Policy\n\nEdit this content from the admin panel.','published',4),
  ('refund-policy','Refund Policy','# Refund Policy\n\nEdit this content from the admin panel.','published',5),
  ('dmca','DMCA Policy','# DMCA Policy\n\nEdit this content from the admin panel.','published',6),
  ('data-deletion','Data Deletion','# Data Deletion\n\nEdit this content from the admin panel.','published',7),
  ('accessibility','Accessibility Statement','# Accessibility Statement\n\nEdit this content from the admin panel.','published',8),
  ('community-guidelines','Community Guidelines','# Community Guidelines\n\nEdit this content from the admin panel.','published',9);

-- Auto-link published legal pages into footer legal section via a function we can call from server
