import React from 'react';
import { Bot, Briefcase, DollarSign, TrendingUp, Shield, Wrench, MessageSquare, Activity, Search, UploadCloud, Clock, Play } from 'lucide-react';

const AGENTS = [
  { id: 'coo', name: 'COO', role: 'Chief Operating Officer', desc: 'Operations, efficiency and production KPIs', schedule: 'Daily at 02:00', status: 'Waiting', icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'cfo', name: 'CFO', role: 'Chief Financial Officer', desc: 'Finance, ROI and cost analysis', schedule: 'Daily at 02:00', status: 'Waiting', icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
  { id: 'marketing', name: 'Marketing', role: 'Marketing Director', desc: 'Trends, content strategy and hashtags', schedule: 'Every 4 hours', status: 'Waiting', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'ciso', name: 'CISO', role: 'Chief Security Officer', desc: 'Security and ISO 27001 compliance', schedule: 'Hourly', status: 'Waiting', icon: Shield, color: 'text-red-400', bg: 'bg-red-500/10' },
  { id: 'error-fixer', name: 'Error Fixer', role: 'Auto-Error Resolution', desc: 'Auto-fixes failed videos', schedule: 'Every 15 min', status: 'Waiting', icon: Wrench, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { id: 'social', name: 'Social Response', role: 'Social Media Agent', desc: 'Auto-replies to comments and DMs', schedule: 'On webhook', status: 'Waiting', icon: MessageSquare, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { id: 'watchdog', name: 'Watchdog', role: 'Video Failure Monitor', desc: 'Monitors pipeline and restarts stuck videos', schedule: 'Every 10 min', status: 'Waiting', icon: Activity, color: 'text-neon-cyan', bg: 'bg-neon-cyan/10' },
  { id: 'trend-hunter', name: 'Trend Hunter', role: 'Auto Content Planner', desc: 'Fetches daily trends and suggests videos', schedule: 'Daily at 06:00', status: 'Waiting', icon: Search, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { id: 'publisher', name: 'Publisher', role: 'Auto YouTube Uploader', desc: 'Uploads finished videos to YouTube and TikTok', schedule: 'After production', status: 'Waiting', icon: UploadCloud, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
];

export default function Agents() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Bot className="text-neon-cyan" size={28} />
          AI Agents
        </h1>
        <p className="text-sm text-gray-400 mt-2">Automated executive assistants managing the VideoMill pipeline</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AGENTS.map((agent) => (
          <div key={agent.id} className="bg-surface/50 border border-border rounded-xl p-5 hover:border-border/80 transition-all flex flex-col justify-between h-full">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${agent.bg} ${agent.color}`}>
                    <agent.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg leading-tight">{agent.name}</h3>
                    <p className="text-xs text-gray-500">{agent.role}</p>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-6">{agent.desc}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1"><Clock size={10} /> {agent.status}</span>
                <span className="text-xs text-gray-300 font-mono">{agent.schedule}</span>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-border rounded-lg text-xs font-bold text-white transition-colors">
                <Play size={12} className="text-neon-cyan" />
                Run now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
