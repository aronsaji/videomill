import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePipelineStore } from '../store/pipelineStore';
import { Video, Search, ExternalLink, Play, Clock, Share2 } from 'lucide-react';

export default function Library() {
  const { orders } = usePipelineStore();
  const publishedVideos = orders.filter(o => o.status === 'published');

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Video className="text-purple-400" />
            Video Library
          </h1>
          <p className="text-sm text-gray-500 mt-1">Ditt arkiv av ferdigproduserte og publiserte videoer</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Søk i biblioteket..." 
            className="bg-black/40 border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/50 transition-all w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {publishedVideos.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-surface/50 border border-border rounded-xl overflow-hidden hover:border-purple-400/30 transition-all group cursor-pointer"
            >
              {/* Thumbnail Area */}
              <div className="aspect-[9/16] bg-black/60 relative overflow-hidden flex items-center justify-center">
                {video.thumbnail_url ? (
                  <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-500" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black flex items-center justify-center">
                    <Play size={48} className="text-purple-400/50 group-hover:text-purple-400 transition-colors group-hover:scale-110 duration-300" />
                  </div>
                )}
                
                {/* Overlays */}
                <div className="absolute top-3 left-3 flex gap-1">
                  {video.platform_destinations.map(p => (
                    <span key={p} className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-black/60 backdrop-blur-md text-white rounded border border-white/10">
                      {p.substring(0, 2)}
                    </span>
                  ))}
                </div>
                <div className="absolute bottom-3 right-3 text-[10px] font-mono bg-black/80 text-white px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-1">
                  <Clock size={10} />
                  00:{video.duration}
                </div>
              </div>

              {/* Info Area */}
              <div className="p-4 relative">
                <div className="absolute -top-4 right-4 w-8 h-8 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-center text-purple-400 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                  <ExternalLink size={14} />
                </div>
                
                <h3 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors line-clamp-2 pr-6">
                  {video.title}
                </h3>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[11px] font-mono text-gray-500">{video.video_id}</span>
                  <div className="flex gap-2">
                    <button className="text-gray-500 hover:text-white transition-colors">
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {publishedVideos.length === 0 && (
        <div className="py-24 text-center border border-dashed border-border rounded-xl bg-surface/30">
          <Video className="mx-auto text-gray-600 mb-3" size={32} />
          <h3 className="text-gray-400 font-mono text-sm">INGEN VIDEOER PUBLISERT ENNÅ</h3>
          <p className="text-xs text-gray-600 mt-1">Når produksjonen din er ferdig, vil den dukke opp her.</p>
        </div>
      )}
    </div>
  );
}
