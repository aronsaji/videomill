-- AI Agent Reports og Social Responses tabeller for VideoMill v5.0

-- Agent Reports: Lagrer rapporter fra COO, CFO, Marketing, CISO
CREATE TABLE IF NOT EXISTS agent_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent VARCHAR(50) NOT NULL,
  report TEXT,
  recommendations TEXT[],
  alerts TEXT[],
  kpis JSONB,
  
  -- CFO specific
  financial_summary TEXT,
  cost_analysis JSONB,
  roi_metrics JSONB,
  budget_suggestions TEXT[],
  
  -- Marketing specific
  content_strategy TEXT,
  audience_insights TEXT[],
  platform_recommendations TEXT[],
  hashtag_suggestions TEXT[],
  posting_schedule JSONB,
  viral_tips TEXT[],
  
  -- CISO specific
  security_status TEXT,
  compliance_check JSONB,
  anomalies TEXT[],
  access_report JSONB,
  risk_level VARCHAR(20),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Responses: Lagrer automatiske svar på sosiale medier
CREATE TABLE IF NOT EXISTS social_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  platform VARCHAR(50),
  from_user VARCHAR(255),
  original_message TEXT,
  sentiment VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE agent_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_responses ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read
CREATE POLICY "Allow read agent_reports" ON agent_reports
  FOR SELECT USING (true);

CREATE POLICY "Allow read social_responses" ON social_responses
  FOR SELECT USING (true);

-- Policy: Service role (n8n) can insert
CREATE POLICY "Allow service insert agent_reports" ON agent_reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service insert social_responses" ON social_responses
  FOR INSERT WITH CHECK (true);

-- Index for querying
CREATE INDEX idx_agent_reports_agent ON agent_reports(agent);
CREATE INDEX idx_agent_reports_created ON agent_reports(created_at DESC);
CREATE INDEX idx_social_responses_created ON social_responses(created_at DESC);

COMMENT ON TABLE agent_reports IS 'Rapporter fra AI-agenter (COO, CFO, Marketing, CISO)';
COMMENT ON TABLE social_responses IS 'Automatiske svar på sosiale medier-meldinger';
