-- ─────────────────────────────────────────────────────────────────────────────
-- agent_logs — logg fra alle AI-agenter
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agent_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    text NOT NULL,           -- 'comment_reply' | 'promoter' | 'error_recovery' | 'analytics' | 'planner'
  action      text NOT NULL,           -- hva agenten gjorde
  status      text NOT NULL DEFAULT 'ok', -- ok | error | skipped
  details     jsonb,                   -- ekstra metadata
  video_id    uuid,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- agent_settings — per-bruker konfig per agent
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agent_settings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id    text NOT NULL,
  enabled     boolean NOT NULL DEFAULT true,
  config      jsonb DEFAULT '{}'::jsonb,
  last_run    timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, agent_id)
);

ALTER TABLE public.agent_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_logs: public read"      ON public.agent_logs     FOR SELECT USING (true);
CREATE POLICY "agent_logs: service insert"   ON public.agent_logs     FOR INSERT WITH CHECK (true);
CREATE POLICY "agent_settings: owner all"    ON public.agent_settings FOR ALL   USING (auth.uid() = user_id);
CREATE POLICY "agent_settings: service all"  ON public.agent_settings FOR ALL   TO service_role USING (true);

-- Add elevenlabs + music fields to user_settings
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS elevenlabs_api_key text,
  ADD COLUMN IF NOT EXISTS music_enabled       boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS captions_enabled    boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_publish        boolean DEFAULT false;
