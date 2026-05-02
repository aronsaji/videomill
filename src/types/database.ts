export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      videos: {
        Row: {
          id: string
          video_id: string
          title: string
          topic: string | null
          status: 'idle' | 'scripting' | 'queued' | 'complete' | 'failed'
          sub_status: string | null
          progress: number
          platform: string
          aspect_ratio: string
          language: string
          target_audience: string | null
          views: number
          video_url: string | null
          metadata: Json | null
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          video_id: string
          title: string
          topic?: string | null
          status?: 'idle' | 'scripting' | 'queued' | 'complete' | 'failed'
          sub_status?: string | null
          progress?: number
          platform?: string
          aspect_ratio?: string
          language?: string
          target_audience?: string | null
          views?: number
          video_url?: string | null
          metadata?: Json | null
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          video_id?: string
          title?: string
          topic?: string | null
          status?: 'idle' | 'scripting' | 'queued' | 'complete' | 'failed'
          sub_status?: string | null
          progress?: number
          platform?: string
          aspect_ratio?: string
          language?: string
          target_audience?: string | null
          views?: number
          video_url?: string | null
          metadata?: Json | null
          created_at?: string
          user_id?: string
        }
      }
      trending_topics: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          viral_score: number
          heat_level: 'fire' | 'hot' | 'rising' | 'stable'
          growth_stat: string | null
          tags: string[]
          platform: string
          target_audience: string | null
          active: boolean
          status: 'pending' | 'processing' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: string
          viral_score: number
          heat_level: 'fire' | 'hot' | 'rising' | 'stable'
          growth_stat?: string | null
          tags?: string[]
          platform: string
          target_audience?: string | null
          active?: boolean
          status?: 'pending' | 'processing' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          viral_score?: number
          heat_level?: 'fire' | 'hot' | 'rising' | 'stable'
          growth_stat?: string | null
          tags?: string[]
          platform?: string
          target_audience?: string | null
          active?: boolean
          status?: 'pending' | 'processing' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
