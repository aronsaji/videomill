import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Activity, Database, Play, Clock, 
  CheckCircle, FileText, Video, Image,
  Plus, ArrowRight, Sparkles, TrendingUp, AlertTriangle
} from 'lucide-react';
import { useVideos, useTrends } from '../lib/hooks/uselivedata';
import { Page } from '../lib/types';
import AnimatedLogo from '../components/AnimatedLogo';
import FactoryStatusBar from '../components/FactoryStatusBar';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

const stats = [
  { label: 'Produced', value: '1,248', icon: Database, color: 'text-violet-400' },
  { label: 'This Month', value: '47', icon: Activity, color: 'text-teal-400' },
  { label: 'Avg Render', value: '2.4x', icon: Zap, color: 'text-amber-400' },
  { label: 'Uptime', value: '99.9%', icon: CheckCircle, color: 'text-green-400' },
];

const RECENT_VIDEOS = [
  { id: 1, title: 'AI News #42', platform: 'tiktok', views: 12400, thumbnail: '' },
  { id: 2, title: 'Tech Review', platform: 'youtube', views: 8900, thumbnail: '' },
  { id: 3, title: 'Coding Tips', platform: 'tiktok', views: 5600, thumbnail: '' },
  { id: 4, title: 'Daily Hacks', platform: 'instagram', views: 3200, thumbnail: '' },
];

const PIPELINE_STEPS = [
  { id: 1, label: 'Scripting', status: 'active', progress: 75 },
  { id: 2, label: 'Voiceover', status: 'pending', progress: 0 },
  { id: 3, label: 'Vision', status: 'pending', progress: 0 },
  { id: 4, label: 'Render', status: 'pending', progress: 0 },
  { id: 5, label: 'Export', status: 'pending', progress: 0 },
];

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { data: videos } = useVideos();
  
  // Simulated job state - in production this comes from Supabase Realtime
  const [currentJob, setCurrentJob] = useState({
    progress: 65,
    status: 'processing' as const,
    currentStep: 'FFmpeg Rendering'
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#050505] p-6"
    >
      {/* Neural Grid Background */}
      <div className="fixed inset-0 neural-grid opacity-30 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-br from-violet-900/10 to-teal-900/10 pointer-events-none" />
      
      <div className="relative z-10 max-w-[1600px] mx-auto space-y-6">
        {/* Header with AnimatedLogo */}
        <div className="flex justify-between items-end">
          <div className="flex items-end gap-6">
            <AnimatedLogo />
            <div>
              <motion.h1 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl font-light tracking-tight text-white"
              >
                Mission Control
              </motion.h1>
              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-teal-400 font-mono text-xs uppercase tracking-[0.2em] mt-2"
              >
                Autonomous Video Factory • Active
              </motion.p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('studio')}
            className="bg-gradient-to-r from-violet-600 to-violet-500 px-6 py-3 rounded-full text-sm font-semibold text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] flex items-center gap-2"
          >
            <Plus size={18} />
            New Batch
          </motion.button>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Studio Input - Large Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-8 bg-[#0A0A0A]/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10">
              <h2 className="text-lg font-medium mb-6 flex items-center gap-2 text-white">
                <Sparkles className="text-violet-500" size={20} /> 
                Studio Input
              </h2>
              
              {/* Dropzone */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="h-64 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-white/30 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all cursor-pointer group"
              >
                <Image size={40} className="mb-4 text-white/20 group-hover:text-violet-400 transition-colors" />
                <p className="text-sm">Drop image for AI generation</p>
                <p className="text-xs text-white/30 mt-2">or click to browse</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Factory Status Bar - WOW Component */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-4"
          >
            <FactoryStatusBar 
              progress={currentJob.progress}
              status={currentJob.status}
              currentStep={currentJob.currentStep}
            />
          </motion.div>

          {/* Stats Grid */}
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="col-span-3 bg-[#0A0A0A]/80 border border-white/10 p-6 rounded-2xl backdrop-blur-xl"
            >
              <div className="flex items-center gap-4">
                <div className={`${stat.color} opacity-60`}>
                  <stat.icon size={20} />
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest">{stat.label}</p>
                  <motion.p 
                    className="text-2xl font-light text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    {stat.value}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Recent Outputs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="col-span-8 bg-[#0A0A0A]/80 border border-white/10 rounded-3xl p-6 backdrop-blur-xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-medium text-white flex items-center gap-2">
                <Video className="text-violet-400" size={18} />
                Recent Outputs
              </h3>
              <button 
                onClick={() => onNavigate('library')}
                className="text-xs text-white/40 hover:text-white flex items-center gap-1"
              >
                View All <ArrowRight size={12} />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {RECENT_VIDEOS.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="aspect-video bg-white/5 rounded-xl overflow-hidden cursor-pointer group relative"
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={24} className="text-white" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-xs text-white truncate">{video.title}</p>
                    <p className="text-[10px] text-white/50">{video.views.toLocaleString()} views</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="col-span-4 bg-[#0A0A0A]/80 border border-white/10 rounded-3xl p-6 backdrop-blur-xl"
          >
            <h3 className="font-medium mb-6 text-white">Quick Actions</h3>
            
            <div className="space-y-3">
              {[
                { icon: FileText, label: 'New Script', color: 'violet' },
                { icon: TrendingUp, label: 'Trend Hunter', color: 'teal' },
                { icon: LayoutGrid, label: 'Batch Mode', color: 'amber' },
              ].map((action) => (
                <motion.button
                  key={action.label}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 bg-white/5 rounded-xl flex items-center gap-3 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <action.icon size={18} className={`text-${action.color}-400`} />
                  <span className="text-sm">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}