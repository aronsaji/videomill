import { TrendingUp, Eye, ThumbsUp, Share2, ArrowUpRight, RefreshCw } from 'lucide-react';
import { mockAnalytics, mockDistributions, mockVideos } from '../lib/mockdata';

const maxViews = Math.max(...mockAnalytics.map(d => d.views));
const maxLikes = Math.max(...mockAnalytics.map(d => d.likes));
const maxShares = Math.max(...mockAnalytics.map(d => d.shares));

function BarChart({ data, valueKey, color, max }: {
  data: { date: string; [key: string]: number | string }[];
  valueKey: string;
  color: string;
  max: number;
}) {
  return (
    <div className="flex items-end gap-2 h-28">
      {data.map((d) => {
        const val = d[valueKey] as number;
        return (
          <div key={d.date as string} className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-xs text-white/30">{val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}</span>
            <div className="w-full flex flex-col justify-end" style={{ height: '72px' }}>
              <div
                className={`w-full rounded-t-md transition-all duration-500 ${color}`}
                style={{ height: `${(val / max) * 72}px`, minHeight: '3px' }}
              />
            </div>
            <span className="text-xs text-white/20">{(d.date as string).split('. ')[0]}.</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Analytics() {
  const totalViews = mockDistributions.reduce((s, d) => s + d.views, 0);
  const totalLikes = mockDistributions.reduce((s, d) => s + d.likes, 0);

  const videoPerformance = mockVideos.map(video => {
    const dists = mockDistributions.filter(d => d.video_id === video.id);
    const views = dists.reduce((s, d) => s + d.views, 0);
    const likes = dists.reduce((s, d) => s + d.likes, 0);
    return { ...video, views, likes, engagement: views > 0 ? ((likes / views) * 100).toFixed(1) : '0' };
  }).sort((a, b) => b.views - a.views);

  const maxVideoViews = Math.max(...videoPerformance.map(v => v.views));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Totale visninger', value: totalViews.toLocaleString('nb-NO'), icon: <Eye size={16} />, sub: 'Alle plattformer', color: 'teal' },
          { label: 'Totale likes', value: totalLikes.toLocaleString('nb-NO'), icon: <ThumbsUp size={16} />, sub: `${((totalLikes/totalViews)*100).toFixed(1)}% engasjement`, color: 'blue' },
          { label: 'Veksttakt (7d)', value: '+34%', icon: <TrendingUp size={16} />, sub: 'vs forrige periode', color: 'teal' },
          { label: 'Gjennomsnitt deling', value: '2.1%', icon: <Share2 size={16} />, sub: 'Del-rate', color: 'cyan' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#111118] border border-white/6 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/35 uppercase tracking-wider">{stat.label}</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                stat.color === 'teal' ? 'bg-teal-500/15 text-teal-400' :
                stat.color === 'blue' ? 'bg-blue-500/15 text-blue-400' :
                'bg-cyan-500/15 text-cyan-400'
              }`}>{stat.icon}</div>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-white/30 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="bg-[#111118] border border-white/6 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Visninger</h3>
          <p className="text-xs text-white/35 mb-4">Siste 7 dager</p>
          <BarChart data={mockAnalytics} valueKey="views" color="bg-gradient-to-t from-teal-500/70 to-teal-400/90" max={maxViews} />
        </div>
        <div className="bg-[#111118] border border-white/6 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Likes</h3>
          <p className="text-xs text-white/35 mb-4">Siste 7 dager</p>
          <BarChart data={mockAnalytics} valueKey="likes" color="bg-gradient-to-t from-blue-500/70 to-blue-400/90" max={maxLikes} />
        </div>
        <div className="bg-[#111118] border border-white/6 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Delinger</h3>
          <p className="text-xs text-white/35 mb-4">Siste 7 dager</p>
          <BarChart data={mockAnalytics} valueKey="shares" color="bg-gradient-to-t from-cyan-500/70 to-cyan-400/90" max={maxShares} />
        </div>
      </div>

      <div className="bg-[#111118] border border-white/6 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-white">Video-ytelse rangering</h2>
            <p className="text-xs text-white/35 mt-0.5">Sortering etter totale visninger</p>
          </div>
        </div>
        <div className="space-y-4">
          {videoPerformance.map((video, i) => (
            <div key={video.id} className="flex items-center gap-4">
              <span className="text-sm font-bold text-white/25 w-5 text-right flex-shrink-0">{i + 1}</span>
              <img src={video.thumbnail_url} alt="" className="w-12 h-8 rounded-md object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/80 truncate mb-1">{video.title}</p>
                <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                    style={{ width: `${(video.views / maxVideoViews) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-bold text-white">{video.views >= 1000 ? `${(video.views/1000).toFixed(1)}k` : video.views}</p>
                <p className="text-xs text-white/30">{video.engagement}% eng.</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#111118] border border-white/6 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-teal-500/15 flex items-center justify-center">
            <RefreshCw size={16} className="text-teal-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Læringsloopen</h2>
            <p className="text-xs text-white/35">AI-innsikter basert på ytelsesdata</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { insight: '"Morning Hacks" tema gir 4x høyere engasjement enn "Tech News"', action: 'Prioriter Morning Hacks-innhold neste uke', type: 'positive' },
            { insight: 'TikTok gir 3x flere visninger enn YouTube for samme video', action: 'Optimaliser for TikTok-format (9:16)', type: 'positive' },
            { insight: 'Videoer over 6 minutter har 40% lavere fullforings-rate', action: 'Hold videoene under 5 minutter', type: 'warning' },
            { insight: 'AI-stemmen får negative kommentarer på 18% av videoene', action: 'Vurder å bytte til ElevenLabs-stemme', type: 'negative' },
          ].map((item, i) => (
            <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${
              item.type === 'positive' ? 'bg-teal-500/5 border-teal-500/15' :
              item.type === 'warning' ? 'bg-amber-500/5 border-amber-500/15' :
              'bg-red-500/5 border-red-500/15'
            }`}>
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                item.type === 'positive' ? 'bg-teal-400' :
                item.type === 'warning' ? 'bg-amber-400' :
                'bg-red-400'
              }`} />
              <div className="flex-1">
                <p className="text-xs text-white/70 leading-relaxed">{item.insight}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <ArrowUpRight size={11} className="text-teal-400" />
                  <p className="text-xs font-medium text-teal-400">{item.action}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
