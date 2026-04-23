'use client';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function AnimatedLogo() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 cursor-pointer group"
    >
      <motion.div
        animate={{
          boxShadow: [
            "0px 0px 0px rgba(139, 92, 246, 0)",
            "0px 0px 20px rgba(139, 92, 246, 0.6)",
            "0px 0px 0px rgba(139, 92, 246, 0)"
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.1, rotate: 15 }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-teal-500 flex items-center justify-center border border-white/10"
      >
        <Zap className="w-6 h-6 text-white group-hover:animate-pulse" strokeWidth={2.5} />
      </motion.div>

      <div className="flex flex-col">
        <span className="text-xl font-bold tracking-tight text-white">
          Video<span className="text-violet-400">Mill</span>
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-teal-400 font-mono">
          Autonomous ERP
        </span>
      </div>
    </motion.div>
  );
}