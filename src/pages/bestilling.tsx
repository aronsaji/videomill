import { useState, useEffect } from 'react';
import {
  TrendingUp, Youtube, Instagram, Monitor,
  CheckCircle2, AlertCircle, RefreshCw, Clock, Send,
  Mic, Smartphone, Square, Zap, ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/authContext';
import { useTrends, createOrder, useOrders } from '../lib/hooks/uselivedata';
import StatusBadge from '../components/statusbadge';
import type { Trend } from '../lib/types';

// ─────────────────────────────────────
// TikTok SVG (ikkje i Lucide)
// ─────────────────────────────────────
function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
    </svg>
  );
}

// ─────────────────────────────────────
// Platform-konfig
// ─────────────────────────────────────
const PLATFORM_CFG: Record<string, {
  label: string; color: string; bg: string; border: string;
  icon: React.ReactNode; badge: string; defaultFormat: string;
}> = {
  tiktok:    { label: 'TikTok / Shorts',  color: 'text-pink-400',   bg: 'bg-pink-500/10',   border: 'border-pink-500/40',   icon: <TikTokIcon size={16} />,  badge: 'TikTok',     defaultFormat: '9:16'  },
  youtube:   { label: 'YouTube',          color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/40',    icon: <Youtube size={16} />,     badge: 'YouTube',    defaultFormat: '16:9'  },
  instagram: { label: 'Instagram Reels',  color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/40', icon: <Instagram size={16} />,   badge: 'Instagram',  defaultFormat: '9:16'  },
  desktop:   { label: 'YouTube (16:9)',   color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/40',   icon: <Monitor size={16} />,     badge: 'Desktop',    defaultFormat: '16:9'  },
};
const PLATFORMS = Object.entries(PLATFORM_CFG).map(([id, v]) => ({ id, ...v }));

const FORMATS = [
  { id: '9:16', label: '9:16', sub: 'Shorts / Reels',    icon: <Smartphone size={14} /> },
  { id: '16:9', label: '16:9', sub: 'YouTube / Desktop', icon: <Monitor size={14} />    },
  { id: '1:1',  label: '1:1',  sub: 'Instagram Feed',    icon: <Square size={14} />     },
];

const LANGUAGES = [
  { id: 'nb', label: 'Norsk',   flag: '🇳🇴' },
  { id: 'en', label: 'English', flag: '🇬🇧' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
  { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

const VOICES: Record<string, { id: string; name: string; gender: string }[]> = {
  nb: [
    { id: 'nb-NO-Pernille', name: 'Pernille', gender: 'Kvinne' },
    { id: 'nb-NO-Finn',     name: 'Finn',     gender: 'Mann'   },
    { id: 'nb-NO-Iselin',   name: 'Iselin',   gender: 'Kvinne' },
  ],
  en: [
    { id: 'en-US-Aria',   name: 'Aria',   gender: 'Female' },
    { id: 'en-US-Andrew', name: 'Andrew', gender: 'Male'   },
    { id: 'en-GB-Sonia',  name: 'Sonia',  gender: 'Female' },
    { id: 'en-GB-Ryan',   name: 'Ryan',   gender: 'Male'   },
  ],
  es: [
    { id: 'es-ES-Elvira', name: 'Elvira', gender: 'Mujer'  },
    { id: 'es-ES-Alvaro', name: 'Álvaro', gender: 'Hombre' },
  ],
  de: [
    { id: 'de-DE-Katja',  name: 'Katja',  gender: 'Frau' },
    { id: 'de-DE-Conrad', name: 'Conrad', gender: 'Mann' },
  ],
};

// ─────────────────────────────────────
// Platform-badge for trend-kort
// ─────────────────────────────────────
function PlatformBadge({ platform, active }: { platform: string; active: boolean }) {
  const cfg = PLATFORM_CFG[platform];
  if (cfg) {
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
        active ? `${cfg.color} ${cfg.bg}` : 'text-white/40 bg-white/6'
      }`}>
        <span className={active ? cfg.color : 'text-white/40'}>
          {platform === 'tiktok'    && <TikTokIcon size={10} />}
          {platform === 'youtube'   && <Youtube size={10} />}
          {platform === 'instagram' && <Instagram size={10} />}
          {platform === 'desktop'   && <Monitor size={10} />}
        </span>
        {cfg.badge}
      </span>
    );
  }
  // Ukjent platform — vis som tekst-badge
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white/40 bg-white/6">
      <TrendingUp size={10} />
      {platform || 'Web'}
    </span>
  );
}

function mapTrendPlatform(p: string): string {
  if (p === 'youtube')   return 'youtube';
  if (p === 'tiktok')    return 'tiktok';
  if (p === 'instagram') return 'instagram';
  return 'desktop';
}

function buildPrompt(trend: Trend): string {
  const tags   = (trend.tags ?? []).slice(0, 5).filter(Boolean).join(', ');
  const growth = trend.growth_stat ? ` Veksttall: ${trend.growth_stat}.` : '';
  const tagStr = tags ? ` Fokusér på: ${tags}.` : '';
  return `Lag en engasjerende video om: "${trend.title ?? ''}".${growth}${tagStr} Hold innholdet kortfattet, fengende og optimalisert for ${trend.platform ?? 'sosiale medier'}.`;
}

// ─────────────────────────────────────
// Komponent
// ─────────────────────────────────────
interface FormState {
  topic:    string;
  prompt:   string;
  platform: string;
  language: string;
  voiceId:  string;
  format:   string;
}

const DEFAULT_FORM: FormState = {
  topic:    '',
  prompt:   '',
  platform: 'tiktok',
  language: 'nb',
  voiceId:  'nb-NO-Pernille',
  format:   '9:16',
};

export default function Bestilling() {
  const { user }                              = useAuth();
  const { data: trends, loading: trendsLoading } = useTrends();
  const { data: orders }                      = useOrders();

  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [form, setForm]                   = useState<FormState>(DEFAULT_FORM);
  const [submitting,   setSubmitting]     = useState(false);
  const [submitResult, setSubmitResult]   = useState<'success' | 'failed' | null>(null);

  // Oppdater stemme automatisk når språk endres
  useEffect(() => {
    const firstVoice = VOICES[form.language]?.[0];
    if (firstVoice && firstVoice.id !== form.voiceId) {
      setForm(f => ({ ...f, voiceId: firstVoice.id }));
    }
  }, [form.language]);

  // ── Velg trend → fyll inn ALLE felt atomisk ──
  const handleSelectTrend = (trend: Trend) => {
    const mappedPlatform = mapTrendPlatform(trend.platform ?? '');
    const platformCfg    = PLATFORM_CFG[mappedPlatform];
    setSelectedTrend(trend);
    setForm(f => ({
      ...f,
      topic:    trend.title    ?? '',
      prompt:   buildPrompt(trend),
      platform: mappedPlatform,
      format:   platformCfg?.defaultFormat ?? f.format,
    }));
  };

  const clearTrend = () => {
    setSelectedTrend(null);
    setForm(DEFAULT_FORM);
  };

  const handleSubmit = async () => {
    if (!user || !form.topic.trim()) return;
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const { data: order, error: insertError } = await createOrder({
        user_id:      user.id,
        topic:        form.topic.trim(),
        title:        form.topic.trim(),
        promp:        form.prompt.trim(),
        platform:     form.platform,
        language:     form.language,
        voice_id:     form.voiceId,
        aspect_ratio: form.format,
      });
      if (insertError || !order) throw insertError ?? new Error('Insert failed');

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const n8nResp = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trigger-n8n`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action:       'new_order',
              video_id:     order.id,
              title:        form.topic.trim(),
              topic:        form.topic.trim(),
              language:     form.language,
              platform:     form.platform,
              trend_id:     selectedTrend?.id  ?? null,
              trend_tags:   selectedTrend?.tags ?? [],
              promp:        form.prompt.trim(),
              voice_id:     form.voiceId,
              aspect_ratio: form.format,
            }),
          }
        );
        await supabase.from('videos')
          .update({ status: n8nResp.ok ? 'queued' : 'failed' })
          .eq('id', order.id);
      }

      setSubmitResult('success');
      setSelectedTrend(null);
      setForm(DEFAULT_FORM);
      setTimeout(() => setSubmitResult(null), 5000);
    } catch {
      setSubmitResult('failed');
      setTimeout(() => setSubmitResult(null), 5000);
    }
    setSubmitting(false);
  };

  const availableVoices = VOICES[form.language] ?? [];
  const pendingOrders   = orders.filter(o => o.status === 'pending' || o.status === 'queued');

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">

      {/* ── VENSTRE: SKJEMA ── */}
      <div className="space-y-5">

        {/* ── Trending Topics ── */}
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
            <p className="text-xs text-white/30 py-2">Ingen trender — n8n henter dem automatisk</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {trends.slice(0, 6).map(trend => {
                const isSelected = selectedTrend?.id === trend.id;
                return (
                  <button
                    key={trend.id}
                    onClick={() => isSelected ? clearTrend() : handleSelectTrend(trend)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-teal-500/50 bg-teal-500/10'
                        : 'border-white/6 bg-white/2 hover:border-white/15 hover:bg-white/4'
                    }`}
                  >
                    {/* Header: score + platform badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold ${isSelected ? 'text-teal-400' : 'text-white/40'}`}>
                        🔥 {trend.viral_score}
                      </span>
                      <PlatformBadge platform={trend.platform ?? ''} active={isSelected} />
                    </div>

                    {/* Tittel */}
                    <p className="text-xs font-semibold text-white leading-snug line-clamp-2 mb-1.5">
                      {trend.title}
                    </p>

                    {/* Growth stat — "hva den handler om" */}
                    {trend.growth_stat && (
                      <p className={`text-[10px] leading-snug mb-1.5 ${isSelected ? 'text-teal-400/80' : 'text-white/30'}`}>
                        📈 {trend.growth_stat}
                      </p>
                    )}

                    {/* Tags */}
                    {(trend.tags ?? []).length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {(trend.tags ?? []).slice(0, 2).map(tag => (
                          <span key={tag} className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                            isSelected ? 'bg-teal-500/15 text-teal-400/80' : 'bg-white/6 text-white/30'
                          }`}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Auto-fill indikator */}
                    {isSelected && (
                      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-teal-500/20">
                        <Zap size={9} className="text-teal-400" />
                        <span className="text-[9px] text-teal-400 font-semibold">Alle felt fylt inn automatisk</span>
                        <ChevronRight size={9} className="text-teal-400 ml-auto" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 01 Topic ── */}
        <div className="bg-[#111118] border border-white/6 rounded-xl p-5 space-y-2">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block">
            01 · Topic
          </label>
          <input
            type="text"
            value={form.topic}
            onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
            placeholder="Hva skal videoen handle om?"
            className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-teal-500/50 transition-all"
          />
        </div>

        {/* ── 02 Prompt ── */}
        <div className="bg-[#111118] border border-white/6 rounded-xl p-5 space-y-2">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block">
            02 · Fullstendig Prompt
          </label>
          <textarea
            value={form.prompt}
            onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
            placeholder="Beskriv vinkling, tone, stil og instruksjoner til AI-en..."
            rows={5}
            className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-teal-500/50 transition-all resize-none"
          />
        </div>

        {/* ── 03 Platform ── */}
        <div className="bg-[#111118] border border-white/6 rounded-xl p-5 space-y-3">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block">
            03 · Plattform
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PLATFORMS.map(p => (
              <button
                key={p.id}
                onClick={() => setForm(f => ({ ...f, platform: p.id, format: p.defaultFormat }))}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                  form.platform === p.id ? `${p.border} ${p.bg}` : 'border-white/6 bg-white/2 hover:border-white/15'
                }`}
              >
                <span className={form.platform === p.id ? p.color : 'text-white/30'}>{p.icon}</span>
                <span className={`text-xs font-semibold ${form.platform === p.id ? 'text-white' : 'text-white/50'}`}>
                  {p.label}
                </span>
                {form.platform === p.id && <CheckCircle2 size={13} className={`ml-auto ${p.color}`} />}
              </button>
            ))}
          </div>
        </div>

        {/* ── 04 Språk + 05 Stemme ── */}
        <div className="bg-[#111118] border border-white/6 rounded-xl p-5 space-y-5">
          <div className="space-y-3">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block">
              04 · Videospråk
            </label>
            <div className="flex gap-2 flex-wrap">
              {LANGUAGES.map(l => (
                <button
                  key={l.id}
                  onClick={() => setForm(f => ({ ...f, language: l.id }))}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    form.language === l.id
                      ? 'border-teal-500/40 bg-teal-500/10 text-teal-400'
                      : 'border-white/6 bg-white/2 text-white/45 hover:border-white/20'
                  }`}
                >
                  <span>{l.flag}</span>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
              <Mic size={12} />
              05 · Stemme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableVoices.map(v => (
                <button
                  key={v.id}
                  onClick={() => setForm(f => ({ ...f, voiceId: v.id }))}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    form.voiceId === v.id
                      ? 'border-teal-500/40 bg-teal-500/10'
                      : 'border-white/6 bg-white/2 hover:border-white/15'
                  }`}
                >
                  <div className="text-left">
                    <p className={`text-xs font-bold ${form.voiceId === v.id ? 'text-teal-400' : 'text-white/70'}`}>
                      {v.name}
                    </p>
                    <p className="text-[10px] text-white/30 mt-0.5">{v.gender}</p>
                  </div>
                  {form.voiceId === v.id && <CheckCircle2 size={13} className="text-teal-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 06 Videoformat ── */}
        <div className="bg-[#111118] border border-white/6 rounded-xl p-5 space-y-3">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block">
            06 · Videoformat
          </label>
          <div className="grid grid-cols-3 gap-3">
            {FORMATS.map(f => (
              <button
                key={f.id}
                onClick={() => setForm(s => ({ ...s, format: f.id }))}
                className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all ${
                  form.format === f.id
                    ? 'border-teal-500/40 bg-teal-500/10'
                    : 'border-white/6 bg-white/2 hover:border-white/15'
                }`}
              >
                <span className={form.format === f.id ? 'text-teal-400' : 'text-white/30'}>{f.icon}</span>
                <p className={`text-sm font-bold ${form.format === f.id ? 'text-teal-400' : 'text-white/60'}`}>{f.label}</p>
                <p className="text-[10px] text-white/25">{f.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Send ── */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !form.topic.trim()}
          className="w-full flex items-center justify-center gap-3 py-4 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-white font-bold text-base rounded-xl transition-all shadow-lg shadow-teal-500/25 active:scale-[0.98]"
        >
          {submitting
            ? <><RefreshCw size={18} className="animate-spin" /> Sender til n8n...</>
            : <><Send size={18} /> Send Bestilling</>
          }
        </button>

        {submitResult && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium ${
            submitResult === 'success'
              ? 'bg-teal-500/10 border-teal-500/20 text-teal-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {submitResult === 'success'
              ? <><CheckCircle2 size={16} /> Bestilling sendt! n8n prosesserer nå.</>
              : <><AlertCircle size={16} /> Noe gikk galt. Sjekk n8n i Innstillinger.</>
            }
          </div>
        )}
      </div>

      {/* ── HØYRE: LOGG ── */}
      <div className="space-y-4 lg:sticky lg:top-6">
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
              {orders.slice(0, 8).map(order => (
                <div key={order.id} className="px-5 py-3.5 hover:bg-white/2 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-xs font-semibold text-white leading-snug line-clamp-2 flex-1">
                      {order.topic ?? order.title}
                    </p>
                    <StatusBadge status={order.status} size="sm" />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-white/30 flex-wrap">
                    <PlatformBadge platform={order.platform ?? ''} active={false} />
                    <span>·</span>
                    <span>{LANGUAGES.find(l => l.id === order.language)?.label ?? order.language}</span>
                    <span>·</span>
                    <span>{order.aspect_ratio}</span>
                    <span className="ml-auto">
                      {new Date(order.created_at).toLocaleString('nb-NO', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
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
