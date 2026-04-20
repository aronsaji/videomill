import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { AppSidebar } from "./appsidebar"; // Dette er den nye sidebaren din
import { ShieldCheck, Bell, Search, Globe, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const location = useLocation();

  // Mapper URL til sidetitler for headeren
  const getPageTitle = (pathname: string) => {
    const path = pathname === "/" ? "Video Machine" : pathname.substring(1);
    return path.charAt(0).toUpperCase() + path.slice(1).replace("-", " ");
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'nb' ? 'en' : 'nb';
    i18n.changeLanguage(newLang);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#090910] text-zinc-100 selection:bg-teal-500/30 font-sans">
        
        {/* SIDEBAR - Din nye Sidebar-komponent */}
        <AppSidebar />

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          
          {/* HEADER - Glassmorphism & Logic */}
          <header className="sticky top-0 z-40 h-16 flex items-center justify-between border-b border-white/5 px-6 bg-[#090910]/80 backdrop-blur-xl shadow-sm">
            
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-white/40 hover:text-teal-400 transition-colors" />
              <div className="h-4 w-px bg-white/10" />
              
              {/* Breadcrumb / Page Indicator */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">System</span>
                <ChevronRight size={10} className="text-white/10" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {getPageTitle(location.pathname)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* SEARCH - Subtile Expandable version */}
              <div className="relative hidden lg:block group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-teal-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Universal Search..."
                  className="bg-white/5 border border-white/5 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white/60 placeholder:text-white/10 focus:outline-none focus:border-teal-500/30 focus:bg-white/10 transition-all w-40 focus:w-64"
                />
              </div>

              {/* LANGUAGE TOGGLE */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white/80 hover:bg-white/10 text-[10px] font-bold transition-all"
              >
                <Globe size={12} />
                {i18n.language?.toUpperCase() === 'NB' ? 'NO' : 'EN'}
              </button>

              {/* SECURITY STATUS */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-500/5 border border-teal-500/10 transition-all hover:bg-teal-500/10">
                <div className="relative">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse shadow-[0_0_8px_#14b8a6]" />
                </div>
                <span className="text-[10px] font-bold text-teal-400 tracking-wider uppercase">Active_Shield</span>
              </div>

              <div className="h-4 w-px bg-white/10 mx-1" />

              {/* NOTIFICATION */}
              <button className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-white/40 hover:text-white relative group">
                <Bell size={16} className="group-hover:rotate-12 transition-transform" />
                <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-teal-500 rounded-full border-2 border-[#090910]" />
              </button>
            </div>
          </header>

          {/* PAGE CONTENT CONTAINER */}
          <main className="flex-1 overflow-x-hidden relative">
            {/* Dekorativ glød bak innholdet (subtil) */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 blur-[120px] pointer-events-none rounded-full" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] pointer-events-none rounded-full" />
            
            {/* Selve sideinnholdet */}
            <div className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto relative z-10">
              {children}
            </div>
          </main>

          {/* Valgfri Footer / System info */}
          <footer className="px-10 py-4 border-t border-white/5 bg-black/20 flex justify-between items-center">
             <span className="text-[9px] font-mono text-white/10 uppercase tracking-widest">
                Viranode Engine v2.4.0 // Connection: Encrypted
             </span>
             <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500/20 flex items-center justify-center">
                   <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
                </div>
             </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}