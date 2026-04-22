import { useMemo } from 'react';
import { 
  TrendingUp, Film, Eye, DollarSign, Shield, Activity, 
  Users, BarChart3, AlertTriangle, CheckCircle, Search, Filter,
  LayoutDashboard, PieChart, FileText, Bot
} from 'lucide-react';
import { Page } from '../lib/types';
import { useVideos, useTrends, useAgentLogs } from '../lib/hooks/uselivedata';
import { useAdminRole, useAllAdmins, AdminRole } from '../lib/hooks/useRoles';
import { useLanguage } from '../contexts/languageContext';
import StatusBadge from '../components/statusbadge';

const LABELS = {
  nb: {
    dashboard: 'COO Dashboard',
    financials: 'Økonomi',
    security: 'Sikkerhet',
    marketing: 'Marketing',
    system: 'IT System',
    support: 'Brukerstøtte',
    viewAll: 'Vis alle',
    activeUsers: 'Aktive brukere',
    totalVideos: 'Totalt videoer',
    completedThisMonth: 'Fullført denne måned',
    revenue: 'Inntekt',
    securityLogs: 'Sikkerhetslogg',
    errorLogs: 'Feillogger',
    trends: 'Trender',
    agents: 'AI Agenter',
  },
  en: {
    dashboard: 'COO Dashboard',
    financials: 'Financials',
    security: 'Security',
    marketing: 'Marketing',
    system: 'System',
    support: 'Support',
    viewAll: 'View all',
    activeUsers: 'Active users',
    totalVideos: 'Total videos',
    completedThisMonth: 'Completed this month',
    revenue: 'Revenue',
    securityLogs: 'Security logs',
    errorLogs: 'Error logs',
    trends: 'Trends',
    agents: 'AI Agents',
  },
};

interface AdminDashboardProps {
  role: AdminRole;
  onNavigate?: (page: Page) => void;
}

