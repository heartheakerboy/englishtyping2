-- visitor_announcements table
CREATE TABLE IF NOT EXISTS public.visitor_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  primary_btn_text text NOT NULL DEFAULT '🚀 Create Free Account',
  primary_btn_action text NOT NULL DEFAULT 'signup',
  secondary_btn_text text NOT NULL DEFAULT 'Learn More',
  secondary_btn_href text,
  colors jsonb NOT NULL DEFAULT '{"bg": "rgba(10, 10, 15, 0.75)", "text": "#ffffff", "primaryBtnBg": "linear-gradient(135deg, #a21caf, #6366f1)", "primaryBtnText": "#ffffff", "secondaryBtnBg": "rgba(255, 255, 255, 0.08)", "secondaryBtnText": "#ffffff", "glassmorphism": true, "border": "rgba(255, 255, 255, 0.1)"}'::jsonb,
  image_url text,
  icon_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  target_audience text NOT NULL DEFAULT 'guests',
  display_pages text NOT NULL DEFAULT 'all',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Grants
GRANT SELECT ON public.visitor_announcements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.visitor_announcements TO authenticated;
GRANT ALL ON public.visitor_announcements TO service_role;

-- RLS
ALTER TABLE public.visitor_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read active visitor announcements" ON public.visitor_announcements FOR SELECT
  USING (is_active = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at > now()));

CREATE POLICY "admins manage visitor announcements" ON public.visitor_announcements FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
