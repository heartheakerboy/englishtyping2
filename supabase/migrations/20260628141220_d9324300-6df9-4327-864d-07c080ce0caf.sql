
-- =========================================
-- TEMPLATE CATEGORIES
-- =========================================
CREATE TABLE public.template_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  icon text,
  parent_id uuid REFERENCES public.template_categories(id) ON DELETE SET NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.template_categories TO anon, authenticated;
GRANT ALL ON public.template_categories TO service_role;
ALTER TABLE public.template_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read" ON public.template_categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_write" ON public.template_categories FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER trg_template_categories_updated BEFORE UPDATE ON public.template_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
-- TEMPLATE TAGS
-- =========================================
CREATE TABLE public.template_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  usage_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.template_tags TO anon, authenticated;
GRANT INSERT ON public.template_tags TO authenticated;
GRANT ALL ON public.template_tags TO service_role;
ALTER TABLE public.template_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags_public_read" ON public.template_tags FOR SELECT USING (true);
CREATE POLICY "tags_auth_insert" ON public.template_tags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "tags_admin_update" ON public.template_tags FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "tags_admin_delete" ON public.template_tags FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- =========================================
-- TEMPLATES
-- =========================================
CREATE TABLE public.templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  thumbnail_url text,
  banner_url text,
  category_id uuid REFERENCES public.template_categories(id) ON DELETE SET NULL,
  language text NOT NULL DEFAULT 'en',
  difficulty text NOT NULL DEFAULT 'medium',
  duration_seconds int NOT NULL DEFAULT 60,
  content_mode text NOT NULL DEFAULT 'time',
  content_text text NOT NULL DEFAULT '',
  content_source text NOT NULL DEFAULT 'manual',
  ai_prompt text,
  word_count int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  visibility text NOT NULL DEFAULT 'public',
  password_hash text,
  attempt_limit int,
  certificate_enabled boolean NOT NULL DEFAULT false,
  certificate_template_id uuid,
  leaderboard_enabled boolean NOT NULL DEFAULT true,
  leaderboard_scope text NOT NULL DEFAULT 'global',
  scoring_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  reward_xp int NOT NULL DEFAULT 0,
  reward_coins int NOT NULL DEFAULT 0,
  reward_badge_id uuid,
  is_featured boolean NOT NULL DEFAULT false,
  is_pinned boolean NOT NULL DEFAULT false,
  is_premium boolean NOT NULL DEFAULT false,
  price_cents int NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  discount_percent int NOT NULL DEFAULT 0,
  coupon_code text,
  views_count int NOT NULL DEFAULT 0,
  uses_count int NOT NULL DEFAULT 0,
  copies_count int NOT NULL DEFAULT 0,
  favorites_count int NOT NULL DEFAULT 0,
  rating_avg numeric(3,2) NOT NULL DEFAULT 0,
  rating_count int NOT NULL DEFAULT 0,
  seo_title text,
  seo_description text,
  og_image_url text,
  schema_jsonld jsonb,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_templates_status ON public.templates(status);
CREATE INDEX idx_templates_visibility ON public.templates(visibility);
CREATE INDEX idx_templates_category ON public.templates(category_id);
CREATE INDEX idx_templates_creator ON public.templates(creator_id);
CREATE INDEX idx_templates_featured ON public.templates(is_featured) WHERE is_featured = true;
CREATE INDEX idx_templates_published_at ON public.templates(published_at DESC NULLS LAST);

GRANT SELECT ON public.templates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.templates TO authenticated;
GRANT ALL ON public.templates TO service_role;

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "templates_public_read" ON public.templates FOR SELECT
  USING (status = 'published' AND visibility = 'public');
CREATE POLICY "templates_owner_read" ON public.templates FOR SELECT TO authenticated
  USING (auth.uid() = creator_id);
CREATE POLICY "templates_admin_read" ON public.templates FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));
CREATE POLICY "templates_owner_insert" ON public.templates FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "templates_owner_update" ON public.templates FOR UPDATE TO authenticated
  USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "templates_admin_update" ON public.templates FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "templates_owner_delete" ON public.templates FOR DELETE TO authenticated
  USING (auth.uid() = creator_id);
