import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Terminal, Play, TrendingUp, Youtube, Instagram, Music2, ChevronRight, Layout } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const N8N_TRENDS_URL = "https://fsnmrm8qy0a6an-5678.proxy.runpod.net/webhook/viranode-get-trends"; 
const N8N_SECRET = "ViraNode2026SuperHemmelig123!";

const PLATFORMS = [
  { id: "tiktok", name: "TikTok/Shorts", icon: <Music2 size={20} />, color: "text-pink-500" },
  { id: "youtube", name: "YouTube (16:9)", icon: <Youtube size={20} />, color: "text-red-500" },
  { id: "instagram", name: "IG Reels", icon: <Instagram size={20} />, color: "text-purple-500" }
];

const AUDIENCES = ["General", "Tech Savvy", "Business", "Gamers", "Young Adults", "Professional"];
const LANGUAGES = ["Norwegian", "English", "Spanish", "German"];
const STYLES = ["Cinematic", "High-Energy", "Documentary", "Minimalist"];

const ALL_VOICES = [
  { id: "nb-NO-Pernille", name: "Pernille", lang: "Norwegian" },
  { id: "nb-NO-Finn", name: "Finn", lang: "Norwegian" },
  { id: "en-US-Aria", name: "Aria", lang: "English" }, 
  { id: "en-US-Andrew", name: "Andrew", lang: "English" }
];

