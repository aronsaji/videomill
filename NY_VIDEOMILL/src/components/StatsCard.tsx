import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'blue' | 'teal' | 'purple' | 'green' | 'red' | 'orange';
}

const colorMap = {
  blue: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/20' },
  teal: { bg: 'bg-teal-500/15', text: 'text-teal-400', border: 'border-teal-500/20' },
  purple: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/20' },
  green: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/20' },
  red: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/20' },
  orange: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/20' },
};

export function StatsCard({ label, value, icon: Icon, color = 'blue' }: StatsCardProps) {
  const colors = colorMap[color];
  
  return (
    <div className="bg-[#111118] border border-white/6 rounded-xl p-4 flex items-center gap-4">
      <div className={`w-9 h-9 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={15} className={colors.text} />
      </div>
      <div>
        <p className="text-xs text-white/35 mb-0.5">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

interface StatsGridProps {
  stats: { label: string; value: string | number; icon: LucideIcon; color?: 'blue' | 'teal' | 'purple' | 'green' | 'red' | 'orange' }[];
  columns?: 2 | 3 | 4;
}

export function StatsGrid({ stats, columns = 4 }: StatsGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  };
  
  return (
    <div className={`grid ${gridCols[columns]} gap-3 sm:gap-4`}>
      {stats.map((stat) => (
        <StatsCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}