import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { 
  Activity, CheckCircle2, Clock, AlertCircle, 
  Loader2, Terminal, Cpu, Hash, Zap
} from "lucide-react";
import { toast } from "sonner";

// URL til en kul cyber-notification lyd (Pixabay/Royalty Free)
const SUCCESS_SOUND_URL = "https://cdn.pixabay.com/audio/2022/03/15/audio_7325298135.mp3";

interface VideoJob {
  id: string;
  title: string;
  status: "queued" | "scripting" | "rendering" | "uploading" | "published" | "failed";
  progress: number;
  created_at: string;
  topic?: string;
}

export default function VideoFactory() {
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialiser lyd-objektet
  useEffect(() => {
    audioRef.current = new Audio(SUCCESS_SOUND_URL);
    audioRef.current.volume = 0.4;
  }, []);

  const playSuccessSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        console.log("Audio playback blocked by browser - requires user interaction first.");
      });
    }
  };

  const fetchJobs = useCallback(async () => {
    const { data, error } = await supabase
      .from('videos_rows')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setJobs(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchJobs();

    const channel = supabase
      .channel('factory-live-feed')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'videos_rows' }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setJobs(prev => [payload.new as VideoJob, ...prev]);
            toast.info("NEURAL UNIT INITIALIZED");
          } 
          
          if (payload.eventType === 'UPDATE') {
            const oldJob = jobs.find(j => j.id === payload.new.id);
            
            // Trigger lyd og toast hvis videoen akkurat ble ferdig
            if (payload.new.status === 'published' && oldJob?.status !== 'published') {
              playSuccessSound();
              toast.success(`PRODUCTION COMPLETE: ${payload.new.title}`, {
                icon: <Zap className="w-4 h-4 text-amber-500" />
              });
            }

            setJobs(prev => prev.map(job => 
              job.id === payload.new.id ? { ...job, ...payload.new } : job
            ));
          }

          if (payload.eventType === 'DELETE') {
            setJobs(prev => prev.filter(job => job.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchJobs, jobs]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published": return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "failed": return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "rendering": return <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />;
      default: return <Clock className="w-5 h-5 text-zinc-500" />;
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 pb-32">
      {/* HEADER */}
      <header className="flex justify-between items-end border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-500">
            <Terminal className="w-5 h-5" />
            <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">
              Neural<span className="text-amber-500">_Factory</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-xs font-mono text-zinc-400 uppercase tracking-[0.3em]">Live Pipeline Status</p>
          </div>
        </div>
        
        <div className="flex gap-8 font-mono">
          <div className="text-right">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Active_Tasks</p>
            <p className="text-xl font-bold text-white leading-none">
              {jobs.filter(j => !['published', 'failed'].includes(j.status)).length}
            </p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest italic">Syncing_Neural_Cores...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          <AnimatePresence mode="popLayout">
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  key={job.id} 
                  className={`group p-4 bg-zinc-900/20 border transition-all rounded-xl flex items-center gap-6 ${
                    ['rendering', 'scripting'].includes(job.status) 
                      ? 'border-amber-500/20 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.03)]' 
                      : 'border-white/5'
                  }`}
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0 w-12 h-12 bg-black/40 rounded-lg flex items-center justify-center border border-white/5">
                    {getStatusIcon(job.status)}
                  </div>
                  
                  {/* Title & Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="flex items-center gap-1 font-mono text-[9px]">
                        <Hash className="w-3 h-3 text-amber-500/50" />
                        <span className="text-amber-500/80 font-bold uppercase tracking-tighter">
                          {job.id.split('-')[0]}
                        </span>
                      </div>
                      <span className="text-zinc-800 text-xs">•</span>
                      <span className="text-[9px] font-mono text-zinc-600 uppercase">
                        {new Date(job.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-200 truncate uppercase tracking-tight group-hover:text-white transition-colors">
                      {job.title || "Autonomous Unit"}
                    </h3>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-48 hidden md:block">
                    <div className="flex justify-between text-[9px] font-mono text-zinc-500 mb-1.5 uppercase font-bold">
                      <span>{job.status}</span>
                      <span className={job.progress === 100 ? "text-emerald-500" : "text-amber-500"}>
                        {job.progress}%
                      </span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full ${job.status === 'failed' ? 'bg-red-500' : 'bg-amber-500'}`}
                        initial={false}
                        animate={{ width: `${job.progress}%` }}
                        transition={{ type: "spring", stiffness: 60, damping: 15 }}
                      />
                    </div>
                  </div>

                  {/* CPU/Activity Icon */}
                  <div className="flex items-center gap-4 ml-4 pr-2">
                    <div className={`p-2 rounded bg-black/40 border border-white/5 ${['rendering', 'scripting'].includes(job.status) ? 'animate-pulse' : ''}`}>
                      <Cpu className={`w-4 h-4 ${job.status === 'published' ? 'text-emerald-500' : 'text-zinc-800'}`} />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="py-32 text-center border-2 border-dashed border-white/5 rounded-3xl"
              >
                <Activity className="w-8 h-8 text-zinc-800 mx-auto mb-4 opacity-20" />
                <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-[0.4em]">Pipeline_Empty</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <footer className="pt-12 flex justify-between items-center opacity-20 font-mono text-[9px] uppercase">
        <p>&gt; sys.monitor: active</p>
        <p>v2.1.0_viranode</p>
      </footer>
    </div>
  );
}
