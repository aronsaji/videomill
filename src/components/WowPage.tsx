import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface WowPageProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export default function WowPage({ title, subtitle, children, actions }: WowPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="wow-page"
    >
      <div className="wow-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="wow-title">{title}</h1>
            {subtitle && <p className="wow-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
        
        {/* Content */}
        {children}
      </div>
    </motion.div>
  );
}