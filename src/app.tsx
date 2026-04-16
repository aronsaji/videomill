import { useState } from 'react';
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

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

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
      case 'dashboard': return <Dashboard onNavigate={setCurrentPage} />;
      case 'trends': return <Trends />;
      case 'production': return <Production />;
      case 'library': return <Library />;
      case 'distribution': return <Distribution />;
      case 'engagement': return <Engagement />;
      case 'analytics': return <Analytics />;
      case 'settings': return <Settings />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
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
