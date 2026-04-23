import { Share2, TrendingUp, Users, Youtube, Instagram, Monitor, RefreshCw, Eye, ExternalLink } from 'lucide-react';
import { useVideos } from '../lib/hooks/uselivedata';
import { useLanguage } from '../contexts/languageContext';
import { StatsGrid } from '../components/StatsCard';
import { PageHeader } from '../components/PageHeader';
import { VideoCard } from '../components/VideoCard';
import StatusBadge from '../components/statusbadge';

function TikTokIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
    </svg>
  );
}

const platformIcon: Record<string, React.ReactNode> = {
  youtube:   <Youtube size={13} className="text-red-400" />,
  tiktok:    <TikTokIcon size={13} />,
  instagram: <Instagram size={13} className="text-purple-400" />,
  desktop:   <Monitor size={13} className="text-blue-400" />,
};

const STATUS_ORDER = ['pending','queued','scripting','recording','editing','complete','failed'];

function statusColor(status: string): string {
  switch(status) {
    case 'complete': return 'bg-teal-500/10 border-teal-500/20';
    case 'failed':   return 'bg-red-500/10 border-red-500/20';
    case 'scripting':
    case 'recording':
    case 'editing':  return 'bg-blue-500/10 border-blue-500/20';
    case 'queued':   return 'bg-yellow-500/10 border-yellow-500/20';
    default:         return 'bg-white/5 border-white/8';
  }
}

export default function Distribution() {
  const { data: videos, loading, refresh } = useVideos();
  const { t } = useLanguage();

  const totalViews     = videos.reduce((s, v) => s + (v.views ?? 0), 0);
  const completeCount  = videos.filter(v => v.status === 'complete').length;
  const activeCount    = videos.filter(v => ['queued','scripting','recording','editing'].includes(v.status)).length;

  // Sort: active first, then by status order, then date
  const sorted = [...videos].sort((a, b) => {
    const ai = STATUS_ORDER.indexOf(a.status);
    const bi = STATUS_ORDER.indexOf(b.status);
    if (ai !== bi) return ai - bi;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-6">
      <StatsGrid
        stats={[
          { label: t.distribution.totalViews, value: totalViews.toLocaleString('nb-NO'), icon: TrendingUp, color: 'teal' },
          { label: t.distribution.completedVideos, value: String(completeCount), icon: Users, color: 'blue' },
          { label: t.distribution.inProduction, value: String(activeCount), icon: Share2, color: 'purple' },
        ]}
      />

      <PageHeader
        title={t.distribution.title}
        subtitle={t.distribution.liveUpdate}
        icon={Share2}
        onRefresh={refresh}
        loading={loading}
      />

      {/* Table / list */}
      {loading ? (
        <div className="flex items-center justify-center h-32 text-white/30 text-sm gap-2">
          <RefreshCw size={16} className="animate-spin" /> Laster...
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20">
          <Share2 size={32} className="text-white/15 mx-auto mb-3" />
          <p className="text-white/30 text-sm">Ingen bestillinger ennå</p>
          <p className="text-white/20 text-xs mt-1">Bestill en video for å starte produksjon</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((video) => {
            const videoUrl = video.video_url
              ?? (video.metadata as Record<string, string> | null)?.video_url_16x9
              ?? null;
            const isActive = ['queued','scripting','recording','editing'].includes(video.status);

            return (
              <div
                key={video.id}
                className={`bg-[#111118] border rounded-xl p-4 transition-all hover:border-white/10 ${statusColor(video.status)}`}
              >
                <div className="flex items-start gap-4">
                  {/* Platform icon */}
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {platformIcon[video.platform?.toLowerCase() ?? ''] ?? <Monitor size={13} className="text-white/30" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title + status */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-semibold text-white truncate flex-1">
                        {video.title ?? video.topic ?? '—'}
                      </p>
                      <StatusBadge status={video.status} />
                    </div>

                    {/* Progress bar */}
                    {isActive && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-[10px] text-white/30 mb-1">
                          <span>{video.sub_status ?? 'Behandler...'}</span>
                          <span>{video.progress ?? 0}%</span>
                        </div>
                        <div className="h-1 bg-white/6 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-700"
                            style={{ width: `${video.progress ?? 0}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Meta info row */}
                    <div className="flex items-center gap-2 text-[11px] text-white/30 flex-wrap">
                      {video.platform && (
                        <span className="capitalize">{video.platform}</span>
                      )}
                      {video.platform && <span>·</span>}
                      {video.language && (
                        <span className="uppercase">{video.language}</span>
                      )}
                      {video.language && <span>·</span>}
                      {video.aspect_ratio && (
                        <span>{video.aspect_ratio}</span>
                      )}
                      {video.target_audience && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <Users size={9} />
                            {video.target_audience}
                          </span>
                        </>
                      )}
                      {video.views > 0 && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5"><Eye size={9} />{video.views.toLocaleString('nb-NO')}</span>
                        </>
                      )}
                      <span className="ml-auto">
                        {new Date(video.created_at).toLocaleString('nb-NO', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {videoUrl && (
                      <a
                        href={videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium rounded-lg hover:bg-teal-500/20 transition-colors"
                      >
                        <ExternalLink size={11} />
                        Se video
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
