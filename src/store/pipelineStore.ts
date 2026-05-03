import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Order, TrendingTopic } from '../types';

const IS_MOCK = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

const MOCK_ORDERS: Order[] = [
  {
    id: '1', video_id: 'VM-8291', title: 'AI overtaking software jobs in 2026',
    topic: 'AI Jobs', category: 'Tech', visual_style: 'cyber', style_tone: 'Informative', target_audience: 'Tech', video_format: '9:16 (Vertical)', ai_voice: 'nova', language: 'Norsk',
    duration: 60, platform_destinations: ['tiktok', 'shorts'], custom_instructions: null,
    status: 'rendering', error_type: null, retry_count: 0, progress: 65,
    sub_status: 'Stitching clips with FFmpeg...', script: null, video_url: null,
    thumbnail_url: null, metadata: null, user_id: 'sys', created_at: new Date(Date.now() - 120000).toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: '2', video_id: 'VM-8290', title: 'Tesla Robotaxi launch reaction',
    topic: 'Tesla', category: 'Tech', visual_style: 'news', style_tone: 'Engaging', target_audience: 'Adults (25-45)', video_format: '16:9 (Horizontal)', ai_voice: 'echo', language: 'Engelsk',
    duration: 45, platform_destinations: ['youtube', 'instagram'], custom_instructions: null,
    status: 'script_generation', error_type: null, retry_count: 0, progress: 20,
    sub_status: 'Generating hook with Groq LLaMA 3.1...', script: null, video_url: null,
    thumbnail_url: null, metadata: null, user_id: 'sys', created_at: new Date(Date.now() - 60000).toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: '3', video_id: 'VM-8289', title: 'The Quiet Luxury trend explained',
    topic: 'Fashion', category: 'Lifestyle', visual_style: 'minimal', style_tone: 'Viral', target_audience: 'Youth (18-25)', video_format: '9:16 (Vertical)', ai_voice: 'shimmer', language: 'Svensk',
    duration: 30, platform_destinations: ['tiktok', 'instagram'], custom_instructions: null,
    status: 'published', error_type: null, retry_count: 0, progress: 100,
    sub_status: null, script: null, video_url: 'https://example.com/vid1.mp4',
    thumbnail_url: null, metadata: { views: 12400, likes: 890 }, user_id: 'sys',
    created_at: new Date(Date.now() - 3600000).toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: '4', video_id: 'VM-8288', title: 'Top 5 crypto picks this week',
    topic: 'Crypto', category: 'Finance', visual_style: 'dynamic', style_tone: 'Dramatic', target_audience: 'Business', video_format: '16:9 (Horizontal)', ai_voice: 'fable', language: 'Norsk',
    duration: 90, platform_destinations: ['youtube'], custom_instructions: null,
    status: 'failed', error_type: 'RENDERING_ERROR', retry_count: 2, progress: 48,
    sub_status: 'FFmpeg process timed out', script: null, video_url: null,
    thumbnail_url: null, metadata: null, user_id: 'sys',
    created_at: new Date(Date.now() - 7200000).toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: '5', video_id: 'VM-8287', title: 'Best AI tools for developers 2026',
    topic: 'Developer Tools', category: 'Tech', visual_style: 'cyber', style_tone: 'Inspiring', target_audience: 'Tech', video_format: '9:16 (Vertical)', ai_voice: 'nova', language: 'Engelsk',
    duration: 60, platform_destinations: ['youtube', 'tiktok'], custom_instructions: null,
    status: 'queued', error_type: null, retry_count: 0, progress: 0,
    sub_status: 'Waiting in queue...', script: null, video_url: null,
    thumbnail_url: null, metadata: null, user_id: 'sys',
    created_at: new Date(Date.now() - 300000).toISOString(), updated_at: new Date().toISOString()
  },
];

