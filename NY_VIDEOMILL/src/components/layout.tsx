import { ReactNode, useState } from 'react';
import { Bell, Search, Globe, Menu, X, Settings, XCircle, CheckCircle, AlertCircle, Film } from 'lucide-react';
import { Page } from '../lib/types';
import { useLanguage } from '../contexts/languageContext';
import { useAuth } from '../contexts/authContext';
import { Language } from '../lib/i18n';
import Sidebar from './sidebar';
import { useVideos } from '../lib/hooks/uselivedata';

interface LayoutProps {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { t, language, setLanguage } = useLanguage();
  const { data: videos } = useVideos();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const recentVideos = videos?.slice(0, 5) || [];
  const hasActiveProductions = videos?.some(v => ['queued', 'scripting', 'recording', 'editing'].includes(v.status)) || false;

  const titleKey = currentPage as keyof typeof t.nav;
  const title = t.nav[titleKey] ?? '';
  const subtitle = (t.pageSub as Record<string, string>)[currentPage] ?? '';

  const toggleLanguage = () => {
    const newLang = language === 'nb' ? 'en' : 'nb';
    setLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-[#0F1419] text-white">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-3 left-3 z-50 p-2 bg-[#192734] border border-[#38444D] rounded-lg lg:hidden"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - fixed on desktop, slide-in on mobile */}
      <div className={`fixed top-0 left-0 h-full z-40 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar current={currentPage} onNavigate={(page) => { onNavigate(page); setSidebarOpen(false); }} />
      </div>

      <main className="lg:pl-64 min-h-screen">
        <header className="sticky top-0 z-20 bg-[#0F1419]/95 backdrop-blur-xl border-b border-[#38444D] px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="pl-12 lg:pl-0">
              <h1 className="text-lg lg:text-xl font-bold text-[#E7E9EA]">{title}</h1>
              <p className="text-sm text-[#8B98A5] hidden sm:block">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Search - hidden on small screens */}
              <div className="relative hidden md:block">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B98A5]" />
                <input
                  type="text"
                  placeholder={t.common.search}
                  className="bg-[#192734] border border-[#38444D] rounded-full pl-10 pr-4 py-2 text-sm text-[#E7E9EA] placeholder-[#8B98A5] focus:outline-none focus:border-[#1D9BF0] w-40 lg:w-48"
                />
              </div>
              
              {/* Language toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-2 lg:px-3 py-2 rounded-full bg-[#192734] border border-[#38444D] text-[#8B98A5] hover:text-[#E7E9EA] hover:border-[#1D9BF0] text-xs font-medium transition-all"
              >
                <Globe size={13} />
                <span className="hidden sm:inline">{language === 'nb' ? 'EN' : 'NO'}</span>
              </button>
              
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative w-9 lg:w-10 h-9 lg:h-10 rounded-full bg-[#192734] border border-[#38444D] flex items-center justify-center hover:bg-[#273340] transition-colors"
                >
                  <Bell size={16} className="text-[#8B98A5]" />
                  {(hasActiveProductions || recentVideos.length > 0) && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#1D9BF0]" />
                  )}
                </button>
                
                {/* Notification dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 top-12 w-72 bg-[#15202B] border border-[#38444D] rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#38444D] flex items-center justify-between">
                      <span className="font-semibold text-[#E7E9EA]">{language === 'nb' ? 'Aktivitet' : 'Activity'}</span>
                      <button onClick={() => setNotifOpen(false)}><X size={14} className="text-[#8B98A5]" /></button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {recentVideos.length === 0 ? (
                        <div className="p-4 text-center text-[#8B98A5] text-sm">
                          {language === 'nb' ? 'Ingen aktivitet ennå' : 'No activity yet'}
                        </div>
                      ) : (
                        recentVideos.map(v => (
                          <div key={v.id} className="px-4 py-3 hover:bg-white/5 border-b border-[#38444D]/50 flex items-start gap-3">
                            {v.status === 'complete' ? (
                              <CheckCircle size={16} className="text-green-500 mt-0.5" />
                            ) : v.status === 'failed' ? (
                              <XCircle size={16} className="text-red-500 mt-0.5" />
                            ) : (
                              <Film size={16} className="text-[#1D9BF0] mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[#E7E9EA] truncate">{v.title || v.topic || 'Video'}</p>
                              <p className="text-xs text-[#8B98A5]">{v.status} • {v.progress || 0}%</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Settings button */}
              <button
                onClick={() => onNavigate('settings')}
                className="w-9 lg:w-10 h-9 lg:h-10 rounded-full bg-[#192734] border border-[#38444D] flex items-center justify-center hover:bg-[#273340] transition-colors"
              >
                <Settings size={16} className="text-[#8B98A5]" />
              </button>
            </div>
          </div>
        </header>

        <div className="px-4 lg:px-6 py-4">
          {children}
        </div>
      </main>
    </div>
  );
}
