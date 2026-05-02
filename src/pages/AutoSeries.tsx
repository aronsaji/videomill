import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Film, Sparkles, Play, Camera, Smartphone,
  Plus, Minus, Globe, History, Check, ArrowRight
} from 'lucide-react';

const LANGUAGES = [
  { id: 'ta', label: 'Tamil', flag: '🇮🇳' },
  { id: 'no', label: 'Norsk', flag: '🇳🇴' },
  { id: 'en', label: 'English', flag: '🇬🇧' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
  { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
  { id: 'hi', label: 'Hindi', flag: '🇮🇳' },
];

const PLATFORMS = [
  { id: 'youtube', label: 'YouTube', icon: Play, color: 'hover:border-red-500 hover:text-red-400', activeBg: 'bg-red-500/10 border-red-500 text-red-400' },
  { id: 'tiktok', label: 'TikTok', icon: Smartphone, color: 'hover:border-pink-500 hover:text-pink-400', activeBg: 'bg-pink-500/10 border-pink-500 text-pink-400' },
  { id: 'instagram', label: 'Instagram', icon: Camera, color: 'hover:border-purple-500 hover:text-purple-400', activeBg: 'bg-purple-500/10 border-purple-500 text-purple-400' },
];

export default function AutoSeries() {
  const [activeTab, setActiveTab] = useState<'new' | 'mine'>('new');
  
  // Form State
  const [title, setTitle] = useState('Sesong 1: Muvendar — De tre store Tamil-kongene');
  const [description, setDescription] = useState('Fokus: Chola, Chera og Pandya-dynastiene\nInnhold: Opprinnelsen, de største kongene, handel og de første store militære konfliktene\nVinkling: Episk historiefortelling — som en Netflix-serie om det virkelige Tamil Nadu\nMålgruppe: Tamil-diaspora og historieinteresserte worldwide');
  const [selectedLanguage, setSelectedLanguage] = useState('ta');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['youtube']);
  const [seasonNum, setSeasonNum] = useState(1);
  const [episodesCount, setEpisodesCount] = useState(10);
  
  const [isGenerating, setIsGenerating] = useState(false);

  const togglePlatform = (id: string) => {
    if (selectedPlatforms.includes(id)) {
      if (selectedPlatforms.length > 1) {
         setSelectedPlatforms(selectedPlatforms.filter(p => p !== id));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation start
    setTimeout(() => {
      setIsGenerating(false);
      setActiveTab('mine');
    }, 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Film className="text-neon-cyan" size={28} />
          Auto-Serie Studio
        </h1>
        <p className="text-sm text-gray-400 mt-2 flex items-center gap-2">
          Lim inn en idé <ArrowRight size={14} /> AI genererer hele sesongen <ArrowRight size={14} /> automatisk produksjon
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('new')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'new' ? 'text-neon-cyan' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Ny serie
          {activeTab === 'new' && (
            <motion.div
              layoutId="autoseries-tab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-cyan"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('mine')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative flex items-center gap-2 ${
            activeTab === 'mine' ? 'text-neon-cyan' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Mine serier
          <span className="bg-neon-cyan/20 text-neon-cyan text-[10px] px-1.5 py-0.5 rounded-full font-bold">1</span>
          {activeTab === 'mine' && (
            <motion.div
              layoutId="autoseries-tab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-cyan"
            />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'new' ? (
          <motion.div
            key="new"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Serietittel / Sesong</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="F.eks. Historien om Romerriket"
                className="w-full bg-surface/50 border border-border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex justify-between">
                Beskriv innholdet
                <span className="text-gray-500 text-xs">jo mer detaljer, jo bedre episoder</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/20 to-purple-500/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Eksempel: Fokus på Chola-dynastiet..."
                  className="w-full bg-surface/50 border border-border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all resize-none font-mono text-sm leading-relaxed"
                />
              </div>
            </div>

            {/* Language Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Globe size={16} className="text-neon-cyan" /> Språk
              </label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLanguage(lang.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      selectedLanguage === lang.id
                        ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan shadow-[0_0_15px_rgba(0,245,255,0.15)]'
                        : 'bg-surface/50 border-border text-gray-400 hover:border-gray-600 hover:text-gray-200'
                    }`}
                  >
                    <span className="text-lg leading-none">{lang.flag}</span>
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">Plattform</label>
              <div className="flex flex-wrap gap-3">
                {PLATFORMS.map((platform) => {
                  const isActive = selectedPlatforms.includes(platform.id);
                  const Icon = platform.icon;
                  return (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl border font-medium transition-all duration-300 ${
                        isActive
                          ? platform.activeBg
                          : `bg-surface/50 border-border text-gray-400 ${platform.color}`
                      }`}
                    >
                      <Icon size={18} />
                      {platform.label}
                      {isActive && <Check size={14} className="ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Counters */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Sesong #</label>
                <div className="flex items-center">
                  <button 
                    onClick={() => setSeasonNum(Math.max(1, seasonNum - 1))}
                    className="w-12 h-12 flex items-center justify-center bg-surface/50 border border-border rounded-l-lg hover:bg-white/5 text-gray-400 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <div className="flex-1 h-12 flex items-center justify-center border-y border-border bg-black/20 text-white font-bold text-lg font-mono">
                    {seasonNum}
                  </div>
                  <button 
                    onClick={() => setSeasonNum(seasonNum + 1)}
                    className="w-12 h-12 flex items-center justify-center bg-surface/50 border border-border rounded-r-lg hover:bg-white/5 text-gray-400 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Antall episoder</label>
                <div className="flex items-center">
                  <button 
                    onClick={() => setEpisodesCount(Math.max(1, episodesCount - 1))}
                    className="w-12 h-12 flex items-center justify-center bg-surface/50 border border-border rounded-l-lg hover:bg-white/5 text-gray-400 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <div className="flex-1 h-12 flex items-center justify-center border-y border-border bg-black/20 text-white font-bold text-lg font-mono">
                    {episodesCount}
                  </div>
                  <button 
                    onClick={() => setEpisodesCount(episodesCount + 1)}
                    className="w-12 h-12 flex items-center justify-center bg-surface/50 border border-border rounded-r-lg hover:bg-white/5 text-gray-400 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-6">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !title || !description}
                className={`w-full py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all relative overflow-hidden group ${
                  isGenerating || !title || !description
                    ? 'bg-surface border border-border text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-neon-cyan to-blue-600 text-background hover:shadow-[0_0_30px_rgba(0,245,255,0.3)]'
                }`}
              >
                {!isGenerating && !(!title || !description) && (
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                )}
                
                {isGenerating ? (
                  <Sparkles className="animate-spin text-neon-cyan" size={24} />
                ) : (
                  <Sparkles size={24} />
                )}
                <span className="relative z-10">
                  {isGenerating ? 'Genererer AI-skript...' : `Generer ${episodesCount} episoder automatisk`}
                </span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="mine"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-surface/50 border border-border rounded-xl overflow-hidden backdrop-blur-sm">
              <div className="p-6 border-b border-border/50 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-white">Sesong 1: Muvendar — De tre store Tamil-kongene</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan">
                      Aktiv
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2 max-w-2xl">
                    Fokus: Chola, Chera og Pandya-dynastiene. Episk historiefortelling for Tamil-diaspora.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">10</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-mono">Episoder</div>
                </div>
              </div>
              
              <div className="bg-black/20 p-6">
                <h4 className="text-sm font-mono text-gray-500 uppercase mb-4 flex items-center gap-2">
                  <History size={15} /> Sesong-progresjon
                </h4>
                
                <div className="space-y-3">
                  {[1, 2, 3].map((ep) => (
                    <div key={ep} className="flex items-center gap-4 bg-surface/30 p-3 rounded-lg border border-border/50">
                      <div className="w-8 h-8 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan flex items-center justify-center font-mono text-sm font-bold">
                        {ep}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-200">Episode {ep}: {ep === 1 ? 'Chola-dynastiets fremvekst' : ep === 2 ? 'De store maritime ekspedisjonene' : 'Pandyaenes hevn'}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">
                          {ep === 1 ? 'PUBLISERT' : ep === 2 ? 'RENDERING...' : 'MANUS GENERERT'}
                        </div>
                      </div>
                      {ep === 1 ? (
                        <div className="w-24 h-1.5 bg-green-500/20 rounded-full overflow-hidden">
                          <div className="h-full w-full bg-green-500 rounded-full" />
                        </div>
                      ) : ep === 2 ? (
                        <div className="w-24 h-1.5 bg-black/40 rounded-full overflow-hidden">
                          <div className="h-full w-2/3 bg-neon-cyan rounded-full animate-pulse" />
                        </div>
                      ) : (
                        <div className="w-24 h-1.5 bg-black/40 rounded-full overflow-hidden">
                          <div className="h-full w-1/4 bg-blue-500 rounded-full" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div className="flex items-center justify-center py-4 border border-dashed border-border/50 rounded-lg text-gray-500 text-sm font-mono bg-black/10">
                    + 7 episoder i produksjonskø
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
