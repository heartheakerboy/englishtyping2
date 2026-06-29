
CREATE TABLE public.test_durations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  seconds integer,  -- nullable for "custom"
  kind text NOT NULL DEFAULT 'time', -- 'time' | 'custom'
  h1 text NOT NULL,
  nav_label text NOT NULL,
  title text NOT NULL,
  meta_description text NOT NULL,
  description_md text NOT NULL DEFAULT '',
  banner_url text,
  category text NOT NULL DEFAULT 'general',
  difficulty text NOT NULL DEFAULT 'medium',
  faq jsonb NOT NULL DEFAULT '[]'::jsonb,
  featured boolean NOT NULL DEFAULT false,
  popular boolean NOT NULL DEFAULT false,
  is_new boolean NOT NULL DEFAULT false,
  enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.test_durations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.test_durations TO authenticated;
GRANT ALL ON public.test_durations TO service_role;

ALTER TABLE public.test_durations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read enabled durations"
  ON public.test_durations FOR SELECT
  USING (enabled = true OR public.has_permission(auth.uid(), 'cms.write'));

CREATE POLICY "Staff can insert durations"
  ON public.test_durations FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'cms.write'));

CREATE POLICY "Staff can update durations"
  ON public.test_durations FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), 'cms.write'))
  WITH CHECK (public.has_permission(auth.uid(), 'cms.write'));

CREATE POLICY "Staff can delete durations"
  ON public.test_durations FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'cms.write'));

CREATE TRIGGER trg_test_durations_updated
  BEFORE UPDATE ON public.test_durations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_test_durations_enabled_sort ON public.test_durations (enabled, sort_order);

-- Seed
INSERT INTO public.test_durations (slug, seconds, kind, h1, nav_label, title, meta_description, description_md, sort_order, popular, featured) VALUES
('15-seconds', 15, 'time', '15 Second Typing Test', '15 Second Typing Test',
  '15 Second Typing Test — Quick WPM Check',
  'Take a fast 15-second typing test. Measure your WPM, accuracy and CPM in seconds. Free, no signup required.',
  'A 15-second typing test is the fastest way to spot-check your speed. Great for warmups and quick benchmarking.', 10, true, false),
('20-seconds', 20, 'time', '20 Second Typing Test', '20 Second Typing Test',
  '20 Second Typing Test — Fast Speed Test',
  'Take a 20-second typing test online. Track real-time WPM, accuracy and mistakes.',
  'A 20-second test gives a slightly more stable WPM than a 15-second sprint while staying short.', 20, false, false),
('30-seconds', 30, 'time', '30 Second Typing Test', '30 Second Typing Test',
  '30 Second Typing Test — Free Online WPM Test',
  'Take a 30-second typing test. Measure WPM, accuracy and consistency. Free and instant results.',
  'The 30-second typing test is a popular sweet spot — short enough to retry, long enough for a reliable WPM.', 30, true, true),
('1-minute', 60, 'time', '1 Minute Typing Test', '1 Minute Typing Test',
  '1 Minute Typing Test — One Minute WPM Test',
  'Take a one-minute typing test online. Real-time WPM, accuracy, CPM and mistake tracking.',
  'The classic 1-minute typing test is the global standard for measuring typing speed.', 40, true, true),
('2-minutes', 120, 'time', '2 Minute Typing Test', '2 Minute Typing Test',
  '2 Minute Typing Test — Free Online Test',
  'Take a 2-minute typing test. Improve stamina and measure your true WPM and accuracy.',
  'A 2-minute test smooths out short bursts and gives a more reliable speed reading.', 50, false, false),
('5-minutes', 300, 'time', '5 Minute Typing Test', '5 Minute Typing Test',
  '5 Minute Typing Test — Stamina WPM Test',
  'Take a 5-minute typing test. Build endurance and measure sustained typing speed.',
  'A 5-minute typing test is great for endurance training and exam preparation.', 60, false, false),
('7-minutes', 420, 'time', '7 Minute Typing Test', '7 Minute Typing Test',
  '7 Minute Typing Test — Advanced Speed Test',
  'Take a 7-minute typing test online. Track stamina, accuracy and long-form speed.',
  'A 7-minute test is ideal for longer transcription practice.', 70, false, false),
('10-minutes', 600, 'time', '10 Minute Typing Test', '10 Minute Typing Test',
  '10 Minute Typing Test — Endurance WPM Test',
  'Take a 10-minute typing test. Real-time WPM, accuracy, and detailed analytics.',
  'The 10-minute test is widely used in government and clerical typing exams.', 80, false, false),
('15-minutes', 900, 'time', '15 Minute Typing Test', '15 Minute Typing Test',
  '15 Minute Typing Test — Long-form Typing Test',
  'Take a 15-minute typing test. Endurance, accuracy and stamina under load.',
  'A 15-minute typing test is the gold standard for typing certifications.', 90, false, false),
('custom', NULL, 'custom', 'Custom Typing Test', 'Custom Typing Test',
  'Custom Typing Test — Choose Your Duration & Text',
  'Build a custom typing test. Pick your own duration, paste your own text, and track WPM and accuracy.',
  'The custom typing test lets you tailor the exercise to your needs.', 100, false, false);
