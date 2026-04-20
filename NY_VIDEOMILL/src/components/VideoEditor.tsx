import { useState } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize, Download, Share2, Trash2, RotateCcw,
  Scissors, Type, Image, Film, Music, Clock, Layers,
  MoveLeft, MoveRight, MoveUp, MoveDown, ZoomIn, ZoomOut,
  Check, X, Plus, Settings
} from 'lucide-react';

interface TimelineClip {
  id: string;
  type: 'video' | 'image' | 'audio' | 'text';
  start: number;
  duration: number;
  content: string;
  thumbnail?: string;
}

interface Scene {
  id: string;
  narration: string;
  visualDescription: string;
  duration: number;
  mediaUrl?: string;
  mediaType?: 'video' | 'image';
}

interface SimpleEditorProps {
  video: {
    id: string;
    title: string;
    script?: string;
    scenes?: Scene[];
    videoUrl?: string;
    thumbnailUrl?: string;
  };
  onSave?: (updates: any) => void;
  onExport?: () => void;
  onPublish?: () => void;
}

export default function SimpleEditor({ video, onSave, onExport, onPublish }: SimpleEditorProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [zoom, setZoom] = useState(100);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);

  // Parse scenes til timeline clips
  const timelineClips: TimelineClip[] = (video.scenes || []).map((scene, i) => ({
    id: scene.id,
    type: scene.mediaType === 'video' ? 'video' : 'image',
    start: video.scenes?.slice(0, i).reduce((acc, s) => acc + s.duration, 0) || 0,
    duration: scene.duration,
    content: scene.narration,
    thumbnail: scene.mediaUrl,
  }));

  const totalDuration = timelineClips.reduce((acc, clip) => acc + clip.duration, 0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-[#0B0D19]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-white">{video.title}</h2>
          <span className="text-xs text-white/40 px-2 py-1 bg-white/5 rounded">{formatTime(totalDuration)}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <RefreshCwIcon size={18} />
          </button>
          <button className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Download size={18} />
          </button>
          <button className="px-3 py-1.5 bg-cyan-500 text-black text-sm font-medium rounded-lg">
            Export
          </button>
        </div>
      </header>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center bg-black relative">
        {video.videoUrl ? (
          <video 
            src={video.videoUrl}
            className="max-h-full max-w-full object-contain"
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          />
        ) : (
          <div className="text-center text-white/30">
            <Film size={48} className="mx-auto mb-2 opacity-30" />
            <p>Ingen forhåndsvisning tilgjengelig</p>
          </div>
        )}
        
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          {playing ? (
            <button 
              onClick={() => setPlaying(false)}
              className="w-16 h-16 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
            >
              <Pause size={24} />
            </button>
          ) : (
            <button 
              onClick={() => setPlaying(true)}
              className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center text-black hover:bg-cyan-400 transition-colors"
            >
              <Play size={24} className="ml-1" />
            </button>
          )}
        </div>
      </div>

      {/* Waveform / Audio Track */}
      <div className="h-16 px-4 border-b border-white/5 flex items-center">
        <div className="flex-1 flex items-center gap-2">
          {Array.from({ length: 50 }).map((_, i) => (
            <div 
              key={i} 
              className="w-1 bg-cyan-400/40 rounded-full"
              style={{ height: `${Math.random() * 100}%` }}
            />
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 border-b border-white/5 overflow-hidden">
        <div className="h-full overflow-x-auto overflow-y-hidden">
          <div 
            className="h-full relative"
            style={{ width: `${zoom}%`, minWidth: '100%' }}
          >
            {/* Time markers */}
            <div className="h-6 flex items-center text-xs text-white/30 border-b border-white/5">
              {Array.from({ length: Math.ceil(totalDuration / 10) + 1 }).map((_, i) => (
                <div 
                  key={i} 
                  className="absolute text-xs text-white/30"
                  style={{ left: `${(i * 10 / totalDuration) * 100}%` }}
                >
                  {formatTime(i * 10)}
                </div>
              ))}
            </div>

            {/* Video track */}
            <div className="h-20 relative border-b border-white/5">
              <div className="absolute top-1 left-1 text-xs text-white/40">Video</div>
              {timelineClips.map((clip, i) => (
                <div
                  key={clip.id}
                  onClick={() => setSelectedClip(clip.id)}
                  className={`absolute h-14 top-6 rounded cursor-pointer transition-all ${
                    selectedClip === clip.id
                      ? 'bg-cyan-500/30 border-cyan-400'
                      : 'bg-white/10 border-white/10 hover:bg-white/20'
                  } border`}
                  style={{
                    left: `${(clip.start / totalDuration) * 100}%`,
                    width: `${(clip.duration / totalDuration) * 100}%`,
                  }}
                >
                  {clip.thumbnail && (
                    <img 
                      src={clip.thumbnail} 
                      alt=""
                      className="w-full h-full object-cover opacity-50 rounded"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-white/60 truncate px-1">
                    Scene {i + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Audio track */}
            <div className="h-20 relative">
              <div className="absolute top-1 left-1 text-xs text-white/40">Audio</div>
              <div 
                className="absolute h-14 top-6 left-0 right-0 bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 rounded"
              />
              <div className="absolute inset-0 flex items-center">
                <span className="text-xs text-white/60 pl-1">Voice + Music</span>
              </div>
            </div>

            {/* Playhead */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-10"
              style={{ left: `${(currentTime / totalDuration) * 100}%` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <button className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <SkipBack size={18} />
          </button>
          <button 
            onClick={() => setPlaying(!playing)}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <SkipForward size={18} />
          </button>
          <span className="text-sm text-white/40 ml-2">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setVolume(v => v === 0 ? 80 : 0)}
            className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-20 accent-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setZoom(z => Math.max(50, z - 25))}
            className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-xs text-white/40 w-12 text-center">{zoom}%</span>
          <button 
            onClick={() => setZoom(z => Math.min(200, z + 25))}
            className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <ZoomIn size={18} />
          </button>
        </div>
      </div>

      {/* Clip Properties Panel */}
      {selectedClip && (
        <div className="w-64 border-l border-white/5 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-white">Scene</h4>
            <button onClick={() => setSelectedClip(null)} className="text-white/40 hover:text-white">
              <X size={16} />
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-white/40 mb-1">Narration</label>
              <textarea 
                className="w-full h-20 px-2 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white resize-none"
                placeholder="Rediger narration..."
              />
            </div>
            
            <div>
              <label className="block text-xs text-white/40 mb-1">Visual</label>
              <button className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white/60 text-left hover:border-white/20">
                <Image size={12} className="inline mr-1" />
                Bytt media...
              </button>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-2 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white/60 hover:border-white/20">
                <Scissors size={12} className="inline mr-1" />
                Split
              </button>
              <button className="flex-1 px-2 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white/60 hover:border-white/20">
                <Trash2 size={12} className="inline mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RefreshCwIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
  );
}