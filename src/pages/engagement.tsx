import { useMemo } from 'react';
import {
  MessageSquare, Bot, TrendingUp, Eye, Film,
  RefreshCw, Zap, Youtube, Instagram, Monitor, ExternalLink, Link,
} from 'lucide-react';
import { useVideos, useTrends } from '../lib/hooks/uselivedata';
import { useLanguage } from '../contexts/languageContext';
import { StatsGrid } from '../components/StatsCard';
import { PageHeader } from '../components/PageHeader';
import StatusBadge from '../components/statusbadge';

function TikTokIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
    </svg>
  );
}

function platformIcon(platform: string | null | undefined) {
  const p = (platform ?? '').toLowerCase();
  if (p.includes('youtube'))   return <Youtube size={12} className="text-red-400" />;
  if (p.includes('tiktok'))    return <TikTokIcon size={12} />;
  if (p.includes('instagram')) return <Instagram size={12} className="text-purple-400" />;
  return <Monitor size={12} className="text-blue-400" />;
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

export default function Engagement() {
  const { data: videos, loading: videosLoading, refresh } = useVideos();
  const { data: trends } = useTrends();
  const { t } = useLanguage();

  // ── Live engasjements-stats fra videos ──
  const completedVideos  = useMemo(() => videos.filter(v => v.status === 'complete'), [videos]);
  const totalViews       = useMemo(() => videos.reduce((s, v) => s + (v.views ?? 0), 0), [videos]);
  const activeVideos     = useMemo(() => videos.filter(v => ['queued','scripting','recording','editing','pending'].includes(v.status)), [videos]);
  const topVideos        = useMemo(() => completedVideos.sort((a,b) => (b.views??0)-(a.views??0)).slice(0, 5), [completedVideos]);

  // ── Platform-fordeling ──
  const platformBreakdown = useMemo(() => {
    const m: Record<string, { count: number; views: number }> = {};
    videos.forEach(v => {
      const p = v.platform ?? 'ukjent';
      if (!m[p]) m[p] = { count: 0, views: 0 };
      m[p].count++;
      m[p].views += v.views ?? 0;
    });
    return Object.entries(m).sort((a, b) => b[1].views - a[1].views);
  }, [videos]);

  

  return (
    <div className="space-y-6">
      <StatsGrid
        stats={[
          { label: t.analytics?.title === 'Analyse' ? 'Totale visninger' : 'Total views', value: totalViews >= 1000 ? `${(totalViews/1000).toFixed(1)}k` : totalViews, icon: Eye, color: 'teal' },
          { label: t.distribution?.title === 'Distribusjon' ? 'Ferdige videoer' : 'Completed videos', value: completedVideos.length, icon: Film, color: 'blue' },
          { label: t.distribution?.title === 'Distribusjon' ? 'Under produksjon' : 'In production', value: activeVideos.length, icon: RefreshCw, color: 'orange' },
          { label: t.trends?.scanNow || 'Trender', value: trends.length, icon: TrendingUp, color: 'purple' },
        ]}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {platformBreakdown.map(([platform, data]) => (
          <div key={platform} className="bg-[#111118] border border-white/6 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs text-white/50 font-medium capitalize">{platform}</p>
            </div>
            {videosLoading
              ? <div className="h-7 w-12 bg-white/5 rounded animate-pulse" />
              : <p className="text-2xl font-bold text-white">{data.count}</p>
            }
            <p className="text-xs text-white/25 mt-1">{data.views.toLocaleString()} visninger</p>
          </div>
        ))}
      </div>

      {/* ── AI-robot banner ── */}
      <div className="bg-teal-500/6 border border-teal-500/15 rounded-xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0">
          <Bot size={16} className="text-teal-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">AI-engasjement-robot er aktiv</p>
          <p className="text-xs text-white/40">Overvåker videoytelse · Auto-genererer innhold basert på trender</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-[10px] text-teal-400/60">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── Top videoer ── */}
        <div className="bg-[#111118] border border-white/6 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Mest sette videoer</h2>
              <p className="text-xs text-white/35 mt-0.5">Rangert etter visninger</p>
            </div>
            <button
              onClick={() => refresh()}
              className="p-1.5 hover:bg-white/8 rounded-lg text-white/30 hover:text-white/60 transition-colors"
            >
              <RefreshCw size={12} className={videosLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {videosLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-white/3 rounded-lg animate-pulse" />)}
            </div>
          ) : topVideos.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-2">
              <Film size={24} className="text-white/15" />
              <p className="text-xs text-white/25">Ingen ferdige videoer ennå</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topVideos.map((video, i) => {
                const thumb = (video.metadata as Record<string,string>|null)?.thumbnail ?? '';
                const videoUrl = video.video_url ?? (video.metadata as Record<string,string>|null)?.video_url_16x9;
                return (
                  <div key={video.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/3 hover:bg-white/5 transition-colors group">
                    <span className="text-xs font-bold text-white/20 w-4 text-right flex-shrink-0">{i+1}</span>
                    <div className="relative w-12 h-8 rounded-md overflow-hidden bg-white/5 flex-shrink-0">
                      {thumb
                        ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                        : <Film size={10} className="text-white/20 m-auto mt-2" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white/80 truncate">
                        {video.title ?? video.topic ?? '—'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {platformIcon(video.platform)}
                        <span className="text-[10px] text-white/30 capitalize">{video.platform ?? '—'}</span>
                        <span className="text-white/15">·</span>
                        <span className="text-[10px] text-white/25">{timeAgo(video.created_at)}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-white">
                        {(video.views??0) >= 1000 ? `${((video.views??0)/1000).toFixed(1)}k` : (video.views??0)}
                      </p>
                      <p className="text-[10px] text-white/25">visn.</p>
                    </div>
                    {videoUrl && (
                      <a href={videoUrl} target="_blank" rel="noopener noreferrer"
                         className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded-lg text-white/30 hover:text-white/60 transition-all">
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Plattform-fordeling ── */}
        <div className="bg-[#111118] border border-white/6 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-1">Plattformfordeling</h2>
          <p className="text-xs text-white/35 mb-4">Videoer og visninger per plattform</p>

          {platformBreakdown.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-2">
              <Monitor size={24} className="text-white/15" />
              <p className="text-xs text-white/25">Ingen plattformdata ennå</p>
            </div>
          ) : (
            <div className="space-y-3">
              {platformBreakdown.map(([platform, data]) => (
                <div key={platform} className="p-3 rounded-xl bg-white/3 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {platformIcon(platform)}
                      <span className="text-xs font-semibold text-white/70 capitalize">{platform}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span>{data.count} video{data.count !== 1 ? 'er' : ''}</span>
                      <span className="font-bold text-white/60">
                        {data.views >= 1000 ? `${(data.views/1000).toFixed(1)}k` : data.views} visn.
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-700"
                      style={{ width: `${(data.count / (platformBreakdown[0][1].count)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Aktive produksjoner ── */}
      {activeVideos.length > 0 && (
        <div className="bg-[#111118] border border-white/6 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-orange-400" />
            <h2 className="text-sm font-semibold text-white">Under produksjon nå</h2>
            <span className="text-xs bg-violet-500/15 text-violet-400 px-2 py-0.5 rounded-full ml-1">{activeVideos.length} aktive</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeVideos.slice(0, 6).map(v => (
              <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white/80 truncate">{v.title ?? v.topic ?? '—'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={v.status} size="sm" />
                    {(v.progress ?? 0) > 0 && (
                      <span className="text-[10px] text-teal-400">{v.progress}%</span>
                    )}
                  </div>
                </div>
                {platformIcon(v.platform)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Kommentarer — coming soon ── */}
      <div className="bg-[#111118] border border-white/6 rounded-xl p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
            <MessageSquare size={16} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Kommentarer & Sentiment</h2>
            <p className="text-xs text-white/35">AI-analyse av kommentarer fra YouTube, TikTok og Instagram</p>
          </div>
        </div>

        <div className="flex flex-col items-center py-10 gap-4 border border-dashed border-white/10 rounded-xl">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Link size={20} className="text-blue-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white/70 mb-1">Koble til sosiale medier</p>
            <p className="text-xs text-white/35 max-w-sm leading-relaxed">
              For å se kommentarer og AI-sentiment-analyse må du koble til YouTube og/eller TikTok via OAuth.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
              <Youtube size={14} /> YouTube OAuth
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 border border-pink-500/20 rounded-xl text-xs text-pink-400">
              <TikTokIcon size={14} /> TikTok API
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs text-purple-400">
              <Instagram size={14} /> Instagram API
            </div>
          </div>
          <p className="text-xs text-white/20">Innstillinger → Kontokobling</p>
        </div>
      </div>
    </div>
  );
}