CREATE POLICY "templates_admin_delete" ON public.templates FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));
CREATE TRIGGER trg_templates_updated BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
-- TEMPLATE TAG MAP
-- =========================================
CREATE TABLE public.template_tag_map (
  template_id uuid NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.template_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (template_id, tag_id)
);
GRANT SELECT ON public.template_tag_map TO anon, authenticated;
GRANT INSERT, DELETE ON public.template_tag_map TO authenticated;
GRANT ALL ON public.template_tag_map TO service_role;
ALTER TABLE public.template_tag_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tagmap_public_read" ON public.template_tag_map FOR SELECT USING (true);
CREATE POLICY "tagmap_owner_write" ON public.template_tag_map FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.templates t WHERE t.id = template_id
    AND (t.creator_id = auth.uid() OR public.is_admin(auth.uid()))));
CREATE POLICY "tagmap_owner_delete" ON public.template_tag_map FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.templates t WHERE t.id = template_id
    AND (t.creator_id = auth.uid() OR public.is_admin(auth.uid()))));

-- =========================================
-- FAVORITES
-- =========================================
CREATE TABLE public.template_favorites (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, template_id)
);
GRANT SELECT, INSERT, DELETE ON public.template_favorites TO authenticated;
GRANT ALL ON public.template_favorites TO service_role;
ALTER TABLE public.template_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorites_owner_all" ON public.template_favorites FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================================
-- REVIEWS
-- =========================================
CREATE TABLE public.template_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.template_reviews(id) ON DELETE CASCADE,
  rating int NOT NULL DEFAULT 5,
  body text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'visible',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (template_id, user_id, parent_id)
);
GRANT SELECT ON public.template_reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.template_reviews TO authenticated;
GRANT ALL ON public.template_reviews TO service_role;
ALTER TABLE public.template_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read" ON public.template_reviews FOR SELECT
  USING (status = 'visible');
CREATE POLICY "reviews_owner_read" ON public.template_reviews FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "reviews_owner_insert" ON public.template_reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_owner_update" ON public.template_reviews FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "reviews_owner_delete" ON public.template_reviews FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE TRIGGER trg_template_reviews_updated BEFORE UPDATE ON public.template_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
-- REPORTS
-- =========================================
CREATE TABLE public.template_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.template_reports TO authenticated;
GRANT ALL ON public.template_reports TO service_role;
ALTER TABLE public.template_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_owner_read" ON public.template_reports FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "reports_owner_insert" ON public.template_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reports_admin_update" ON public.template_reports FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- =========================================
-- USAGES
-- =========================================
CREATE TABLE public.template_usages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL DEFAULT 'use',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_usages_user_recent ON public.template_usages(user_id, created_at DESC);
GRANT SELECT, INSERT ON public.template_usages TO authenticated;
GRANT ALL ON public.template_usages TO service_role;
ALTER TABLE public.template_usages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usages_owner_read" ON public.template_usages FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.templates t WHERE t.id = template_id AND t.creator_id = auth.uid()));
CREATE POLICY "usages_owner_insert" ON public.template_usages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =========================================
-- PURCHASES
-- =========================================
CREATE TABLE public.template_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents int NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  coupon_code text,
  status text NOT NULL DEFAULT 'pending',
  provider text,
  provider_ref text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (template_id, user_id)
);
GRANT SELECT, INSERT ON public.template_purchases TO authenticated;
GRANT ALL ON public.template_purchases TO service_role;
ALTER TABLE public.template_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "purchases_owner_read" ON public.template_purchases FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.templates t WHERE t.id = template_id AND t.creator_id = auth.uid()));
CREATE POLICY "purchases_owner_insert" ON public.template_purchases FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =========================================
-- REVISIONS
-- =========================================
CREATE TABLE public.template_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  snapshot jsonb NOT NULL,
  note text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.template_revisions TO authenticated;
GRANT ALL ON public.template_revisions TO service_role;
ALTER TABLE public.template_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "revisions_owner_all" ON public.template_revisions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.templates t WHERE t.id = template_id
    AND (t.creator_id = auth.uid() OR public.is_admin(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.templates t WHERE t.id = template_id
    AND (t.creator_id = auth.uid() OR public.is_admin(auth.uid()))));

-- =========================================
-- COUNTER + RATING TRIGGERS
-- =========================================
CREATE OR REPLACE FUNCTION public.tpl_favorites_count_trg() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.templates SET favorites_count = favorites_count + 1 WHERE id = NEW.template_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.templates SET favorites_count = GREATEST(0, favorites_count - 1) WHERE id = OLD.template_id;
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER trg_tpl_favs AFTER INSERT OR DELETE ON public.template_favorites
  FOR EACH ROW EXECUTE FUNCTION public.tpl_favorites_count_trg();

