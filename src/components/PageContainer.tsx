import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export default function PageContainer({ title, subtitle, children, actions }: PageContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen"
    >
      {/* Neural Grid Background */}
      <div className="fixed inset-0 neural-grid opacity-20 pointer-events-none z-0" style={{ backgroundSize: '40px 40px' }} />
      
      {/* Header */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">{title}</h1>
            {subtitle && <p className="text-sm text-white/40 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}