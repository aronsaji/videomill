import { useState } from 'react';
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
  youtube:   'text-red-400 bg-red-500/10',
  tiktok:    'text-pink-400 bg-pink-500/10',
  google:    'text-blue-400 bg-blue-500/10',
  instagram: 'text-purple-400 bg-purple-500/10',
  desktop:   'text-blue-400 bg-blue-500/10',
};

const heatColors: Record<string, string> = {
  fire:   'text-orange-400 bg-orange-500/10 border-orange-500/20',
  hot:    'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  rising: 'text-teal-400   bg-teal-500/10   border-teal-500/20',
  high:   'text-orange-400 bg-orange-500/10 border-orange-500/20',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  low:    'text-white/40  bg-white/5        border-white/10',
};

interface Props {
  onNavigate?: (page: Page) => void;
}

export default function Trends({ onNavigate }: Props) {
  const { t } = useLanguage();
  const { data: trends, loading } = useTrends();
  const [filter, setFilter] = useState<string>('all');

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
        <div className="flex gap-1 bg-white/4 p-1 rounded-xl border border-white/6 flex-wrap">
          {platforms.map(key => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === key
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/25'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {key === 'all' ? t.trends.all : key}
              <span className="ml-1.5 text-white/25">
                {key === 'all' ? trends.length : trends.filter(tr => normPlatform(tr.platform) === key).length}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-white/30">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          Live — oppdateres hver 6. time
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
        <div className="space-y-3">
          {filtered.map(trend => {
            const pk = normPlatform(trend.platform);
            return (
              <div key={trend.id} className="bg-[#111118] border border-white/6 rounded-xl p-5 hover:border-white/10 transition-all group">
                <div className="flex items-start gap-4">

                  {/* Score badge */}
                  <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border border-teal-500/20">
                    <span className="text-lg font-bold text-teal-400 leading-none">{trend.viral_score ?? '—'}</span>
                    <span className="text-[10px] text-teal-400/60 leading-none mt-0.5">{t.trends.score}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-white leading-snug mb-1">{trend.title}</h3>

                        {/* Growth stat / description */}
                        {trend.growth_stat && (
                          <p className="text-xs text-teal-400/70 leading-relaxed mb-2">
                            📈 {trend.growth_stat}
                          </p>
                        )}

                        {/* Tags row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Platform badge */}
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${platformColors[pk] ?? 'text-white/40 bg-white/5'}`}>
                            {platformIcon[pk]}
                            <span className="capitalize">{pk}</span>
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
                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full"
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
