import { LayoutDashboard, TrendingUp, Film, Library, Share2, MessageSquare, BarChart3, Settings, LogOut, Zap, Factory, Radar, Crown, CreditCard } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom'; // Viktig for integrasjon
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { AnimatedLogo } from './animatedlogo'; // Bruker din eksisterende logo
import { supabase } from "@/lib/supabase";

export default function Sidebar() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Henter nåværende URL

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Navigasjonsobjekter som matcher dine ruter (URL-er)
  const navItems = [
    { path: '/', label: "Video Machine", icon: <Zap size={17} /> },
    { path: '/factory', label: "Factory Floor", icon: <Factory size={17} /> },
    { path: '/dashboard', label: "Dashboard", icon: <LayoutDashboard size={17} /> },
    { path: '/trends', label: "Trendradar", icon: <Radar size={17} /> },
    { path: '/library', label: "Library", icon: <Film size={17} /> },
    { path: '/analytics', label: "Analytics", icon: <BarChart3 size={17} /> },
  ];

  const systemItems = [
    { path: '/admin', label: "Admin Panel", icon: <Crown size={17} /> },
    { path: '/payments', label: "Payments", icon: <CreditCard size={17} /> },
    { path: '/settings', label: "Settings", icon: <Settings size={17} /> },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#090910] border-r border-white/5 flex flex-col z-40">
      {/* LOGO */}
      <div className="px-6 py-8">
        <AnimatedLogo size="md" />
      </div>

      {/* HOVEDNAVIGASJON */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <p className="px-4 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">Production</p>
        {navItems.map(({ path, label, icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.05)]'
                  : 'text-white/45 hover:text-white/80 hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className={`flex-shrink-0 ${active ? 'text-teal-400' : 'text-white/25'}`}>{icon}</span>
              <span className="truncate">{label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_#14b8a6]" />}
            </Link>
          );
        })}
      </nav>

      {/* SYSTEM & LOGOUT */}
      <div className="px-3 py-4 border-t border-white/5 space-y-1">
        <p className="px-4 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">System</p>
        {systemItems.map(({ path, label, icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className={active ? 'text-teal-400' : 'text-white/25'}>{icon}</span>
              {label}
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/5 border border-transparent transition-all mt-2"
        >
          <LogOut size={17} className="text-white/25" />
          Logout
        </button>

        {/* SYSTEM STATUS CARD */}
        <div className="mt-4 mx-1 px-4 py-4 rounded-2xl bg-teal-500/5 border border-teal-500/10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400">System Active</span>
          </div>
          <p className="text-[10px] text-white/30 uppercase tracking-tighter">Next Node Sync: 2h 14m</p>
        </div>
      </div>
    </aside>
  );
}