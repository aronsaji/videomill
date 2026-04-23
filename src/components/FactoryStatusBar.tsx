'use client';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface FactoryStatusBarProps {
  progress: number;
  status: 'idle' | 'processing' | 'complete' | 'error';
  currentStep: string;
}

export default function FactoryStatusBar({ progress, status, currentStep }: FactoryStatusBarProps) {
  const statusConfig = {
    idle: { color: 'text-slate-500', icon: Loader2, pulse: false, bg: 'from-slate-500 to-slate-600' },
    processing: { color: 'text-violet-400', icon: Loader2, pulse: true, bg: 'from-violet-600 to-teal-400' },
    complete: { color: 'text-teal-400', icon: CheckCircle2, pulse: false, bg: 'from-teal-500 to-teal-400' },
    error: { color: 'text-red-400', icon: AlertTriangle, pulse: false, bg: 'from-red-500 to-red-600' },
  };

  const current = statusConfig[status];
  const Icon = current.icon;

  return (
    <div className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4 font-mono text-xs uppercase tracking-widest">
        <div className={`flex items-center gap-2 ${current.color}`}>
          <Icon className={`w-4 h-4 ${current.pulse ? 'animate-spin' : ''}`} />
          <span>{status}</span>
        </div>
        <div className="text-white/40">
          Step: <span className="text-white">{currentStep}</span>
        </div>
        <div className={`${current.color} font-bold`}>
          {progress}%
        </div>
      </div>

      <div className="h-2.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 relative">
        <motion.div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${current.bg} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        <motion.div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${current.bg} rounded-full blur-sm`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}