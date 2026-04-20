import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { 
  Trash2, 
  Download, 
  Clock, 
  CheckCircle2, 
  Loader2,
  Film,
  AlertCircle
} from "lucide-react";

interface Video {
  id: string;
  title: string;
  status: string;
  video_url?: string;
  thumbnail_url?: string;
  created_at: string;
}

export default function VideoLibrary() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching videos:", error);
      } else if (data) {
        setVideos(data);
      }
      setLoading(false);
    };

    fetchVideos();
    
    // REALTIME: Denne lytter på endringer i Supabase-tabellen 'videos'
    const channel = supabase
      .channel('library-changes')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'videos' }, 
        (payload) => {
          console.log("Realtime update received!", payload);
          fetchVideos(); // Refresher listen automatisk ved endring
        }
      )
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
    };
  }, []);

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 min-h-screen">
      {/* HEADER */}
      <header className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-500 mb-1">
            <Film className="w-5 h-5" />
            <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">
              Media_<span className="text-amber-500">Assets</span>
            </h1>
          </div>
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-[0.3em] font-bold">
            Production Archive & Distribution
          </p>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          <p className="text-[10px] font-mono text-zinc-500 uppercase font-black">Connecting_To_Vault...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.length === 0 ? (
            <div className="col-span-full border border-dashed border-white/10 rounded-2xl p-20 text-center">
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest font-black">No_Active_Productions_Found</p>
            </div>
          ) : (
            videos.map((video) => (
              <motion.div 
                key={video.id}
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="group bg-zinc-900/40 border border-white/10 rounded-2xl overflow-hidden hover:border-amber-500/40 transition-all shadow-2xl"
              >
                {/* VIDEO PREVIEW AREA */}
                <div className="aspect-video bg-black relative flex items-center justify-center border-b border-white/5 overflow-hidden">
                  {video.status === 'published' && video.video_url ? (
                    <video 
                      src={video.video_url} 
                      className="w-full h-full object-cover"
                      controls
                      poster={video.thumbnail_url}
                    />
                  ) : video.status === 'failed' ? (
                    <div className="text-center p-6 bg-red-500/5 h-full w-full flex flex-col justify-center">
                      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-[10px] font-mono text-red-500 uppercase font-black tracking-widest">Production_Failed</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-3 p-6">
                      <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black">
                        {video.status === 'queued' ? 'System_In_Queue' : `Unit_Processing_${video.status}...`}
                      </p>
                    </div>
                  )}
                </div>

                {/* INFO AREA */}
                <div className="p-5 space-y-4">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-tighter">
                        ID: {video.id.split('-')[0]}
                      </span>
                      {video.status === 'published' ? 
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : 
                        <Clock className="w-4 h-4 text-zinc-600 animate-pulse" />
                      }
                    </div>
                    <h3 className="text-white font-black uppercase text-sm truncate italic italic tracking-tight">
                      {video.title || "Untitled_Production"}
                    </h3>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2">
                    <button 
                      disabled={video.status !== 'published'}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                        video.status === 'published' 
                        ? 'bg-white text-black border-white hover:bg-zinc-200' 
                        : 'bg-white/5 text-zinc-600 border-white/5 cursor-not-allowed'
                      }`}
                    >
                      <Download className="w-3 h-3" /> Download
                    </button>
                    <button className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all text-red-500 group-hover:scale-105">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
