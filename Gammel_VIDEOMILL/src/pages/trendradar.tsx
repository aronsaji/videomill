import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Radar, Flame, TrendingUp, Sparkles, RefreshCw, 
  History, Eye, Search, DollarSign, Beaker, Zap, ArrowUpRight,
  Music2, Instagram, Youtube, Facebook, Terminal
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TrendTopic {
  id: number;
  status: "FIRE" | "HOT" | "RISING";
  category: string;
  title: string;
  description: string;
  tags: string[];
  icon: any;
  viralPlatform: "TikTok" | "Instagram" | "YouTube" | "Facebook";
  platformColor: string;
}

const TREND_DATA: TrendTopic[] = [
  { id: 1, status: "FIRE", category: "History", title: "Hidden WWII secrets they never taught in school", description: "History + conspiracy. Evergreen viral hook that consistently hits millions.", tags: ["history", "wwii", "secrets"], icon: History, viralPlatform: "TikTok", platformColor: "#00f2ea" },
  { id: 2, status: "FIRE", category: "Mystery", title: "Declassified government files — what they were hiding", description: "Mystery + authority distrust = massive shares across all demographics.", tags: ["mystery", "classified", "government"], icon: Eye, viralPlatform: "Instagram", platformColor: "#e1306c" },
  { id: 3, status: "FIRE", category: "Finance", title: "How the ultra-rich hide their money — legally", description: "Finance + inequality anger drives huge watch time and comment section debates.", tags: ["finance", "wealth", "money"], icon: DollarSign, viralPlatform: "YouTube", platformColor: "#ff0000" },
  { id: 4, status: "FIRE", category: "Crime", title: "Cold cases solved by random citizens on the internet", description: "True crime + internet detective = top growth niche for long-form shorts.", tags: ["truecrime", "coldcase", "mystery"], icon: Search, viralPlatform: "TikTok", platformColor: "#00f2ea" },
  { id: 5, status: "HOT", category: "Science", title: "Scientists found something they refuse to explain", description: "Science mystery hooks outperform pure education 3x in retention tests.", tags: ["science", "discovery", "viral"], icon: Beaker, viralPlatform: "Instagram", platformColor: "#e1306c" },
  { id: 6, status: "HOT", category: "Tech", title: "AI tools they don't want you to know about", description: "AI is currently the #1 growing search category on YouTube and Google.", tags: ["ai", "tech", "tools"], icon: Zap, viralPlatform: "YouTube", platformColor: "#ff0000" },
  { id: 7, status: "HOT", category: "History", title: "Ancient civilizations that vanished without explanation", description: "Ancient mystery + perfect for high-end AI visuals and cinematic pacing.", tags: ["history", "ancient", "documentary"], icon: History, viralPlatform: "Facebook", platformColor: "#1877F2" },
  { id: 8, status: "HOT", category: "Finance", title: "The financial crash nobody is talking about", description: "Economic anxiety drives urgency clicks. Best for news-style delivery.", tags: ["finance", "economy", "crash"], icon: DollarSign, viralPlatform: "Facebook", platformColor: "#1877F2" },
  { id: 9, status: "HOT", category: "Crime", title: "Cults that are still operating right now", description: "Right now urgency hook is a proven viral formula for investigative content.", tags: ["cult", "crime", "documentary"], icon: Search, viralPlatform: "TikTok", platformColor: "#00f2ea" },
  { id: 10, status: "HOT", category: "Mystery", title: "Places on Earth nobody is allowed to visit", description: "Forbidden places — millions of views consistently across 2024-2026.", tags: ["mystery", "forbidden", "secret"], icon: Eye, viralPlatform: "Instagram", platformColor: "#e1306c" },
  { id: 11, status: "FIRE", category: "History", title: "The real reason empires collapsed overnight", description: "Collapse narrative triggers a fear + curiosity loop in the viewer.", tags: ["history", "empire", "collapse"], icon: History, viralPlatform: "YouTube", platformColor: "#ff0000" },
  { id: 12, status: "RISING", category: "Science", title: "Body discoveries that changed everything in 2026", description: "Health + science in a current year context drives high search volume.", tags: ["science", "health", "discovery"], icon: Beaker, viralPlatform: "Facebook", platformColor: "#1877F2" },
  { id: 13, status: "RISING", category: "Tech", title: "Countries already living in 2040 — what they got right", description: "Future + specific country = high share rate and low competition.", tags: ["tech", "future", "innovation"], icon: Zap, viralPlatform: "Instagram", platformColor: "#e1306c" },
  { id: 14, status: "RISING", category: "Mystery", title: "The strangest things found on Google Earth", description: "Visual mystery format with high retention for mobile users.", tags: ["mystery", "googleearth", "viral"], icon: Eye, viralPlatform: "TikTok", platformColor: "#00f2ea" },
  { id: 15, status: "RISING", category: "Crime", title: "Hackers who took down entire countries — true stories", description: "Tech crime crossover. Massive growth segment for true crime fans.", tags: ["cybercrime", "hacker", "truecrime"], icon: Search, viralPlatform: "YouTube", platformColor: "#ff0000" },
  { id: 16, status: "RISING", category: "Finance", title: "The jobs AI will replace first — and what survives", description: "AI + job fear = highly emotional, shareable, and searched content.", tags: ["ai", "jobs", "future"], icon: DollarSign, viralPlatform: "Facebook", platformColor: "#1877F2" },
];

