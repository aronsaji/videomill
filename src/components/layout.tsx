import { ReactNode } from 'react';
import { Bell, Search, Globe } from 'lucide-react';
import { Page } from '../lib/types';
import { useLanguage } from '../contexts/languageContext';
import { useAuth } from '../contexts/authContext';
import { Language } from '../lib/i18n';
import Sidebar from './sidebar';

interface LayoutProps {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();

  const titleKey = currentPage as keyof typeof t.nav;
  const title = t.nav[titleKey] ?? '';
  const subtitle = (t.pageSub as Record<string, string>)[currentPage] ?? '';

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'VM';

  return (
    <div className="min-h-screen bg-[#090910] text-white">
      <Sidebar current={currentPage} onNavigate={onNavigate} />

      <main className="pl-64">
        <header className="sticky top-0 z-30 bg-[#090910]/80 backdrop-blur-xl border-b border-white/5 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">{title}</h1>
              <p className="text-sm text-white/40 mt-0.5">{subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder={t.common.search}
                  className="bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2 text-sm text-white/70 placeholder-white/25 focus:outline-none focus:border-teal-500/40 focus:bg-white/8 transition-all w-44"
                />
              </div>
              <button
                onClick={() => setLanguage(language === 'nb' ? 'en' : 'nb' as Language)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/8 text-white/45 hover:text-white/75 text-xs font-medium transition-all"
              >
                <Globe size={13} />
                {language === 'nb' ? 'EN' : 'NO'}
              </button>
              <button className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Bell size={15} className="text-white/45" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-teal-400" />
              </button>
              <button
                onClick={() => onNavigate('settings')}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-teal-500/20 hover:from-teal-400 hover:to-cyan-400 transition-all"
              >
                {initials}
              </button>
            </div>
          </div>
        </header>

        <div className="px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
