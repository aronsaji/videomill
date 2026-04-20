import { useState } from 'react';
import { 
  Film, Music, Sparkles, 
  Check, ChevronDown, Volume2,
  Video, Wand, MonitorPlay
} from 'lucide-react';

export interface QualityConfig {
  video: {
    resolution: '1080p' | '1440p' | '4k';
    fps: 24 | 30 | 60;
    bitrate: 'standard' | 'high' | 'ultra';
    format: 'mp4' | 'mov';
    codec: 'h264' | 'h265' | 'vp9' | 'av1';
  };
  audio: {
    voice: 'ai' | 'human';
    voiceId: string;
    language: string;
    voiceStability: number;
    voiceClarity: number;
    backgroundMusic: boolean;
    musicVolume: number;
    audioNormalization: boolean;
  };
  effects: {
    captions: boolean;
    captionsStyle: 'viral_pop' | 'minimal' | 'subtitle' | 'animated';
    captionsColor: string;
    transitions: 'fade' | 'smooth' | 'zoom' | 'none';
    filters: 'none' | 'cinematic' | 'vibrant' | 'warm' | 'cool';
    speedRamping: boolean;
  };
  output: {
    aspectRatio: '9:16' | '16:9' | '1:1' | '4:5';
    platforms: ('tiktok' | 'youtube' | 'instagram' | 'reels')[];
  };
}

const VOICE_OPTIONS = [
  { id: 'nb-NO-PernilleNeural', name: 'Pernille', lang: 'nb', style: 'Professional' },
  { id: 'nb-NO-FinnNeural', name: 'Finn', lang: 'nb', style: 'Casual' },
  { id: 'nb-NO-IselinNeural', name: 'Iselin', lang: 'nb', style: 'Friendly' },
  { id: 'en-US-AriaNeural', name: 'Aria', lang: 'en', style: 'Professional' },
  { id: 'en-US-GuyNeural', name: 'Guy', lang: 'en', style: 'Deep' },
  { id: 'en-US-JennyNeural', name: 'Jenny', lang: 'en', style: 'Upbeat' },
  { id: 'es-ES-ElviraNeural', name: 'Elvira', lang: 'es', style: 'Professional' },
  { id: 'de-DE-KatjaNeural', name: 'Katja', lang: 'de', style: 'Professional' },
  { id: 'r multiple_1', name: 'AI Voice (Multiple)', lang: 'multi', style: 'AI-generated' },
];

const MUSIC_OPTIONS = [
  { id: 'none', name: 'Ingen', category: 'none' },
  { id: 'upbeat_1', name: 'Upbeat Energy', category: 'upbeat' },
  { id: 'cinematic_1', name: 'Cinematic Epic', category: 'cinematic' },
  { id: 'lofi_1', name: 'Lo-Fi Chill', category: 'lofi' },
  { id: 'corporate_1', name: 'Corporate Success', category: 'corporate' },
  { id: 'electronic_1', name: 'Electronic Pulse', category: 'electronic' },
  { id: 'acoustic_1', name: 'Acoustic Warm', category: 'acoustic' },
  { id: 'drumroll_1', name: 'Drum Roll Build', category: 'drums' },
];

interface QualitySettingsProps {
  config: QualityConfig;
  onChange: (config: QualityConfig) => void;
}