export default function VideoMachine() {
  const navigate = useNavigate();
  const [trends, setTrends] = useState<any[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [language, setLanguage] = useState("English");
  const [selectedVoice, setSelectedVoice] = useState("en-US-Aria");
  const [style, setStyle] = useState("Cinematic");
  const [platform, setPlatform] = useState("TikTok/Shorts");
  const [audience, setAudience] = useState("General");

  const filteredVoices = ALL_VOICES.filter(v => v.lang === language);

  useEffect(() => {
    async function fetchLiveTrends() {
      try {
        const response = await fetch(N8N_TRENDS_URL, { headers: { 'X-ViraNode-Secret': N8N_SECRET } });
        let data = await response.json();
        if (data && Array.isArray(data)) {
          setTrends(data.sort((a, b) => (parseInt(b.grow) || 0) - (parseInt(a.grow) || 0)));
        }
      } catch (err) {
        setTrends([
          { title: "AI Agent Workflows", grow: "240%" },
          { title: "Sora 2026 Predictions", grow: "195%" },
          { title: "Neuro-Marketing", grow: "180%" },
          { title: "Web3 Utility", grow: "145%" },
          { title: "Quantum Chips", grow: "130%" }
        ]);
      }
    }
    fetchLiveTrends();
  }, []);

  const handleDeploy = async () => {
    if (!title.trim()) return toast.error("Please enter a title");
    setIsDeploying(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('videos').insert({
        user_id: user?.id,
        title, topic: desc, voice_id: selectedVoice, voice: selectedVoice,
        language, video_style: style, style_preset: style, platform,
        status: 'queued', aspect_ratio: platform.includes("YouTube") ? "16:9" : "9:16",
        target_audience: audience, promp: desc, captions_enabled: true,
        captions_style: 'Viral Pop', captions_color: '#FFB100', duration_seconds: 60
      });
      if (error) throw error;
      toast.success("Deployment Successful!");
      setTimeout(() => navigate("/factory"), 800);
    } catch (err: any) {
      toast.error(err.message);
      setIsDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-200 p-6 font-sans pb-44">
      
      {/* HEADER */}
      <header className="max-w-[1600px] mx-auto flex items-center justify-between mb-8 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <Terminal size={24} className="text-amber-500" />
          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">
            VIDEOMILL<span className="text-amber-500">_DEPLOY</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">System Active</span>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto space-y-8">
        
        {/* TRENDS BAR */}
        <section className="bg-zinc-900/40 border border-white/5 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-amber-500" />
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Live Trend Sync</h2>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {trends.slice(0, 5).map((t, idx) => (
              <button key={idx} onClick={() => setTitle(t.title)}
                className={`p-4 rounded-xl border transition-all text-left ${title === t.title ? 'border-amber-500 bg-amber-500/10' : 'border-white/5 bg-black/40 hover:border-white/20'}`}>
                <div className="text-[10px] font-black text-amber-500 mb-1">{t.grow} GROWTH</div>
                <div className="text-xs font-bold uppercase truncate text-zinc-200">{t.title}</div>
              </button>
            ))}
          </div>
        </section>

        {/* MAIN PANEL */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* COLUMN 1: CONTENT */}
          <div className="bg-zinc-900/40 border border-white/10 p-7 rounded-[2rem] space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2 italic">01. Content Title <ChevronRight size={12}/></label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter headline..." className="w-full bg-black border border-white/10 rounded-xl p-4 text-white font-bold focus:border-amber-500 outline-none transition-all placeholder:text-zinc-700" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2 italic">02. Script Prompt <ChevronRight size={12}/></label>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Instructions..." className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm text-zinc-300 outline-none h-44 focus:border-amber-500 transition-all resize-none" />
            </div>
          </div>

          {/* COLUMN 2: SETTINGS */}
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest italic">03. Platform</label>
              <div className="grid grid-cols-3 gap-3">
                {PLATFORMS.map(p => (
                  <button key={p.id} onClick={() => setPlatform(p.name)} className={`p-5 rounded-2xl border transition-all flex flex-col items-center gap-3 ${platform === p.name ? 'border-blue-500 bg-blue-500/20 text-white' : 'border-white/5 bg-zinc-900/60 text-zinc-500 hover:border-white/20'}`}>
                    <div className={platform === p.name ? p.color : "text-zinc-600"}>{p.icon}</div>
                    <span className="text-[9px] font-black uppercase">{p.id}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-pink-400 tracking-widest italic">04. Audience</label>
              <div className="grid grid-cols-2 gap-2">
                {AUDIENCES.map(a => (
                  <button key={a} onClick={() => setAudience(a)} className={`py-3 rounded-xl border text-[10px] font-black uppercase transition-all ${audience === a ? 'border-pink-500 bg-pink-500/20 text-pink-500 shadow-lg shadow-pink-500/10' : 'border-white/5 bg-zinc-900/60 text-zinc-500 hover:border-white/10'}`}>{a}</button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-orange-400 tracking-widest italic">05. Language</label>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map(l => (
                  <button key={l} onClick={() => setLanguage(l)} className={`py-3 rounded-xl border text-[10px] font-black uppercase transition-all ${language === l ? 'border-orange-500 bg-orange-500/20 text-orange-500' : 'border-white/5 bg-zinc-900/60 text-zinc-500'}`}>{l}</button>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMN 3: STYLE & VOICE */}
          <div className="bg-zinc-900/40 border border-white/10 p-7 rounded-[2rem] space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-purple-400 tracking-widest italic">06. Visual Style</label>
              <div className="grid grid-cols-1 gap-2">
                {STYLES.map(s => (
                  <button key={s} onClick={() => setStyle(s)} className={`py-3 px-4 rounded-xl border text-[10px] font-black uppercase flex justify-between items-center transition-all ${style === s ? 'border-purple-500 bg-purple-500/20 text-purple-400' : 'border-white/5 bg-black/40 text-zinc-500'}`}>
                    {s} {style === s && <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-emerald-400 tracking-widest italic">07. Neural Voice</label>
              <div className="space-y-2 overflow-y-auto max-h-52 pr-2 custom-scrollbar">
                {filteredVoices.map(v => (
                  <button key={v.id} onClick={() => setSelectedVoice(v.id)} className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${selectedVoice === v.id ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-white/5 bg-black/40 text-zinc-600 hover:border-white/10'}`}>
                    <span className="text-[11px] font-black uppercase">{v.name}</span>
                    <Play size={14} className={selectedVoice === v.id ? "text-emerald-500" : "text-zinc-800"} fill="currentColor" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER MANIFEST */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 flex justify-center z-50">
        <div className="max-w-[1400px] w-full bg-[#0d0d0d]/95 backdrop-blur-md border border-white/10 p-5 rounded-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between">
          <div className="grid grid-cols-6 gap-8 px-6 flex-1 border-r border-white/5">
            <div className="min-w-0">
              <div className="text-[8px] font-black text-zinc-600 uppercase mb-1">Title</div>
              <div className="text-[11px] font-bold truncate text-white uppercase italic">{title || "NO_TITLE"}</div>
            </div>
            <div>
              <div className="text-[8px] font-black text-zinc-600 uppercase mb-1">Target</div>
              <div className="text-[11px] font-bold text-pink-500 uppercase">{audience}</div>
            </div>
            <div>
              <div className="text-[8px] font-black text-zinc-600 uppercase mb-1">Platform</div>
              <div className="text-[11px] font-bold text-blue-500 uppercase">{platform.split('/')[0]}</div>
            </div>
            <div>
              <div className="text-[8px] font-black text-zinc-600 uppercase mb-1">Lang</div>
              <div className="text-[11px] font-bold text-orange-500 uppercase">{language}</div>
            </div>
            <div>
              <div className="text-[8px] font-black text-zinc-600 uppercase mb-1">Style</div>
              <div className="text-[11px] font-bold text-purple-500 uppercase">{style}</div>
            </div>
            <div>
              <div className="text-[8px] font-black text-zinc-600 uppercase mb-1">Voice</div>
              <div className="text-[11px] font-bold text-emerald-500 uppercase">{selectedVoice.split('-').pop()}</div>
            </div>
          </div>
          
          <button onClick={handleDeploy} disabled={isDeploying || !title} className="ml-8 bg-white hover:bg-amber-500 text-black font-black px-12 py-5 rounded-2xl text-xl flex items-center gap-3 transition-all active:scale-95 disabled:opacity-30 group shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-amber-500/20">
            {isDeploying ? "SYNCING..." : "DEPLOY"} <Zap size={20} fill="currentColor" />
          </button>
        </div>
      </footer>
    </div>
  );
}
