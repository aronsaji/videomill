import { useState } from 'react';
import { Play, Download, Share2, Clock, Eye, Film, RefreshCw, ExternalLink, X, AlertTriangle, RotateCcw } from 'lucide-react';
import { useVideos, updateVideoStatus } from '../lib/hooks/uselivedata';
import { useLanguage } from '../contexts/languageContext';
import { useAuth } from '../contexts/authContext';
import StatusBadge from '../components/statusbadge';

const LBL = {
  nb: {
    total: (n: number) => `${n} videoer totalt`,
    grid: 'Rutenett', list: 'Liste',
    empty: 'Ingen videoer ennå', emptyHint: 'Bestill en ny AI-video for å komme i gang',
    close: 'Lukk', views: 'visninger',
    retry: 'Prøv på nytt', retrying: 'Sender på nytt...',
    failed: 'Feilet', error: 'Feil',
  },
  en: {
    total: (n: number) => `${n} videos total`,
    grid: 'Grid', list: 'List',
    empty: 'No videos yet', emptyHint: 'Order a new AI video to get started',
    close: 'Close', views: 'views',
    retry: 'Retry', retrying: 'Retrying...',
    failed: 'Failed', error: 'Error',
  },
};

function formatDuration(seconds: number | null | undefined) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Library() {
  const { data: videos, loading, refresh } = useVideos();
  const { language } = useLanguage();
  const { user } = useAuth();
  const lbl = language === 'en' ? LBL.en : LBL.nb;
  const [view, setView]           = useState<'grid' | 'list'>('grid');
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const handleRetry = async (videoId: string) => {
    if (!user) return;
    setRetryingId(videoId);
    try {
      await updateVideoStatus(videoId, 'queued', 0);
      await refresh();
    } finally {
      setRetryingId(null);
    }
  };

  const displayVideos = videos;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <RefreshCw size={20} className="text-white/30 animate-spin" />
      </div>
    );
  }

  return (
    <>
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
              <X size={16} /> {lbl.close}
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
            <p className="text-sm text-white/40">{lbl.total(displayVideos.length)}</p>
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
              {lbl.grid}
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === 'list' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/25' : 'text-white/40 hover:text-white/70'}`}
            >
              {lbl.list}
            </button>
          </div>
        </div>

        {displayVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Film size={32} className="text-white/15" />
            <p className="text-white/30 text-sm">{lbl.empty}</p>
            <p className="text-white/20 text-xs">{lbl.emptyHint}</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
            {displayVideos.map((video) => {
              const thumbnail   = (video.metadata as Record<string, string> | null)?.thumbnail ?? '';
              const videoUrl    = video.video_url ?? (video.metadata as Record<string, string> | null)?.video_url_16x9 ?? '';
              const durationSec = video.duration_seconds ?? (typeof video.duration === 'number' ? video.duration : null);

              return (
                <div key={video.id} className={`bg-[#111118] border border-white/6 rounded-xl overflow-hidden transition-all group ${videoUrl ? 'hover:border-teal-500/30 cursor-pointer' : 'hover:border-white/12'}`}
                  onClick={() => videoUrl && setActiveVideo({ url: videoUrl, title: video.title ?? video.topic ?? '' })}
                >
                  <div className="relative aspect-video bg-white/5">
                    {thumbnail
                      ? <img src={thumbnail} alt={video.title ?? ''} className="w-full h-full object-cover" />
                      : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film size={24} className="text-white/15" />
                        </div>
                      )
                    }
                    {videoUrl && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                          <Play size={20} className="text-white fill-white ml-1" />
                        </div>
                      </div>
                    )}
                    {durationSec != null && formatDuration(durationSec) && (
                      <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded font-mono">
                        {formatDuration(durationSec)}
                      </div>
                    )}
                    {video.platform && (
                      <div className="absolute top-2 left-2">
                        <span className="text-xs bg-black/60 backdrop-blur-sm text-white/80 px-1.5 py-0.5 rounded capitalize">
                          {video.platform}
                        </span>
                      </div>
                    )}
                    {(video.status !== 'complete' || !videoUrl) && (
                      <div className="absolute top-2 right-2">
                        {videoUrl ? <StatusBadge status={video.status} size="sm" /> : (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                            {lbl.failed}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-white leading-snug mb-2 truncate">
                      {video.title ?? video.topic ?? '—'}
                    </h3>
                    {video.status === 'failed' && (video.metadata as Record<string, unknown> | null)?.error && (
                      <div className="mb-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                        <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-300/80">{(video.metadata as Record<string, unknown>).error as string}</p>
                      </div>
                    )}
                    {video.status === 'failed' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRetry(video.id); }}
                        disabled={retryingId === video.id}
                        className="mb-3 w-full py-2 px-3 bg-amber-500/15 border border-amber-500/30 rounded-lg text-amber-400 text-xs font-medium flex items-center justify-center gap-2 hover:bg-amber-500/25 transition-colors disabled:opacity-50"
                      >
                        <RotateCcw size={12} className={retryingId === video.id ? 'animate-spin' : ''} />
                        {retryingId === video.id ? lbl.retrying : lbl.retry}
                      </button>
                    )}
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
                    {video.status === 'failed' && (video.metadata as Record<string, unknown> | null)?.error && (
                      <div className="mt-1 p-1.5 bg-red-500/10 border border-red-500/20 rounded flex items-start gap-1.5 max-w-xs">
                        <AlertTriangle size={11} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] text-red-300/80 truncate">{(video.metadata as Record<string, unknown>).error as string}</p>
                      </div>
                    )}
                    {video.status === 'failed' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRetry(video.id); }}
                        disabled={retryingId === video.id}
                        className="mt-1.5 py-1 px-2 bg-amber-500/15 border border-amber-500/30 rounded text-amber-400 text-xs font-medium flex items-center gap-1.5 hover:bg-amber-500/25 transition-colors disabled:opacity-50"
                      >
                        <RotateCcw size={10} className={retryingId === video.id ? 'animate-spin' : ''} />
                        {retryingId === video.id ? lbl.retrying : lbl.retry}
                      </button>
                    )}
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
    </>
  );
}