import React from "react";
import { motion } from "framer-motion";
import { 
  BarChart as BarChartIcon, 
  TrendingUp, 
  Zap, 
  Shield, 
  Activity,
  Globe,
  Youtube,
  Music2,
  Instagram,
  Facebook
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell 
} from "recharts";

// Data for grafene (Basert på dine tall)
const lineData = [
  { name: "Apr 9", value: 240 },
  { name: "Apr 10", value: 10 },
];

const platformData = [
  { name: "youtube", value: 246, color: "#22d3ee" },
  { name: "facebook", value: 65, color: "#a855f7" },
  { name: "instagram", value: 30, color: "#f59e0b" },
  { name: "tiktok", value: 10, color: "#ec4899" },
];

export default function Analytics() {
  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 min-h-screen bg-black">
      
      {/* HEADER - Industriell stil */}
      <header className="flex justify-between items-end border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-500">
            <Activity className="w-5 h-5" />
            <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">
              System_<span className="text-amber-500">Analytics</span>
            </h1>
          </div>
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-[0.3em] font-bold">
            Real-time Performance Monitoring
          </p>
        </div>
        
        <div className="hidden md:block text-right font-mono">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Global Status</p>
          <p className="text-sm font-bold text-emerald-500 uppercase italic">All Systems Operational</p>
        </div>
      </header>

      {/* TOP STATS - De 4 hovedboksene */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total_Productions", val: "246", trend: "+12%", icon: <Zap className="w-4 h-4" /> },
          { label: "Success_Rate", val: "43%", trend: "-5%", icon: <Shield className="w-4 h-4" /> },
          { label: "Avg_Render_Time", val: "4m 12s", trend: "-18s", icon: <Activity className="w-4 h-4" /> },
          { label: "Global_Reach", val: "1.2M", trend: "+24%", icon: <Globe className="w-4 h-4" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900/40 border border-white/5 p-6 rounded-2xl group hover:border-amber-500/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-black/40 rounded-lg text-amber-500 border border-white/5">
                {stat.icon}
              </div>
              <span className={`text-[10px] font-mono font-black ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-white italic tracking-tighter">{stat.val}</h3>
          </div>
        ))}
      </div>

      {/* GRAFER - To kolonner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Videos Over Time */}
        <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2 italic">
              <TrendingUp className="w-4 h-4 text-amber-500" /> Videos_Over_Time
            </h3>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Archive_Range: 48h</span>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '10px' }}
                  itemStyle={{ color: '#f59e0b' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#f59e0b" 
                  strokeWidth={3} 
                  dot={{ fill: '#f59e0b', r: 4 }} 
                  animationDuration={2000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2 italic">
              <BarChartIcon className="w-4 h-4 text-amber-500" /> Platform_Distribution
            </h3>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Source: Viral_API</span>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#ffffff05'}}
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '10px' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={1500}>
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* FOOTER - Systeminfo */}
      <footer className="pt-10 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-white/5 opacity-50">
        <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500 uppercase font-black">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          Neural_Engine_Active • Monitoring 4,209 sources
        </div>
        <div className="flex gap-8">
          <div className="flex items-center gap-2">
            <Youtube className="w-3 h-3 text-zinc-600" />
            <span className="text-[9px] font-mono text-zinc-600 font-bold uppercase tracking-tighter">YT_Nodes: 14</span>
          </div>
          <div className="flex items-center gap-2">
            <Music2 className="w-3 h-3 text-zinc-600" />
            <span className="text-[9px] font-mono text-zinc-600 font-bold uppercase tracking-tighter">TT_Nodes: 08</span>
          </div>
          <div className="flex items-center gap-2">
            <Instagram className="w-3 h-3 text-zinc-600" />
            <span className="text-[9px] font-mono text-zinc-600 font-bold uppercase tracking-tighter">IG_Nodes: 12</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
