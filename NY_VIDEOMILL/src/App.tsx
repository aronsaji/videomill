import { useState, useEffect } from 'react';
import { Page } from './lib/types';
import { AuthProvider, useAuth } from './contexts/authContext';
import { LanguageProvider } from './contexts/languageContext';
import Layout from './components/layout';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Trends from './pages/trends';
import Production from './pages/production';
import Library from './pages/library';
import Distribution from './pages/distribution';
import Engagement from './pages/engagement';
import Analytics from './pages/analytics';
import Settings from './pages/settings';
import Bestilling from './pages/bestilling';
import Agents from './pages/agents';
import Studio from './pages/studio';
import SeriesPage from './pages/series';
import Onboarding, { useOnboarding } from './components/onboarding';

// ── Hash-based routing so F5 / direct URL keeps the correct page ──
const VALID_PAGES: Page[] = [
  'dashboard', 'trends', 'production', 'library',
  'distribution', 'engagement', 'analytics', 'settings', 'bestilling', 'studio', 'series', 'agents',
];

function getPageFromHash(): Page {
  const hash = window.location.hash.replace('#', '').split('?')[0] as Page;
  return VALID_PAGES.includes(hash) ? hash : 'dashboard';
}

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>(getPageFromHash);
  const { showOnboarding, completeOnboarding: dismissOnboarding } = useOnboarding();

  // Keep URL hash in sync with page state
  const handleNavigate = (page: Page) => {
    window.location.hash = page;
    setCurrentPage(page);
  };

  // React to browser back / forward and manual URL edits
  useEffect(() => {
    const onHashChange = () => setCurrentPage(getPageFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060609] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/30 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center animate-pulse">
            <div className="w-4 h-4 rounded bg-teal-400/50" />
          </div>
          <div className="text-white/30 text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':    return <Dashboard onNavigate={handleNavigate} />;
      case 'bestilling':   return <Bestilling />;
      case 'studio':       return <Studio />;
      case 'trends':       return <Trends onNavigate={handleNavigate} />;
      case 'production':   return <Production onNavigate={handleNavigate} />;
      case 'library':      return <Library />;
      case 'distribution': return <Distribution />;
      case 'engagement':   return <Engagement />;
      case 'analytics':    return <Analytics />;
      case 'series':       return <SeriesPage />;
      case 'settings':     return <Settings />;
      case 'agents':       return <Agents />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
      {showOnboarding && user && (
        <Onboarding onComplete={() => dismissOnboarding()} onSkip={() => dismissOnboarding()} />
      )}
    </Layout>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
