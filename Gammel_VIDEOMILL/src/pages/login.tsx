import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Chrome } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) alert(error.message);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 w-full max-w-md border border-white/5 bg-zinc-900/40 rounded-xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            Video<span className="text-amber-500">Mill</span>
          </h1>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-2">
            Secure Terminal Access
          </p>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full mb-6 flex items-center justify-center gap-3 bg-white hover:bg-zinc-200 text-black font-bold py-3 rounded uppercase text-xs tracking-tighter transition-all"
        >
          <Chrome className="w-4 h-4" />
          Sign in with Google
        </button>

        <div className="relative mb-6 text-center">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
          <span className="relative bg-[#121214] px-4 text-[10px] uppercase font-mono text-zinc-500">Or use terminal</span>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Email</label>
            <input 
              type="email" 
              className="w-full bg-black/50 border border-white/10 p-3 text-white rounded font-mono text-sm focus:border-amber-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-black/50 border border-white/10 p-3 text-white rounded font-mono text-sm focus:border-amber-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-4 rounded uppercase tracking-tighter transition-all"
          >
            {loading ? "Accessing..." : "Login"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
