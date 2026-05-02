import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Users, Clock, Eye, Share2, ThumbsUp, MessageSquare } from 'lucide-react';

export default function Analytics() {
  // Mock data for analytics
  const metrics = [
    { label: 'Total Views', value: '1.2M', change: '+14%', isPositive: true, icon: Eye },
    { label: 'Watch Time', value: '45.2K hrs', change: '+8%', isPositive: true, icon: Clock },
    { label: 'Avg. Hook Retention', value: '62%', change: '-2%', isPositive: false, icon: Users },
    { label: 'Total Engagement', value: '84.3K', change: '+24%', isPositive: true, icon: TrendingUp },
  ];

  const topVideos = [
    { id: 'VM-8289', title: 'The Quiet Luxury trend explained', views: 890000, likes: 45000, shares: 12000, ctr: '8.4%' },
    { id: 'VM-8280', title: 'Why software engineering is changing forever', views: 210000, likes: 18000, shares: 3400, ctr: '6.2%' },
    { id: 'VM-8275', title: 'Tech news you missed this week', views: 95000, likes: 5200, shares: 800, ctr: '4.1%' },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart2 className="text-blue-400" />
          Analytics & Performance
        </h1>
        <p className="text-sm text-gray-500 mt-1">Overvåk ytelsen på tvers av plattformer (YouTube, TikTok, Instagram)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div 
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface/50 border border-border rounded-xl p-5 backdrop-blur-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <m.icon size={18} className="text-blue-400" />
              </div>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                m.isPositive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {m.change}
              </span>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{m.value}</p>
              <p className="text-xs font-mono text-gray-500 mt-1 uppercase">{m.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface/50 border border-border rounded-xl p-6 backdrop-blur-sm h-80 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <BarChart2 size={48} className="text-gray-700 mb-4" />
          <p className="text-gray-400 font-mono text-sm uppercase">Graf-integrasjon kommer snart</p>
          <p className="text-gray-600 text-xs mt-2 max-w-sm text-center">Her vil det komme en chart.js graf for å vise daglige visninger basert på performance_snapshots tabellen.</p>
        </div>

        <div className="bg-surface/50 border border-border rounded-xl p-6 backdrop-blur-sm flex flex-col">
          <h2 className="font-mono text-sm text-gray-400 uppercase mb-4">Top Performers (30 dager)</h2>
          <div className="flex-1 overflow-y-auto space-y-3">
            {topVideos.map((video, i) => (
              <motion.div 
                key={video.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
                className="p-3 bg-black/20 border border-border rounded-lg hover:border-blue-500/30 transition-colors"
              >
                <p className="text-sm font-medium text-gray-200 line-clamp-1">{video.title}</p>
                <p className="text-xs font-mono text-blue-400 my-1.5">{video.id}</p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 flex items-center gap-1"><Eye size={10} /> Views</span>
                    <span className="text-xs text-white font-mono">{(video.views / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 flex items-center gap-1"><ThumbsUp size={10} /> Likes</span>
                    <span className="text-xs text-white font-mono">{(video.likes / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500">CTR</span>
                    <span className="text-xs text-green-400 font-mono">{video.ctr}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
