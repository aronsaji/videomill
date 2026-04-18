import { useMemo } from 'react';
import {
  TrendingUp, Film, Eye, Zap, ArrowUpRight,
  Clock, CheckCircle2, AlertCircle, Play, RefreshCw,
  Video, Flame,
} from 'lucide-react';
import { Page } from '../lib/types';
import { useTrends, useVideos } from '../lib/hooks/uselivedata';
import { useLanguage } from '../contexts/languageContext';
import StatusBadge from '../components/statusbadge';
import { setPendingTrend } from '../lib/pendingTrend';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return 'Nå nettopp';
  if (m < 60) return `${m}m siden`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}t siden`;
  return `${Math.floor(h / 24)}d siden`;
}

const STATUS_ACTIVE = ['pending', 'queued', 'scripting', 'recording', 'editing'];

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { t } = useLanguage();
  const { data: trends, loading: trendsLoading } = useTrends();
  const { data: videos,  loading: videosLoading, refresh: refreshVideos } = useVideos();

  const loading = trendsLoading || videosLoading;

  // ── Live stats ──
  const totalViews       = useMemo(() => videos.reduce((s, v) => s + (v.views ?? 0), 0), [videos]);
  const completedVideos  = useMemo(() => videos.filter(v => v.status === 'complete').length, [videos]);
  const activeProductions = useMemo(() => videos.filter(v => STATUS_ACTIVE.includes(v.status)).length, [videos]);
  const hotTrends        = useMemo(() => trends.filter(tr => tr.heat_level === 'fire' || tr.heat_level === 'hot').length, [trends]);

  // ── Chart: videos created last 7 days ──
  const chartData = useMemo(() => {
    const days: { label: string; count: number; views: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayVideos = videos.filter(v => v.created_at?.startsWith(key));
      days.push({
        label: d.toLocaleDateString('nb-NO', { weekday: 'short' }),
        count: dayVideos.length,
        views: dayVideos.reduce((s, v) => s + (v.views ?? 0), 0),
      });
    }
    return days;
  }, [videos]);

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  // ── Best videos (completed, sorted by views) ──
  const bestVideos = useMemo(() =>
    videos
      .filter(v => v.status === 'complete')
      .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
      .slice(0, 4),
    [videos]
  );

  // ── Recent active productions ──
  const recentProductions = useMemo(() =>
    videos
      .filter(v => STATUS_ACTIVE.includes(v.status))
      .slice(0, 5),
    [videos]
  );

  // ── Hot trends ──
  const topTrends = useMemo(() =>
    trends.slice(0, 4),
    [trends]
  );

  const stats = [
    {
      label: 'Totale visninger',
      value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews.toString(),
      icon: <Eye size={18} />,
      color: 'teal',
      sub: 'alle videoer',
    },
    {
      label: 'Ferdige videoer',
      value: completedVideos.toString(),
      icon: <Video size={18} />,
      color: 'blue',
      sub: `${videos.length} totalt`,
    },
    {
      label: 'Under produksjon',
      value: activeProductions.toString(),
      icon: <Film size={18} />,
      color: 'orange',
      sub: activeProductions > 0 ? 'Kjører nå' : 'Ingen aktive',
    },
    {
      label: 'Varme trender',
      value: hotTrends.toString(),
      icon: <TrendingUp size={18} />,
      color: 'cyan',
      sub: `${trends.length} trender totalt`,
    },
  ];

  return (
    <div className="space-y-5">

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-[#111118] border border-white/6 rounded-xl p-4 sm:p-5 hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/40 text-[11px] font-medium uppercase tracking-wider leading-tight">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                stat.color === 'teal'   ? 'bg-teal-500/15 text-teal-400' :
                stat.color === 'blue'  ? 'bg-blue-500/15 text-blue-400' :
                stat.color === 'orange'? 'bg-orange-500/15 text-orange-400' :
                                         'bg-cyan-500/15 text-cyan-400'
              }`}>
                {stat.icon}
              </div>
            </div>
            {loading
              ? <div className="h-8 w-16 bg-white/5 rounded animate-pulse" />
              : <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{stat.value}</div>
            }
            <div className="text-xs text-white/30 mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Chart + Pipeline ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Chart */}
        <div className="lg:col-span-2 bg-[#111118] border border-white/6 rounded-xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-white">Videoer produsert — siste 7 dager</h2>
              <p className="text-xs text-white/35 mt-0.5">Antall bestillinger per dag</p>
            </div>
            <div className="flex items-center gap-2">
              {loading && <RefreshCw size={12} className="text-white/30 animate-spin" />}
              <button
                onClick={() => refreshVideos()}
                className="p-1.5 rounded-lg hover:bg-white/8 text-white/30 hover:text-white/60 transition-colors"
              >
                <RefreshCw size={12} />
              </button>
            </div>
          </div>

          {videos.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center h-28 gap-2">
              <Film size={24} className="text-white/15" />
              <p className="text-xs text-white/25">Ingen videoer ennå — bestill din første!</p>
            </div>
          ) : (
            <div className="flex items-end gap-2 sm:gap-3 h-32">
              {chartData.map(day => (
                <div key={day.label} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-[10px] text-white/40 font-medium">
                    {day.count > 0 ? day.count : ''}
                  </div>
                  <div className="w-full flex flex-col justify-end" style={{ height: '72px' }}>
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        day.count > 0
                          ? 'bg-gradient-to-t from-teal-500/70 to-teal-400/90'
                          : 'bg-white/5'
                      }`}
                      style={{ height: `${day.count > 0 ? Math.max((day.count / maxCount) * 72, 6) : 4}px` }}
                    />
                  </div>
                  <div className="text-[10px] text-white/25 capitalize">{day.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pipeline */}
        <div className="bg-[#111118] border border-white/6 rounded-xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Pipeline</h2>
            <button
              onClick={() => onNavigate('bestilling')}
              className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
            >
              Se alle
            </button>
          </div>

          {recentProductions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Clock size={20} className="text-white/15" />
              <p className="text-xs text-white/25">Ingen aktive produksjoner</p>
              <button
                onClick={() => onNavigate('bestilling')}
                className="mt-2 px-3 py-1.5 bg-teal-500/15 border border-teal-500/25 text-teal-400 text-xs rounded-lg hover:bg-teal-500/25 transition-all"
              >
                + Ny bestilling
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentProductions.map(prod => (
                <div key={prod.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                    prod.status === 'complete' ? 'bg-teal-500/15' :
                    prod.status === 'failed'   ? 'bg-red-500/15'  : 'bg-blue-500/15'
                  }`}>
                    {prod.status === 'complete' ? <CheckCircle2 size={14} className="text-teal-400" /> :
                     prod.status === 'failed'   ? <AlertCircle  size={14} className="text-red-400"  /> :
                     <Clock size={14} className="text-blue-400 animate-pulse" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white/80 truncate">
                      {prod.title ?? prod.topic ?? '—'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StatusBadge status={prod.status} size="sm" />
                      {(prod.progress ?? 0) > 0 && (
                        <span className="text-[10px] text-teal-400">{prod.progress}%</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Trends + Best videos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Trending topics */}
        <div className="bg-[#111118] border border-white/6 rounded-xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">{t.dashboard.latestTrends}</h2>
              <p className="text-xs text-white/35 mt-0.5">{t.dashboard.aiDetected}</p>
            </div>
            <button
              onClick={() => onNavigate('trends')}
              className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
            >
              Alle trender <ArrowUpRight size={12} />
            </button>
          </div>

          {trendsLoading ? (
            <div className="space-y-2.5">
              {[1,2,3].map(i => (
                <div key={i} className="h-14 bg-white/3 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : topTrends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <TrendingUp size={20} className="text-white/15" />
              <p className="text-xs text-white/25">Ingen trender ennå</p>
              <p className="text-[11px] text-white/20">n8n henter automatisk hvert 6. time</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {topTrends.map(trend => (
                <div
                  key={trend.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/3 hover:bg-white/5 transition-colors group cursor-pointer"
                  onClick={() => { setPendingTrend(trend); onNavigate('bestilling'); }}
                >
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border border-teal-500/15 flex items-center justify-center">
                    <span className="text-sm font-bold text-teal-400">{trend.viral_score ?? '—'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white/85 leading-tight mb-1 truncate">{trend.title}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-white/35 capitalize">{trend.platform ?? '—'}</span>
                      {trend.heat_level && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                          trend.heat_level === 'fire'   ? 'bg-orange-500/15 text-orange-400' :
                          trend.heat_level === 'hot'    ? 'bg-yellow-500/15 text-yellow-400' :
                          trend.heat_level === 'rising' ? 'bg-teal-500/15 text-teal-400'     :
                          'bg-white/5 text-white/30'
                        }`}>
                          <Flame size={8} className="inline mr-0.5" />{trend.heat_level}
                        </span>
                      )}
                      {(trend.tags ?? []).slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] bg-white/6 text-white/40 px-1.5 py-0.5 rounded">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <span className="opacity-0 group-hover:opacity-100 flex-shrink-0 px-2 py-1 bg-teal-500/15 border border-teal-500/25 text-teal-400 text-[10px] rounded-lg transition-all">
                    Start
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Best / latest videos */}
        <div className="bg-[#111118] border border-white/6 rounded-xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">
                {bestVideos.length > 0 ? t.dashboard.bestVideos : 'Siste videoer'}
              </h2>
              <p className="text-xs text-white/35 mt-0.5">
                {bestVideos.length > 0 ? t.dashboard.rankedByViews : 'Alle statuser'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('library')}
              className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
            >
              Bibliotek <ArrowUpRight size={12} />
            </button>
          </div>

          {videosLoading ? (
            <div className="space-y-2.5">
              {[1,2,3].map(i => (
                <div key={i} className="h-12 bg-white/3 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Film size={20} className="text-white/15" />
              <p className="text-xs text-white/25">Ingen videoer ennå</p>
              <button
                onClick={() => onNavigate('bestilling')}
                className="mt-2 px-3 py-1.5 bg-teal-500/15 border border-teal-500/25 text-teal-400 text-xs rounded-lg hover:bg-teal-500/25 transition-all"
              >
                Bestill første video
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {(bestVideos.length > 0 ? bestVideos : videos.slice(0, 4)).map(vid => {
                const thumb = (vid.metadata as Record<string,string> | null)?.thumbnail ?? '';
                const videoUrl = vid.video_url ?? (vid.metadata as Record<string,string> | null)?.video_url_16x9 ?? '';
                return (
                  <div key={vid.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/3 hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => videoUrl && window.open(videoUrl, '_blank')}>
                    <div className="relative flex-shrink-0 w-14 h-9 rounded-md overflow-hidden bg-white/5">
                      {thumb
                        ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Film size={12} className="text-white/20" /></div>
                      }
                      {videoUrl && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play size={10} className="text-white fill-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white/80 truncate">
                        {vid.title ?? vid.topic ?? '—'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-white/30 capitalize">{vid.platform ?? '—'}</span>
                        <StatusBadge status={vid.status} size="sm" />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-white">
                        {(vid.views ?? 0) >= 1000
                          ? `${((vid.views ?? 0) / 1000).toFixed(1)}k`
                          : (vid.views ?? 0).toString()}
                      </p>
                      <p className="text-[10px] text-white/25">{timeAgo(vid.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── System status banner ── */}
      <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/5 border border-teal-500/15 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center flex-shrink-0">
            <Zap size={20} className="text-teal-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{t.dashboard.systemRunning}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <p className="text-xs text-white/40">
                {trends.length} trender · {completedVideos} videoer · {activeProductions > 0 ? `${activeProductions} under produksjon` : 'Klar for bestilling'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('trends')}
            className="flex-1 sm:flex-none px-4 py-2 bg-teal-500/15 border border-teal-500/25 text-teal-400 text-sm font-medium rounded-xl hover:bg-teal-500/25 transition-all"
          >
            {t.dashboard.seeTrends}
          </button>
          <button
            onClick={() => onNavigate('bestilling')}
            className="flex-1 sm:flex-none px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-xl hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/20"
          >
            + Ny video
          </button>
        </div>
      </div>
    </div>
  );
}
