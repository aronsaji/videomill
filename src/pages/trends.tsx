import { useState, useEffect } from 'react';
import { RefreshCw, Play, TrendingUp, Youtube, Instagram, Monitor, Flame, Users } from 'lucide-react';
import { useTrends } from '../lib/hooks/uselivedata';
import { useLanguage } from '../contexts/languageContext';
import { setPendingTrend } from '../lib/pendingTrend';
import type { Trend } from '../lib/types';
import type { Page } from '../lib/types';

function TikTokIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
    </svg>
  );
}

const platformIcon: Record<string, React.ReactNode> = {
  youtube:   <Youtube size={13} />,
  tiktok:    <TikTokIcon size={13} />,
  google:    <TrendingUp size={13} />,
  instagram: <Instagram size={13} />,
  desktop:   <Monitor size={13} />,
};

const platformColors: Record<string, string> = {
  youtube:   'text-[#FF0000] bg-[#FF0000]/10',
  tiktok:    'text-[#FE2C55] bg-[#FE2C55]/10',
  google:    'text-[#4285F4] bg-[#4285F4]/10',
  instagram: 'text-[#E4405F] bg-[#E4405F]/10',
  desktop:   'text-[#1D9BF0] bg-[#1D9BF0]/10',
};

const heatColors: Record<string, string> = {
  fire:   'text-violet-500 bg-violet-500/10 border-violet-500/20',
  hot:    'text-teal-500 bg-teal-500/10 border-teal-500/20',
  rising: 'text-[#8b5cf6]   bg-[#8b5cf6]/10   border-[#8b5cf6]/20',
  high:   'text-violet-500 bg-violet-500/10 border-violet-500/20',
  medium: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
  low:    'text-[#8B98A5]  bg-white/5        border-white/10',
};

interface Props {
  onNavigate?: (page: Page) => void;
}

export default function Trends({ onNavigate }: Props) {
  const { t } = useLanguage();
  const { data: trends, loading, refresh } = useTrends();
  const [filter, setFilter] = useState<string>('all');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
      setLastRefreshed(new Date());
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Normalize platform key for icon/color lookup
  const normPlatform = (p: string | null | undefined) => {
    if (!p) return 'desktop';
    const lp = p.toLowerCase().trim();
    if (lp.includes('tiktok'))    return 'tiktok';
    if (lp.includes('youtube'))   return 'youtube';
    if (lp.includes('instagram')) return 'instagram';
    if (lp.includes('google'))    return 'google';
    return 'desktop';
  };

  // Unique platforms for filter tabs
  const platforms = ['all', ...Array.from(new Set(trends.map(tr => normPlatform(tr.platform))))];
  const filtered  = filter === 'all' ? trends : trends.filter(tr => normPlatform(tr.platform) === filter);

  const handleStartProduction = (trend: Trend) => {
    setPendingTrend(trend);
    if (onNavigate) {
      onNavigate('bestilling');
    } else {
      // Fallback: hash navigation
      window.location.hash = 'bestilling';
    }
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1 bg-[#15202B] p-1 rounded-full flex-wrap">
          {platforms.map(key => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-1.5 rounded-full text-[14px] font-medium capitalize transition-all ${
                filter === key
                  ? 'bg-[#1D9BF0] text-white'
                  : 'text-[#8B98A5] hover:bg-white/5'
              }`}
            >
              {key === 'all' ? t.trends.all : key}
              <span className="ml-1.5 text-white/25">
                {key === 'all' ? trends.length : trends.filter(tr => normPlatform(tr.platform) === key).length}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-[#8B98A5]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#1D9BF0] animate-pulse" />
          <span className="hidden sm:inline">Sist oppdatert: {lastRefreshed.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}</span>
          <button
            onClick={() => { refresh(); setLastRefreshed(new Date()); }}
            disabled={loading}
            className="p-2 rounded-full hover:bg-white/5 text-[#8B98A5] hover:text-white transition-colors"
            title="Oppdater nå"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-32 text-white/30 text-sm gap-2">
          <RefreshCw size={16} className="animate-spin" /> {t.common.loading}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <TrendingUp size={32} className="text-white/15 mx-auto mb-3" />
          <p className="text-white/30 text-sm">{t.trends.noTrends}</p>
          <p className="text-white/20 text-xs mt-1">{t.trends.addedByN8n}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(trend => {
            const pk = normPlatform(trend.platform);
            return (
              <div key={trend.id} className="bg-[#15202B] border border-[#38444D] rounded-2xl p-4 hover:bg-[#192734] transition-all group">
                <div className="flex items-start gap-4">

                  {/* Platform Logo */}
                  <div className={`flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-xl ${platformColors[pk] ?? 'bg-[#1D9BF0]/10'}`}>
                    {platformIcon[pk]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        {/* Platform + Heat */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 text-[12px] font-bold px-2 py-0.5 rounded-full ${platformColors[pk] ?? 'text-white/40 bg-white/5'}`}>
                            {platformIcon[pk]}
                            <span className="capitalize">{pk}</span>
                          </span>
                          {trend.heat_level && (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${heatColors[trend.heat_level] ?? heatColors.low}`}>
                              <Flame size={10} />
                              {trend.heat_level}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-[15px] font-semibold text-[#E7E9EA] leading-snug mb-1">{trend.title}</h3>

                        {/* Growth stat / description */}
                        {trend.growth_stat && (
                          <p className="text-[13px] text-[#1D9BF0] leading-relaxed mb-2">
                            📈 {trend.growth_stat}
                          </p>
                        )}

                        {/* Tags row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Score */}
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#8B98A5]">
                            <span className="text-[#1D9BF0]">{trend.viral_score ?? '—'}</span>
                            {t.trends.score}
                          </span>

                          {/* Heat level */}
                          {trend.heat_level && (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${heatColors[trend.heat_level] ?? heatColors.low}`}>
                              <Flame size={10} />
                              {trend.heat_level}
                            </span>
                          )}

                          {/* Category */}
                          {trend.category && (
                            <span className="text-[10px] bg-white/6 text-white/35 px-2 py-0.5 rounded-full capitalize">
                              {trend.category}
                            </span>
                          )}

                          {/* Tags */}
                          {(trend.tags ?? []).slice(0, 3).map((tag: string) => (
                            <span key={tag} className="text-xs bg-white/6 text-white/45 px-2 py-0.5 rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* Target audience */}
                        {trend.target_audience && (
                          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-white/30">
                            <Users size={10} />
                            <span>{trend.target_audience}</span>
                          </div>
                        )}
                      </div>

                      {/* Action button — visible on hover */}
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleStartProduction(trend)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-teal-500 text-white text-xs font-semibold rounded-lg hover:bg-teal-400 transition-colors shadow-md shadow-teal-500/20"
                        >
                          <Play size={12} fill="white" />
                          {t.trends.initProduction}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Viral score bar */}
                <div className="mt-3 ml-16 h-1 bg-white/4 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
                    style={{ width: `${Math.min(trend.viral_score ?? 0, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
