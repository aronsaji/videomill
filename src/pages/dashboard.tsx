import { TrendingUp, Film, Eye, ThumbsUp, Zap, ArrowUpRight, Clock, CheckCircle2, AlertCircle, Play } from 'lucide-react';
import { Page } from '../lib/types';
import { mockAnalytics } from '../lib/mockdata';
import { useTrends, useProductions, useDistributions, useVideos } from '../lib/hooks/uselivedata';
import { useLanguage } from '../contexts/languageContext';
import StatusBadge from '../components/statusbadge';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { t } = useLanguage();
  const { data: trends } = useTrends();
  const { data: productions } = useProductions();
  const { data: distributions } = useDistributions();
  const { data: videos } = useVideos();

  const totalViews = distributions.reduce((s, d) => s + d.views, 0);
  const totalLikes = distributions.reduce((s, d) => s + d.likes, 0);
  const pendingTrends = trends.filter(tr => tr.status === 'pending').length;
  const activeProductions = productions.filter(p => ['queued','scripting','recording','editing'].includes(p.status)).length;

  const stats = [
    { label: t.dashboard.totalViews, value: totalViews.toLocaleString('nb-NO'), icon: <Eye size={18} />, color: 'teal', change: '+34%' },
    { label: t.dashboard.totalLikes, value: totalLikes.toLocaleString('nb-NO'), icon: <ThumbsUp size={18} />, color: 'blue', change: '+18%' },
    { label: t.dashboard.activeProductions, value: activeProductions.toString(), icon: <Film size={18} />, color: 'orange', change: `${activeProductions} ${t.dashboard.ongoing}` },
    { label: t.dashboard.newTrends, value: pendingTrends.toString(), icon: <TrendingUp size={18} />, color: 'cyan', change: t.dashboard.awaitingApproval },
  ];

  const maxViews = Math.max(...mockAnalytics.map(d => d.views));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#111118] border border-white/6 rounded-xl p-5 hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/40 text-xs font-medium uppercase tracking-wider">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                stat.color === 'teal' ? 'bg-teal-500/15 text-teal-400' :
                stat.color === 'blue' ? 'bg-blue-500/15 text-blue-400' :
                stat.color === 'orange' ? 'bg-orange-500/15 text-orange-400' :
                'bg-cyan-500/15 text-cyan-400'
              }`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl font-bold text-white tracking-tight">{stat.value}</div>
            <div className="text-xs text-white/35 mt-1">{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-[#111118] border border-white/6 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-white">{t.dashboard.viewsLast7}</h2>
              <p className="text-xs text-white/35 mt-0.5">{t.dashboard.allPlatforms}</p>
            </div>
            <button onClick={() => onNavigate('analytics')} className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors">
              {t.dashboard.fullAnalysis} <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="flex items-end gap-3 h-36">
            {mockAnalytics.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-xs text-white/40 font-medium">{day.views >= 1000 ? `${(day.views/1000).toFixed(0)}k` : day.views}</div>
                <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-teal-500/60 to-teal-400/80 transition-all duration-500"
                    style={{ height: `${(day.views / maxViews) * 80}px`, minHeight: '4px' }}
                  />
                </div>
                <div className="text-xs text-white/25">{day.date.split('. ')[0]}.</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111118] border border-white/6 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">{t.dashboard.pipelineStatus}</h2>
            <button onClick={() => onNavigate('production')} className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
              Se alle
            </button>
          </div>
          <div className="space-y-3">
            {productions.slice(0, 4).map((prod) => (
              <div key={prod.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
                <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                  prod.status === 'complete' ? 'bg-teal-500/15' :
                  prod.status === 'failed' ? 'bg-red-500/15' :
                  'bg-blue-500/15'
                }`}>
                  {prod.status === 'complete' ? <CheckCircle2 size={14} className="text-teal-400" /> :
                   prod.status === 'failed' ? <AlertCircle size={14} className="text-red-400" /> :
                   <Clock size={14} className="text-blue-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white/80 truncate">{prod.title}</p>
                  <StatusBadge status={prod.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#111118] border border-white/6 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">{t.dashboard.latestTrends}</h2>
              <p className="text-xs text-white/35 mt-0.5">{t.dashboard.aiDetected}</p>
            </div>
            <button onClick={() => onNavigate('trends')} className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors">
              Alle trender <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {trends.filter(tr => tr.status === 'pending').slice(0, 3).map((trend) => (
              <div key={trend.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/3 hover:bg-white/5 transition-colors group">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border border-teal-500/15 flex items-center justify-center">
                  <span className="text-base font-bold text-teal-400">{trend.score}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/85 leading-tight mb-1">{trend.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/35 capitalize">{trend.platform}</span>
                    <span className="text-white/20">·</span>
                    {trend.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs bg-white/6 text-white/45 px-1.5 py-0.5 rounded">#{tag}</span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('trends')}
                  className="opacity-0 group-hover:opacity-100 flex-shrink-0 px-2.5 py-1.5 bg-teal-500/15 border border-teal-500/25 text-teal-400 text-xs rounded-lg hover:bg-teal-500/25 transition-all"
                >
                  Start
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111118] border border-white/6 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">{t.dashboard.bestVideos}</h2>
              <p className="text-xs text-white/35 mt-0.5">{t.dashboard.rankedByViews}</p>
            </div>
            <button onClick={() => onNavigate('library')} className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors">
              Bibliotek <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Morning Routine som endret livet mitt', views: 64050, platform: 'YouTube + TikTok', thumb: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=80' },
              { title: 'Slik lager du passive inntekter med AI', views: 19400, platform: 'YouTube', thumb: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=80' },
              { title: 'Slik tjener du penger på YouTube', views: 32532, platform: 'YouTube + TikTok', thumb: 'https://images.pexels.com/photos/3153198/pexels-photo-3153198.jpeg?auto=compress&cs=tinysrgb&w=80' },
            ].map((vid) => (
              <div key={vid.title} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/3 hover:bg-white/5 transition-colors group cursor-pointer">
                <div className="relative flex-shrink-0 w-14 h-9 rounded-md overflow-hidden bg-white/5">
                  <img src={vid.thumb} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={12} className="text-white fill-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white/80 truncate">{vid.title}</p>
                  <p className="text-xs text-white/35">{vid.platform}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-white">{(vid.views/1000).toFixed(1)}k</p>
                  <p className="text-xs text-white/30">visninger</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/5 border border-teal-500/15 rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
            <Zap size={20} className="text-teal-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{t.dashboard.systemRunning}</p>
            <p className="text-xs text-white/45 mt-0.5">Neste trend-scan om 2t 14min · Alle plattformer tilkoblet</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => onNavigate('trends')} className="px-4 py-2 bg-teal-500/15 border border-teal-500/25 text-teal-400 text-sm font-medium rounded-xl hover:bg-teal-500/25 transition-all">
            {t.dashboard.seeTrends}
          </button>
          <button onClick={() => onNavigate('production')} className="px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-xl hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/20">
            {t.dashboard.newProduction}
          </button>
        </div>
      </div>
    </div>
  );
}
