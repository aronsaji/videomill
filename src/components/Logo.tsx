import { motion } from 'framer-motion';

export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Animated outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-xl border-2 border-neon-cyan/40 border-t-transparent border-b-neon-cyan"
        />
        
        {/* Pulsing inner play button */}
        <motion.div
          animate={{ scale: [1, 1.05, 1], boxShadow: ["0 0 10px rgba(0,245,255,0.2)", "0 0 20px rgba(0,245,255,0.5)", "0 0 10px rgba(0,245,255,0.2)"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-1.5 bg-neon-cyan/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-neon-cyan/30"
        >
          <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-neon-cyan border-b-[5px] border-b-transparent ml-1" />
        </motion.div>
      </div>
      <div className="flex flex-col justify-center">
        <h1 className={`font-bold tracking-tight text-white leading-none ${size === 'lg' ? 'text-3xl mb-1' : 'text-xl mb-0.5'}`}>
          VIDEOMILL
        </h1>
        <p className={`font-mono text-neon-cyan leading-none ${size === 'lg' ? 'text-xs' : 'text-[10px]'}`}>
          NON-STOP VIRAL ENGINE
        </p>
      </div>
    </div>
  );
}
