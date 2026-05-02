import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePipelineStore } from '../store/pipelineStore';
import { Flame, Video, RefreshCw, Plus, ExternalLink, ArrowUpRight, X, Monitor, Smartphone, Send, Heart, CheckCircle } from 'lucide-react';
import type { TrendingTopic } from '../types';

const INITIAL_SOCIAL_ACCOUNTS = [
  { id: 'acc1', platform: 'youtube', handle: '@VideoMillOfficial', icon: Monitor },
  { id: 'acc2', platform: 'tiktok', handle: '@VideoMill.no', icon: Smartphone },
  { id: 'acc3', platform: 'twitter', handle: '@videomill_tech', icon: Send },
  { id: 'acc4', platform: 'instagram', handle: '@videomill_daily', icon: Heart },
];

export default function TrendAnalyzer() {
  const { trends, isLoading, fetchInitialData } = usePipelineStore();
  const [filter, setFilter] = useState<'all' | 'tiktok' | 'youtube' | 'google'>('all');
  
  const [selectedTrend, setSelectedTrend] = useState<TrendingTopic | null>(null);
  
  // Accounts & Modal State
  const [accounts, setAccounts] = useState(INITIAL_SOCIAL_ACCOUNTS);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['acc1', 'acc2']);
  const [language, setLanguage] = useState('Norsk');
  const [styleTone, setStyleTone] = useState('Auto');
  const [targetAudience, setTargetAudience] = useState('Auto');
  const [aiVoice, setAiVoice] = useState('🗣️ Nova (Female)');
  const [videoFormat, setVideoFormat] = useState('📱 9:16 (Vertical)');
  const [isOrdering, setIsOrdering] = useState(false);
  const [showConnectView, setShowConnectView] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const filteredTrends = filter === 'all' ? trends : trends.filter(t => t.source === filter);

  const toggleChannel = (id: string) => {
    setSelectedChannels(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleOrder = () => {
    setIsOrdering(true);
    
    usePipelineStore.getState().addOrder({
      title: selectedTrend?.title || 'Auto Trend Video',
      topic: selectedTrend?.tags[0] || 'Trend',
      style_tone: styleTone,
      target_audience: targetAudience,
      video_format: videoFormat,
      ai_voice: aiVoice,
      language: language,
      platform_destinations: accounts.filter(a => selectedChannels.includes(a.id)).map(a => a.platform) as any,
    });

    setTimeout(() => {
      setIsOrdering(false);
      setSelectedTrend(null);
    }, 1500);
  };

  const handleConnectAccount = (platform: string, icon: any) => {
    setIsConnecting(platform);
    setTimeout(() => {
      const newId = `acc_${Date.now()}`;
      setAccounts(prev => [...prev, {
        id: newId,
        platform,
        handle: `@din_konto_${platform}`,
        icon
      }]);
      setSelectedChannels(prev => [...prev, newId]); // auto select
      setIsConnecting(null);
      setShowConnectView(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Flame className="text-neon-amber" />
            Trend Radar
          </h1>
          <p className="text-sm text-gray-500 mt-1">AI-detected trends from TikTok, YouTube and X (Twitter)</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchInitialData()}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 border border-border rounded-lg transition-colors"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Scan Now
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border pb-4">
        {['all', 'tiktok', 'youtube', 'google'].map((src) => (
          <button
            key={src}
            onClick={() => setFilter(src as any)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase transition-colors border ${
              filter === src 
                ? 'bg-neon-amber/10 border-neon-amber/30 text-neon-amber' 
                : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            {src === 'google' ? 'X (Twitter)' : src}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredTrends.map((trend, i) => (
            <motion.div
              key={trend.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              className="bg-surface/50 border border-border rounded-xl p-5 hover:border-neon-amber/30 transition-all group relative overflow-hidden cursor-pointer"
              onClick={() => setSelectedTrend(trend)}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-amber/5 rounded-full blur-3xl group-hover:bg-neon-amber/10 transition-colors pointer-events-none" />
              
              <div className="flex justify-between items-start mb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1.5 ${
                    trend.source === 'tiktok' ? 'bg-pink-500/15 text-pink-400 border border-pink-500/20' :
                    trend.source === 'youtube' ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
                    'bg-white/10 text-gray-300 border border-white/20'
                  }`}>
                    {trend.source === 'youtube' && <Monitor size={12} />}
                    {trend.source === 'tiktok' && <Smartphone size={12} />}
                    {trend.source === 'google' && <Send size={12} className="text-[#1DA1F2]" />}
                    {trend.source === 'google' ? 'X (TWITTER)' : trend.source}
                  </span>
                  <span className="text-xs font-mono text-neon-amber bg-neon-amber/10 px-2 py-0.5 rounded border border-neon-amber/20 flex items-center gap-1">
                    <ArrowUpRight size={12} />
                    {trend.viral_score}% POPULARITY
                  </span>
                </div>
                <button className="text-gray-500 hover:text-white transition-colors">
                  <ExternalLink size={16} />
                </button>
              </div>

              <div className="relative z-10">
                <h3 className="text-lg font-bold text-gray-100 group-hover:text-white transition-colors leading-tight mb-2">
                  {trend.title}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                  {trend.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {trend.tags.map(tag => (
                    <span key={tag} className="text-[11px] font-mono bg-black/40 text-gray-500 px-2 py-1 rounded border border-white/5">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 mt-auto pt-2 border-t border-border/50">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTrend(trend);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 rounded-lg text-sm font-bold transition-all hover:shadow-[0_0_15px_rgba(0,245,255,0.15)]"
                  >
                    <Plus size={16} />
                    Lag video av trend
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTrends.length === 0 && !isLoading && (
          <div className="col-span-full py-20 text-center border border-dashed border-border rounded-xl bg-surface/30">
            <Flame className="mx-auto text-gray-600 mb-3" size={32} />
            <h3 className="text-gray-400 font-mono text-sm">NO TRENDS DETECTED</h3>
            <p className="text-xs text-gray-600 mt-1">Try adjusting your filters or wait for the next scan.</p>
          </div>
        )}
      </div>

      {/* Order Modal */}
      <AnimatePresence>
        {selectedTrend && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedTrend(null)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface border border-border w-full max-w-xl rounded-2xl shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-border bg-black/20">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Start Produksjon</h2>
                    <p className="text-sm text-gray-400">Bestill video basert på "{selectedTrend.title}"</p>
                  </div>
                  <button onClick={() => setSelectedTrend(null)} className="text-gray-500 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {!showConnectView ? (
                  <>
                    <div className="space-y-6">
                      <div className="space-y-4 mb-6 pb-6 border-b border-border/50">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-gray-500">1. Style & Tone</label>
                          <div className="flex flex-wrap gap-2">
                            {['Auto', '⚡ Engaging', '📚 Informative', '😄 Humorous', '🎭 Dramatic', '✨ Inspiring', '🔥 Viral'].map(style => (
                              <button
                                key={style}
                                onClick={() => setStyleTone(style)}
                                className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                  styleTone === style 
                                    ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
                                    : 'bg-black/40 border-border text-gray-400 hover:bg-white/5'
                                }`}
                              >
                                {style}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-gray-500">2. Target Audience</label>
                          <div className="flex flex-wrap gap-2">
                            {['Auto', '🎮 Youth (18–25)', '👔 Adults (25–45)', '🏡 Seniors (45+)', '💻 Tech', '👨‍👩‍👧 Parents', '🎓 Students', '💼 Business', '💪 Health', '🎨 Creative', '🕹️ Gamers'].map(aud => (
                              <button
                                key={aud}
                                onClick={() => setTargetAudience(aud)}
                                className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                  targetAudience === aud 
                                    ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
                                    : 'bg-black/40 border-border text-gray-400 hover:bg-white/5'
                                }`}
                              >
                                {aud}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-gray-500">3. AI Voice</label>
                            <div className="flex flex-col gap-1.5">
                              {['🗣️ Nova (Female)', '🗣️ Echo (Male)', '🗣️ Fable (Neutral)'].map(voice => (
                                <button
                                  key={voice}
                                  onClick={() => setAiVoice(voice)}
                                  className={`px-2 py-1.5 text-[10px] font-bold rounded border transition-all text-left ${
                                    aiVoice === voice 
                                      ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
                                      : 'bg-black/40 border-border text-gray-400 hover:bg-white/5'
                                  }`}
                                >
                                  {voice}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-gray-500">4. Video Format</label>
                            <div className="flex flex-col gap-1.5">
                              {['📱 9:16 (Vertical)', '📺 16:9 (Horizontal)', '⬛ 1:1 (Square)'].map(format => (
                                <button
                                  key={format}
                                  onClick={() => setVideoFormat(format)}
                                  className={`px-2 py-1.5 text-[10px] font-bold rounded border transition-all text-left ${
                                    videoFormat === format 
                                      ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
                                      : 'bg-black/40 border-border text-gray-400 hover:bg-white/5'
                                  }`}
                                >
                                  {format}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                        <Monitor size={16} className="text-neon-amber" />
                        Språk & Publiseringskanaler
                      </h3>
                      
                      <div className="mb-6">
                        <label className="text-xs text-gray-500 mb-2 block">Velg videoens språk:</label>
                        <div className="flex gap-2">
                          {['Norsk', 'Engelsk', 'Svensk'].map(lang => (
                            <button
                              key={lang}
                              onClick={() => setLanguage(lang)}
                              className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
                                language === lang 
                                  ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(0,245,255,0.2)]'
                                  : 'bg-black/40 border-border text-gray-400 hover:bg-white/5 hover:border-gray-500'
                              }`}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mb-4">Velg hvilke av dine tilkoblede kontoer videoen skal publiseres til automatisk.</p>
                      
                      <div className="space-y-2">
                        {accounts.map((acc) => {
                          const isActive = selectedChannels.includes(acc.id);
                          return (
                            <div 
                              key={acc.id}
                              onClick={() => toggleChannel(acc.id)}
                              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                                isActive ? 'bg-neon-cyan/10 border-neon-cyan text-white' : 'bg-white/5 border-border text-gray-400 hover:bg-white/10 hover:border-gray-600'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isActive ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-black/40 text-gray-500'}`}>
                                  <acc.icon size={18} />
                                </div>
                                <div>
                                  <div className="font-bold text-sm">{acc.handle}</div>
                                  <div className="text-[10px] uppercase font-bold text-gray-500">{acc.platform}</div>
                                </div>
                              </div>
                              <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isActive ? 'bg-neon-cyan border-neon-cyan text-black' : 'border-gray-600'}`}>
                                {isActive && <CheckCircle size={14} strokeWidth={3} />}
                              </div>
                            </div>
                          )
                        })}
                        
                        <button 
                          onClick={() => setShowConnectView(true)}
                          className="w-full flex items-center justify-center gap-2 p-3 mt-4 rounded-xl border border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-colors"
                        >
                          <Plus size={16} />
                          Koble til ny konto
                        </button>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border flex justify-end gap-3">
                      <button 
                        onClick={() => setSelectedTrend(null)}
                        className="px-5 py-2.5 rounded-lg font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        Avbryt
                      </button>
                      <button 
                        onClick={handleOrder}
                        disabled={isOrdering || selectedChannels.length === 0}
                        className={`px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg ${
                          isOrdering || selectedChannels.length === 0
                            ? 'bg-white/10 text-gray-500 cursor-not-allowed shadow-none'
                            : 'bg-neon-cyan text-black hover:bg-neon-cyan/90 hover:shadow-[0_0_20px_rgba(0,245,255,0.4)]'
                        }`}
                      >
                        {isOrdering ? (
                          <RefreshCw size={18} className="animate-spin" />
                        ) : (
                          <Monitor size={18} />
                        )}
                        {isOrdering ? 'Sender ordre...' : 'Start Video Produksjon'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Koble til plattform</h3>
                      <p className="text-xs text-gray-500 mb-4">Velg hvilken type konto du vil legge til i VideoMill.</p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { p: 'youtube', label: 'YouTube', icon: Monitor, color: 'text-red-500' },
                          { p: 'tiktok', label: 'TikTok', icon: Smartphone, color: 'text-white' },
                          { p: 'instagram', label: 'Instagram', icon: Heart, color: 'text-pink-500' },
                          { p: 'twitter', label: 'X (Twitter)', icon: Send, color: 'text-blue-400' },
                        ].map(opt => (
                          <button
                            key={opt.p}
                            onClick={() => handleConnectAccount(opt.p, opt.icon)}
                            disabled={isConnecting !== null}
                            className={`flex flex-col items-center gap-3 p-4 border border-border rounded-xl transition-all ${
                              isConnecting === opt.p ? 'bg-white/10 border-gray-500' : 'bg-surface hover:bg-white/5'
                            }`}
                          >
                            {isConnecting === opt.p ? (
                              <RefreshCw size={24} className="animate-spin text-neon-cyan" />
                            ) : (
                              <opt.icon size={24} className={opt.color} />
                            )}
                            <span className="text-sm font-bold">{isConnecting === opt.p ? 'Godkjenner...' : opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border flex justify-end">
                      <button 
                        onClick={() => setShowConnectView(false)}
                        disabled={isConnecting !== null}
                        className="px-5 py-2.5 rounded-lg font-bold text-gray-400 hover:text-white transition-colors"
                      >
                        Tilbake
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
