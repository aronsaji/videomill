-- Kanal per språk
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS channel_routes jsonb DEFAULT '{}'::jsonb;

-- Lag kommentar
COMMENT ON COLUMN user_settings.channel_routes IS '{"nb": "youtube_channel_id", "en": "youtube_channel_id", ...}';