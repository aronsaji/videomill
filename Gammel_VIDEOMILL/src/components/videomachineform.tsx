import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Zap, X, Flame, ScrollText, Beaker, Search, DollarSign, Heart, Eye, Play, Calendar, CheckCircle2, Sliders, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface VideoMachineFormProps {
  onClose: () => void;
}

const CATEGORIES = [
  { id: "tech", label: "Tech", icon: Zap },
  { id: "motivation", label: "Motivation", icon: Flame },
  { id: "history", label: "History", icon: ScrollText },
  { id: "science", label: "Science", icon: Beaker },
  { id: "crime", label: "Crime", icon: Search },
  { id: "finance", label: "Finance", icon: DollarSign },
  { id: "health", label: "Health", icon: Heart },
  { id: "mystery", label: "Mystery", icon: Eye },
];

const VOICES = [
  { id: "adam", name: "Adam", tag: "BEST", desc: "Deep & Authoritative", genres: "History · Crime" },
  { id: "josh", name: "Josh", tag: "BEST", desc: "Deep Narrative Male", genres: "Mystery · Thriller" },
  { id: "rachel", name: "Rachel", tag: "BEST", desc: "Warm & Professional", genres: "Science · Finance" },
  { id: "domi", name: "Domi", desc: "Strong & Confident", genres: "Motivation · Tech" },
];

export function VideoMachineForm({ onClose }: VideoMachineFormProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("tech");
  const [selectedVoice, setSelectedVoice] = useState("adam");

  const days = ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"];
  const dates = [14, 15, 16, 17, 18, 19, 20];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Series Started!", { description: "Your 7-day video series is now in production." });
      onClose();
    }, 1500);
  };

  return (
    <div className="glass-card rounded-2xl border border-amber-500/10 bg-black/90 p-8 max-w-5xl w-full mx-auto overflow-y-auto max-h-[90vh]">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-3xl font-black text-white italic uppercase tracking-tighter">
            Video<span className="text-amber-500">Machine</span>
          </h2>
          <p className="mt-1 font-mono text-xs text-amber-500/60 uppercase tracking-widest">
            7-Day Autonomous Production
          </p>
        </div>
        <button type="button" onClick={onClose} className="rounded-full p-2 text-zinc-500 hover:bg-white/5 transition-colors">
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          {/* Usage */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-amber-500/60">
              <span>Monthly usage (Agency)</span>
              <span className="text-white">246 / ∞</span>
            </div>
            <Progress value={25} className="h-1 bg-zinc-900" />
          </div>

          {/* Topic */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-white font-bold uppercase tracking-tight">Topic</Label>
              <span className="text-[10px] text-zinc-600 font-mono">0/500</span>
            </div>
            <Textarea 
              placeholder="Describe your series topic..." 
              required 
              className="bg-zinc-900/50 border-zinc-800 text-white focus:border-amber-500/50 min-h-[100px] rounded-xl"
            />
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <Label className="text-white font-bold uppercase tracking-tight">Category</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-xl border transition-all text-sm font-medium",
                    selectedCategory === cat.id 
                      ? "bg-amber-500 border-amber-500 text-black" 
                      : "bg-zinc-900/30 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  )}
                >
                  <cat.icon size={14} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voices */}
          <div className="space-y-3">
            <Label className="text-white font-bold uppercase tracking-tight">AI Voice</Label>
            <div className="space-y-2">
              {VOICES.map((voice) => (
                <button
                  key={voice.id}
                  type="button"
                  onClick={() => setSelectedVoice(voice.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                    selectedVoice === voice.id ? "bg-zinc-900 border-amber-500/50" : "bg-zinc-900/30 border-zinc-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", selectedVoice === voice.id ? "bg-amber-500 text-black" : "bg-zinc-800 text-zinc-500")}>
                      <Play size={14} fill="currentColor" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-sm">{voice.name}</span>
                        {voice.tag && <span className="bg-amber-500/10 text-amber-500 text-[8px] px-1.5 py-0.5 rounded font-black uppercase">⭐ {voice.tag}</span>}
                      </div>
                      <p className="text-[10px] text-zinc-500">{voice.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={16} className="text-amber-500" />
              <h3 className="text-white font-bold text-xs uppercase italic">Schedule Preview</h3>
            </div>
            <div className="space-y-2">
              {days.map((day, i) => (
                <div key={day} className="flex items-center gap-3">
                  <div className="flex flex-col items-center w-6">
                    <span className="text-[8px] uppercase text-zinc-600">{day}</span>
                    <span className="text-white font-mono text-[10px]">{dates[i]}</span>
                  </div>
                  <div className={cn(
                    "flex-1 p-2 rounded border text-[10px] flex justify-between",
                    i === 0 ? "border-amber-500/40 text-amber-500 bg-amber-500/5" : "border-zinc-800 text-zinc-600"
                  )}>
                    <span>Day {i + 1}</span>
                    {i === 0 && <Zap size={10} fill="currentColor" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button type="button" variant="outline" className="w-full border-zinc-800 text-white font-bold uppercase text-[10px] tracking-widest h-12">
            <Sliders size={14} className="mr-2" />
            Advanced Options
          </Button>

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full h-16 bg-amber-500 hover:bg-amber-400 text-black font-black text-lg uppercase italic tracking-tighter rounded-xl shadow-[0_10px_30px_rgba(245,158,11,0.2)] transition-all"
          >
            {loading ? "Initializing..." : "Start Video Mill"}
            <Zap className="ml-2 h-5 w-5" fill="currentColor" />
          </Button>
        </div>
      </form>
    </div>
  );
}
