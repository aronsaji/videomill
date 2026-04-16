import { LayoutDashboard, TrendingUp, Film, Library, Share2, MessageSquare, BarChart3, Settings, LogOut, ShoppingCart } from 'lucide-react';
import { Page } from '../lib/types';
import { useLanguage } from '../contexts/languageContext';
import { useAuth } from '../contexts/authContext';
import Logo from './logo';

interface SidebarProps {
  current: Page;
  onNavigate: (page: Page) => void;
}

export default function Sidebar({ current, onNavigate }: SidebarProps) {
  const { t } = useLanguage();
  const { signOut } = useAuth();

  const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
    { page: 'dashboard',    label: t.nav.dashboard,    icon: <LayoutDashboard size={17} /> },
    { page: 'bestilling',   label: t.nav.bestilling,   icon: <ShoppingCart size={17} /> },
    { page: 'trends',       label: t.nav.trends,       icon: <TrendingUp size={17} /> },
    { page: 'production',   label: t.nav.production,   icon: <Film size={17} /> },
    { page: 'library',      label: t.nav.library,      icon: <Library size={17} /> },
    { page: 'distribution', label: t.nav.distribution, icon: <Share2 size={17} /> },
    { page: 'engagement',   label: t.nav.engagement,   icon: <MessageSquare size={17} /> },
    { page: 'analytics',    label: t.nav.analytics,    icon: <BarChart3 size={17} /> },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0d0d14] border-r border-white/5 flex flex-col z-40">
      <div className="px-5 py-5 border-b border-white/5">
        <Logo size="md" />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ page, label, icon }) => {
          const active = current === page;
          return (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-teal-500/12 text-teal-400 border border-teal-500/20'
                  : 'text-white/45 hover:text-white/80 hover:bg-white/4 border border-transparent'
              }`}
            >
              <span className={`flex-shrink-0 ${active ? 'text-teal-400' : 'text-white/25'}`}>{icon}</span>
              <span className="truncate">{label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/5 space-y-1">
        <button
          onClick={() => onNavigate('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            current === 'settings'
              ? 'bg-teal-500/12 text-teal-400 border border-teal-500/20'
              : 'text-white/40 hover:text-white/70 hover:bg-white/4 border border-transparent'
          }`}
        >
          <Settings size={17} className={current === 'settings' ? 'text-teal-400' : 'text-white/25'} />
          {t.nav.settings}
        </button>

        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/5 border border-transparent transition-all"
        >
          <LogOut size={17} className="text-white/25" />
          {t.common.logout}
        </button>

        <div className="mt-2 mx-1 px-3 py-3 rounded-xl bg-teal-500/6 border border-teal-500/12">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs font-semibold text-teal-400">{t.common.systemActive}</span>
          </div>
          <p className="text-xs text-white/35">{t.common.nextScan} 2t 14min</p>
        </div>
      </div>
    </aside>
  );
}
