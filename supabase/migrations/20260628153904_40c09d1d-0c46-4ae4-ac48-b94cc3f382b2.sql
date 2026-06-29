
-- Languages registry
CREATE TABLE IF NOT EXISTS public.languages (
  code TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  native TEXT NOT NULL,
  rtl BOOLEAN NOT NULL DEFAULT false,
  enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 100,
  flag TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.languages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.languages TO authenticated;
GRANT ALL ON public.languages TO service_role;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read enabled languages" ON public.languages FOR SELECT USING (enabled = true);
CREATE POLICY "Admins manage languages" ON public.languages FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER trg_languages_updated BEFORE UPDATE ON public.languages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Translation overrides (admin-edited values; merged on top of bundled JSON)
CREATE TABLE IF NOT EXISTS public.translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lang TEXT NOT NULL REFERENCES public.languages(code) ON DELETE CASCADE,
  namespace TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lang, namespace, key)
);
GRANT SELECT ON public.translations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.translations TO authenticated;
GRANT ALL ON public.translations TO service_role;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read translations" ON public.translations FOR SELECT USING (true);
CREATE POLICY "Admins manage translations" ON public.translations FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX idx_translations_lang_ns ON public.translations(lang, namespace);
CREATE TRIGGER trg_translations_updated BEFORE UPDATE ON public.translations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Translation version history
CREATE TABLE IF NOT EXISTS public.translation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lang TEXT NOT NULL,
  namespace TEXT NOT NULL,
  key TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.translation_history TO authenticated;
GRANT ALL ON public.translation_history TO service_role;
ALTER TABLE public.translation_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read history" ON public.translation_history FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins insert history" ON public.translation_history FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

-- Preferred language on profile
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT;

-- Seed 20 languages
INSERT INTO public.languages (code, label, native, rtl, enabled, sort_order, flag) VALUES
  ('en','English','English',false,true,1,'🇬🇧'),
  ('hi','Hindi','हिन्दी',false,true,2,'🇮🇳'),
  ('mr','Marathi','मराठी',false,true,3,'🇮🇳'),
  ('gu','Gujarati','ગુજરાતી',false,true,4,'🇮🇳'),
  ('ta','Tamil','தமிழ்',false,true,5,'🇮🇳'),
  ('te','Telugu','తెలుగు',false,true,6,'🇮🇳'),
  ('kn','Kannada','ಕನ್ನಡ',false,true,7,'🇮🇳'),
  ('ml','Malayalam','മലയാളം',false,true,8,'🇮🇳'),
  ('pa','Punjabi','ਪੰਜਾਬੀ',false,true,9,'🇮🇳'),
  ('bn','Bengali','বাংলা',false,true,10,'🇧🇩'),
  ('ur','Urdu','اردو',true,true,11,'🇵🇰'),
  ('ar','Arabic','العربية',true,true,12,'🇸🇦'),
  ('es','Spanish','Español',false,true,13,'🇪🇸'),
  ('fr','French','Français',false,true,14,'🇫🇷'),
  ('de','German','Deutsch',false,true,15,'🇩🇪'),
  ('pt','Portuguese','Português',false,true,16,'🇵🇹'),
  ('ru','Russian','Русский',false,true,17,'🇷🇺'),
  ('ja','Japanese','日本語',false,true,18,'🇯🇵'),
  ('ko','Korean','한국어',false,true,19,'🇰🇷'),
  ('zh','Chinese (Simplified)','简体中文',false,true,20,'🇨🇳')
ON CONFLICT (code) DO NOTHING;
