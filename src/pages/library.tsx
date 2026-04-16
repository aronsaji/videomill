import { useState } from 'react';
import { Play, Download, Share2, Clock, Eye, ThumbsUp } from 'lucide-react';
import { mockVideos, mockDistributions } from '../lib/mockdata';

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Library() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const videosWithStats = mockVideos.map(video => {
    const dists = mockDistributions.filter(d => d.video_id === video.id);
    const totalViews = dists.reduce((s, d) => s + d.views, 0);
    const totalLikes = dists.reduce((s, d) => s + d.likes, 0);
    const platforms = dists.map(d => d.platform);
    return { ...video, totalViews, totalLikes, platforms };
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/40">{mockVideos.length} videoer totalt</p>
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

      {view === 'grid' ? (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
          {videosWithStats.map((video) => (
            <div key={video.id} className="bg-[#111118] border border-white/6 rounded-xl overflow-hidden hover:border-white/12 transition-all group">
              <div className="relative aspect-video bg-white/5">
                <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                    <Play size={20} className="text-white fill-white ml-1" />
                  </button>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded font-mono">
                  {formatDuration(video.duration)}
                </div>
                <div className="absolute top-2 left-2 flex gap-1">
                  {video.platforms.map(p => (
                    <span key={p} className="text-xs bg-black/60 backdrop-blur-sm text-white/80 px-1.5 py-0.5 rounded">{p}</span>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-white leading-snug mb-2">{video.title}</h3>
                <div className="flex items-center justify-between text-xs text-white/35">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Eye size={11} /> {video.totalViews.toLocaleString('nb-NO')}</span>
                    <span className="flex items-center gap-1"><ThumbsUp size={11} /> {video.totalLikes.toLocaleString('nb-NO')}</span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-md hover:bg-white/8 text-white/40 hover:text-white/70 transition-colors"><Download size={13} /></button>
                    <button className="p-1.5 rounded-md hover:bg-white/8 text-white/40 hover:text-white/70 transition-colors"><Share2 size={13} /></button>
                  </div>
                </div>
                <p className="text-xs text-white/25 mt-2 flex items-center gap-1">
                  <Clock size={10} />
                  {new Date(video.created_at).toLocaleDateString('nb-NO', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {videosWithStats.map((video) => (
            <div key={video.id} className="bg-[#111118] border border-white/6 rounded-xl p-4 flex items-center gap-4 hover:border-white/10 transition-all group">
              <div className="relative w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play size={14} className="text-white fill-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">{video.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-white/35">
                  <span className="flex items-center gap-1"><Clock size={10} /> {formatDuration(video.duration)}</span>
                  <span className="flex items-center gap-1"><Eye size={10} /> {video.totalViews.toLocaleString('nb-NO')}</span>
                  <span className="flex items-center gap-1"><ThumbsUp size={10} /> {video.totalLikes.toLocaleString('nb-NO')}</span>
                  {video.platforms.map(p => (
                    <span key={p} className="bg-white/6 px-1.5 py-0.5 rounded text-white/50">{p}</span>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 text-xs text-white/30">
                {new Date(video.created_at).toLocaleDateString('nb-NO', { day: '2-digit', month: 'short' })}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 rounded-md hover:bg-white/8 text-white/40 hover:text-white/70 transition-colors"><Download size={14} /></button>
                <button className="p-1.5 rounded-md hover:bg-white/8 text-white/40 hover:text-white/70 transition-colors"><Share2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
