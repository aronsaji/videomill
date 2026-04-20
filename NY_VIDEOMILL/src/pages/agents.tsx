import { useMemo } from 'react';
import { Bot, TrendingUp, DollarSign, Shield, MessageSquare, RefreshCw, AlertTriangle, CheckCircle2, Lightbulb, Clock, Hash, Megaphone, Activity, Zap, Brain, Eye } from 'lucide-react';
import { useAgentReports, useSocialResponses } from '../lib/hooks/uselivedata';
import { useLanguage } from '../contexts/languageContext';
import { PageHeader } from '../components/PageHeader';

const AGENT_CONFIG = {
  COO: {
    name: 'COO',
    title: 'Chief Operating Officer',
    icon: TrendingUp,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    accent: 'from-blue-500/20 to-cyan-500/10',
    description: 'Operasjoner, effektivitet og produksjons-KPIer',
    schedule: 'Daglig kl 02:00',
  },
  CFO: {
    name: 'CFO',
    title: 'Chief Financial Officer',
    icon: DollarSign,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    accent: 'from-emerald-500/20 to-green-500/10',
    description: 'Økonomi, ROI og kostnadsanalyse',
    schedule: 'Daglig kl 02:00',
  },
  Marketing: {
    name: 'Marketing',
    title: 'Marketing Director',
    icon: Megaphone,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    accent: 'from-purple-500/20 to-pink-500/10',
    description: 'Trender, content-strategi og hashtags',
    schedule: 'Hver 4. time',
  },
  CISO: {
    name: 'CISO',
    title: 'Chief Security Officer',
    icon: Shield,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    accent: 'from-red-500/20 to-orange-500/10',
    description: 'Sikkerhet og ISO 27001 compliance',
    schedule: 'Hver time',
  },
  ErrorFixer: {
    name: 'Error Fixer',
    title: 'Auto-Error Resolution',
    icon: Zap,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    accent: 'from-amber-500/20 to-yellow-500/10',
    description: 'Auto-retter feilede videoer',
    schedule: 'Hver 15. min',
  },
  SocialResponse: {
    name: 'Social Response',
    title: 'Social Media Agent',
    icon: MessageSquare,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    accent: 'from-cyan-500/20 to-blue-500/10',
    description: 'Svar på sosiale medier',
    schedule: 'Ved webhook',
  },
};

