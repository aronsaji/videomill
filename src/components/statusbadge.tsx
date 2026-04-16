interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const config: Record<string, { label: string; classes: string }> = {
  // Production statuses
  queued:       { label: 'I kø',       classes: 'bg-white/6 text-white/45 border-white/10' },
  scripting:    { label: 'Manus',      classes: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  recording:    { label: 'Innspilling',classes: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  editing:      { label: 'Redigering', classes: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  complete:     { label: 'Ferdig',     classes: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  failed:       { label: 'Feilet',     classes: 'bg-red-500/10 text-red-400 border-red-500/20' },
  // Trend statuses
  pending:      { label: 'Venter',     classes: 'bg-white/6 text-white/40 border-white/10' },
  approved:     { label: 'Godkjent',   classes: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  rejected:     { label: 'Avvist',     classes: 'bg-red-500/10 text-red-400 border-red-500/20' },
  in_production:{ label: 'Produksjon', classes: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  // Distribution statuses
  uploading:    { label: 'Laster opp', classes: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  live:         { label: 'Live',       classes: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  // Sentiment
  positive:     { label: 'Positiv',    classes: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  neutral:      { label: 'Nøytral',   classes: 'bg-white/6 text-white/40 border-white/10' },
  negative:     { label: 'Negativ',    classes: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { label, classes } = config[status] ?? { label: status, classes: 'bg-white/6 text-white/40 border-white/10' };
  const sizeClass = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';
  return (
    <span className={`inline-flex items-center rounded-md border font-medium ${sizeClass} ${classes}`}>
      {label}
    </span>
  );
}
