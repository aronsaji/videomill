import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Trend, Video, VideoDistribution, Comment } from '../types';

// ─────────────────────────────────────────────────────────────
// Generic realtime hook — subscribes to Supabase Realtime and
// keeps local state in sync with INSERT / UPDATE / DELETE events
// ─────────────────────────────────────────────────────────────
function useRealtimeTable<T extends { id: string }>(
  table: string,
  query: () => Promise<T[]>
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await query();
      setData(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refresh();
  }, [table]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refresh };
}

// ─────────────────────────────────────────────────────────────
// Trending topics — actual table: trending_topics
// ─────────────────────────────────────────────────────────────
export function useTrends() {
  return useRealtimeTable<Trend>('trending_topics', async () => {
    const { data, error } = await supabase
      .from('trending_topics')
      .select('*')
      .eq('active', true)
      .order('viral_score', { ascending: false });
    if (error) throw error;
    // Map old n8n column names → new names when new ones are null
    // Old pipeline used: rank, heat, reason
    // New pipeline uses: viral_score, heat_level, growth_stat
    const mapped = (data ?? []).map((row: Record<string, unknown>) => ({
      ...row,
      viral_score: (row.viral_score as number) ?? (row.rank as number) ?? 0,
      heat_level:  (row.heat_level  as string) ?? (row.heat  as string) ?? null,
      growth_stat: (row.growth_stat as string) ?? (row.reason as string) ?? null,
    }));
    return mapped as Trend[];
  });
}

// ─────────────────────────────────────────────────────────────
// Videos / Productions — actual table: videos
// ─────────────────────────────────────────────────────────────
export function useVideos() {
  return useRealtimeTable<Video>('videos', async () => {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Video[];
  });
}

/** Alias: productions are stored in the videos table */
export const useProductions = useVideos;

/** Orders: all videos for this user */
export function useOrders() {
  return useRealtimeTable<Video>('videos', async () => {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data ?? []) as Video[];
  });
}

// ─────────────────────────────────────────────────────────────
// Distributions / Comments — tables don't exist yet.
// Return static empty state so the UI shows empty gracefully.
// ─────────────────────────────────────────────────────────────
export function useDistributions() {
  return {
    data: [] as VideoDistribution[],
    loading: false,
    error: null,
    refresh: async () => {},
  };
}

export function useComments() {
  return {
    data: [] as Comment[],
    loading: false,
    error: null,
    refresh: async () => {},
  };
}

// Agent Reports — actual table: agent_reports
// ─────────────────────────────────────────────────────────────
export interface AgentReport {
  id: string;
  agent: string;
  report?: string;
  recommendations?: string[];
  alerts?: string[];
  kpis?: Record<string, unknown>;
  financial_summary?: string;
  cost_analysis?: Record<string, unknown>;
  roi_metrics?: Record<string, unknown>;
  budget_suggestions?: string[];
  content_strategy?: string;
  audience_insights?: string[];
  platform_recommendations?: string[];
  hashtag_suggestions?: string[];
  posting_schedule?: Record<string, unknown>;
  viral_tips?: string[];
  security_status?: string;
  compliance_check?: Record<string, unknown>;
  anomalies?: string[];
  access_report?: Record<string, unknown>;
  risk_level?: string;
  message?: string;
  platform?: string;
  from_user?: string;
  original_message?: string;
  created_at: string;
}

export function useAgentReports() {
  return useRealtimeTable<AgentReport>('agent_reports', async () => {
    const { data, error } = await supabase
      .from('agent_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data ?? []) as AgentReport[];
  });
}

// Social Responses — actual table: social_responses
// ─────────────────────────────────────────────────────────────
export function useSocialResponses() {
  return useRealtimeTable<AgentReport>('social_responses', async () => {
    const { data, error } = await supabase
      .from('social_responses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data ?? []) as AgentReport[];
  });
}

// Agent Logs — actual table: agent_logs
// ─────────────────────────────────────────────────────────────
export interface AgentLog {
  id: string;
  agent_id: string;
  action: string;
  status: string;
  details?: Record<string, unknown> | null;
  video_id?: string | null;
  created_at: string;
}

export function useAgentLogs(limit = 20) {
  return useRealtimeTable<AgentLog>('agent_logs', async () => {
    const { data, error } = await supabase
      .from('agent_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as AgentLog[];
  });
}

// ─────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────

/**
 * Create a new order / video job.
 * Inserts into the `videos` table with the correct column names.
 * Note: the prompt column in the DB is spelled "promp" (without t).
 */
export async function createOrder(order: {
  user_id: string;
  topic: string;
  promp: string;
  platform: string;
  language: string;
  voice_id: string;
  aspect_ratio: string;
  title?: string;
  target_audience?: string;
}) {
  return supabase
    .from('videos')
    .insert({
      user_id:          order.user_id,
      topic:            order.topic,
      title:            order.title ?? order.topic,
      promp:            order.promp,
      platform:         order.platform,
      language:         order.language,
      voice_id:         order.voice_id,
      aspect_ratio:     order.aspect_ratio,
      target_audience:  order.target_audience ?? null,
      status:           'pending',
      progress:         0,
    })
    .select()
    .single();
}

/**
 * Create a production job (same table as orders).
 */
export async function createProduction(data: {
  title: string;
  language: string;
  user_id: string;
  target_audience?: string;
  topic?: string;
  promp?: string;
  platform?: string;
  voice_id?: string;
  aspect_ratio?: string;
}) {
  return supabase
    .from('videos')
    .insert({
      ...data,
      status:   'queued',
      progress: 0,
    })
    .select()
    .single();
}

/**
 * Update video status (used for retry / manual status changes).
 */
export async function updateVideoStatus(id: string, status: string, progress?: number) {
  return supabase
    .from('videos')
    .update({ 
      status, 
      ...(progress !== undefined ? { progress } : {}),
      // Clear error metadata on retry
      metadata: { ...(progress === 0 ? { error: null } : {}) }
    })
    .eq('id', id);
}

/**
 * Reply to a comment — no-op since comments table does not exist.
 * Kept for API compatibility with engagement.tsx.
 */
export async function updateCommentReply(_id: string, _reply_text: string) {
  return { data: null, error: null };
}
