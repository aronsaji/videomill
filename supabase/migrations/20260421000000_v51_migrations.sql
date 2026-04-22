-- VideoMill v5.1 migrations
-- Run in order: 20260421000000

-- 1. Add error tracking table for Error Fixer Agent
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL,
  error_type VARCHAR(50),
  error_message TEXT,
  fix_applied BOOLEAN DEFAULT FALSE,
  fix_recommendation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add webhook_logs for monitoring
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint VARCHAR(100),
  status_code INTEGER,
  response_time_ms INTEGER,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS on new tables
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- 4. Policies
CREATE POLICY "Allow read error_logs" ON error_logs FOR SELECT USING (true);
CREATE POLICY "Allow service insert error_logs" ON error_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read webhook_logs" ON webhook_logs FOR SELECT USING (true);
CREATE POLICY "Allow service insert webhook_logs" ON webhook_logs FOR INSERT WITH CHECK (true);

-- 5. Indexes
CREATE INDEX idx_error_logs_video ON error_logs(video_id);
CREATE INDEX idx_error_logs_created ON error_logs(created_at DESC);
CREATE INDEX idx_webhook_logs_endpoint ON webhook_logs(endpoint);
CREATE INDEX idx_webhook_logs_created ON webhook_logs(created_at DESC);

-- 6. Add user_id to agent_reports for multi-user support
ALTER TABLE agent_reports ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE social_responses ADD COLUMN IF NOT EXISTS user_id UUID;

COMMENT ON TABLE error_logs IS 'Error tracking for Error Fixer Agent';
COMMENT ON TABLE webhook_logs IS 'Webhook monitoring logs';