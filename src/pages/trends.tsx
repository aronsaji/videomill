import { useState } from 'react';
import { RefreshCw, Play, X, TrendingUp, Youtube, Hash } from 'lucide-react';
import { TrendStatus } from '../lib/types';
import { useTrends, updateTrendStatus, createProduction } from '../lib/hooks/uselivedata';
import { useAuth } from '../contexts/authContext';
import { useLanguage } from '../contexts/languageContext';
import { supabase } from '../lib/supabaseClient';
import StatusBadge from '../components/statusbadge';

const platformIcon: Record<string, React.ReactNode> = {
  youtube: <Youtube size={13} />,
  tiktok: <Hash size={13} />,
  google: <TrendingUp size={13} />,
};

const platformColors: Record<string, string> = {
  youtube: 'text-red-400 bg-red-500/10',
  tiktok: 'text-pink-400 bg-pink-500/10',
  google: 'text-blue-400 bg-blue-500/10',
};

export default function Trends() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data: trends, loading } = useTrends();
  const [filter, setFilter] = useState<TrendStatus | 'all'>('all');
  const [scanning, setScanning] = useState(false);
  const [initiating, setInitiating] = useState<string | null>(null);

  const filtered = filter === 'all' ? trends : trends.filter(tr => tr.status === filter);

  const handleApprove = async (id: string) => {
    await updateTrendStatus(id, 'approved');
  };

  const handleReject = async (id: string) => {
    await updateTrendStatus(id, 'rejected');
  };

  const handleInitProduction = async (trend: typeof trends[0]) => {
    if (!user) return;
    setInitiating(trend.id);
    await updateTrendStatus(trend.id, 'in_production');
    const { data: prod } = await createProduction({
      title: trend.title,
      trend_id: trend.id,
      language: 'nb',
      audience: trend.tags.join(', '),
      user_id: user.id,
    });
    if (prod) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trigger-n8n`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'init_production',
            production_id: prod.id,
            title: trend.title,
            topic: trend.topic,
            language: 'nb',
            audience: trend.tags.join(', '),
            trend_id: trend.id,
            vinkling: trend.vinkling,
            tags: trend.tags,
          }),
        });
      }
    }
    setInitiating(null);
  };

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 2500);
  };

  const counts = {
    all: trends.length,
    pending: trends.filter(t => t.status === 'pending').length,
    approved: trends.filter(t => t.status === 'approved').length,
    in_production: trends.filter(t => t.status === 'in_production').length,
    rejected: trends.filter(t => t.status === 'rejected').length,
  };

  const filterOptions = [
    { key: 'all' as const, label: t.trends.all },
    { key: 'pending' as const, label: t.trends.pending },
    { key: 'approved' as const, label: t.trends.approved },
    { key: 'in_production' as const, label: t.trends.inProduction },
    { key: 'rejected' as const, label: t.trends.rejected },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-white/4 p-1 rounded-xl border border-white/6">
          {filterOptions.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === key ? 'bg-teal-500/20 text-teal-400 border border-teal-500/25' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {label}
              <span className="ml-1.5 text-white/25">{counts[key]}</span>
            </button>
          ))}
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500/15 border border-teal-500/25 text-teal-400 text-sm font-medium rounded-xl hover:bg-teal-500/25 disabled:opacity-60 transition-all"
        >
          <RefreshCw size={14} className={scanning ? 'animate-spin' : ''} />
          {scanning ? t.trends.scanning : t.trends.scanNow}
        </button>
      </div>

      {scanning && (
        <div className="bg-teal-500/8 border border-teal-500/20 rounded-xl p-4 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <p className="text-sm text-teal-300">{t.trends.scanningMsg}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32 text-white/30 text-sm">{t.common.loading}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <TrendingUp size={32} className="text-white/15 mx-auto mb-3" />
          <p className="text-white/30 text-sm">{t.trends.noTrends}</p>
          <p className="text-white/20 text-xs mt-1">{t.trends.addedByN8n}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((trend) => (
            <div key={trend.id} className="bg-[#111118] border border-white/6 rounded-xl p-5 hover:border-white/10 transition-all group">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border border-teal-500/20">
                  <span className="text-lg font-bold text-teal-400 leading-none">{trend.score}</span>
                  <span className="text-xs text-teal-400/60 leading-none mt-0.5">{t.trends.score}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-white leading-snug mb-1">{trend.title}</h3>
                      <p className="text-xs text-white/45 leading-relaxed mb-2">{trend.vinkling}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${platformColors[trend.platform] ?? 'text-white/40 bg-white/5'}`}>
                          {platformIcon[trend.platform]}
                          {trend.platform}
                        </span>
                        {(trend.tags ?? []).slice(0, 2).map((tag: string) => (
                          <span key={tag} className="text-xs bg-white/6 text-white/45 px-2 py-0.5 rounded-full">#{tag}</span>
                        ))}
                        <StatusBadge status={trend.status} />
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {trend.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleReject(trend.id)}
                            className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                          >
                            <X size={14} />
                          </button>
                          <button
                            onClick={() => handleApprove(trend.id)}
                            className="px-3 py-1.5 bg-white/8 border border-white/12 text-white/70 text-xs font-medium rounded-lg hover:bg-white/12 transition-colors"
                          >
                            {t.trends.approve}
                          </button>
                        </>
                      )}
                      {(trend.status === 'pending' || trend.status === 'approved') && (
                        <button
                          onClick={() => handleInitProduction(trend)}
                          disabled={initiating === trend.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 text-white text-xs font-semibold rounded-lg hover:bg-teal-400 disabled:opacity-60 transition-colors shadow-md shadow-teal-500/20"
                        >
                          {initiating === trend.id ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            <Play size={12} fill="white" />
                          )}
                          {t.trends.initProduction}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 ml-16 h-1 bg-white/4 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full"
                  style={{ width: `${trend.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
