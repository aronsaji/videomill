import { useState } from 'react';
import { Play, Download, Share2, Clock, Eye, Film, RefreshCw, ExternalLink, X } from 'lucide-react';
import { useVideos } from '../lib/hooks/uselivedata';
import StatusBadge from '../components/statusbadge';

function formatDuration(seconds: number | null | undefined) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Library() {
  const { data: videos, loading, refresh } = useVideos();
  const [view, setView]           = useState<'grid' | 'list'>('grid');
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);

  // Only show completed or failed videos that have some content
  const displayVideos = videos;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <RefreshCw size={20} className="text-white/30 animate-spin" />
      </div>
    );
  }

  return (
    <div>
    {/* ── Video Modal ── */}
    {activeVideo && (
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => setActiveVideo(null)}
      >
        <div
          className="relative w-full max-w-3xl"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => setActiveVideo(null)}
            className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors flex items-center gap-1 text-sm"
          >
            <X size={16} /> Lukk
          </button>
          <video
            src={activeVideo.url}
            controls
            autoPlay
            className="w-full rounded-xl shadow-2xl"
          />
          <p className="text-white/50 text-sm mt-3 text-center">{activeVideo.title}</p>
        </div>
      </div>
    )}
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-white/40">{displayVideos.length} videoer totalt</p>
          <button
            onClick={() => refresh()}
            className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
            title="Oppdater"
          >
            <RefreshCw size={13} />
          </button>
        </div>
        <div className="flex gap-1 bg-white/4 p-1 rounded-xl border border-white/6">
          <button
            onClick={() => setView('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === 'grid' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/25' : 'text-white/40 hover:text-white/70'}`}
          >
            Rutenett
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === 'list' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/25' : 'text-white/40 hover:text-white/70'}`}
          >
            Liste
          </button>
        </div>
      </div>

      {displayVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Film size={32} className="text-white/15" />
          <p className="text-white/30 text-sm">Ingen videoer ennå</p>
          <p className="text-white/20 text-xs">Bestill en ny AI-video for å komme i gang</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
          {displayVideos.map((video) => {
            const thumbnail   = (video.metadata as Record<string, string> | null)?.thumbnail ?? '';
            const videoUrl    = video.video_url ?? (video.metadata as Record<string, string> | null)?.video_url_16x9 ?? '';
            const durationSec = video.duration_seconds ?? (typeof video.duration === 'number' ? video.duration : null);

            return (
              <div key={video.id} className="bg-[#111118] border border-white/6 rounded-xl overflow-hidden hover:border-white/12 transition-all group">
                <div className="relative aspect-video bg-white/5">
                  {thumbnail
                    ? <img src={thumbnail} alt={video.title ?? ''} className="w-full h-full object-cover" />
                    : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film size={24} className="text-white/15" />
                      </div>
                    )
                  }
                  {/* Play overlay */}
                  {videoUrl && (
                    <button
                      onClick={() => setActiveVideo({ url: videoUrl, title: video.title ?? video.topic ?? '' })}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity w-full"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                        <Play size={20} className="text-white fill-white ml-1" />
                      </div>
                    </button>
                  )}
                  {/* Duration */}
                  {durationSec != null && formatDuration(durationSec) && (
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded font-mono">
                      {formatDuration(durationSec)}
                    </div>
                  )}
                  {/* Platform */}
                  {video.platform && (
                    <div className="absolute top-2 left-2">
                      <span className="text-xs bg-black/60 backdrop-blur-sm text-white/80 px-1.5 py-0.5 rounded capitalize">
                        {video.platform}
                      </span>
                    </div>
                  )}
                  {/* Status (non-complete) */}
                  {video.status !== 'complete' && (
                    <div className="absolute top-2 right-2">
                      <StatusBadge status={video.status} size="sm" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-white leading-snug mb-2 truncate">
                    {video.title ?? video.topic ?? '—'}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-white/35">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Eye size={11} /> {(video.views ?? 0).toLocaleString('nb-NO')}</span>
                      {video.aspect_ratio && (
                        <span className="bg-white/6 px-1.5 py-0.5 rounded text-white/30">{video.aspect_ratio}</span>
                      )}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {videoUrl && (
                        <a href={videoUrl} target="_blank" rel="noopener noreferrer"
                           className="p-1.5 rounded-md hover:bg-white/8 text-white/40 hover:text-white/70 transition-colors">
                          <Download size={13} />
                        </a>
                      )}
                      <button className="p-1.5 rounded-md hover:bg-white/8 text-white/40 hover:text-white/70 transition-colors">
                        <Share2 size={13} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-white/25 mt-2 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(video.created_at).toLocaleDateString('nb-NO', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {displayVideos.map((video) => {
            const thumbnail   = (video.metadata as Record<string, string> | null)?.thumbnail ?? '';
            const videoUrl    = video.video_url ?? (video.metadata as Record<string, string> | null)?.video_url_16x9 ?? '';
            const durationSec = video.duration_seconds ?? (typeof video.duration === 'number' ? video.duration : null);

            return (
              <div key={video.id} className="bg-[#111118] border border-white/6 rounded-xl p-4 flex items-center gap-4 hover:border-white/10 transition-all group">
                <div className="relative w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                  {thumbnail
                    ? <img src={thumbnail} alt="" className="w-full h-full object-cover" />
                    : <Film size={14} className="text-white/20 m-auto mt-4" />
                  }
                  {videoUrl && (
                    <a href={videoUrl} target="_blank" rel="noopener noreferrer"
                       className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play size={14} className="text-white fill-white" />
                    </a>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">
                    {video.title ?? video.topic ?? '—'}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-white/35 flex-wrap">
                    {durationSec != null && formatDuration(durationSec) && (
                      <span className="flex items-center gap-1"><Clock size={10} /> {formatDuration(durationSec)}</span>
                    )}
                    <span className="flex items-center gap-1"><Eye size={10} /> {(video.views ?? 0).toLocaleString('nb-NO')}</span>
                    {video.platform && (
                      <span className="bg-white/6 px-1.5 py-0.5 rounded capitalize">{video.platform}</span>
                    )}
                    {video.aspect_ratio && (
                      <span className="bg-white/6 px-1.5 py-0.5 rounded">{video.aspect_ratio}</span>
                    )}
                    <StatusBadge status={video.status} size="sm" />
                  </div>
                </div>
                <div className="flex-shrink-0 text-xs text-white/30">
                  {new Date(video.created_at).toLocaleDateString('nb-NO', { day: '2-digit', month: 'short' })}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {videoUrl && (
                    <a href={videoUrl} target="_blank" rel="noopener noreferrer"
                       className="p-1.5 rounded-md hover:bg-white/8 text-white/40 hover:text-teal-400 transition-colors">
                      <ExternalLink size={14} />
                    </a>
                  )}
                  <button className="p-1.5 rounded-md hover:bg-white/8 text-white/40 hover:text-white/70 transition-colors">
                    <Share2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </div>
  );
}
