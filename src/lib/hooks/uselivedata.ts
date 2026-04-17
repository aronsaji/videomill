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

    const channel = supabase
      .channel(`${table}_changes_${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setData(prev => [payload.new as T, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setData(prev => prev.map(item =>
            item.id === (payload.new as T).id ? (payload.new as T) : item
          ));
        } else if (payload.eventType === 'DELETE') {
          setData(prev => prev.filter(item => item.id !== (payload.old as { id: string }).id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
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
    .update({ status, ...(progress !== undefined ? { progress } : {}) })
    .eq('id', id);
}

/**
 * Reply to a comment — no-op since comments table does not exist.
 * Kept for API compatibility with engagement.tsx.
 */
export async function updateCommentReply(_id: string, _reply_text: string) {
  return { data: null, error: null };
}
