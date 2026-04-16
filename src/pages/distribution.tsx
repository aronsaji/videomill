import { Share2, ExternalLink, Eye, ThumbsUp, Youtube, Hash, Instagram, Facebook, Twitter } from 'lucide-react';
import { useDistributions, useVideos } from '../lib/hooks/uselivedata';
import { useLanguage } from '../contexts/languageContext';
import StatusBadge from '../components/statusbadge';

const platformIcon: Record<string, React.ReactNode> = {
  YouTube:   <Youtube size={13} className="text-red-400" />,
  TikTok:    <Hash size={13} className="text-pink-400" />,
  Instagram: <Instagram size={13} className="text-purple-400" />,
  Facebook:  <Facebook size={13} className="text-blue-400" />,
  Twitter:   <Twitter size={13} className="text-sky-400" />,
};

export default function Distribution() {
  const { t } = useLanguage();
  const { data: distributions, loading: loadingDist } = useDistributions();
  const { data: videos, loading: loadingVid } = useVideos();

  const loading = loadingDist || loadingVid;

  const enriched = distributions.map(d => ({
    ...d,
    videoTitle: videos.find(v => v.id === d.video_id)?.title ?? '—',
  }));

  const totalViews = distributions.reduce((s, d) => s + d.views, 0);
  const totalLikes = distributions.reduce((s, d) => s + d.likes, 0);
  const liveCount  = distributions.filter(d => d.status === 'live').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Totale visninger', value: totalViews.toLocaleString('nb-NO'), icon: <Eye size={15} className="text-teal-400" /> },
          { label: 'Totale likes',     value: totalLikes.toLocaleString('nb-NO'), icon: <ThumbsUp size={15} className="text-blue-400" /> },
          { label: 'Live-publikasjoner', value: String(liveCount),               icon: <Share2 size={15} className="text-purple-400" /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-[#111118] border border-white/6 rounded-xl p-4 flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">{icon}</div>
            <div>
              <p className="text-xs text-white/35 mb-0.5">{label}</p>
              <p className="text-lg font-bold text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-32 text-white/30 text-sm">{t.common.loading}</div>
      ) : enriched.length === 0 ? (
        <div className="text-center py-20">
          <Share2 size={32} className="text-white/15 mx-auto mb-3" />
          <p className="text-white/30 text-sm">Ingen distribusjoner ennå</p>
        </div>
      ) : (
        <div className="bg-[#111118] border border-white/6 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider">Video</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider">Plattform</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider">Visninger</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider">Likes</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider">Publisert</th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((d) => (
                <tr key={d.id} className="border-b border-white/4 last:border-b-0 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-white/80 font-medium truncate max-w-[260px]">{d.videoTitle}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="flex items-center gap-1.5 text-white/55">
                      {platformIcon[d.platform] ?? <Share2 size={13} />}
                      {d.platform}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right text-white/55 font-mono text-xs">
                    {d.views.toLocaleString('nb-NO')}
                  </td>
                  <td className="px-4 py-3.5 text-right text-white/55 font-mono text-xs">
                    {d.likes.toLocaleString('nb-NO')}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {d.posted_at ? (
                      <span className="text-white/35 text-xs">
                        {new Date(d.posted_at).toLocaleDateString('nb-NO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    ) : (
                      <span className="text-white/20 text-xs">—</span>
                    )}
                    {d.external_url && d.external_url !== '#' && (
                      <a href={d.external_url} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex text-white/30 hover:text-teal-400 transition-colors">
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
