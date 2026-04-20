-- ─────────────────────────────────────────────────────────────────────────────
-- series + episodes — Auto-Serie Studio
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.series (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title          text NOT NULL,
  prompt         text,
  season_number  integer NOT NULL DEFAULT 1,
  total_episodes integer NOT NULL DEFAULT 0,
  language       text NOT NULL DEFAULT 'ta',
  platform       text NOT NULL DEFAULT 'youtube',
  status         text NOT NULL DEFAULT 'ready',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.episodes (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id      uuid NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  episode_number integer NOT NULL,
  title          text NOT NULL,
  description    text,
  video_id       uuid REFERENCES public.videos(id),
  video_url      text,
  status         text NOT NULL DEFAULT 'pending',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- Add groq_api_key to user_settings for client-side generation
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS groq_api_key text;

-- RLS
ALTER TABLE public.series  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "series: owner all"  ON public.series
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "episodes: owner all" ON public.episodes
  FOR ALL USING (
    series_id IN (SELECT id FROM public.series WHERE user_id = auth.uid())
  );

CREATE POLICY "episodes: service role" ON public.episodes
  FOR ALL TO service_role USING (true);

CREATE POLICY "series: service role" ON public.series
  FOR ALL TO service_role USING (true);
