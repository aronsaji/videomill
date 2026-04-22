import { LucideIcon, RefreshCw } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  onRefresh?: () => void;
  loading?: boolean;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, icon: Icon, onRefresh, loading, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Icon className="w-6 h-6 text-[#1D9BF0]" />
          {title}
        </h1>
        <p className="text-sm text-white/50">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        {action}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/4 border border-white/8 text-white/40 text-xs rounded-lg hover:bg-white/8 hover:text-white/60 transition-colors"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
        )}
      </div>
    </div>
  );
}