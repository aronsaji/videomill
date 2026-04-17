import { useState, useEffect } from 'react';
import {
  Zap, TrendingUp, Youtube, Hash, Instagram, Monitor,
  CheckCircle2, AlertCircle, RefreshCw, Clock, Send,
  Mic, Smartphone, Square
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/authContext';
import { useTrends, createOrder, useOrders } from '../lib/hooks/uselivedata';
import StatusBadge from '../components/statusbadge';
import type { Trend } from '../lib/types';

// ─────────────────────────────────────
// Statisk konfigurasjon
// ─────────────────────────────────────
const PLATFORMS = [
  { id: 'tiktok',    label: 'TikTok / Shorts', icon: <Hash size={16} />,    color: 'text-pink-400',   border: 'border-pink-500/40',   bg: 'bg-pink-500/10'   },
  { id: 'youtube',   label: 'YouTube',          icon: <Youtube size={16} />, color: 'text-red-400',    border: 'border-red-500/40',    bg: 'bg-red-500/10'    },
  { id: 'instagram', label: 'Instagram Reels',  icon: <Instagram size={16} />, color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/10' },
  { id: 'desktop',   label: 'YouTube (16:9)',   icon: <Monitor size={16} />, color: 'text-blue-400',   border: 'border-blue-500/40',   bg: 'bg-blue-500/10'   },
];

const FORMATS = [
  { id: '9:16',  label: '9:16',  sub: 'Shorts / Reels',  icon: <Smartphone size={14} /> },
  { id: '16:9',  label: '16:9',  sub: 'YouTube / Desktop', icon: <Monitor size={14} /> },
  { id: '1:1',   label: '1:1',   sub: 'Instagram Feed',  icon: <Square size={14} /> },
];

const LANGUAGES = [
  { id: 'nb', label: 'Norsk' },
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Español' },
  { id: 'de', label: 'Deutsch' },
];

const VOICES: Record<string, { id: string; name: string; gender: string }[]> = {
  nb: [
    { id: 'nb-NO-Pernille', name: 'Pernille', gender: 'Kvinne' },
    { id: 'nb-NO-Finn',     name: 'Finn',     gender: 'Mann'   },
    { id: 'nb-NO-Iselin',   name: 'Iselin',   gender: 'Kvinne' },
  ],
  en: [
    { id: 'en-US-Aria',    name: 'Aria',    gender: 'Female' },
    { id: 'en-US-Andrew',  name: 'Andrew',  gender: 'Male'   },
    { id: 'en-GB-Sonia',   name: 'Sonia',   gender: 'Female' },
    { id: 'en-GB-Ryan',    name: 'Ryan',    gender: 'Male'   },
  ],
  es: [
    { id: 'es-ES-Elvira',  name: 'Elvira',  gender: 'Mujer'  },
    { id: 'es-ES-Alvaro',  name: 'Álvaro',  gender: 'Hombre' },
  ],
  de: [
    { id: 'de-DE-Katja',   name: 'Katja',   gender: 'Frau'   },
    { id: 'de-DE-Conrad',  name: 'Conrad',  gender: 'Mann'   },
  ],
};

// ─────────────────────────────────────
// Komponent
// ─────────────────────────────────────
export default function Bestilling() {
  const { user } = useAuth();
  const { data: trends, loading: trendsLoading } = useTrends();
  const { data: orders } = useOrders();

  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [topic, setTopic]         = useState('');
  const [prompt, setPrompt]       = useState('');
  const [platform, setPlatform]   = useState('tiktok');
  const [language, setLanguage]   = useState('nb');
  const [voiceId, setVoiceId]     = useState('nb-NO-Pernille');
  const [format, setFormat]       = useState('9:16');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<'success' | 'failed' | null>(null);

  // Oppdater stemme når språk endres
  useEffect(() => {
    const firstVoice = VOICES[language]?.[0];
    if (firstVoice) setVoiceId(firstVoice.id);
  }, [language]);

  // Fyll inn fra valgt trend
  const handleSelectTrend = (trend: Trend) => {
    setSelectedTrend(trend);
    setTopic(trend.title);
    // trending_topics has no vinkling column — user writes prompt manually
  };

  const clearTrend = () => {
    setSelectedTrend(null);
    setTopic('');
    setPrompt('');
  };

  const handleSubmit = async () => {
    if (!user || !topic.trim()) return;
    setSubmitting(true);
    setSubmitResult(null);

    try {
      // 1. Lagre bestilling i Supabase (videos-tabellen)
      const { data: order, error: insertError } = await createOrder({
        user_id:      user.id,
        topic:        topic.trim(),
        title:        topic.trim(),
        promp:        prompt.trim(),   // DB column is "promp" (no t)
        platform,
        language,
        voice_id:     voiceId,
        aspect_ratio: format,          // DB column for video format
      });

      if (insertError || !order) throw insertError ?? new Error('Insert failed');

      // 2. Trigger n8n via Edge Function (same mønster som trends.tsx)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const n8nResp = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trigger-n8n`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action:        'new_order',
              video_id:      order.id,
              title:         topic.trim(),
              topic:         topic.trim(),
              language,
              platform,
              trend_id:      selectedTrend?.id ?? null,
              trend_tags:    selectedTrend?.tags ?? [],
              promp:         prompt.trim(),
              voice_id:      voiceId,
              aspect_ratio:  format,
            }),
          }
        );
        // Oppdater status i videos-tabellen basert på n8n-svar
        await supabase
          .from('videos')
          .update({ status: n8nResp.ok ? 'queued' : 'failed' })
          .eq('id', order.id);
      }

      setSubmitResult('success');
      // Reset skjema
      setSelectedTrend(null);
      setTopic('');
      setPrompt('');
      setTimeout(() => setSubmitResult(null), 5000);
    } catch {
      setSubmitResult('failed');
      setTimeout(() => setSubmitResult(null), 5000);
    }

    setSubmitting(false);
  };

  const availableVoices = VOICES[language] ?? [];
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'queued');
  const recentOrders  = orders.slice(0, 8);

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">

      {/* ── VENSTRE: SKJEMA ── */}
      <div className="space-y-5">

        {/* Trending Topics */}
        <div className="bg-[#111118] border border-white/6 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-teal-400" />
            <h2 className="text-sm font-semibold text-white">Trending Topics</h2>
            {trendsLoading && <RefreshCw size={12} className="text-white/30 animate-spin ml-auto" />}
            {selectedTrend && (
              <button onClick={clearTrend} className="ml-auto text-xs text-white/35 hover:text-white/60 transition-colors">
                Fjern valg
              </button>
            )}
          </div>

          {trends.length === 0 && !trendsLoading ? (
            <p className="text-xs text-white/30 py-2">Ingen trender tilgjengelig — n8n henter dem automatisk</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {trends.slice(0, 6).map(trend => (
                <button
                  key={trend.id}
                  onClick={() => selectedTrend?.id === trend.id ? clearTrend() : handleSelectTrend(trend)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    selectedTrend?.id === trend.id
                      ? 'border-teal-500/50 bg-teal-500/10'
                      : 'border-white/6 bg-white/2 hover:border-white/15 hover:bg-white/4'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold uppercase ${selectedTrend?.id === trend.id ? 'text-teal-400' : 'text-white/35'}`}>
                      🔥 {trend.viral_score}
                    </span>
                    <span className="text-[10px] text-white/25">{trend.platform}</span>
                  </div>
                  <p className="text-xs font-semibold text-white leading-snug line-clamp-2">{trend.title}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Topic */}
        <div className="bg-[#111118] border border-white/6 rounded-xl p-5 space-y-2">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block">
            01 · Topic
          </label>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Hva skal videoen handle om?"
            className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-teal-500/50 transition-all"
          />
        </div>

        {/* Prompt */}
        <div className="bg-[#111118] border border-white/6 rounded-xl p-5 space-y-2">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block">
            02 · Fullstendig Prompt
          </label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Beskriv vinkling, tone, stil, spesifikke instruksjoner til AI-en..."
            rows={5}
            className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-teal-500/50 transition-all resize-none"
          />
        </div>

        {/* Platform */}
        <div className="bg-[#111118] border border-white/6 rounded-xl p-5 space-y-3">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block">03 · Plattform</label>
          <div className="grid grid-cols-2 gap-2">
            {PLATFORMS.map(p => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                  platform === p.id
                    ? `${p.border} ${p.bg}`
                    : 'border-white/6 bg-white/2 hover:border-white/15'
                }`}
              >
                <span className={platform === p.id ? p.color : 'text-white/30'}>{p.icon}</span>
                <span className={`text-xs font-semibold ${platform === p.id ? 'text-white' : 'text-white/50'}`}>{p.label}</span>
                {platform === p.id && <CheckCircle2 size={13} className={`ml-auto ${p.color}`} />}
              </button>
            ))}
          </div>
        </div>

        {/* Language + Voice */}
        <div className="bg-[#111118] border border-white/6 rounded-xl p-5 space-y-5">
          {/* Language */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block">04 · Språk</label>
            <div className="flex gap-2 flex-wrap">
              {LANGUAGES.map(l => (
                <button
                  key={l.id}
                  onClick={() => setLanguage(l.id)}
                  className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    language === l.id
                      ? 'border-teal-500/40 bg-teal-500/10 text-teal-400'
                      : 'border-white/6 bg-white/2 text-white/45 hover:border-white/20'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
              <Mic size={12} />
              05 · Stemme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableVoices.map(v => (
                <button
                  key={v.id}
                  onClick={() => setVoiceId(v.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    voiceId === v.id
                      ? 'border-teal-500/40 bg-teal-500/10'
                      : 'border-white/6 bg-white/2 hover:border-white/15'
                  }`}
                >
                  <div className="text-left">
                    <p className={`text-xs font-bold ${voiceId === v.id ? 'text-teal-400' : 'text-white/70'}`}>{v.name}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">{v.gender}</p>
                  </div>
                  {voiceId === v.id && <CheckCircle2 size={13} className="text-teal-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Video Format */}
        <div className="bg-[#111118] border border-white/6 rounded-xl p-5 space-y-3">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block">06 · Videoformat</label>
          <div className="grid grid-cols-3 gap-3">
            {FORMATS.map(f => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all ${
                  format === f.id
                    ? 'border-teal-500/40 bg-teal-500/10'
                    : 'border-white/6 bg-white/2 hover:border-white/15'
                }`}
              >
                <span className={format === f.id ? 'text-teal-400' : 'text-white/30'}>{f.icon}</span>
                <p className={`text-sm font-bold ${format === f.id ? 'text-teal-400' : 'text-white/60'}`}>{f.label}</p>
                <p className="text-[10px] text-white/25">{f.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !topic.trim()}
          className="w-full flex items-center justify-center gap-3 py-4 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-white font-bold text-base rounded-xl transition-all shadow-lg shadow-teal-500/25 active:scale-[0.98]"
        >
          {submitting ? (
            <><RefreshCw size={18} className="animate-spin" /> Sender til n8n...</>
          ) : (
            <><Send size={18} /> Send Bestilling</>
          )}
        </button>

        {/* Feedback */}
        {submitResult && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium ${
            submitResult === 'success'
              ? 'bg-teal-500/10 border-teal-500/20 text-teal-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {submitResult === 'success'
              ? <><CheckCircle2 size={16} /> Bestilling sendt! n8n prosesserer nå produksjonen.</>
              : <><AlertCircle size={16} /> Noe gikk galt. Sjekk n8n-konfigurasjonen i Innstillinger.</>
            }
          </div>
        )}
      </div>

      {/* ── HØYRE: ORDRE-HISTORIKK ── */}
      <div className="space-y-4 lg:sticky lg:top-6">

        {/* Live-indikator */}
        {pendingOrders.length > 0 && (
          <div className="bg-teal-500/8 border border-teal-500/20 rounded-xl p-4 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse flex-shrink-0" />
            <p className="text-xs text-teal-300 font-medium">
              {pendingOrders.length} bestilling{pendingOrders.length > 1 ? 'er' : ''} under behandling
            </p>
          </div>
        )}

        <div className="bg-[#111118] border border-white/6 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Bestillingslogg</h3>
            <span className="text-xs text-white/30">{orders.length} totalt</span>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center">
              <Clock size={24} className="text-white/15 mx-auto mb-2" />
              <p className="text-xs text-white/25">Ingen bestillinger ennå</p>
            </div>
          ) : (
            <div className="divide-y divide-white/4">
              {recentOrders.map(order => (
                <div key={order.id} className="px-5 py-3.5 hover:bg-white/2 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-xs font-semibold text-white leading-snug line-clamp-2 flex-1">
                      {order.topic ?? order.title}
                    </p>
                    <StatusBadge status={order.status} size="sm" />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-white/30">
                    <span>{PLATFORMS.find(p => p.id === order.platform)?.label ?? order.platform}</span>
                    <span>·</span>
                    <span>{LANGUAGES.find(l => l.id === order.language)?.label ?? order.language}</span>
                    <span>·</span>
                    <span>{order.aspect_ratio}</span>
                    <span className="ml-auto">
                      {new Date(order.created_at).toLocaleString('nb-NO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
