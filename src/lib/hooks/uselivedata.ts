import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Trend, Production, Video, VideoDistribution, Comment } from '../types';

function useRealtimeTable<T extends { id: string }>(
  table: string,
  query: () => Promise<T[]>
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const result = await query();
    setData(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh().catch(err => {
      setError(err.message);
      setLoading(false);
    });

    const channel = supabase
      .channel(`${table}_changes_${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setData(prev => [payload.new as T, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setData(prev => prev.map(item => item.id === (payload.new as T).id ? payload.new as T : item));
        } else if (payload.eventType === 'DELETE') {
          setData(prev => prev.filter(item => item.id !== (payload.old as { id: string }).id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [table]);

  return { data, loading, error, refresh };
}

export function useTrends() {
  return useRealtimeTable<Trend>('trends', async () => {
    const { data, error } = await supabase
      .from('trends')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Trend[];
  });
}

export function useProductions() {
  return useRealtimeTable<Production>('productions', async () => {
    const { data, error } = await supabase
      .from('productions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Production[];
  });
}

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

export function useDistributions() {
  return useRealtimeTable<VideoDistribution>('video_distributions', async () => {
    const { data, error } = await supabase
      .from('video_distributions')
      .select('*')
      .order('posted_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as VideoDistribution[];
  });
}

export function useComments() {
  return useRealtimeTable<Comment>('comments', async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('posted_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Comment[];
  });
}

export async function updateTrendStatus(id: string, status: string) {
  return supabase.from('trends').update({ status }).eq('id', id);
}

export async function createProduction(data: {
  title: string;
  trend_id: string | null;
  language: string;
  audience: string;
  user_id: string;
}) {
  return supabase.from('productions').insert({ ...data, status: 'queued', progress: 0 }).select().single();
}

export async function updateCommentReply(id: string, reply_text: string) {
  return supabase.from('comments').update({ replied: true, reply_text }).eq('id', id);
}