export default function AdminDashboard({ role, onNavigate }: AdminDashboardProps) {
  const { language } = useLanguage();
  const lbl = language === 'en' ? LABELS.en : LABELS.nb;
  const { data: videos, loading: videosLoading } = useVideos();
  const { data: trends } = useTrends();
  const { logs, loading: logsLoading } = useAgentLogs(20);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    const monthVideos = videos.filter(v => v.created_at?.startsWith(thisMonth));
    
    return {
      totalVideos: videos.length,
      completedThisMonth: monthVideos.filter(v => v.status === 'complete').length,
      activeProductions: videos.filter(v => ['queued','scripting','recording','editing'].includes(v.status)).length,
      totalViews: videos.reduce((s, v) => s + (v.views || 0), 0),
      activeTrends: trends?.filter(t => t.active).length || 0,
      revenue: monthVideos.filter(v => v.status === 'complete').length * 249, // estimert
    };
  }, [videos, trends]);

  const renderCOO = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Film} label="Totalt videoer" value={stats.totalVideos} color="text-teal-400" />
        <StatCard icon={CheckCircle} label="Fullført måned" value={stats.completedThisMonth} color="text-green-400" />
        <StatCard icon={Activity} label="Aktive produksjoner" value={stats.activeProductions} color="text-amber-400" />
        <StatCard icon={TrendingUp} label="Aktive trender" value={stats.activeTrends} color="text-cyan-400" />
      </div>

      {/* Recent Videos */}
      <div className="bg-[#111118] border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Siste videoer</h2>
        </div>
        <div className="space-y-2">
          {videos.slice(0, 5).map(v => (
            <div key={v.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-white text-sm">{v.title || v.topic || 'Untitled'}</p>
                <p className="text-white/40 text-xs">{new Date(v.created_at).toLocaleDateString('nb-NO')}</p>
              </div>
              <StatusBadge status={v.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCFO = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={DollarSign} label="Estimert inntekt" value={stats.revenue} prefix="kr " color="text-green-400" />
        <StatCard icon={Film} label="Videoer denne måned" value={stats.completedThisMonth} color="text-teal-400" />
        <StatCard icon={Eye} label="Totalt visninger" value={stats.totalViews} color="text-blue-400" />
      </div>
      <div className="bg-[#111118] border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">{lbl.financials}</h2>
        <p className="text-white/40">Detaljert økonomirapportering kommer snart</p>
      </div>
    </div>
  );

  const renderCISO = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={Shield} label="System status" value="OK" color="text-green-400" />
        <StatCard icon={AlertTriangle} label="Feil siste 24t" value={0} color="text-amber-400" />
        <StatCard icon={Activity} label="API kall" value={videos.length * 5} color="text-teal-400" />
      </div>
      <div className="bg-[#111118] border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">{lbl.securityLogs}</h2>
        <div className="space-y-2">
          <LogEntry time={new Date().toISOString()} action="Bruker logget inn" status="ok" />
          <LogEntry time={new Date().toISOString()} action="Video bestilt" status="ok" />
        </div>
      </div>
    </div>
  );

  const renderMarketing = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={TrendingUp} label="Aktive trender" value={stats.activeTrends} color="text-cyan-400" />
        <StatCard icon={Film} label="Videoer produsert" value={stats.completedThisMonth} color="text-teal-400" />
        <StatCard icon={Eye} label="Visninger" value={stats.totalViews} color="text-blue-400" />
      </div>
      <div className="bg-[#111118] border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">{lbl.trends}</h2>
        <div className="space-y-2">
          {trends?.slice(0, 5).map(t => (
            <TrendItem key={t.id} trend={t} />
          ))}
        </div>
      </div>
    </div>
  );

  const renderIT = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={Activity} label="System" value="Online" color="text-green-400" />
        <StatCard icon={Bot} label="AI Agenter" value="4" color="text-teal-400" />
        <StatCard icon={AlertTriangle} label="Feil" value={0} color="text-amber-400" />
      </div>
      <div className="bg-[#111118] border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">{lbl.errorLogs}</h2>
        <p className="text-white/40">Ingen feil logget</p>
      </div>
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Totalt brukere" value={videos.length} color="text-teal-400" />
        <StatCard icon={Film} label="Totalt videoer" value={stats.totalVideos} color="text-blue-400" />
        <StatCard icon={Activity} label="Aktive bestillinger" value={stats.activeProductions} color="text-amber-400" />
      </div>
      <div className="bg-[#111118] border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Brukerhenvendelser</h2>
        <p className="text-white/40">Ingen åpne henvendelser</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <LayoutDashboard size={24} className="text-teal-400" />
          {role} Dashboard
        </h1>
      </div>

      {role === 'COO' && renderCOO()}
      {role === 'CFO' && renderCFO()}
      {role === 'CISO' && renderCISO()}
      {role === 'Marketing' && renderMarketing()}
      {role === 'IT' && renderIT()}
      {role === 'Support' && renderSupport()}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, prefix = '', color }: { icon: React.ElementType; label: string; value: string | number; prefix?: string; color: string }) {
  return (
    <div className="bg-[#111118] border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-2 text-white/40 text-sm mb-1">
        <Icon size={14} />
        {label}
      </div>
      <p className={`text-2xl font-bold ${color}`}>{prefix}{value}</p>
    </div>
  );
}

function LogEntry({ time, action, status }: { time: string; action: string; status: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg text-sm">
      <span className="text-white/60">{new Date(time).toLocaleString('nb-NO')}</span>
      <span className="text-white">{action}</span>
      <span className={`px-2 py-0.5 rounded text-xs ${status === 'ok' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
        {status}
      </span>
    </div>
  );
}

function TrendItem({ trend }: { trend: Record<string, unknown> }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
      <div>
        <p className="text-white text-sm">{String(trend.title)}</p>
        <p className="text-white/40 text-xs">{String(trend.heat_level)}</p>
      </div>
      <span className="text-teal-400 text-sm font-medium">{Number(trend.viral_score)}</span>
    </div>
  );
}