export type ProductionStatus = 'pending' | 'queued' | 'scripting' | 'recording' | 'editing' | 'complete' | 'failed';
export type DistributionStatus = 'pending' | 'uploading' | 'live' | 'failed';
export type Sentiment = 'positive' | 'neutral' | 'negative';

/** Maps to actual Supabase table: trending_topics */
export interface Trend {
  id: string;
  platform: string | null;
  title: string;
  growth_stat: string | null;
  /** Was stored as 'rank' by old n8n; now correctly mapped to viral_score */
  viral_score: number;
  tags: string[] | null;
  heat_level: string | null;
  /** Target audience / who the content is for */
  target_audience: string | null;
  /** Category from Ollama (tech, motivation, history, …) */
  category: string | null;
  active: boolean;
  updated_at: string;
  created_at?: string;
}

/** Maps to actual Supabase table: videos (used for both orders and productions) */
export interface Video {
  id: string;
  user_id: string;
  title: string | null;
  topic: string | null;
  voice_id: string | null;
  voice: string | null;
  category: string | null;
  video_style: string | null;
  style_preset: string | null;
  duration: number | null;
  duration_seconds: number | null;
  language: string | null;
  platforms: string[] | null;
  platform: string | null;
  status: string;
  retry_count: number;
  views: number;
  video_url: string | null;
  /** Multi-format video URLs stored in metadata */
  metadata: Record<string, unknown> | null;
  created_at: string;
  date: string | null;
  aspect_ratio: string | null;
  target_audience: string | null;
  script_instructions: string | null;
  captions_enabled: boolean;
  captions_style: string | null;
  captions_color: string | null;
  progress: number;
  sub_status: string | null;
  callback_url: string | null;
  series_id: string | null;
  /** Note: column is named "promp" (without t) in the database */
  promp: string | null;
}

/** Production is an alias for Video — same table */
export type Production = Video;

/** Order is an alias for Video — orders are inserted as videos */
export type Order = Video;

export interface UserSocialAccount {
  id: string;
  user_id: string;
  platform: string;
  channel_id: string | null;
  access_token: string | null;
  refresh_token: string | null;
  created_at: string;
}

/** Stub type — video_distributions table does not exist in DB, kept for UI compatibility */
export interface VideoDistribution {
  id: string;
  video_id: string;
  platform: string;
  status: DistributionStatus;
  external_url: string | null;
  views: number;
  likes: number;
  posted_at: string | null;
}

/** Stub type — comments table does not exist in DB, kept for UI compatibility */
export interface Comment {
  id: string;
  video_id: string;
  platform: string;
  author: string;
  text: string;
  sentiment: Sentiment;
  replied: boolean;
  reply_text: string | null;
  posted_at: string;
}

export interface AnalyticsSnapshot {
  id: string;
  video_id: string;
  views: number;
  likes: number;
  comments_count: number;
  shares: number;
  date: string;
}

export type Page = 'dashboard' | 'trends' | 'production' | 'library' | 'distribution' | 'engagement' | 'analytics' | 'settings' | 'bestilling';
