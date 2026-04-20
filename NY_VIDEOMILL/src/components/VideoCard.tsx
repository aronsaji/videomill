import { Eye, ExternalLink, Youtube, RefreshCw } from 'lucide-react';
import StatusBadge from './statusbadge';
import { useLanguage } from '../contexts/languageContext';

interface VideoCardProps {
  video: {
    id: string;
    title?: string | null;
    topic?: string | null;
    status: string;
    progress?: number | null;
    sub_status?: string | null;
    platform?: string | null;
    views?: number;
    created_at: string;
    video_url?: string | null;
    metadata?: Record<string, unknown> | null;
  };
  onRetry?: (id: string) => void;
}

function YouTubeIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function TikTokIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
    </svg>
  );
}

function InstagramIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  );
}

function platformIcon(platform: string | null | undefined) {
  const p = (platform ?? '').toLowerCase();
  if (p.includes('youtube')) return <YouTubeIcon size={12} />;
  if (p.includes('tiktok')) return <TikTokIcon size={12} />;
  if (p.includes('instagram')) return <InstagramIcon size={12} />;
  return null;
}

export function VideoCard({ video, onRetry }: VideoCardProps) {
  const { t } = useLanguage();
  const isActive = ['queued', 'scripting', 'recording', 'editing'].includes(video.status);
  const videoUrl = video.video_url || (video.metadata as Record<string, unknown>)?.video_url_9x16 as string || (video.metadata as Record<string, unknown>)?.video_url_16x9 as string;

  return (
    <div className="bg-[#111118] border border-white/6 rounded-xl p-4 hover:border-white/12 transition-all">
      <div className="flex items-start gap-3">
        {/* Platform icon */}
        {video.platform && (
          <div className="mt-1">
            {platformIcon(video.platform)}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {/* Title + Status */}
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
                  className="h-full bg-gradient-to-r from-[#1D9BF0] to-cyan-400 rounded-full transition-all duration-700"
                  style={{ width: `${video.progress ?? 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-2 text-[11px] text-white/30 flex-wrap">
            {video.platform && (
              <span className="capitalize">{video.platform}</span>
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
          {video.status === 'failed' && onRetry && (
            <button
              onClick={() => onRetry(video.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium rounded-lg hover:bg-orange-500/20 transition-colors"
            >
              <RefreshCw size={11} />
              {t.common?.retry || 'Retry'}
            </button>
          )}
          {videoUrl && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1D9BF0]/10 border border-[#1D9BF0]/20 text-[#1D9BF0] text-xs font-medium rounded-lg hover:bg-[#1D9BF0]/20 transition-colors"
            >
              <ExternalLink size={11} />
              {t.distribution?.title === 'Distribusjon' ? 'Se video' : 'View'}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}