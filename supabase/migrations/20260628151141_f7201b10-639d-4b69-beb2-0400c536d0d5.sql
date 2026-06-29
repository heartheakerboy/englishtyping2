DROP POLICY IF EXISTS "Anyone can read active game configs" ON public.game_configs;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'game_configs'
      AND policyname = 'public read active games'
  ) THEN
    CREATE POLICY "public read active games"
      ON public.game_configs
      FOR SELECT
      TO public
      USING (is_active = true);
  END IF;
END $$;

GRANT SELECT ON public.game_configs TO anon, authenticated;
GRANT ALL ON public.game_configs TO service_role;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated, service_role;