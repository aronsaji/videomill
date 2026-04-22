/*
  # VideoMill — Orders (Bestillinger)

  ## Tabell: orders
  Lagrer brukerens videobestillinger med alle produksjonsparametere.
  Hver bestilling trigges videre til n8n via Edge Function.

  ## Sikkerhet
  - RLS aktivert: brukere kan kun se/endre egne bestillinger
  - status-felt med CHECK constraint
  - n8n_response lagres for audit trail (ISO 27001 A.5.28)
*/

CREATE TABLE IF NOT EXISTS orders (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trend_id      uuid REFERENCES trends(id) ON DELETE SET NULL,
  topic         text NOT NULL,
  prompt        text NOT NULL DEFAULT '',
  platform      text NOT NULL DEFAULT 'tiktok',
  language      text NOT NULL DEFAULT 'nb',
  voice_id      text NOT NULL DEFAULT '',
  video_format  text NOT NULL DEFAULT '9:16',
  status        text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'processing', 'complete', 'failed')),
  n8n_response  text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_user_select" ON orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "orders_user_insert" ON orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_user_update" ON orders FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_user_delete" ON orders FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
