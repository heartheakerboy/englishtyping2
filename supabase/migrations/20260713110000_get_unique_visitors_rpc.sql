-- Create the get_unique_visitors_count RPC function to calculate unique visitors based on session_id
CREATE OR REPLACE FUNCTION public.get_unique_visitors_count(_since TIMESTAMPTZ)
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(DISTINCT COALESCE(session_id, id::text))
  FROM public.page_views
  WHERE created_at >= _since;
$$;
