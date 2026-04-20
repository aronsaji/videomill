import { useMemo } from 'react';
import { Bot, TrendingUp, DollarSign, Shield, Palette, MessageSquare, RefreshCw, AlertTriangle, CheckCircle2, Lightbulb, Clock, User, Hash, Megaphone } from 'lucide-react';
import { useAgentReports, useSocialResponses } from '../lib/hooks/uselivedata';

const AGENT_CONFIG = {
  COO: {
    name: 'COO',
    title: 'Chief Operating Officer',
    icon: TrendingUp,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    description: 'Operasjoner, effektivitet og produksjons-KPIer',
  },
  CFO: {
    name: 'CFO',
    title: 'Chief Financial Officer',
    icon: DollarSign,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    description: 'Økonomi, ROI og kostnadsanalyse',
  },
  Marketing: {
    name: 'Marketing',
    title: 'Marketing Director',
    icon: Megaphone,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    description: 'Trender, content-strategi og hashtags',
  },
  CISO: {
    name: 'CISO',
    title: 'Chief Information Security Officer',
    icon: Shield,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    description: 'Sikkerhet og ISO 27001 compliance',
  },
  SocialResponse: {
    name: 'Social Response',
    title: 'Social Media Agent',
    icon: MessageSquare,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    description: 'Svar på sosiale medier',
  },
};

function AgentCard({ report, config }: { report: any; config: any }) {
  const Icon = config.icon;
  
  return (
    <div className={`${config.bg} border ${config.border} rounded-xl p-4 sm:p-5`}>
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

      {report.from_user && report.original_message && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-3 h-3 text-white/40" />
            <span className="text-xs text-white/60">{report.from_user}</span>
            <span className="text-xs text-white/30">på {report.platform}</span>
          </div>
          <p className="text-xs text-white/50 italic">"{report.original_message}"</p>
        </div>
      )}
    </div>
  );
}

function SocialResponseCard({ response }: { response: any }) {
  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4 text-yellow-400" />
        <span className="text-sm font-medium text-yellow-400">Svar sendt</span>
        <span className="text-xs text-white/40 ml-auto">
          {new Date(response.created_at).toLocaleString('nb-NO')}
        </span>
      </div>
      {response.original_message && (
        <div className="mb-2">
          <p className="text-xs text-white/40">Original:</p>
          <p className="text-sm text-white/70 italic">"{response.original_message}"</p>
        </div>
      )}
      <div className="mt-2 pt-2 border-t border-yellow-500/20">
        <p className="text-xs text-yellow/40">Svar:</p>
        <p className="text-sm text-white">{response.message}</p>
      </div>
    </div>
  );
}

export default function Agents() {
  const { data: reports, loading, refresh } = useAgentReports();
  const { data: socialResponses } = useSocialResponses();

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-400" />
            AI Agenter
          </h1>
          <p className="text-sm text-white/50">Overvåking og automatisering</p>
        </div>
        <button
          onClick={() => refresh()}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(AGENT_CONFIG).map(([key, config]) => {
          const report = latestByAgent[key];
          const Icon = config.icon;
          return (
            <div
              key={key}
              className={`${config.bg} border ${config.border} rounded-xl p-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${config.color}`} />
                <span className={`text-sm font-medium ${config.color}`}>{key}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-white/40">
                <Clock className="w-3 h-3" />
                {report
                  ? new Date(report.created_at).toLocaleString('nb-NO', { hour: '2-digit', minute: '2-digit' })
                  : 'Ingen data'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Reports by Agent */}
      {Object.entries(AGENT_CONFIG).map(([key, config]) => {
        const agentReports = reportsByAgent[key] ?? [];
        if (agentReports.length === 0) return null;
        
        return (
          <div key={key}>
            <h2 className={`text-lg font-semibold ${config.color} mb-3 flex items-center gap-2`}>
              <config.icon className="w-5 h-5" />
              {config.name}
              <span className="text-xs text-white/30 font-normal">
                ({agentReports.length} rapporter)
              </span>
            </h2>
            <div className="grid gap-4">
              {agentReports.slice(0, 5).map((report) => (
                <AgentCard key={report.id} report={report} config={config} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Social Responses */}
      <div>
        <h2 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Sosiale medier-svar
          <span className="text-xs text-white/30 font-normal">
            ({(socialResponses ?? []).length} svar)
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

      {/* How to use */}
      <div className="bg-white/5 rounded-xl p-4">
        <h3 className="text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          Slik fungerer det
        </h3>
        <ul className="text-xs text-white/50 space-y-1">
          <li>• <strong className="text-white/70">COO</strong> – kjører daglig: analyserer operasjoner og effektivitet</li>
          <li>• <strong className="text-white/70">CFO</strong> – kjører daglig: økonomisk analyse og ROI</li>
          <li>• <strong className="text-white/70">Marketing</strong> – kjører hver 4. time: trender og strategi</li>
          <li>• <strong className="text-white/70">CISO</strong> – kjører hver time: sikkerhet og compliance</li>
          <li>• <strong className="text-white/70">Social Response</strong> – aktiveres via webhook på /social-response</li>
        </ul>
      </div>
    </div>
  );
}