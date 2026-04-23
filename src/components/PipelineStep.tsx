import { motion } from 'framer-motion';
import { LucideIcon, Check, Loader2 } from 'lucide-react';

type StepStatus = 'pending' | 'active' | 'complete' | 'error';

interface PipelineStepProps {
  icon: LucideIcon;
  label: string;
  status?: StepStatus;
  progress?: number;
}

const statusConfig: Record<StepStatus, { 
  bg: string; 
  text: string; 
  iconBg: string;
  iconColor: string;
  animate: string;
}> = {
  pending: {
    bg: 'bg-white/5',
    text: 'text-white/30',
    iconBg: 'bg-white/5',
    iconColor: 'text-white/20',
    animate: '',
  },
  active: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-300',
    iconBg: 'bg-violet-500/20',
    iconColor: 'text-violet-400',
    animate: 'animate-pulse',
  },
  complete: {
    bg: 'bg-teal-500/10',
    text: 'text-teal-300',
    iconBg: 'bg-teal-500/20',
    iconColor: 'text-teal-400',
    animate: '',
  },
  error: {
    bg: 'bg-red-500/10',
    text: 'text-red-300',
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-400',
    animate: '',
  },
};

export default function PipelineStep({ 
  icon: Icon, 
  label, 
  status = 'pending',
  progress = 0 
}: PipelineStepProps) {
  const config = statusConfig[status];
  const isProcessing = status === 'active';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-4 p-4 rounded-xl ${config.bg} transition-colors duration-300`}
    >
      {/* Icon */}
      <div className={`relative w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center ${config.animate}`}>
        {status === 'complete' ? (
          <Check size={20} className={config.iconColor} />
        ) : isProcessing ? (
          <Loader2 size={20} className={`${config.iconColor} animate-spin`} />
        ) : (
          <Icon size={20} className={config.iconColor} />
        )}
        
        {/* Progress ring for active step */}
        {isProcessing && progress > 0 && (
          <svg className="absolute inset-0 w-12 h-12 -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-violet-500/20"
            />
            <motion.circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-violet-400"
              initial={{ strokeDashoffset: 126 }}
              animate={{ strokeDashoffset: 126 - (126 * progress) / 100 }}
              transition={{ type: 'spring', stiffness: 30 }}
            />
          </svg>
        )}
      </div>

      {/* Label & Progress */}
      <div className="flex-1">
        <p className={`text-sm font-medium ${config.text}`}>{label}</p>
        {isProcessing && (
          <div className="mt-1 h-1 w-full bg-violet-500/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-violet-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 30 }}
            />
          </div>
        )}
      </div>

      {/* Status indicator */}
      {status === 'complete' && (
        <div className="w-2 h-2 rounded-full bg-teal-400" />
      )}
      {status === 'active' && (
        <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
      )}
    </motion.div>
  );
}