CREATE OR REPLACE FUNCTION public.tpl_usage_count_trg() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.action = 'use' THEN
    UPDATE public.templates SET uses_count = uses_count + 1 WHERE id = NEW.template_id;
  ELSIF NEW.action = 'copy' THEN
    UPDATE public.templates SET copies_count = copies_count + 1 WHERE id = NEW.template_id;
  ELSIF NEW.action = 'view' THEN
    UPDATE public.templates SET views_count = views_count + 1 WHERE id = NEW.template_id;
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER trg_tpl_usage AFTER INSERT ON public.template_usages
  FOR EACH ROW EXECUTE FUNCTION public.tpl_usage_count_trg();

CREATE OR REPLACE FUNCTION public.tpl_rating_recalc(_tpl uuid) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.templates t
  SET rating_avg = COALESCE((SELECT round(avg(rating)::numeric, 2) FROM public.template_reviews
                              WHERE template_id = _tpl AND status = 'visible' AND parent_id IS NULL), 0),
      rating_count = (SELECT count(*) FROM public.template_reviews
                       WHERE template_id = _tpl AND status = 'visible' AND parent_id IS NULL)
  WHERE t.id = _tpl;
$$;

CREATE OR REPLACE FUNCTION public.tpl_review_trg() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.tpl_rating_recalc(COALESCE(NEW.template_id, OLD.template_id));
  RETURN NULL;
END $$;
CREATE TRIGGER trg_tpl_reviews AFTER INSERT OR UPDATE OR DELETE ON public.template_reviews
  FOR EACH ROW EXECUTE FUNCTION public.tpl_review_trg();

-- Increment view counter RPC (callable from anon)
CREATE OR REPLACE FUNCTION public.tpl_increment_views(_slug text) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.templates SET views_count = views_count + 1
  WHERE slug = _slug AND status = 'published' AND visibility = 'public';
$$;
GRANT EXECUTE ON FUNCTION public.tpl_increment_views(text) TO anon, authenticated;

-- =========================================
-- SEED CATEGORIES
-- =========================================
INSERT INTO public.template_categories (slug, name, icon, sort_order) VALUES
  ('government-exams','Government Exams','landmark', 10),
  ('school','School','graduation-cap', 20),
  ('college','College','book-open', 30),
  ('coding','Coding','code', 40),
  ('office','Office','briefcase', 50),
  ('business','Business','building-2', 60),
  ('kids','Kids','baby', 70),
  ('beginners','Beginners','sparkles', 80),
  ('advanced','Advanced','flame', 90),
  ('typing-games','Typing Games','gamepad-2', 100),
  ('custom-practice','Custom Practice','wrench', 110),
  ('speed-practice','Speed Practice','zap', 120),
  ('accuracy-practice','Accuracy Practice','target', 130),
  ('number-typing','Number Typing','hash', 140),
  ('symbol-typing','Symbol Typing','at-sign', 150),
  ('quote-typing','Quote Typing','quote', 160),
  ('story-typing','Story Typing','book', 170),
  ('article-typing','Article Typing','newspaper', 180),
  ('ai-generated','AI Generated','sparkles', 190);

INSERT INTO public.template_categories (slug, name, icon, sort_order, parent_id) VALUES
  ('ssc-chsl','SSC CHSL','file-text', 11, (SELECT id FROM public.template_categories WHERE slug='government-exams')),
  ('ssc-cgl','SSC CGL','file-text', 12, (SELECT id FROM public.template_categories WHERE slug='government-exams')),
  ('ssc-mts','SSC MTS','file-text', 13, (SELECT id FROM public.template_categories WHERE slug='government-exams')),
  ('railway','Railway','train', 14, (SELECT id FROM public.template_categories WHERE slug='government-exams')),
  ('bank-po','Bank PO','banknote', 15, (SELECT id FROM public.template_categories WHERE slug='government-exams')),
  ('bank-clerk','Bank Clerk','banknote', 16, (SELECT id FROM public.template_categories WHERE slug='government-exams')),
  ('court-typing','Court Typing','scale', 17, (SELECT id FROM public.template_categories WHERE slug='government-exams')),
  ('police','Police','shield', 18, (SELECT id FROM public.template_categories WHERE slug='government-exams')),
  ('high-court','High Court','gavel', 19, (SELECT id FROM public.template_categories WHERE slug='government-exams')),
  ('district-court','District Court','gavel', 20, (SELECT id FROM public.template_categories WHERE slug='government-exams'));

INSERT INTO public.template_categories (slug, name, icon, sort_order, parent_id) VALUES
  ('programming','Programming','terminal', 41, (SELECT id FROM public.template_categories WHERE slug='coding')),
  ('interview','Interview','user-check', 42, (SELECT id FROM public.template_categories WHERE slug='coding'));
