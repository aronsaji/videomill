import { useState } from 'react';
import { Wand2, Image, Sparkles, RefreshCw, Download, Check } from 'lucide-react';

interface ThumbnailGeneratorProps {
  videoTitle: string;
  videoScenes?: { visualDescription?: string }[];
  onSelect?: (thumbnailUrl: string) => void;
}

const THEME_COLORS = [
  { bg: '#FFB800', accent: '#000', name: 'Gold' },
  { bg: '#FF4757', accent: '#fff', name: 'Red' },
  { bg: '#00F5FF', accent: '#000', name: 'Cyan' },
  { bg: '#8B5CF6', accent: '#fff', name: 'Purple' },
  { bg: '#10B981', accent: '#fff', name: 'Green' },
  { bg: '#F59E0B', accent: '#000', name: 'Amber' },
];

const STYLE_PRESETS = [
  { id: 'viral_bold', name: 'Viral Bold', font: 'Impact', effect: 'glow' },
  { id: 'modern_minimal', name: 'Modern', font: 'Inter', effect: 'gradient' },
  { id: 'news_anchor', name: 'News', font: 'Arial', effect: 'solid' },
  { id: 'cinematic', name: 'Cinematic', font: 'Bebas', effect: 'letterbox' },
];

export default function ThumbnailGenerator({ videoTitle, videoScenes, onSelect }: ThumbnailGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [generatedThumbnails, setGeneratedThumbnails] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState(THEME_COLORS[0]);
  const [selectedStyle, setSelectedStyle] = useState(STYLE_PRESETS[0]);
  const [customText, setCustomText] = useState('');

  const generateThumbnails = async () => {
    setGenerating(true);

    // Simulate AI thumbnail generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock thumbnails
    const mockUrls = [
      `https://picsum.photos/seed/${Date.now()}/1280/720`,
      `https://picsum.photos/seed/${Date.now() + 1}/1280/720`,
      `https://picsum.photos/seed/${Date.now() + 2}/1280/720`,
    ];

    setGeneratedThumbnails(mockUrls);
    setGenerating(false);
  };

  const displayText = customText || videoTitle;

  return (
    <div className="space-y-4">
      {/* Theme Colors */}
      <div>
        <label className="block text-xs text-white/50 mb-2">Farge-tema</label>
        <div className="flex gap-2">
          {THEME_COLORS.map((color, i) => (
            <button
              key={i}
              onClick={() => setSelectedColor(color)}
              className={`w-8 h-8 rounded-lg border-2 transition-all ${
                selectedColor.name === color.name ? 'border-white scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: color.bg }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Style Presets */}
      <div>
        <label className="block text-xs text-white/50 mb-2">Style</label>
        <div className="grid grid-cols-2 gap-2">
          {STYLE_PRESETS.map(style => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                selectedStyle.id === style.id
                  ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                  : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
              }`}
            >
              {style.name}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Text */}
      <div>
        <label className="block text-xs text-white/50 mb-2">Egen tekst (valgfritt)</label>
        <input
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder={videoTitle}
          className="w-full px-3 py-2 bg-[#12131A] border border-white/10 rounded-lg text-white text-sm"
        />
      </div>

      {/* Preview */}
      <div>
        <label className="block text-xs text-white/50 mb-2">Forhåndsvisning</label>
        <div 
          className="relative aspect-video rounded-xl overflow-hidden"
          style={{ backgroundColor: selectedColor.bg }}
        >
          {/* Text overlay */}
          <div 
            className={`absolute inset-0 flex items-center justify-center p-8 text-center ${
              selectedStyle.effect === 'glow' ? 'drop-shadow-lg' : ''
            }`}
            style={{ 
              color: selectedColor.accent,
              fontFamily: selectedStyle.font,
              fontSize: '2.5rem',
              fontWeight: 'bold',
              textShadow: selectedColor.accent === '#000' 
                ? '2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff'
                : '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000'
            }}
          >
            <span className="max-w-full truncate">
              {displayText.slice(0, 50)}
            </span>
          </div>

          {/* Channel branding */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/20" />
            <span className="text-white font-medium text-sm">VideoMill</span>
          </div>

          {/* Duration badge */}
          <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/70 rounded text-white text-xs font-medium">
            10:32
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateThumbnails}
        disabled={generating}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all"
      >
        {generating ? (
          <>
            <RefreshCw size={18} className="animate-spin" />
            Genererer...
          </>
        ) : (
          <>
            <Wand2 size={18} />
            AI-generer 3 varianter
          </>
        )}
      </button>

      {/* Generated Options */}
      {generatedThumbnails.length > 0 && (
        <div>
          <label className="block text-xs text-white/50 mb-2">AI-genererte alternativer</label>
          <div className="grid grid-cols-3 gap-2">
            {generatedThumbnails.map((url, i) => (
              <button
                key={i}
                onClick={() => onSelect?.(url)}
                className="relative aspect-video rounded-lg overflow-hidden group"
              >
                <img src={url} alt={`Variant ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Check size={24} className="text-white" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}