import { useState } from 'react';
import { Play, Flame, TrendingUp, CheckCircle, Loader2, Users, Hash } from 'lucide-react';
import { useTrends, createOrder } from '../lib/hooks/uselivedata';
import { useAuth } from '../contexts/authContext';
import { supabase } from '../lib/supabaseClient';
import { useLanguage } from '../contexts/languageContext';

function TikTokIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
    </svg>
  );
}

function YouTubeIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function InstagramIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  );
}

export default function Studio() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { data: trends, loading: trendsLoading, refresh: refreshTrends } = useTrends();

  const [generating, setGenerating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const nb = language === 'nb';

  const defaultTrends = [
    { id: '1', title: 'AI Agent Automatisering', heat_level: 'fire', viral_score: 98, platform: 'tiktok', target_audience: '18-35', growth_stat: '+340%', category: 'tech', tags: ['ai', 'automation'] },
    { id: '2', title: 'De 10 beste AI-verktøy', heat_level: 'fire', viral_score: 95, platform: 'youtube', target_audience: '25-45', growth_stat: '+280%', category: 'tech', tags: ['tools', 'productivity'] },
    { id: '3', title: 'Hvordan tjene på AI', heat_level: 'hot', viral_score: 92, platform: 'instagram', target_audience: '22-40', growth_stat: '+250%', category: 'business', tags: ['money', 'sidehustle'] },
    { id: '4', title: 'Claude vs GPT-4', heat_level: 'hot', viral_score: 89, platform: 'tiktok', target_audience: '18-35', growth_stat: '+200%', category: 'tech', tags: ['ai', 'comparison'] },
  ];

  const displayTopics = trends.length > 0 ? trends : defaultTrends;

  const getPlatformIcon = (p: string) => {
    const pl = (p || '').toLowerCase();
    if (pl.includes('tiktok')) return <TikTokIcon />;
    if (pl.includes('youtube')) return <YouTubeIcon />;
    if (pl.includes('instagram')) return <InstagramIcon />;
    return <TrendingUp size={14} />;
  };

  const getPlatformColor = (p: string) => {
    const pl = (p || '').toLowerCase();
    if (pl.includes('tiktok')) return { icon: 'text-[#FE2C55]', bg: 'bg-[#FE2C55]' };
    if (pl.includes('youtube')) return { icon: 'text-[#FF0000]', bg: 'bg-[#FF0000]' };
    if (pl.includes('instagram')) return { icon: 'text-[#E4405F]', bg: 'bg-[#E4405F]' };
    return { icon: 'text-[#1D9BF0]', bg: 'bg-[#1D9BF0]' };
  };

  const handleCreate = async (topic: typeof displayTopics[0]) => {
    if (!user || generating) return;

    setSelectedId(topic.id);
    setGenerating(true);

    try {
      const { data: order, error } = await createOrder({
        user_id: user.id,
        topic: topic.title,
        title: topic.title.slice(0, 80),
        promp: `Lag en-engasjerende video om: ${topic.title}. ${topic.growth_stat || ''}`,
        platform: topic.platform || 'tiktok',
        language: 'nb',
        voice_id: 'XB0fDUnXU5powFXDhCwa',
        aspect_ratio: '9:16',
      });

      if (error) throw error;

      if (order) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trigger-n8n`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'new_order',
                video_id: order.id,
                title: topic.title,
                topic: topic.title,
                language: 'nb',
                platform: topic.platform || 'tiktok',
                promp: topic.title,
voice_id: 'nb-NO-PernilleNeural',
                aspect_ratio: '9:16',
              }),
            }
          );
        }
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.hash = 'library';
      }, 2000);

    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <CheckCircle size={48} className="text-[#1D9BF0] mb-4" />
        <h2 className="text-xl font-bold text-[#E7E9EA] mb-2">Bestilt!</h2>
        <p className="text-[#8B98A5]">Går til biblioteket...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-[#E7E9EA]">
          <Flame size={28} className="inline text-orange-500 mr-2" />
          {nb ? 'Hotte Trender' : 'Hot Trends'}
        </h1>
        <p className="text-sm text-[#8B98A5] mt-1">
          {nb ? 'Klikk på en trend for å bestille video' : 'Click a trend to order video'}
        </p>
      </div>

      {/* Trend Cards - Simple grid */}
      <div className="grid grid-cols-1 gap-3">
        {displayTopics.slice(0, 8).map((topic: any) => {
          const pf = getPlatformColor(topic.platform);
          const isSelected = selectedId === topic.id;
          const isGenerating = generating && isSelected;

          return (
            <button
              key={topic.id}
              onClick={() => handleCreate(topic)}
              disabled={generating}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                isSelected 
                  ? 'bg-[#1D9BF0]/10 border-[#1D9BF0]/50' 
                  : 'bg-[#15202B] border-[#38444D] hover:border-[#1D9BF0]/30'
              } ${generating ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start gap-4">
                {/* Platform icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${pf.bg}/15 ${pf.icon}`}>
                  {getPlatformIcon(topic.platform)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title + Score */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[#E7E9EA] truncate">{topic.title}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${topic.viral_score >= 90 ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {topic.viral_score}%
                    </span>
                  </div>

                  {/* Details row */}
                  <div className="flex items-center gap-3 text-xs text-[#8B98A5] flex-wrap">
                    {/* Growth */}
                    <span className="flex items-center gap-1">
                      <TrendingUp size={12} />
                      {topic.growth_stat || '+100%'}
                    </span>
                    
                    {/* Platform */}
                    <span className={`flex items-center gap-1 capitalize ${pf.icon}`}>
                      {getPlatformIcon(topic.platform)}
                      {topic.platform}
                    </span>

                    {/* Audience */}
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {topic.target_audience || '18-35'}
                    </span>
                  </div>

                  {/* Tags */}
                  {topic.tags && topic.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {topic.tags.slice(0, 4).map((tag: string) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[#192734] text-[#8B98A5]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Play button */}
                <div className="flex-shrink-0">
                  {isGenerating ? (
                    <Loader2 size={20} className="text-[#1D9BF0] animate-spin" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#1D9BF0] flex items-center justify-center">
                      <Play size={16} className="text-white ml-0.5" fill="currentColor" />
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Refresh */}
      <div className="mt-6 text-center">
        <button 
          onClick={() => refreshTrends()}
          disabled={trendsLoading}
          className="text-sm text-[#8B98A5] hover:text-[#1D9BF0] transition-colors"
        >
          {nb ? 'Oppdater trender ↻' : 'Refresh trends ↻'}
        </button>
      </div>
    </div>
  );
}