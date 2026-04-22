/*
  # n8n Webhook Trigger
  
  Når ny video bestilles (status = 'pending'), kalle n8n webhook automatisk.
  n8n må da polle for nye bestillinger eller motta POST.
*/

-- Funksjon for å kalle n8n webhook
CREATE OR REPLACE FUNCTION public.trigger_n8n_on_new_order()
RETURNS trigger AS $$
DECLARE
  webhook_url text;
BEGIN
  -- Hent n8n webhook URL fra user_settings
  SELECT n8n_webhook_url INTO webhook_url
  FROM user_settings
  WHERE user_id = NEW.user_id
  LIMIT 1;
  
  -- Hvis n8n er aktivert, kall webhook
  IF webhook_url IS NOT NULL AND webhook_url != '' THEN
    PERFORM (
      SELECT supabase_http.request(
        'POST',
        webhook_url,
        '{"Content-Type": "application/json"}'::jsonb,
        jsonb_build_object(
          'id', NEW.id,
          'user_id', NEW.user_id,
          'topic', NEW.topic,
          'prompt', NEW.promp,
          'platform', NEW.platform,
          'language', NEW.language,
          'status', NEW.status
        )::text
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger som kjøres når ny bestilling settes til pending
DROP TRIGGER IF EXISTS trigger_n8n_new_order ON videos;
CREATE TRIGGER trigger_n8n_new_order
  AFTER INSERT ON videos
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.trigger_n8n_on_new_order();