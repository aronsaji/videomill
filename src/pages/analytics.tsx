import { useMemo } from 'react';
import { TrendingUp, Eye, ThumbsUp, Film, ArrowUpRight, RefreshCw, Lightbulb, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { useVideos } from '../lib/hooks/uselivedata';
import { useLanguage } from '../contexts/languageContext';
import { StatsGrid } from '../components/StatsCard';
import { PageHeader } from '../components/PageHeader';

function BarChart({ data, color }: {
  data: { label: string; value: number }[];
  color: string;
}) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 sm:gap-2 h-28">
      {data.map(d => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
          <span className="text-[10px] text-white/30">
            {d.value >= 1000 ? `${(d.value / 1000).toFixed(0)}k` : d.value > 0 ? d.value : ''}
          </span>
          <div className="w-full flex flex-col justify-end" style={{ height: '72px' }}>
            <div
              className={`w-full rounded-t-md transition-all duration-500 ${d.value > 0 ? color : 'bg-white/5'}`}
              style={{ height: `${d.value > 0 ? Math.max((d.value / max) * 72, 4) : 4}px` }}
            />
          </div>
          <span className="text-[10px] text-white/20 capitalize">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const { data: videos, loading, refresh } = useVideos();
  const { t } = useLanguage();

  // ── Live stats fra videos-tabellen ──
  const totalViews     = useMemo(() => videos.reduce((s, v) => s + (v.views ?? 0), 0), [videos]);
  const completedCount = useMemo(() => videos.filter(v => v.status === 'complete').length, [videos]);
  const totalVideos    = videos.length;
  const avgViews       = completedCount > 0 ? Math.round(totalViews / completedCount) : 0;

  // Engasjement basert på views vs produserte videoer
  const engagementRate = totalViews > 0 && completedCount > 0
    ? ((totalViews / completedCount) / 1000 * 10).toFixed(1)
    : '0';

  // ── Chart: videoer publisert per dag siste 7 dager ──
  const last7days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayVideos = videos.filter(v => v.created_at?.startsWith(key));
      days.push({
        label: d.toLocaleDateString('nb-NO', { weekday: 'short' }),
        value: dayVideos.length,
        views: dayVideos.reduce((s, v) => s + (v.views ?? 0), 0),
        complete: dayVideos.filter(v => v.status === 'complete').length,
      });
    }
    return days;
  }, [videos]);

  // ── Video-ytelse rangering ──
  const videoPerformance = useMemo(() =>
    videos
      .map(v => ({
        ...v,
        thumbnail: (v.metadata as Record<string, string> | null)?.thumbnail ?? '',
        engagement: (v.views ?? 0) > 0 ? (((v.views ?? 0) / 1000) * 5).toFixed(1) : '0',
      }))
      .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
      .slice(0, 6),
    [videos]
  );
  const maxVideoViews = Math.max(...videoPerformance.map(v => v.views ?? 0), 1);

  // ── Platform-fordeling ──
  const platformStats = useMemo(() => {
    const counts: Record<string, number> = {};
    videos.forEach(v => {
      const p = v.platform ?? 'ukjent';
      counts[p] = (counts[p] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [videos]);

  // ── Dynamiske AI-innsikter basert på ekte data ──
  const insights = useMemo(() => {
    const list: { text: string; action: string; type: 'positive' | 'warning' | 'info' }[] = [];

    if (totalVideos === 0) {
      list.push({ text: 'Ingen videoer produsert ennå.', action: 'Bestill din første AI-video', type: 'info' });
      return list;
    }

    // Mest aktive plattform
    if (platformStats.length > 0) {
      const top = platformStats[0];
      list.push({
        text: `${top[0]} er din mest brukte plattform med ${top[1]} video${top[1] > 1 ? 'er' : ''}.`,
        action: `Fortsett å publisere på ${top[0]} for best rekkevidde`,
        type: 'positive',
      });
    }

    // Fullføringsprosent
    const failedCount = videos.filter(v => v.status === 'failed').length;
    if (failedCount > 0) {
      list.push({
        text: `${failedCount} video${failedCount > 1 ? 'er' : ''} feilet under produksjon (${Math.round((failedCount / totalVideos) * 100)}% feilrate).`,
        action: 'Sjekk n8n pipeline-logger og retry mislykkede jobber',
        type: 'warning',
      });
    }

    // Produksjonsaktivitet
    const activeCount = videos.filter(v => ['pending','queued','scripting','recording','editing'].includes(v.status)).length;
    if (activeCount > 0) {
      list.push({
        text: `${activeCount} video${activeCount > 1 ? 'er' : ''} er under produksjon akkurat nå.`,
        action: 'Følg med i Pipeline-siden for live status',
        type: 'info',
      });
    }

    // Gjennomsnittlig produksjonsvolum
    const videosThisWeek = last7days.reduce((s, d) => s + d.value, 0);
    if (videosThisWeek > 0) {
      list.push({
        text: `${videosThisWeek} video${videosThisWeek > 1 ? 'er' : ''} bestilt siste 7 dager — gjennomsnitt ${(videosThisWeek / 7).toFixed(1)} per dag.`,
        action: videosThisWeek >= 5 ? 'God produksjonstakt! Oppretthold tempoet' : 'Øk produksjonstakten for raskere vekst',
        type: videosThisWeek >= 5 ? 'positive' : 'warning',
      });
    }

    // Ferdigstillingsgrad
    if (completedCount > 0 && totalVideos > 0) {
      const completionRate = Math.round((completedCount / totalVideos) * 100);
      list.push({
        text: `${completionRate}% av alle bestilte videoer er fullført (${completedCount}/${totalVideos}).`,
        action: completionRate >= 70 ? 'Høy fullføringsprosent — pipeline kjører stabilt' : 'Sjekk pipeline-feil for å øke fullføringsprosenten',
        type: completionRate >= 70 ? 'positive' : 'warning',
      });
    }

    // Visninger
    if (totalViews > 0) {
      list.push({
        text: `Totalt ${totalViews.toLocaleString('nb-NO')} visninger fordelt på ${completedCount} video${completedCount !== 1 ? 'er' : ''} (snitt ${avgViews.toLocaleString('nb-NO')} per video).`,
        action: 'Koble til YouTube/TikTok for automatisk synkronisering av visninger',
        type: 'info',
      });
    }

    return list.slice(0, 5);
  }, [videos, platformStats, last7days, totalVideos, completedCount, totalViews, avgViews]);

  const stats = [
    { label: 'Totale visninger',   value: totalViews >= 1000 ? `${(totalViews/1000).toFixed(1)}k` : totalViews.toString(), icon: <Eye size={16} />,        sub: `snitt ${avgViews} per video`,          color: 'teal'   },
    { label: 'Ferdige videoer',    value: completedCount.toString(),                                                         icon: <Film size={16} />,        sub: `${totalVideos} totalt produsert`,       color: 'blue'   },
    { label: 'Produsert siste 7d', value: last7days.reduce((s,d) => s+d.value, 0).toString(),                                icon: <TrendingUp size={16} />,  sub: 'nye bestillinger',                     color: 'teal'   },
    { label: 'Eng.rate (estimat)', value: `${engagementRate}%`,                                                              icon: <ThumbsUp size={16} />,    sub: 'basert på visninger',                  color: 'cyan'   },
  ];

return (
    <div className="space-y-6">
      <StatsGrid
        stats={[
          { label: t.analytics?.title === 'Analyse' ? 'Totale visninger' : 'Total views', value: totalViews >= 1000 ? `${(totalViews/1000).toFixed(1)}k` : totalViews, icon: Eye, color: 'teal' },
          { label: t.distribution?.completedVideos || 'Completed', value: completedCount, icon: Film, color: 'blue' },
          { label: t.analytics?.last7Days || 'Last 7 days', value: last7days.reduce((s,d) => s+d.value, 0), icon: TrendingUp, color: 'purple' },
          { label: t.analytics?.completionRate || 'Completion', value: `${engagementRate}%`, icon: ThumbsUp, color: 'orange' },
        ]}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#111118] border border-white/6 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              {stat.icon}
              <p className="text-xs text-white/50 font-medium">{stat.label}</p>
            </div>
            {loading
              ? <div className="h-7 w-14 bg-white/5 rounded animate-pulse" />
              : <p className="text-2xl font-bold text-white">{stat.value}</p>
            }
            <p className="text-xs text-white/30 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-[#111118] border border-white/6 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">Bestillinger per dag</h3>
            <button onClick={() => refresh()} className="p-1 hover:bg-white/8 rounded text-white/30 hover:text-white/60 transition-colors">
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          <p className="text-xs text-white/35 mb-4">Siste 7 dager</p>
          <BarChart data={last7days} color="bg-gradient-to-t from-teal-500/70 to-teal-400/90" />
        </div>

        <div className="bg-[#111118] border border-white/6 rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Visninger per dag</h3>
          <p className="text-xs text-white/35 mb-4">Siste 7 dager</p>
          <BarChart
            data={last7days.map(d => ({ label: d.label, value: d.views }))}
            color="bg-gradient-to-t from-blue-500/70 to-blue-400/90"
          />
        </div>

        <div className="bg-[#111118] border border-white/6 rounded-xl p-4 sm:p-5 sm:col-span-2 lg:col-span-1">
          <h3 className="text-sm font-semibold text-white mb-1">Plattformfordeling</h3>
          <p className="text-xs text-white/35 mb-4">Antall videoer per plattform</p>
          {platformStats.length === 0 ? (
            <div className="flex items-center justify-center h-28 text-white/20 text-xs">Ingen data ennå</div>
          ) : (
            <div className="space-y-2.5 mt-2">
              {platformStats.map(([platform, count]) => (
                <div key={platform} className="flex items-center gap-3">
                  <span className="text-xs text-white/50 capitalize w-20 flex-shrink-0 truncate">{platform}</span>
                  <div className="flex-1 h-2 bg-white/6 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400"
                      style={{ width: `${(count / (platformStats[0][1])) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-white/60 w-6 text-right flex-shrink-0">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Video-ytelse rangering ── */}
      <div className="bg-[#111118] border border-white/6 rounded-xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-white">Video-ytelse rangering</h2>
            <p className="text-xs text-white/35 mt-0.5">Sortering etter totale visninger</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-10 bg-white/3 rounded-lg animate-pulse" />)}
          </div>
        ) : videoPerformance.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-2">
            <Film size={24} className="text-white/15" />
            <p className="text-xs text-white/25">Ingen videoer ennå</p>
          </div>
        ) : (
          <div className="space-y-4">
            {videoPerformance.map((video, i) => (
              <div key={video.id} className="flex items-center gap-3 sm:gap-4">
                <span className="text-sm font-bold text-white/25 w-5 text-right flex-shrink-0">{i + 1}</span>
                {video.thumbnail
                  ? <img src={video.thumbnail} alt="" className="w-12 h-8 rounded-md object-cover flex-shrink-0" />
                  : <div className="w-12 h-8 rounded-md bg-white/6 flex items-center justify-center flex-shrink-0"><Film size={10} className="text-white/20" /></div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white/80 truncate mb-1.5">
                    {video.title ?? video.topic ?? '—'}
                  </p>
                  <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-700"
                      style={{ width: `${((video.views ?? 0) / maxVideoViews) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-bold text-white">
                    {(video.views ?? 0) >= 1000 ? `${((video.views ?? 0)/1000).toFixed(1)}k` : (video.views ?? 0)}
                  </p>
                  <p className="text-[10px] text-white/30 capitalize">{video.platform ?? '—'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Læringsloop — dynamiske innsikter ── */}
      <div className="bg-[#111118] border border-white/6 rounded-xl p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-teal-500/15 flex items-center justify-center flex-shrink-0">
            <RefreshCw size={16} className="text-teal-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Læringsloop</h2>
            <p className="text-xs text-white/35">AI-innsikter basert på dine faktiske videodata</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-[10px] text-teal-400/60">Live</span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-white/3 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((item, i) => (
              <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${
                item.type === 'positive' ? 'bg-teal-500/5 border-teal-500/15' :
                item.type === 'warning'  ? 'bg-amber-500/5 border-amber-500/15' :
                                           'bg-blue-500/5 border-blue-500/15'
              }`}>
                <div className="flex-shrink-0 mt-0.5">
                  {item.type === 'positive' ? <CheckCircle2 size={14} className="text-teal-400" /> :
                   item.type === 'warning'  ? <AlertTriangle size={14} className="text-amber-400" /> :
                   <Info size={14} className="text-blue-400" />}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white/70 leading-relaxed">{item.text}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <ArrowUpRight size={11} className="text-teal-400 flex-shrink-0" />
                    <p className="text-xs font-medium text-teal-400">{item.action}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Koble sosiale medier for mer data */}
            <div className="flex items-start gap-3 p-4 rounded-xl border bg-white/2 border-white/6">
              <Lightbulb size={14} className="text-white/30 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-white/40 leading-relaxed">
                  Koble YouTube og TikTok for å få reelle visnings-, likes- og kommentardata automatisk synkronisert.
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <ArrowUpRight size={11} className="text-white/30" />
                  <p className="text-xs text-white/30">Gå til Innstillinger → YouTube OAuth</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