export default function QualitySettings({ config, onChange }: QualitySettingsProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'effects' | 'output'>('video');

  const tabs = [
    { id: 'video', label: 'Video', icon: Film },
    { id: 'audio', label: 'Lyd', icon: Audio },
    { id: 'effects', label: 'Effects', icon: Wand },
    { id: 'output', label: 'Output', icon: MonitorPlay },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-[#0B0F1A] rounded-xl">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Video Settings */}
      {activeTab === 'video' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-2">Oppløsning</label>
            <div className="grid grid-cols-3 gap-2">
              {(['1080p', '1440p', '4k'] as const).map(res => (
                <button
                  key={res}
                  onClick={() => onChange({ ...config, video: { ...config.video, resolution: res } })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                    config.video.resolution === res
                      ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                      : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-2">FPS</label>
            <div className="flex gap-2">
              {([24, 30, 60] as const).map(fps => (
                <button
                  key={fps}
                  onClick={() => onChange({ ...config, video: { ...config.video, fps } })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                    config.video.fps === fps
                      ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                      : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
                  }`}
                >
                  {fps} fps
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-2">Kvalitet</label>
            <div className="flex gap-2">
              {(['standard', 'high', 'ultra'] as const).map(q => (
                <button
                  key={q}
                  onClick={() => onChange({ ...config, video: { ...config.video, bitrate: q } })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                    config.video.bitrate === q
                      ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                      : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
                  }`}
                >
                  {q === 'standard' ? 'Standard' : q === 'high' ? 'High' : 'Ultra'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-2">Format</label>
            <div className="flex gap-2">
              {(['mp4', 'mov'] as const).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => onChange({ ...config, video: { ...config.video, format: fmt } })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                    config.video.format === fmt
                      ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                      : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
                  }`}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Audio Settings */}
      {activeTab === 'audio' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-2">Stemme</label>
            <select
              value={config.audio.voiceId}
              onChange={(e) => onChange({ ...config, audio: { ...config.audio, voiceId: e.target.value } })}
              className="w-full px-4 py-3 bg-[#0B0F1A] border border-white/10 rounded-xl text-white text-sm focus:border-cyan-500/40 focus:outline-none"
            >
              {VOICE_OPTIONS.map(v => (
                <option key={v.id} value={v.id} className="bg-[#0B0F1A]">
                  {v.name} ({v.lang.toUpperCase()}) - {v.style}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-2">Stemmostabilitet: {Math.round(config.audio.voiceStability * 100)}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={config.audio.voiceStability * 100}
              onChange={(e) => onChange({ ...config, audio: { ...config.audio, voiceStability: Number(e.target.value) / 100 } })}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-2">Klarhet: {Math.round(config.audio.voiceClarity * 100)}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={config.audio.voiceClarity * 100}
              onChange={(e) => onChange({ ...config, audio: { ...config.audio, voiceClarity: Number(e.target.value) / 100 } })}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music size={18} className="text-cyan-400" />
              <span className="text-sm text-white/80">Bakgrunnsmusikk</span>
            </div>
            <button
              onClick={() => onChange({ ...config, audio: { ...config.audio, backgroundMusic: !config.audio.backgroundMusic } })}
              className={`w-12 h-6 rounded-full transition-all ${
                config.audio.backgroundMusic ? 'bg-cyan-500' : 'bg-white/10'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                config.audio.backgroundMusic ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {config.audio.backgroundMusic && (
            <div className="space-y-2">
              <label className="block text-xs text-white/50 mb-2">Musikk</label>
              <select
                value="none"
                className="w-full px-4 py-3 bg-[#0B0F1A] border border-white/10 rounded-xl text-white text-sm focus:border-cyan-500/40 focus:outline-none"
              >
                {MUSIC_OPTIONS.map(m => (
                  <option key={m.id} value={m.id} className="bg-[#0B0F1A]">
                    {m.name}
                  </option>
                ))}
              </select>
              <label className="block text-xs text-white/50 mb-2">Musikk-volum</label>
              <input
                type="range"
                min="0"
                max="100"
                value={config.audio.musicVolume * 100}
                onChange={(e) => onChange({ ...config, audio: { ...config.audio, musicVolume: Number(e.target.value) / 100 } })}
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 size={18} className="text-cyan-400" />
              <span className="text-sm text-white/80">Lyd-normalisering</span>
            </div>
            <button
              onClick={() => onChange({ ...config, audio: { ...config.audio, audioNormalization: !config.audio.audioNormalization } })}
              className={`w-12 h-6 rounded-full transition-all ${
                config.audio.audioNormalization ? 'bg-cyan-500' : 'bg-white/10'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                config.audio.audioNormalization ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      )}

      {/* Effects Settings */}
      {activeTab === 'effects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles size={18} className="text-cyan-400" />
              <span className="text-sm text-white/80">Teksting</span>
            </div>
            <button
              onClick={() => onChange({ ...config, effects: { ...config.effects, captions: !config.effects.captions } })}
              className={`w-12 h-6 rounded-full transition-all ${
                config.effects.captions ? 'bg-cyan-500' : 'bg-white/10'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                config.effects.captions ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {config.effects.captions && (
            <>
              <div>
                <label className="block text-xs text-white/50 mb-2">Stil</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['viral_pop', 'minimal', 'subtitle', 'animated'] as const).map(style => (
                    <button
                      key={style}
                      onClick={() => onChange({ ...config, effects: { ...config.effects, captionsStyle: style } })}
                      className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all ${
                        config.effects.captionsStyle === style
                          ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                          : 'bg-white/5 text-white/60 border-white/10'
                      }`}
                    >
                      {style.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-2">Farge</label>
                <div className="flex gap-2">
                  {['#FFB800', '#FF4757', '#00F5FF', '#FFFFFF', '#000000'].map(color => (
                    <button
                      key={color}
                      onClick={() => onChange({ ...config, effects: { ...config.effects, captionsColor: color } })}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        config.effects.captionsColor === color 
                          ? 'border-white scale-110' 
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs text-white/50 mb-2">Overganger</label>
            <div className="grid grid-cols-4 gap-2">
              {(['fade', 'smooth', 'zoom', 'none'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => onChange({ ...config, effects: { ...config.effects, transitions: t } })}
                  className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all ${
                    config.effects.transitions === t
                      ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                      : 'bg-white/5 text-white/60 border-white/10'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-2">Filter</label>
            <div className="grid grid-cols-3 gap-2">
              {(['none', 'cinematic', 'vibrant', 'warm', 'cool'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => onChange({ ...config, effects: { ...config.effects, filters: f } })}
                  className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all ${
                    config.effects.filters === f
                      ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                      : 'bg-white/5 text-white/60 border-white/10'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Output Settings */}
      {activeTab === 'output' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-2">Format</label>
            <div className="grid grid-cols-4 gap-2">
              {(['9:16', '16:9', '1:1', '4:5'] as const).map(ratio => (
                <button
                  key={ratio}
                  onClick={() => onChange({ ...config, output: { ...config.output, aspectRatio: ratio } })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                    config.output.aspectRatio === ratio
                      ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                      : 'bg-white/5 text-white/60 border-white/10'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-2">Publiser til</label>
            <div className="grid grid-cols-2 gap-2">
              {(['tiktok', 'youtube', 'instagram', 'reels'] as const).map(platform => (
                <button
                  key={platform}
                  onClick={() => {
                    const platforms = config.output.platforms.includes(platform as any)
                      ? config.output.platforms.filter(p => p !== platform)
                      : [...config.output.platforms, platform as any];
                    onChange({ ...config, output: { ...config.output, platforms } });
                  }}
                  className={`px-3 py-3 rounded-lg text-sm font-medium border transition-all flex items-center gap-2 ${
                    config.output.platforms.includes(platform as any)
                      ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                      : 'bg-white/5 text-white/60 border-white/10'
                  }`}
                >
                  {config.output.platforms.includes(platform as any) && <Check size={16} />}
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const DEFAULT_QUALITY_CONFIG: QualityConfig = {
  video: {
    resolution: '1080p',
    fps: 30,
    bitrate: 'high',
    format: 'mp4',
    codec: 'h264',
  },
  audio: {
    voice: 'ai',
    voiceId: 'nb-NO-PernilleNeural',
    language: 'nb',
    voiceStability: 0.5,
    voiceClarity: 0.85,
    backgroundMusic: true,
    musicVolume: 0.12,
    audioNormalization: true,
  },
  effects: {
    captions: true,
    captionsStyle: 'viral_pop',
    captionsColor: '#FFB800',
    transitions: 'fade',
    filters: 'none',
    speedRamping: false,
  },
  output: {
    aspectRatio: '9:16',
    platforms: ['tiktok'],
  },
};