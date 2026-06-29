
CREATE POLICY "editors read media bucket" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'media' AND (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'editor')));
CREATE POLICY "editors write media bucket" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'editor')));
CREATE POLICY "editors update media bucket" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'editor')))
  WITH CHECK (bucket_id = 'media' AND (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'editor')));
CREATE POLICY "editors delete media bucket" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'editor')));
