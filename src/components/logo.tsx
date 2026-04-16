interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const dim = size === 'sm' ? 28 : size === 'md' ? 36 : 52;
  const textClass = size === 'sm' ? 'text-base' : size === 'md' ? 'text-lg' : 'text-2xl';
  const subClass = size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-xs' : 'text-sm';

  return (
    <div className="flex items-center gap-2.5">
      <svg width={dim} height={dim} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGradA" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="logoGradB" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f766e" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0e7490" stopOpacity="0.3" />
          </linearGradient>
          <filter id="logoGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect x="2" y="2" width="48" height="48" rx="13" fill="url(#logoGradB)" stroke="url(#logoGradA)" strokeWidth="1.2" />
        <path
          d="M14 20 L22 20 L18 27 L26 27 L14 40 L20 30 L12 30 Z"
          fill="url(#logoGradA)"
          filter="url(#logoGlow)"
        />
        <rect x="28" y="18" width="10" height="4" rx="1.5" fill="url(#logoGradA)" opacity="0.9" />
        <rect x="28" y="25" width="8" height="3" rx="1.5" fill="url(#logoGradA)" opacity="0.6" />
        <rect x="28" y="31" width="6" height="3" rx="1.5" fill="url(#logoGradA)" opacity="0.35" />
        <circle cx="40" cy="14" r="4" fill="url(#logoGradA)" opacity="0.25" />
        <circle cx="40" cy="14" r="2" fill="url(#logoGradA)" opacity="0.6" />
        <circle cx="12" cy="14" r="2.5" fill="url(#logoGradA)" opacity="0.3" />
        <circle cx="40" cy="40" r="2" fill="url(#logoGradA)" opacity="0.2" />
      </svg>

      {showText && (
        <div>
          <div className={`font-bold tracking-tight leading-none text-white ${textClass}`}>
            Video<span className="text-teal-400">Mill</span>
          </div>
          <div className={`text-teal-400/70 font-medium leading-none mt-0.5 ${subClass}`}>
            AI Studio
          </div>
        </div>
      )}
    </div>
  );
}
