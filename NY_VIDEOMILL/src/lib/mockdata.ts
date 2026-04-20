import { Trend, Video, VideoDistribution, Comment, AnalyticsSnapshot } from './types';

// ─────────────────────────────────────────────────────────────
// Mock Trending Topics — matches actual trending_topics table schema
// ─────────────────────────────────────────────────────────────
export const mockTrends: Trend[] = [
  {
    id: '1',
    title: '5 AI Agents som gjor jobben din på 10 minutter',
    platform: 'youtube',
    viral_score: 94,
    growth_stat: '+340% siste 48t',
    heat_level: 'high',
    tags: ['AI', 'Produktivitet', 'Automatisering'],
    active: true,
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    target_audience: 'tech-entusiaster',
    category: 'tech',
  },
  {
    id: '2',
    title: 'Morning Routine Hack som sparer 2 timer hver dag',
    platform: 'tiktok',
    viral_score: 88,
    growth_stat: '+190% siste 24t',
    heat_level: 'high',
    tags: ['Produktivitet', 'Rutine', 'Livsstil'],
    active: true,
    updated_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    target_audience: 'produktivitets-entusiaster',
    category: 'motivation',
  },
  {
    id: '3',
    title: 'ChatGPT gjør dette 1000x bedre enn Google',
    platform: 'youtube',
    viral_score: 82,
    growth_stat: '+120% siste 24t',
    heat_level: 'medium',
    tags: ['AI', 'ChatGPT', 'Tech'],
    active: true,
    updated_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    target_audience: 'tech-entusiaster',
    category: 'tech',
  },
  {
    id: '4',
    title: 'Norske startups som tar verden med storm i 2025',
    platform: 'google',
    viral_score: 76,
    growth_stat: '+85% siste 3 dager',
    heat_level: 'medium',
    tags: ['Startup', 'Norge', 'Business'],
    active: true,
    updated_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    target_audience: 'gründere',
    category: 'finance',
  },
  {
    id: '5',
    title: 'Disse 3 investerings-appene gjor meg rik på 6 måneder',
    platform: 'tiktok',
    viral_score: 71,
    growth_stat: '+60% siste 24t',
    heat_level: 'medium',
    tags: ['Investering', 'Finans', 'Apps'],
    active: true,
    updated_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    target_audience: 'investorer',
    category: 'finance',
  },
  {
    id: '6',
    title: 'Slik bruker du Notion som en proff i 2025',
    platform: 'youtube',
    viral_score: 68,
    growth_stat: '+45% siste 48t',
    heat_level: 'low',
    tags: ['Produktivitet', 'Notion', 'Verktøy'],
    active: true,
    updated_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    target_audience: 'produktivitets-entusiaster',
    category: 'tech',
  },
];

