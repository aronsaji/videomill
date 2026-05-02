import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { usePipelineStore } from './store/pipelineStore';
import { Layout } from './components/Layout';
import type { Page } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

import TrendAnalyzer from './pages/TrendAnalyzer';
import Orders from './pages/Orders';
import Library from './pages/Library';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AutoSeries from './pages/AutoSeries';
import Agents from './pages/Agents';

// Layout wrapper to handle internal navigation state
function MainLayout() {
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
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
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

  // Auto-login for dev if desired, but let's keep the real login flow
  // For now, let's just make it possible to bypass login in development or show login
  useEffect(() => {
    const token = localStorage.getItem('videomill_auth');
    if (token) setIsAuthenticated(true);
  }, []);

  if (!isAuthenticated) {
    return <Login onLogin={() => {
      localStorage.setItem('videomill_auth', 'true');
      setIsAuthenticated(true);
    }} />;
  }

  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}

export default App;
