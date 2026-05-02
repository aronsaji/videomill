export type OrderStatus = 
  | 'queued' 
  | 'script_generation' 
  | 'rendering' 
  | 'uploading' 
  | 'published' 
  | 'analyzing'
  | 'optimizing'
  | 'failed' 
  | 'needs_attention';

export type ErrorType = 
  | 'RENDERING_ERROR' 
  | 'NETWORK_TRANSIENT' 
  | 'UPLOAD_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'INPUT_VALIDATION_ERROR'
  | 'UNKNOWN'
  | null;

export type Platform = 'tiktok' | 'youtube' | 'instagram' | 'shorts';

export interface Order {
  id: string;
  video_id: string;
  title: string;
  topic: string;
  category: string;
  visual_style: string;
  style_tone: string;
  target_audience: string;
  video_format: string;
  ai_voice: string;
  language: string;
  duration: number;
  platform_destinations: Platform[];
  custom_instructions: string | null;
  status: OrderStatus;
  error_type: ErrorType;
  retry_count: number;
  progress: number;
  sub_status: string | null;
  script: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  metadata: Record<string, unknown> | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TrendingTopic {
  id: string;
  title: string;
  description: string;
  tags: string[];
  source: 'tiktok' | 'youtube' | 'google';
  heat: number;
  rank: number;
  viral_score: number;
  active: boolean;
  created_at: string;
}

export interface PerformanceSnapshot {
  id: string;
  order_id: string;
  snapshot_day: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watch_time_seconds: number;
  ctr: number;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Order>;
      };
      trending_topics: {
        Row: TrendingTopic;
        Insert: Omit<TrendingTopic, 'id' | 'created_at'>;
        Update: Partial<TrendingTopic>;
      };
      performance_snapshots: {
        Row: PerformanceSnapshot;
        Insert: Omit<PerformanceSnapshot, 'id' | 'created_at'>;
        Update: Partial<PerformanceSnapshot>;
      };
    };
  };
}
