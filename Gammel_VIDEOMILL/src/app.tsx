import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "./components/ui/sonner";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { AppLayout } from "./components/layout/applayout";
import { SplashScreen } from "./components/splashscreen";

// Autentisering
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Sider
import Dashboard from "./pages/dashboard";
import FactoryFloor from "./pages/factoryfloor";
import TrendRadar from "./pages/trendradar";
import Library from "./pages/library";
import Analytics from "./pages/analytics";
import AuditLog from "./pages/auditlog";
import AdminPanel from "./pages/adminpanel";
import Settings from "./pages/settings";
import Login from "./pages/login";
import Payments from "./pages/payments";
import VideoMachine from "./pages/videomachine";
import AuthCallback from "./pages/authcallback"; // <--- LAGT TIL IMPORT

const queryClient = new QueryClient();

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen show={true} />;

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black font-mono">
        <span className="text-[10px] text-amber-500 uppercase tracking-[0.3em]">Syncing_System...</span>
      </div>
    );
  }

  // SCENARIO 1: IKKE LOGGET INN
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Tillat callback selv om man ikke er "formelt" logget inn i context ennå, 
            da userId sendes i URL-en */}
        <Route path="/auth/callback/youtube" element={<AuthCallback />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // SCENARIO 2: LOGGET INN
  return (
    <Routes>
      {/* Callback-ruten ligger utenfor AppLayout for å ha full skjerm */}
      <Route path="/auth/callback/youtube" element={<AuthCallback />} />

      {/* Alle vanlige sider ligger inne i AppLayout */}
      <Route
        path="*"
        element={
          <AppLayout>
            <Routes>
              <Route path="/" element={<VideoMachine />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/factory" element={<FactoryFloor />} />
              <Route path="/trends" element={<TrendRadar />} />
              <Route path="/library" element={<Library />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/audit" element={<AuditLog />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        }
      />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppContent />
          </TooltipProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
