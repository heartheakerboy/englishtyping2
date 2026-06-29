
-- Profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Typing results
CREATE TABLE public.typing_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  mode TEXT NOT NULL,
  mode_value INT NOT NULL,
  wpm NUMERIC(6,2) NOT NULL,
  raw_wpm NUMERIC(6,2) NOT NULL,
  accuracy NUMERIC(5,2) NOT NULL,
  cpm NUMERIC(7,2) NOT NULL,
  consistency NUMERIC(5,2),
  chars_correct INT NOT NULL DEFAULT 0,
  chars_incorrect INT NOT NULL DEFAULT 0,
  chars_extra INT NOT NULL DEFAULT 0,
  chars_missed INT NOT NULL DEFAULT 0,
  duration_seconds NUMERIC(6,2) NOT NULL,
  language TEXT NOT NULL DEFAULT 'english',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.typing_results TO authenticated;
GRANT ALL ON public.typing_results TO service_role;
ALTER TABLE public.typing_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own results" ON public.typing_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own results" ON public.typing_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own results" ON public.typing_results FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_typing_results_user_created ON public.typing_results(user_id, created_at DESC);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
