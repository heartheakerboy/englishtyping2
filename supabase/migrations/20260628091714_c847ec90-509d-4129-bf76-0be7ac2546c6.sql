
DROP POLICY IF EXISTS "anyone insert pv" ON public.page_views;
CREATE POLICY "self insert pv" ON public.page_views
  FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());