// ─────────────────────────────────────────────────────────────
// Mock Videos — matches actual videos table schema
// (used for both productions and orders)
// ─────────────────────────────────────────────────────────────
export const mockProductions: Video[] = [
  {
    id: 'p1',
    user_id: 'mock-user',
    title: 'Slik bruker du Notion som en proff i 2025',
    topic: 'Notion Productivity',
    voice_id: 'nb-NO-Pernille',
    voice: 'Pernille',
    category: null,
    video_style: null,
    style_preset: null,
    duration: null,
    duration_seconds: null,
    language: 'nb',
    platforms: ['youtube'],
    platform: 'youtube',
    status: 'editing',
    retry_count: 0,
    views: 0,
    video_url: null,
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    date: null,
    metadata: null,
    aspect_ratio: '9:16',
    target_audience: 'produktivitets-entusiaster',
    script_instructions: null,
    captions_enabled: true,
    captions_style: null,
    captions_color: null,
    progress: 78,
    sub_status: 'rendering',
    callback_url: null,
    series_id: null,
    promp: null,
  },
  {
    id: 'p2',
    user_id: 'mock-user',
    title: 'ChatGPT gjør dette 1000x bedre enn Google',
    topic: 'ChatGPT vs Google',
    voice_id: 'nb-NO-Finn',
    voice: 'Finn',
    category: null,
    video_style: null,
    style_preset: null,
    duration: null,
    duration_seconds: null,
    language: 'nb',
    platforms: ['youtube'],
    platform: 'youtube',
    status: 'recording',
    retry_count: 0,
    views: 0,
    video_url: null,
    created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    date: null,
    metadata: null,
    aspect_ratio: '16:9',
    target_audience: 'tech-entusiaster',
    script_instructions: null,
    captions_enabled: true,
    captions_style: null,
    captions_color: null,
    progress: 45,
    sub_status: null,
    callback_url: null,
    series_id: null,
    promp: null,
  },
  {
    id: 'p3',
    user_id: 'mock-user',
    title: 'Top 10 VS Code Extensions 2025',
    topic: 'VS Code',
    voice_id: 'nb-NO-Pernille',
    voice: 'Pernille',
    category: null,
    video_style: null,
    style_preset: null,
    duration: null,
    duration_seconds: null,
    language: 'nb',
    platforms: ['youtube'],
    platform: 'youtube',
    status: 'scripting',
    retry_count: 0,
    views: 0,
    video_url: null,
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    date: null,
    metadata: null,
    aspect_ratio: '16:9',
    target_audience: 'utviklere',
    script_instructions: null,
    captions_enabled: true,
    captions_style: null,
    captions_color: null,
    progress: 20,
    sub_status: null,
    callback_url: null,
    series_id: null,
    promp: null,
  },
  {
    id: 'p4',
    user_id: 'mock-user',
    title: 'Slik tjener du penger på YouTube uten å vise ansiktet',
    topic: 'Faceless YouTube',
    voice_id: 'nb-NO-Iselin',
    voice: 'Iselin',
    category: null,
    video_style: null,
    style_preset: null,
    duration: 387,
    duration_seconds: 387,
    language: 'nb',
    platforms: ['youtube', 'tiktok'],
    platform: 'youtube',
    status: 'complete',
    retry_count: 0,
    views: 8432,
    video_url: 'https://example.com/video1.mp4',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    date: null,
    metadata: {
      thumbnail: 'https://images.pexels.com/photos/3153198/pexels-photo-3153198.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    aspect_ratio: '9:16',
    target_audience: 'content-skapere',
    script_instructions: null,
    captions_enabled: true,
    captions_style: null,
    captions_color: null,
    progress: 100,
    sub_status: null,
    callback_url: null,
    series_id: null,
    promp: null,
  },
];

/** Alias so existing imports of mockVideos still work */
export const mockVideos: Video[] = mockProductions;

// ─────────────────────────────────────────────────────────────
// Mock Distributions (stub — video_distributions table doesn't exist yet)
// ─────────────────────────────────────────────────────────────
export const mockDistributions: (VideoDistribution & { videoTitle: string })[] = [
  { id: 'd1', video_id: 'p4', videoTitle: 'Slik tjener du penger på YouTube uten å vise ansiktet', platform: 'YouTube', status: 'live', external_url: '#', views: 8432, likes: 612, posted_at: new Date(Date.now() - 1000 * 60 * 40).toISOString() },
  { id: 'd2', video_id: 'p4', videoTitle: 'Slik tjener du penger på YouTube uten å vise ansiktet', platform: 'TikTok', status: 'live', external_url: '#', views: 24100, likes: 2890, posted_at: new Date(Date.now() - 1000 * 60 * 38).toISOString() },
];

// ─────────────────────────────────────────────────────────────
// Mock Comments (stub — comments table doesn't exist yet)
// ─────────────────────────────────────────────────────────────
export const mockComments: (Comment & { videoTitle: string })[] = [
  { id: 'c1', video_id: 'p4', videoTitle: 'Slik tjener du penger på YouTube uten å vise ansiktet', platform: 'YouTube', author: 'TechNerd92', text: 'Fantastisk video! Kan du lage en om Faceless YouTube på norsk?', sentiment: 'positive', replied: true, reply_text: 'Takk! Ja, en mer dyptgående guide kommer neste uke!', posted_at: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
  { id: 'c2', video_id: 'p4', videoTitle: 'Slik tjener du penger på YouTube uten å vise ansiktet', platform: 'TikTok', author: 'marieeriksen', text: 'Stemmen er litt robotaktig. Ellers bra innhold!', sentiment: 'neutral', replied: false, reply_text: null, posted_at: new Date(Date.now() - 1000 * 60 * 35).toISOString() },
];

// ─────────────────────────────────────────────────────────────
// Mock Analytics
// ─────────────────────────────────────────────────────────────
export const mockAnalytics: { date: string; views: number; likes: number; shares: number }[] = [
  { date: '11. apr', views: 4200,  likes: 380,  shares: 90  },
  { date: '12. apr', views: 6800,  likes: 540,  shares: 140 },
  { date: '13. apr', views: 5100,  likes: 420,  shares: 110 },
  { date: '14. apr', views: 9400,  likes: 810,  shares: 220 },
  { date: '15. apr', views: 12800, likes: 1120, shares: 340 },
  { date: '16. apr', views: 18200, likes: 1640, shares: 490 },
  { date: '17. apr', views: 24100, likes: 2210, shares: 670 },
];

/** @deprecated — Platform type removed. Use UserSocialAccount instead. */
export const mockPlatforms = [
  { id: 'pl1', name: 'YouTube',   connected: true,  account_name: '@VideoMillNO' },
  { id: 'pl2', name: 'TikTok',    connected: true,  account_name: '@videomill'   },
  { id: 'pl3', name: 'Instagram', connected: false, account_name: ''             },
];

// Re-export AnalyticsSnapshot type for legacy compatibility
export type { AnalyticsSnapshot };