const MOCK_TRENDS: TrendingTopic[] = [
  { id: 't1', title: 'OpenAI GPT-5 announced', description: 'GPT-5 is reportedly 10x smarter than GPT-4. The internet is exploding.', tags: ['ai', 'openai', 'tech'], source: 'youtube', heat: 98, rank: 1, viral_score: 98, active: true, created_at: new Date().toISOString() },
  { id: 't2', title: '#QuietLuxury aesthetics 2026', description: 'Minimalist fashion trend taking over TikTok FYP globally.', tags: ['fashion', 'lifestyle', 'trending'], source: 'tiktok', heat: 91, rank: 2, viral_score: 91, active: true, created_at: new Date().toISOString() },
  { id: 't3', title: 'Tesla Robotaxi goes live', description: 'Elon Musk announces full self-driving Robotaxi service in 3 cities.', tags: ['tesla', 'tech', 'ev'], source: 'google', heat: 87, rank: 3, viral_score: 87, active: true, created_at: new Date().toISOString() },
  { id: 't4', title: 'Crypto bull run Q2 2026', description: 'Bitcoin breaks $200K, altcoin season in full swing.', tags: ['crypto', 'bitcoin', 'finance'], source: 'youtube', heat: 82, rank: 4, viral_score: 82, active: true, created_at: new Date().toISOString() },
  { id: 't5', title: 'AI vs Human art debate', description: 'Major art galleries banning AI-generated art sparks massive online debate.', tags: ['ai', 'art', 'controversy'], source: 'tiktok', heat: 76, rank: 5, viral_score: 76, active: true, created_at: new Date().toISOString() },
  { id: 't6', title: 'Remote work comeback 2026', description: 'Big tech reverses RTO policies after productivity studies.', tags: ['work', 'tech', 'business'], source: 'google', heat: 71, rank: 6, viral_score: 71, active: true, created_at: new Date().toISOString() },
];

interface StoreState {
  orders: Order[];
  trends: TrendingTopic[];
  isLoading: boolean;
  fetchInitialData: () => Promise<void>;
  subscribeToChanges: () => void;
  addOrder: (orderData: Partial<Order>) => void;
}

export const usePipelineStore = create<StoreState>((set, get) => ({
  orders: [],
  trends: [],
  isLoading: false,

  addOrder: async (orderData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newOrder: Order = {
      id: Math.random().toString(36).substring(7),
      video_id: `VM-${Math.floor(Math.random() * 1000) + 8000}`,
      title: orderData.title || 'Automated Trend Video',
      topic: orderData.topic || '',
      category: orderData.category || 'Tech',
      visual_style: orderData.visual_style || 'cyber',
      style_tone: orderData.style_tone || 'Auto',
      target_audience: orderData.target_audience || 'Auto',
      video_format: orderData.video_format || 'Auto',
      ai_voice: orderData.ai_voice || 'nova',
      language: orderData.language || 'Norsk',
      duration: 60,
      platform_destinations: orderData.platform_destinations || ['tiktok', 'youtube'],
      status: 'queued',
      progress: 0,
      retry_count: 0,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...orderData
    } as Order;

    set(state => ({ orders: [newOrder, ...state.orders] }));

    if (!IS_MOCK) {
      try {
        const { id, user_id, ...orderWithoutIds } = newOrder; // Remove invalid mock IDs
        const { error } = await supabase.from('orders').insert(orderWithoutIds as any);
        if (error) {
          console.error('Failed to insert order to Supabase:', error);
        }
      } catch (err) {
        console.error('Error inserting order:', err);
      }
    }
  },

  fetchInitialData: async () => {
    set({ isLoading: true });
    if (IS_MOCK) {
      set({ orders: MOCK_ORDERS, trends: MOCK_TRENDS, isLoading: false });
      return;
    }
    try {
      const [ordersRes, trendsRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('trending_topics').select('*').eq('active', true).order('viral_score', { ascending: false }).limit(20),
      ]);
      set({
        orders: (ordersRes.data as Order[]) || [],
        trends: (trendsRes.data as TrendingTopic[]) || [],
        isLoading: false,
      });
    } catch (e) {
      console.error('Fetch error:', e);
      set({ orders: MOCK_ORDERS, trends: MOCK_TRENDS, isLoading: false });
    }
  },

  subscribeToChanges: () => {
    if (IS_MOCK) return;
    try {
      supabase.channel('db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
          const { orders } = get();
          if (payload.eventType === 'INSERT') {
            set({ orders: [payload.new as Order, ...orders] });
          } else if (payload.eventType === 'UPDATE') {
            set({ orders: orders.map(o => o.id === payload.new.id ? payload.new as Order : o) });
          } else if (payload.eventType === 'DELETE') {
            set({ orders: orders.filter(o => o.id !== (payload.old as Order).id) });
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'trending_topics' }, (payload) => {
          const { trends } = get();
          if (payload.eventType === 'INSERT') {
            set({ trends: [...trends, payload.new as TrendingTopic].sort((a, b) => b.viral_score - a.viral_score) });
          } else if (payload.eventType === 'UPDATE') {
            set({ trends: trends.map(t => t.id === payload.new.id ? payload.new as TrendingTopic : t) });
          } else if (payload.eventType === 'DELETE') {
            set({ trends: trends.filter(t => t.id !== (payload.old as TrendingTopic).id) });
          }
        })
        .subscribe();
    } catch (e) {
      console.error('Subscription error:', e);
    }
  },
}));