function AgentSummaryCard({ agentKey, config, latestReport }: { agentKey: string; config: any; latestReport?: any }) {
  const Icon = config.icon;
  const hasData = !!latestReport;
  
  return (
    <div className={`relative overflow-hidden ${config.bg} border ${config.border} rounded-2xl p-5 hover:border-white/20 transition-all group`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${config.accent} opacity-50`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${config.bg} border ${config.border}`}>
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <h3 className={`font-bold ${config.color}`}>{config.name}</h3>
              <p className="text-xs text-white/40">{config.title}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${hasData ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-white/30'}`}>
            <Activity size={10} />
            {hasData ? 'Active' : 'Waiting'}
          </div>
        </div>
        
        <p className="text-sm text-white/60 mb-3">{config.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <Clock size={11} />
            {config.schedule}
          </div>
          {latestReport && (
            <span className="text-xs text-white/40">
              {new Date(latestReport.created_at).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        
        {latestReport && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-white/50 line-clamp-2">
              {latestReport.report || latestReport.financial_summary || latestReport.content_strategy || latestReport.security_status || 'Ingen data'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function AgentDetailCard({ report, config }: { report: any; config: any }) {
  const Icon = config.icon;
  
  return (
    <div className={`${config.bg} border ${config.border} rounded-xl p-4`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2 rounded-lg ${config.bg}`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${config.color}`}>{config.name}</h3>
          <p className="text-xs text-white/40">{config.title}</p>
        </div>
        <span className="text-xs text-white/30">
          {new Date(report.created_at).toLocaleString('nb-NO', { 
            hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' 
          })}
        </span>
      </div>

      <p className="text-sm text-white/80 mb-3 line-clamp-3">
        {report.report || report.financial_summary || report.content_strategy || report.security_status || report.message || 'Ingen data'}
      </p>

      {report.recommendations && report.recommendations.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-white/40 mb-1.5 flex items-center gap-1">
            <Lightbulb className="w-3 h-3" /> Anbefalinger
          </p>
          <div className="flex flex-wrap gap-1">
            {report.recommendations.slice(0, 3).map((r: string, i: number) => (
              <span key={i} className="text-xs bg-white/5 px-2 py-1 rounded text-white/60">{r}</span>
            ))}
          </div>
        </div>
      )}

      {report.alerts && report.alerts.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-orange/40 mb-1.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Varsler
          </p>
          <div className="flex flex-wrap gap-1">
            {report.alerts.slice(0, 2).map((a: string, i: number) => (
              <span key={i} className="text-xs bg-orange/10 px-2 py-1 rounded text-orange">{a}</span>
            ))}
          </div>
        </div>
      )}

      {report.hashtag_suggestions && report.hashtag_suggestions.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-white/40 mb-1.5 flex items-center gap-1">
            <Hash className="w-3 h-3" /> Hashtags
          </p>
          <div className="flex flex-wrap gap-1">
            {report.hashtag_suggestions.slice(0, 5).map((h: string, i: number) => (
              <span key={i} className="text-xs bg-purple-500/10 px-2 py-1 rounded text-purple-300">#{h}</span>
            ))}
          </div>
        </div>
      )}

      {report.viral_tips && report.viral_tips.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-white/40 mb-1.5">Viral-tips</p>
          <div className="flex flex-wrap gap-1">
            {report.viral_tips.slice(0, 3).map((t: string, i: number) => (
              <span key={i} className="text-xs bg-green-500/10 px-2 py-1 rounded text-green-300">{t}</span>
            ))}
          </div>
        </div>
      )}

      {report.anomalies && report.anomalies.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-red/40 mb-1.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Anomalier
          </p>
          <div className="flex flex-wrap gap-1">
            {report.anomalies.slice(0, 3).map((a: string, i: number) => (
              <span key={i} className="text-xs bg-red-500/10 px-2 py-1 rounded text-red-300">{a}</span>
            ))}
          </div>
        </div>
      )}

      {report.risk_level && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-white/40">Risikonivå:</span>
          <span className={`text-xs px-2 py-1 rounded ${
            report.risk_level === 'low' ? 'bg-green-500/20 text-green-400' :
            report.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>{report.risk_level}</span>
        </div>
      )}
    </div>
  );
}

function SocialResponseCard({ response }: { response: any }) {
  return (
    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-medium text-cyan-400">Svar sendt</span>
        <span className="text-xs text-white/30 ml-auto">
          {new Date(response.created_at).toLocaleString('nb-NO')}
        </span>
      </div>
      {response.original_message && (
        <div className="mb-2">
          <p className="text-xs text-white/40">Original:</p>
          <p className="text-sm text-white/70 italic">"{response.original_message}"</p>
        </div>
      )}
      <div className="mt-2 pt-2 border-t border-cyan-500/20">
        <p className="text-xs text-cyan/40">Svar:</p>
        <p className="text-sm text-white">{response.message}</p>
      </div>
    </div>
  );
}

export default function Agents() {
  const { data: reports, loading, refresh } = useAgentReports();
  const { data: socialResponses } = useSocialResponses();
  const { t } = useLanguage();

  const reportsByAgent = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    (reports ?? []).forEach(r => {
      const agent = r.agent ?? 'Unknown';
      if (!grouped[agent]) grouped[agent] = [];
      grouped[agent].push(r);
    });
    return grouped;
  }, [reports]);

  const latestByAgent = useMemo(() => {
    const latest: Record<string, any> = {};
    Object.entries(reportsByAgent).forEach(([agent, list]) => {
      if (list.length > 0) latest[agent] = list[0];
    });
    return latest;
  }, [reportsByAgent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Agenter"
        subtitle="Automatiserte executive assistenter"
        icon={Bot}
        onRefresh={refresh}
        loading={loading}
      />

      {/* Agent Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(AGENT_CONFIG).map(([key, config]) => (
          <AgentSummaryCard 
            key={key} 
            agentKey={key} 
            config={config} 
            latestReport={latestByAgent[key]} 
          />
        ))}
      </div>

      {/* Detailed Reports by Agent */}
      {Object.entries(AGENT_CONFIG).map(([key, config]) => {
        const agentReports = reportsByAgent[key] ?? [];
        if (agentReports.length === 0) return null;
        
        return (
          <div key={key}>
            <h2 className={`text-lg font-semibold ${config.color} mb-3 flex items-center gap-2`}>
              <config.icon className="w-5 h-5" />
              {config.name} Rapporter
              <span className="text-xs text-white/30 font-normal">
                ({agentReports.length})
              </span>
            </h2>
            <div className="grid gap-4">
              {agentReports.slice(0, 3).map((report) => (
                <AgentDetailCard key={report.id} report={report} config={config} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Social Responses */}
      <div>
        <h2 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Sosiale medier-svar
          <span className="text-xs text-white/30 font-normal">
            ({(socialResponses ?? []).length})
          </span>
        </h2>
        {(socialResponses ?? []).length === 0 ? (
          <p className="text-sm text-white/40">Ingen responser enda</p>
        ) : (
          <div className="grid gap-3">
            {(socialResponses ?? []).slice(0, 5).map((response) => (
              <SocialResponseCard key={response.id} response={response} />
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h3 className="text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
          <Brain className="w-4 h-4 text-blue-400" />
          Agent Oversikt
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-blue-400" />
            <span><strong className="text-blue-400">COO</strong> - Daglig</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-3 h-3 text-emerald-400" />
            <span><strong className="text-emerald-400">CFO</strong> - Daglig</span>
          </div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-3 h-3 text-purple-400" />
            <span><strong className="text-purple-400">Marketing</strong> - 4t</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3 text-red-400" />
            <span><strong className="text-red-400">CISO</strong> - Hver time</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-amber-400" />
            <span><strong className="text-amber-400">Error Fixer</strong> - 15m</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-3 h-3 text-cyan-400" />
            <span><strong className="text-cyan-400">Social</strong> - Webhook</span>
          </div>
        </div>
      </div>
    </div>
  );
}