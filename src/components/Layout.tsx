import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, TrendingUp, ShoppingCart, Video, BarChart2,
  Settings, Bell, ChevronRight, Zap, LogOut, Menu, X, Film, Bot
} from 'lucide-react';
import Logo from './Logo';

type Page = 'dashboard' | 'trends' | 'orders' | 'library' | 'analytics' | 'settings' | 'autoseries' | 'agents';

interface NavItem {
  id: Page;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'autoseries', label: 'Auto Series', icon: Film },
  { id: 'trends', label: 'Trend Radar', icon: TrendingUp },
  { id: 'orders', label: 'Bestilling', icon: ShoppingCart },
  { id: 'agents', label: 'AI Agents', icon: Bot },
  { id: 'library', label: 'Library', icon: Video },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
];

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export const Layout = ({ children, currentPage, onNavigate, onLogout }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background overflow-hidden text-gray-200 font-sans">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 72 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-surface border-r border-border flex flex-col py-5 z-20 flex-shrink-0"
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between px-4 mb-8">
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Logo size="sm" />
              </motion.div>
            )}
          </AnimatePresence>
          {!sidebarOpen && (
            <div className="mx-auto">
              <Zap size={22} className="text-neon-cyan" />
            </div>
          )}
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-300 transition-colors ml-auto"
            >
              <X size={18} />
            </button>
          )}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute left-3 bottom-24 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <Menu size={18} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1 px-2">
          {NAV_ITEMS.map(item => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full text-left group relative ${
                  isActive
                    ? 'bg-neon-cyan/10 text-neon-cyan'
                    : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-0 h-full w-0.5 bg-neon-cyan rounded-r-full"
                  />
                )}
                <item.icon size={18} className="flex-shrink-0" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </nav>

        {/* Bottom Nav */}
        <div className="px-2 flex flex-col gap-1 mt-4 border-t border-border pt-4">
          <button
            onClick={() => onNavigate('settings')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-gray-500 hover:text-gray-200 hover:bg-white/5 w-full text-left ${currentPage === 'settings' ? 'text-neon-cyan bg-neon-cyan/10' : ''}`}
          >
            <Settings size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Innstillinger</span>}
          </button>
          <button onClick={onLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-gray-500 hover:text-red-400 hover:bg-red-500/5 w-full text-left">
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logg ut</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Background Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,245,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.15) 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }}
        />

        {/* Header */}
        <header className="h-16 border-b border-border flex items-center px-6 justify-between z-10 bg-surface/80 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-3">
            <ChevronRight size={14} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-300 capitalize">
              {NAV_ITEMS.find(n => n.id === currentPage)?.label ?? currentPage}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 font-mono text-xs text-neon-cyan bg-neon-cyan/5 border border-neon-cyan/20 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-pulse" />
              SYSTEM ONLINE
            </div>
            <button onClick={() => alert('Ingen nye varsler akkurat nå.')} className="relative text-gray-500 hover:text-gray-300 transition-colors">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-neon-amber rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-400">
              A
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export type { Page };
