import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePipelineStore } from '../store/pipelineStore';
import { ShoppingCart, Plus, Filter, Clock, CheckCircle2, AlertTriangle, Loader } from 'lucide-react';
import type { OrderStatus } from '../types';

export default function Orders() {
  const { orders } = usePipelineStore();
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  
  // Form states
  const [topic, setTopic] = useState('');
  const [styleTone, setStyleTone] = useState('⚡ Engaging');
  const [targetAudience, setTargetAudience] = useState('🎮 Youth (18–25)');
  const [aiVoice, setAiVoice] = useState('🗣️ Nova (Female)');
  const [videoFormat, setVideoFormat] = useState('📱 9:16 (Vertical)');
  const [platforms, setPlatforms] = useState<string[]>(['TikTok', 'YouTube Shorts']);
  const [language, setLanguage] = useState('Norsk');
  const [instructions, setInstructions] = useState('');

  const handleCreateOrder = () => {
    usePipelineStore.getState().addOrder({
      title: topic || 'New Manual Video',
      topic: topic || 'Custom',
      style_tone: styleTone,
      target_audience: targetAudience,
      video_format: videoFormat,
      ai_voice: aiVoice,
      platform_destinations: platforms.map(p => p.toLowerCase().split(' ')[0]) as any,
      language,
      custom_instructions: instructions,
    });
    setShowForm(false);
    setTopic('');
    setInstructions('');
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="text-neon-cyan" />
            Ordre & Bestillinger
          </h1>
          <p className="text-sm text-gray-500 mt-1">Administrer videokøen og opprett nye manuelle bestillinger</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(0,245,255,0.1)] hover:shadow-[0_0_20px_rgba(0,245,255,0.2)]"
        >
          <Plus size={16} />
          Ny Bestilling
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-surface/80 border border-border rounded-xl p-6 backdrop-blur-sm relative">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-neon-cyan to-blue-500" />
              <h2 className="text-lg font-bold text-white mb-4">Opprett ny videobestilling</h2>
              
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-gray-400">TEMA / TITTELL</label>
                    <input value={topic} onChange={e => setTopic(e.target.value)} type="text" placeholder="F.eks: Top 5 AI Tools in 2026" className="w-full bg-black/40 border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-gray-400">1. STYLE & TONE</label>
                      <div className="flex flex-wrap gap-2">
                        {['⚡ Engaging', '📚 Informative', '😄 Humorous', '🎭 Dramatic', '✨ Inspiring', '🔥 Viral'].map(style => (
                          <button
                            key={style}
                            type="button"
                            onClick={() => setStyleTone(style)}
                            className={`px-3 py-1.5 text-[11px] font-medium rounded-lg border transition-all ${
                              styleTone === style 
                                ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(0,245,255,0.2)]'
                                : 'bg-black/40 border-border text-gray-400 hover:bg-white/5 hover:border-gray-500'
                            }`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono text-gray-400">2. TARGET AUDIENCE</label>
                      <div className="flex flex-wrap gap-2">
                        {['🎮 Youth (18–25)', '👔 Adults (25–45)', '🏡 Seniors (45+)', '💻 Tech', '👨‍👩‍👧 Parents', '🎓 Students', '💼 Business', '💪 Health', '🎨 Creative', '🕹️ Gamers'].map(aud => (
                          <button
                            key={aud}
                            type="button"
                            onClick={() => setTargetAudience(aud)}
                            className={`px-3 py-1.5 text-[11px] font-medium rounded-lg border transition-all ${
                              targetAudience === aud 
                                ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(0,245,255,0.2)]'
                                : 'bg-black/40 border-border text-gray-400 hover:bg-white/5 hover:border-gray-500'
                            }`}
                          >
                            {aud}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono text-gray-400">3. AI VOICE</label>
                      <div className="flex flex-wrap gap-2">
                        {['🗣️ Nova (Female)', '🗣️ Echo (Male)', '🗣️ Fable (Neutral)', '🗣️ Onyx (Deep Male)', '🗣️ Alloy (Neutral)', '🗣️ Shimmer (Female)'].map(voice => (
                          <button
                            key={voice}
                            type="button"
                            onClick={() => setAiVoice(voice)}
                            className={`px-3 py-1.5 text-[11px] font-medium rounded-lg border transition-all ${
                              aiVoice === voice 
                                ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(0,245,255,0.2)]'
                                : 'bg-black/40 border-border text-gray-400 hover:bg-white/5 hover:border-gray-500'
                            }`}
                          >
                            {voice}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono text-gray-400">4. VIDEO FORMAT</label>
                      <div className="flex flex-wrap gap-2">
                        {['📱 9:16 (Vertical)', '📺 16:9 (Horizontal)', '⬛ 1:1 (Square)'].map(format => (
                          <button
                            key={format}
                            type="button"
                            onClick={() => setVideoFormat(format)}
                            className={`px-3 py-1.5 text-[11px] font-medium rounded-lg border transition-all ${
                              videoFormat === format 
                                ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(0,245,255,0.2)]'
                                : 'bg-black/40 border-border text-gray-400 hover:bg-white/5 hover:border-gray-500'
                            }`}
                          >
                            {format}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-border/50">
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-gray-400">PLATTFORMER</label>
                      <div className="flex flex-wrap gap-2">
                        {['TikTok', 'YouTube Shorts', 'Instagram Reels'].map(p => {
                          const isActive = platforms.includes(p);
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                              className={`px-3 py-1.5 text-[11px] font-medium rounded-lg border transition-all ${
                                isActive
                                  ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(0,245,255,0.2)]'
                                  : 'bg-black/40 border-border text-gray-400 hover:bg-white/5 hover:border-gray-500'
                              }`}
                            >
                              {p}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-gray-400">SPRÅK</label>
                      <div className="flex flex-wrap gap-2">
                        {['Norsk', 'Engelsk', 'Svensk'].map(lang => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => setLanguage(lang)}
                            className={`px-3 py-1.5 text-[11px] font-medium rounded-lg border transition-all ${
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
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-gray-400">EKSTRA INSTRUKSJONER (PROMPT)</label>
                    <textarea value={instructions} onChange={e => setInstructions(e.target.value)} rows={3} placeholder="Instruksjoner for AI script generator..." className="w-full bg-black/40 border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all resize-none"></textarea>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">Avbryt</button>
                  <button type="button" onClick={handleCreateOrder} className="px-6 py-2 bg-neon-cyan text-black rounded-lg text-sm font-bold hover:bg-neon-cyan/90 transition-colors flex items-center gap-2">
                    Start Produksjon
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-surface/50 border border-border rounded-xl backdrop-blur-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <Filter size={16} className="text-gray-500" />
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {['all', 'queued', 'rendering', 'published', 'failed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`px-3 py-1 rounded-full text-xs font-mono capitalize transition-colors border ${
                  statusFilter === status 
                    ? 'bg-white/10 border-white/20 text-white' 
                    : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 text-xs font-mono text-gray-500 bg-black/20">
                <th className="p-4 font-normal">Video ID</th>
                <th className="p-4 font-normal">Tittel / Tema</th>
                <th className="p-4 font-normal">Plattformer</th>
                <th className="p-4 font-normal">Status</th>
                <th className="p-4 font-normal text-right">Opprettet</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredOrders.map((order, i) => (
                  <motion.tr 
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/50 hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <td className="p-4 text-sm font-mono text-gray-400 group-hover:text-neon-cyan transition-colors">
                      {order.video_id}
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-200">{order.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{order.category}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {order.platform_destinations.map(p => (
                          <span key={p} className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-white/5 text-gray-400 rounded">
                            {p.substring(0, 2)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {order.status === 'published' && <CheckCircle2 size={14} className="text-green-400" />}
                        {order.status === 'failed' && <AlertTriangle size={14} className="text-red-400" />}
                        {order.status === 'queued' && <Clock size={14} className="text-gray-400" />}
                        {['script_generation', 'rendering', 'uploading'].includes(order.status) && <Loader size={14} className="text-neon-cyan animate-spin" />}
                        <span className="text-xs font-mono text-gray-300 capitalize">
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right text-xs font-mono text-gray-500">
                      {new Date(order.created_at).toLocaleString('nb-NO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="p-12 text-center text-gray-500 font-mono text-sm">
              Ingen bestillinger funnet for dette filteret.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
