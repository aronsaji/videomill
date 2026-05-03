import React, { useState, useEffect } from 'react';
import { HashRouter as BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { usePipelineStore } from './store/pipelineStore';
import { Layout } from './components/Layout';
import type { Page } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { supabase } from './lib/supabase';

import TrendAnalyzer from './pages/TrendAnalyzer';
import Orders from './pages/Orders';
import Library from './pages/Library';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AutoSeries from './pages/AutoSeries';
import Agents from './pages/Agents';

// Layout wrapper to handle internal navigation state
function MainLayout({ onLogout }: { onLogout: () => Promise<void> }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchInitialData, subscribeToChanges } = usePipelineStore();

  useEffect(() => {
    fetchInitialData();
    subscribeToChanges();
  }, [fetchInitialData, subscribeToChanges]);

  // Determine current page from URL
  const path = location.pathname.substring(1) || 'dashboard';
  const currentPage = (path as Page) || 'dashboard';

  const handleNavigate = (page: Page) => {
    navigate(`/${page === 'dashboard' ? '' : page}`);
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate} onLogout={onLogout}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/autoseries" element={<AutoSeries />} />
        <Route path="/trends" element={<TrendAnalyzer />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/library" element={<Library />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Laster...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <BrowserRouter>
      <MainLayout onLogout={handleLogout} />
    </BrowserRouter>
  );
}

export default App;