export default function TrendRadar() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const navigate = useNavigate();

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdate(new Date());
      toast.success("AI Trend Scan Complete", {
        description: "Radar updated with latest viral velocity data."
      });
    }, 1500);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "TikTok": return <Music2 className="h-3 w-3" />;
      case "Instagram": return <Instagram className="h-3 w-3" />;
      case "YouTube": return <Youtube className="h-3 w-3" />;
      case "Facebook": return <Facebook className="h-3 w-3" />;
      default: return null;
    }
  };

  const useThisTopic = (topic: TrendTopic) => {
    const config = {
      topic: topic.title,
      category: topic.category,
      voice: topic.category.toLowerCase() === "history" || topic.category.toLowerCase() === "crime" ? "Adam" : "Rachel",
      style: topic.category.toLowerCase() === "tech" || topic.category.toLowerCase() === "science" ? "Cinematic" : "Dark Documentary",
      platform: topic.viralPlatform
    };

    localStorage.setItem("pendingVideoJob", JSON.stringify(config));

    toast.success("Configuring Factory", {
      description: `Loading trend: ${topic.title}`
    });

    setTimeout(() => {
      navigate("/video-machine");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-300 p-8 md:p-12">
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Radar className={cn("h-6 w-6 text-amber-500", isRefreshing && "animate-spin")} />
              <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full" />
            </div>
            <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">
              Trend<span className="text-amber-500">Radar</span>
            </h1>
          </div>
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-[0.3em] font-bold">
            Real-time Viral Opportunity Detection
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block font-mono">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">Last AI Scan</p>
            <p className="text-xs font-bold text-emerald-400 uppercase italic">Live Now: {lastUpdate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="border-white/20 bg-zinc-900/60 hover:bg-zinc-800 text-white gap-2 rounded-xl h-11 uppercase font-black text-[10px] tracking-widest transition-all"
          >
            <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
            Trigger Scan
          </Button>
        </div>
      </div>

      {/* SUB-HEADER */}
      <div className="max-w-7xl mx-auto mb-10 border-b border-white/10 pb-4 flex items-center justify-between">
        <h2 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2 italic">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Market Analysis — Neural Node 04
        </h2>
        <span className="text-[10px] text-zinc-400 font-mono font-black tracking-tighter">16/16 SENSORS ACTIVE</span>
      </div>

      {/* GRID SECTION */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <AnimatePresence mode="popLayout">
          {TREND_DATA.map((trend, index) => (
            <motion.div
              key={trend.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              onClick={() => useThisTopic(trend)}
              className="group cursor-pointer relative bg-zinc-900/40 border border-white/10 rounded-2xl p-6 hover:bg-zinc-900/60 hover:border-amber-500/50 transition-all flex flex-col h-full overflow-hidden shadow-2xl"
            >
              {/* Background Glow */}
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/[0.05] blur-3xl rounded-full group-hover:bg-amber-500/[0.1] transition-colors" />
              
              <div className="relative z-10 flex flex-col h-full">
                {/* Topic Header Area */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col gap-2">
                    <div className={cn(
                      "flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter w-fit shadow-sm",
                      trend.status === "FIRE" ? "bg-red-500/20 text-red-400 border border-red-500/20" : 
                      trend.status === "HOT" ? "bg-amber-500/20 text-amber-400 border border-amber-500/20" : 
                      "bg-blue-500/20 text-blue-400 border border-blue-500/20"
                    )}>
                      <Flame className="h-3 w-3" fill="currentColor" />
                      {trend.status}
                    </div>
                    {/* Plattform logo i farger */}
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-black/60 rounded border border-white/10 w-fit">
                      <div style={{ color: trend.platformColor }}>
                        {getPlatformIcon(trend.viralPlatform)}
                      </div>
                      <span className="text-[10px] font-mono font-black text-zinc-200 uppercase tracking-tighter">
                        {trend.viralPlatform}
                      </span>
                    </div>
                  </div>
                  <trend.icon className="h-5 w-5 text-zinc-600 group-hover:text-amber-500 transition-colors" />
                </div>

                {/* Content Area */}
                <div className="mb-3 space-y-2">
                  <span className="text-[10px] uppercase font-black text-amber-500 tracking-widest">
                    {trend.category}
                  </span>
                  <h3 className="text-base font-bold text-white leading-tight group-hover:text-amber-400 transition-colors">
                    {trend.title}
                  </h3>
                </div>

                {/* Description - HØY KONTRAST */}
                <p className="text-sm text-zinc-200 leading-relaxed mb-6 group-hover:text-white transition-colors font-medium">
                  {trend.description}
                </p>

                {/* Tags Area - HØY KONTRAST */}
                <div className="flex flex-wrap gap-1.5 mb-8">
                  {trend.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="text-[10px] font-mono text-zinc-100 bg-white/10 px-2 py-0.5 rounded border border-white/10 uppercase tracking-tighter font-bold shadow-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Bottom Action */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                   <span className="text-[10px] font-mono text-zinc-400 uppercase italic font-bold">
                    Analysis_id: <span className="text-zinc-200">#{trend.id}092</span>
                  </span>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-400 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                    Use Topic <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <div className="max-w-7xl mx-auto mt-20 flex flex-col md:flex-row justify-between items-center gap-4 opacity-60">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-zinc-400" />
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-zinc-400 font-bold">
            System Online • AI Trend Engine v2026.4
          </p>
        </div>
        <div className="flex items-center gap-6 text-[10px] font-mono text-zinc-400 uppercase tracking-tighter font-black">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" /> TikTok_Feed</span>
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_5px_rgba(236,72,153,0.5)]" /> Reels_Feed</span>
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]" /> YT_Shorts_Feed</span>
        </div>
      </div>
    </div>
  );
}
