import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2,
  Terminal,
  Cpu,
  Hash
} from "lucide-react";

interface VideoJob {
  id: string;
  title: string;
  status: "queued" | "scripting" | "rendering" | "uploading" | "published" | "failed";
  progress: number;
  created_at: string;
  topic?: string;
}

export default function Dashboard() {
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial henting
  const fetchJobs = useCallback(async () => {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setJobs(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchJobs();

    // OPTIMALISERT REALTIME: Håndterer endringer i minnet uten ny fetch
    const channel = supabase
      .channel('live-pipeline')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'videos' }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setJobs(prev => [payload.new as VideoJob, ...prev]);
          } 
          else if (payload.eventType === 'UPDATE') {
            setJobs(prev => prev.map(job => 
              job.id === payload.new.id ? { ...job, ...payload.new } : job
            ));
          } 
          else if (payload.eventType === 'DELETE') {
            setJobs(prev => prev.filter(job => job.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchJobs]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published": return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "failed": return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "rendering": return <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />;
      default: return <Clock className="w-5 h-5 text-zinc-500" />;
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10">
      <header className="flex justify-between items-end border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-500">
            <Terminal className="w-5 h-5" />
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">
              Control<span className="text-white">Room</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-xs font-mono text-zinc-400 uppercase tracking-[0.3em]">
              Live Neural Feed Active
            </p>
          </div>
        </div>
        
        <div className="flex gap-8 font-mono">
          <div className="text-right">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Active Nodes</p>
            <p className="text-xl font-bold text-white leading-none">
              {jobs.filter(j => !['published', 'failed'].includes(j.status)).length}
            </p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Accessing_Data_Layer...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          <AnimatePresence mode="popLayout">
            {jobs.map((job) => (
              <motion.div 
                layout // Gjør at listen animeres glatt når ting flytter på seg
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={job.id} 
                className={`group p-4 bg-zinc-900/30 border transition-all rounded-xl flex items-center gap-6 ${
                  job.status === 'rendering' ? 'border-amber-500/20 bg-amber-500/5' : 'border-white/5'
                }`}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-black/40 rounded-lg flex items-center justify-center border border-white/5">
                  {getStatusIcon(job.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="flex items-center gap-1 font-mono text-[10px]">
                      <Hash className="w-3 h-3 text-amber-500/50" />
                      <span className="text-amber-500/80 font-bold uppercase tracking-tighter">
                        {job.id.split('-')[0]}
                      </span>
                    </div>
                    <span className="text-zinc-700 text-xs font-bold">//</span>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-tight">
                      {new Date(job.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <h3 className="text-base font-bold text-white truncate uppercase tracking-tight">
                    {job.title || "Untitled Production Unit"}
                  </h3>
                </div>

                <div className="w-48 hidden lg:block">
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500 mb-1.5 uppercase font-bold tracking-tight">
                    <span>{job.status}</span>
                    <span className="text-amber-500">{job.progress}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${job.status === 'failed' ? 'bg-red-500' : 'bg-amber-500'}`}
                      initial={false}
                      animate={{ width: `${job.progress}%` }}
                      transition={{ type: "spring", stiffness: 50, damping: 15 }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 ml-4 pr-2">
                  <div className={`p-2 rounded bg-black/20 border border-white/5 ${['rendering', 'scripting'].includes(job.status) ? 'animate-pulse' : ''}`}>
                    <Cpu className={`w-4 h-4 ${job.status === 'published' ? 'text-emerald-500' : 'text-zinc-700'}`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <footer className="pt-6 flex justify-between items-center opacity-30">
        <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-tighter">
          &gt; session_monitor: active // protocol: real_time_patch_v3
        </p>
      </footer>
    </div>
  );
}0
