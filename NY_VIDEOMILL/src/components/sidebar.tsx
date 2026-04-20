import { LayoutDashboard, TrendingUp, Film, Library, Share2, MessageSquare, BarChart3, Settings, LogOut, ShoppingCart, Clapperboard, Layers, Bot } from 'lucide-react';
import { Page } from '../lib/types';
import { useLanguage } from '../contexts/languageContext';
import { useAuth } from '../contexts/authContext';
import Logo from './logo';

interface SidebarProps {
  current: Page;
  onNavigate: (page: Page) => void;
}

export default function Sidebar({ current, onNavigate }: SidebarProps) {
  const { t, language } = useLanguage();
  const { signOut } = useAuth();

  const navItems: { page: Page; label: string; label_en: string; icon: React.ReactNode; badge?: string }[] = [
    { page: 'dashboard',    label: t.nav.dashboard,    label_en: 'Dashboard',    icon: <LayoutDashboard size={20} /> },
    { page: 'studio',       label: 'Studio Pro',       label_en: 'Studio Pro',       icon: <Clapperboard size={20} />, badge: 'NY' },
    { page: 'series',       label: 'Auto-Serie',       label_en: 'Auto Series',       icon: <Layers size={20} />,       badge: 'AI' },
    { page: 'bestilling',   label: t.nav.bestilling,   label_en: 'Orders',   icon: <ShoppingCart size={20} /> },
    { page: 'trends',       label: t.nav.trends,       label_en: 'Trends',       icon: <TrendingUp size={20} /> },
    { page: 'production',   label: t.nav.production,   label_en: 'Production',   icon: <Film size={20} /> },
    { page: 'library',      label: t.nav.library,      label_en: 'Library',      icon: <Library size={20} /> },
    { page: 'distribution', label: t.nav.distribution, label_en: 'Distribution', icon: <Share2 size={20} /> },
    { page: 'engagement',   label: t.nav.engagement,   label_en: 'Engagement',   icon: <MessageSquare size={20} /> },
    { page: 'analytics',    label: t.nav.analytics,    label_en: 'Analytics',    icon: <BarChart3 size={20} /> },
    { page: 'agents',      label: 'AI Agenter',    label_en: 'AI Agents',    icon: <Bot size={20} />,    badge: 'AI' },
  ];

  const getLabel = (item: typeof navItems[0]) => language === 'en' ? item.label_en : item.label;

  return (
    <aside className="w-64 h-full bg-[#15202B] border-r border-[#38444D] flex flex-col">
      <div className="px-4 lg:px-5 py-4 lg:py-5 border-b border-[#38444D]">
        <Logo size="md" />
      </div>

      <nav className="flex-1 px-2 lg:px-3 py-3 lg:py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ page, label, label_en, icon, badge }) => {
          const active = current === page;
          return (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`w-full flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl lg:rounded-full text-[14px] lg:text-[15px] font-medium transition-all duration-150 ${
                active
                  ? 'bg-[#1D9BF0]/15 text-[#1D9BF0]'
                  : 'text-[#E7E9EA] hover:bg-white/5'
              }`}
            >
              <span className="flex-shrink-0">{icon}</span>
              <span className="truncate">{language === 'en' ? label_en : label}</span>
              {badge && !active && (
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1D9BF0]/20 text-[#1D9BF0]">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-[#38444D] space-y-2">
        <button
          onClick={() => onNavigate('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-[15px] font-medium transition-all ${
            current === 'settings'
              ? 'bg-[#1D9BF0]/15 text-[#1D9BF0]'
              : 'text-[#E7E9EA] hover:bg-white/5'
          }`}
        >
          <Settings size={18} />
          {t.nav.settings}
        </button>

        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-[15px] font-medium text-[#F4212E] hover:bg-[#F4212E]/10 transition-all"
        >
          <LogOut size={18} />
          {t.common.logout}
        </button>

        <div className="mt-2 mx-1 px-4 py-3 rounded-2xl bg-[#1D9BF0]/10 border border-[#1D9BF0]/20">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-[#1D9BF0] animate-pulse" />
            <span className="text-xs font-bold text-[#1D9BF0]">{t.common.systemActive}</span>
          </div>
          <p className="text-xs text-[#8B98A5]">{t.common.nextScan} 2t 14min</p>
        </div>
      </div>
    </aside>
  );
}
