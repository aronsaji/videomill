import { useState } from 'react';
import { RefreshCw, Play, TrendingUp, Youtube, Hash, Flame } from 'lucide-react';
import { useTrends, createProduction } from '../lib/hooks/uselivedata';
import { useAuth } from '../contexts/authContext';
import { useLanguage } from '../contexts/languageContext';
import { supabase } from '../lib/supabaseClient';
import type { Trend } from '../lib/types';

const platformIcon: Record<string, React.ReactNode> = {
  youtube:   <Youtube size={13} />,
  tiktok:    <Hash size={13} />,
  google:    <TrendingUp size={13} />,
  instagram: <Hash size={13} />,
};

const platformColors: Record<string, string> = {
  youtube:   'text-red-400 bg-red-500/10',
  tiktok:    'text-pink-400 bg-pink-500/10',
  google:    'text-blue-400 bg-blue-500/10',
  instagram: 'text-purple-400 bg-purple-500/10',
};

const heatColors: Record<string, string> = {
  high:   'text-orange-400 bg-orange-500/10 border-orange-500/20',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  low:    'text-white/40  bg-white/5        border-white/10',
};

export default function Trends() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data: trends, loading } = useTrends();
  const [filter, setFilter] = useState<string>('all');
  const [scanning, setScanning] = useState(false);
  const [initiating, setInitiating] = useState<string | null>(null);

  // Filter by platform
  const platforms = ['all', ...Array.from(new Set(trends.map(tr => tr.platform)))];
  const filtered = filter === 'all' ? trends : trends.filter(tr => tr.platform === filter);

  const handleInitProduction = async (trend: Trend) => {
    if (!user) return;
    setInitiating(trend.id);

    const { data: prod } = await createProduction({
      title:            trend.title,
      language:         'nb',
      user_id:          user.id,
      target_audience:  (trend.tags ?? []).join(', '),
      topic:            trend.title,
    });

    if (prod) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trigger-n8n`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action:       'init_production',
            video_id:     prod.id,
            title:        trend.title,
            topic:        trend.title,
            language:     'nb',
            trend_id:     trend.id,
            trend_tags:   trend.tags ?? [],
            viral_score:  trend.viral_score,
            heat_level:   trend.heat_level,
          }),
        });
      }
    }
    setInitiating(null);
  };

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 2500);
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
                {key === 'all' ? trends.length : trends.filter(tr => tr.platform === key).length}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500/15 border border-teal-500/25 text-teal-400 text-sm font-medium rounded-xl hover:bg-teal-500/25 disabled:opacity-60 transition-all"
        >
          <RefreshCw size={14} className={scanning ? 'animate-spin' : ''} />
          {scanning ? t.trends.scanning : t.trends.scanNow}
        </button>
      </div>

      {/* Scanning banner */}
      {scanning && (
        <div className="bg-teal-500/8 border border-teal-500/20 rounded-xl p-4 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <p className="text-sm text-teal-300">{t.trends.scanningMsg}</p>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-32 text-white/30 text-sm">{t.common.loading}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <TrendingUp size={32} className="text-white/15 mx-auto mb-3" />
          <p className="text-white/30 text-sm">{t.trends.noTrends}</p>
          <p className="text-white/20 text-xs mt-1">{t.trends.addedByN8n}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(trend => (
            <div key={trend.id} className="bg-[#111118] border border-white/6 rounded-xl p-5 hover:border-white/10 transition-all group">
              <div className="flex items-start gap-4">

                {/* Score badge */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border border-teal-500/20">
                  <span className="text-lg font-bold text-teal-400 leading-none">{trend.viral_score}</span>
                  <span className="text-[10px] text-teal-400/60 leading-none mt-0.5">{t.trends.score}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white leading-snug mb-1">{trend.title}</h3>

                      {/* Growth stat */}
                      {trend.growth_stat && (
                        <p className="text-xs text-teal-400/70 leading-relaxed mb-2">
                          📈 {trend.growth_stat}
                        </p>
                      )}

                      {/* Tags row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${platformColors[trend.platform] ?? 'text-white/40 bg-white/5'}`}>
                          {platformIcon[trend.platform]}
                          {trend.platform}
                        </span>

                        {trend.heat_level && (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${heatColors[trend.heat_level] ?? heatColors.low}`}>
                            <Flame size={10} />
                            {trend.heat_level}
                          </span>
                        )}

                        {(trend.tags ?? []).slice(0, 3).map((tag: string) => (
                          <span key={tag} className="text-xs bg-white/6 text-white/45 px-2 py-0.5 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleInitProduction(trend)}
                        disabled={initiating === trend.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 text-white text-xs font-semibold rounded-lg hover:bg-teal-400 disabled:opacity-60 transition-colors shadow-md shadow-teal-500/20"
                      >
                        {initiating === trend.id ? (
                          <RefreshCw size={12} className="animate-spin" />
                        ) : (
                          <Play size={12} fill="white" />
                        )}
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
                  style={{ width: `${Math.min(trend.viral_score, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
