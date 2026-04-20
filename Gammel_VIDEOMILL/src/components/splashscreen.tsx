import { motion } from "framer-motion";
import { AnimatedLogo } from "./layout/animatedlogo";

interface SplashScreenProps {
  show: boolean;
}

export function SplashScreen({ show }: SplashScreenProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black">
      {/* Bakgrunnsglød */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05)_0%,transparent_70%)]" />
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Her rendres nå KUN det animerte ikonet og navnet VideoMill én gang */}
        <AnimatedLogo size="lg" showTagline={false} />
        
        <div className="mt-8 text-center">
          {/* Ditt slagord - Nå forstørret og gjort tydeligere */}
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 font-mono text-[14px] font-black uppercase tracking-[0.4em] text-amber-500 italic"
          >
            The Non-Stop Viral Engine
          </motion.p>
        </div>

        {/* Loading bar */}
        <div className="mt-12 h-[2px] w-64 overflow-hidden bg-zinc-800/50 rounded-full">
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent" 
          />
        </div>
      </div>
    </div>
  );
}
