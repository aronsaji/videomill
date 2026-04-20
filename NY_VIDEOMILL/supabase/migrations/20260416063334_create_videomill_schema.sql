/*
  # VideoMill — Hoved-databaseskjema

  ## Tabeller opprettet
  1. trends          – Trend-signaler fra TrendRadar
  2. productions     – Videoproduksjoner knyttet til trender
  3. videos          – Ferdige videoer med metadata og URL-er
  4. platforms       – Brukerens tilkoblede sosiale medier-kontoer
  5. video_distributions – Publiseringsjobber per plattform
  6. comments        – Kommentarer fra sosiale medier med sentiment
  7. analytics_snapshots – Periodiske metrikk-snapshoter per video

  ## Sikkerhetsmodell (Zero Trust / ISO 27001)
  - RLS aktivert på alle tabeller
  - Brukere kan kun lese/skrive egne data (auth.uid() = user_id)
  - Ingen offentlig lesetilgang uten eksplisitt policy
  - Sensitiv data (tokens, hemmeligheter) lagres IKKE her —
    brukes via n8n / Edge Functions med Vault-hemmeligheter
*/


-- ─────────────────────────────────────────────
-- TRENDS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trends (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text NOT NULL,
  topic       text NOT NULL DEFAULT '',
  platform    text NOT NULL DEFAULT 'youtube',
  score       integer NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  status      text NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'approved', 'rejected', 'in_production')),
  vinkling    text DEFAULT '',
  tags        text[] DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trends_user_select" ON trends FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "trends_user_insert" ON trends FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "trends_user_update" ON trends FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "trends_user_delete" ON trends FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────
-- PRODUCTIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS productions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trend_id      uuid REFERENCES trends(id) ON DELETE SET NULL,
  title         text NOT NULL,
  status        text NOT NULL DEFAULT 'queued'
                CHECK (status IN ('queued','scripting','recording','editing','complete','failed')),
  progress      integer NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  language      text NOT NULL DEFAULT 'no',
  audience      text NOT NULL DEFAULT 'general',
  error_message text,
  script        text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE productions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "productions_user_select" ON productions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "productions_user_insert" ON productions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "productions_user_update" ON productions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "productions_user_delete" ON productions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Automatisk oppdatering av updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS productions_updated_at ON productions;
CREATE TRIGGER productions_updated_at
  BEFORE UPDATE ON productions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────
-- VIDEOS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS videos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  production_id   uuid REFERENCES productions(id) ON DELETE SET NULL,
  title           text NOT NULL,
  thumbnail_url   text DEFAULT '',
  video_url_9x16  text DEFAULT '',
  video_url_16x9  text DEFAULT '',
  duration        integer NOT NULL DEFAULT 0,
  -- Ekstra felt fra gammel app (videomachine)
  topic           text DEFAULT '',
  voice_id        text DEFAULT '',
  language        text DEFAULT 'en',
  video_style     text DEFAULT 'Cinematic',
  platform        text DEFAULT 'TikTok/Shorts',
  status          text NOT NULL DEFAULT 'queued'
                  CHECK (status IN ('queued','processing','complete','failed')),
  aspect_ratio    text DEFAULT '9:16',
  target_audience text DEFAULT 'General',
  captions_enabled boolean DEFAULT true,
  captions_style  text DEFAULT 'Viral Pop',
  captions_color  text DEFAULT '#FFB100',
  duration_seconds integer DEFAULT 60,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "videos_user_select" ON videos FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "videos_user_insert" ON videos FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "videos_user_update" ON videos FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "videos_user_delete" ON videos FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────
-- PLATFORMS (tilkoblede sosiale medier-kontoer)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS platforms (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text NOT NULL,
  connected       boolean NOT NULL DEFAULT false,
  account_name    text DEFAULT '',
  account_avatar  text DEFAULT '',
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platforms_user_select" ON platforms FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "platforms_user_insert" ON platforms FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "platforms_user_update" ON platforms FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "platforms_user_delete" ON platforms FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────
-- VIDEO_DISTRIBUTIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS video_distributions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id     uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  platform     text NOT NULL,
  status       text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','uploading','live','failed')),
  external_url text DEFAULT '',
  views        integer NOT NULL DEFAULT 0,
  likes        integer NOT NULL DEFAULT 0,
  posted_at    timestamptz
);

ALTER TABLE video_distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "distributions_user_select" ON video_distributions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "distributions_user_insert" ON video_distributions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "distributions_user_update" ON video_distributions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "distributions_user_delete" ON video_distributions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────
-- COMMENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id    uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  platform    text NOT NULL,
  author      text NOT NULL DEFAULT '',
  text        text NOT NULL DEFAULT '',
  sentiment   text NOT NULL DEFAULT 'neutral'
              CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  replied     boolean NOT NULL DEFAULT false,
  reply_text  text,
  posted_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_user_select" ON comments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "comments_user_insert" ON comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_user_update" ON comments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_user_delete" ON comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────
-- ANALYTICS_SNAPSHOTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id       uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  views          integer NOT NULL DEFAULT 0,
  likes          integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  shares         integer NOT NULL DEFAULT 0,
  date           date NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (video_id, date)
);

ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analytics_user_select" ON analytics_snapshots FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "analytics_user_insert" ON analytics_snapshots FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "analytics_user_update" ON analytics_snapshots FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
