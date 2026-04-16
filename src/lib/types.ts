export type TrendStatus = 'pending' | 'approved' | 'rejected' | 'in_production';
export type ProductionStatus = 'queued' | 'scripting' | 'recording' | 'editing' | 'complete' | 'failed';
export type DistributionStatus = 'pending' | 'uploading' | 'live' | 'failed';
export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface Trend {
  id: string;
  title: string;
  topic: string;
  platform: string;
  score: number;
  status: TrendStatus;
  vinkling: string;
  tags: string[];
  created_at: string;
}

export interface Production {
  id: string;
  trend_id: string | null;
  title: string;
  status: ProductionStatus;
  progress: number;
  language: string;
  audience: string;
  error_message: string | null;
  script: string | null;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  production_id: string;
  title: string;
  thumbnail_url: string;
  video_url_9x16: string;
  video_url_16x9: string;
  duration: number;
  created_at: string;
}

export interface Platform {
  id: string;
  name: string;
  connected: boolean;
  account_name: string;
  account_avatar: string;
}

export interface VideoDistribution {
  id: string;
  video_id: string;
  platform: string;
  status: DistributionStatus;
  external_url: string;
  views: number;
  likes: number;
  posted_at: string | null;
}

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

export type Page = 'dashboard' | 'trends' | 'production' | 'library' | 'distribution' | 'engagement' | 'analytics' | 'settings';
