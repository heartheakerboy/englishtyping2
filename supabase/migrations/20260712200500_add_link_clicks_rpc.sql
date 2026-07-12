-- Create the increment_link_clicks RPC function
CREATE OR REPLACE FUNCTION public.increment_link_clicks(
  _link_type TEXT,
  _source_path TEXT,
  _target_url TEXT,
  _anchor_text TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.link_analytics (link_type, source_path, target_url, anchor_text, clicks_count)
  VALUES (_link_type, _source_path, _target_url, _anchor_text, 1)
  ON CONFLICT (link_type, source_path, target_url, anchor_text)
  DO UPDATE SET clicks_count = public.link_analytics.clicks_count + 1, updated_at = now();
END;
$$;
