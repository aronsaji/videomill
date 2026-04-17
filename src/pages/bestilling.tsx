import { useState, useEffect, useRef } from 'react';
import {
  TrendingUp, Youtube, Instagram, Monitor,
  CheckCircle2, AlertCircle, RefreshCw, Clock, Send,
  Mic, Smartphone, Square, Zap, ChevronRight, Users,
  Flame, Calendar,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/authContext';
import { useTrends, createOrder, useOrders } from '../lib/hooks/uselivedata';
import { consumePendingTrend } from '../lib/pendingTrend';
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
  tiktok:    { label: 'TikTok / Shorts',  color: 'text-pink-400',   bg: 'bg-pink-500/10',   border: 'border-pink-500/40',   icon: <TikTokIcon size={16} />,  badge: 'TikTok',     defaultFormat: '9:16' },
  youtube:   { label: 'YouTube',          color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/40',    icon: <Youtube size={16} />,     badge: 'YouTube',    defaultFormat: '16:9' },
  instagram: { label: 'Instagram Reels',  color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/40', icon: <Instagram size={16} />,   badge: 'Instagram',  defaultFormat: '9:16' },
  desktop:   { label: 'YouTube (16:9)',   color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/40',   icon: <Monitor size={16} />,     badge: 'Desktop',    defaultFormat: '16:9' },
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
// Hjelpefunksjoner
// ─────────────────────────────────────

/** Normalize any platform string to our PLATFORM_CFG key */
function normalizePlatform(raw: string | null | undefined): string {
  if (!raw) return 'desktop';
  const p = raw.toLowerCase().trim();
  if (p.includes('tiktok') || p.includes('tik_tok') || p.includes('shorts')) return 'tiktok';
  if (p.includes('youtube') || p.includes('yt'))  return 'youtube';
  if (p.includes('instagram') || p.includes('ig') || p.includes('reels')) return 'instagram';
  return 'desktop';
}

function buildPrompt(trend: Trend): string {
  const tags   = (trend.tags ?? []).slice(0, 5).filter(Boolean).join(', ');
  const growth = trend.growth_stat ? ` Veksttall: ${trend.growth_stat}.` : '';
  const tagStr = tags ? ` Fokusér på: ${tags}.` : '';
  const platform = trend.platform ?? 'sosiale medier';
  return `Lag en engasjerende video om: "${trend.title}".${growth}${tagStr} Hold innholdet kortfattet, fengende og optimalisert for ${platform}.`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return 'Nå nettopp';
  if (h < 24) return `${h}t siden`;
  const d = Math.floor(h / 24);
  return `${d}d siden`;
}

// ─────────────────────────────────────
// Platform-badge for trend-kort
// ─────────────────────────────────────
function PlatformBadge({ rawPlatform, active }: { rawPlatform: string | null | undefined; active: boolean }) {
  const key = normalizePlatform(rawPlatform);
  const cfg = PLATFORM_CFG[key];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
      active ? `${cfg.color} ${cfg.bg}` : 'text-white/40 bg-white/6'
    }`}>
      <span className={active ? cfg.color : 'text-white/40'}>
        {key === 'tiktok'    && <TikTokIcon size={10} />}
        {key === 'youtube'   && <Youtube size={10} />}
        {key === 'instagram' && <Instagram size={10} />}
        {key === 'desktop'   && <Monitor size={10} />}
      </span>
      {cfg.badge}
    </span>
  );
}

// ─────────────────────────────────────
// Komponent
// ─────────────────────────────────────
interface FormState {
  topic:           string;
  prompt:          string;
  platform:        string;
  language:        string;
  voiceId:         string;
  format:          string;
  targetAudience:  string;
}

const DEFAULT_FORM: FormState = {
  topic:           '',
  prompt:          '',
  platform:        'tiktok',
  language:        'nb',
  voiceId:         'nb-NO-Pernille',
  format:          '9:16',
  targetAudience:  '',
};

export default function Bestilling() {
  const { user }                                  = useAuth();
  const { data: trends, loading: trendsLoading }  = useTrends();
  const { data: orders }                          = useOrders();
  const formRef                                   = useRef<HTMLDivElement>(null);

  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [form, setForm]                   = useState<FormState>(DEFAULT_FORM);
  const [submitting,   setSubmitting]     = useState(false);
  const [submitResult, setSubmitResult]   = useState<{ ok: boolean; msg: string } | null>(null);

  // ── Consume any trend passed from Trends page ──
  useEffect(() => {
    const pending = consumePendingTrend();
    if (pending) handleSelectTrend(pending);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-update voice when language changes ──
  useEffect(() => {
    const firstVoice = VOICES[form.language]?.[0];
    if (firstVoice && firstVoice.id !== form.voiceId) {
      setForm(f => ({ ...f, voiceId: firstVoice.id }));
    }
  }, [form.language]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Velg trend → fyll inn ALLE felt atomisk ──
  const handleSelectTrend = (trend: Trend) => {
    const mapped     = normalizePlatform(trend.platform);
    const platformCfg = PLATFORM_CFG[mapped];
    setSelectedTrend(trend);
    setForm(f => ({
      ...f,
      topic:          trend.title ?? '',
      prompt:         buildPrompt(trend),
      platform:       mapped,
      format:         platformCfg?.defaultFormat ?? f.format,
      targetAudience: trend.target_audience ?? '',
    }));
    // Scroll to form so user sees filled fields
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
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
        user_id:         user.id,
        topic:           form.topic.trim(),
        title:           form.topic.trim(),
        promp:           form.prompt.trim(),
        platform:        form.platform,
        language:        form.language,
        voice_id:        form.voiceId,
        aspect_ratio:    form.format,
        target_audience: form.targetAudience.trim() || undefined,
      });
      if (insertError || !order) throw insertError ?? new Error('Insert failed');

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
              action:          'new_order',
              video_id:        order.id,
              title:           form.topic.trim(),
              topic:           form.topic.trim(),
              language:        form.language,
              platform:        form.platform,
              trend_id:        selectedTrend?.id  ?? null,
              trend_tags:      selectedTrend?.tags ?? [],
              promp:           form.prompt.trim(),
              voice_id:        form.voiceId,
              aspect_ratio:    form.format,
              target_audience: form.targetAudience.trim() || null,
            }),
          }
        );

        const n8nBody = await n8nResp.json().catch(() => ({}));
        await supabase.from('videos')
          .update({ status: n8nResp.ok ? 'queued' : 'pending' })
          .eq('id', order.id);

        if (!n8nResp.ok) {
          setSubmitResult({ ok: false, msg: n8nBody?.message ?? `n8n feilet (${n8nResp.status})` });
          setSubmitting(false);
          return;
        }
      }

      setSubmitResult({ ok: true, msg: 'Bestilling sendt! n8n prosesserer nå.' });
      setSelectedTrend(null);
      setForm(DEFAULT_FORM);
      setTimeout(() => setSubmitResult(null), 6000);
    } catch (err) {
      setSubmitResult({ ok: false, msg: (err instanceof Error ? err.message : 'Ukjent feil') });
      setTimeout(() => setSubmitResult(null), 6000);
    }
    setSubmitting(false);
  };

  const availableVoices = VOICES[form.language] ?? [];
  const pendingOrders   = orders.filter(o => ['pending','queued','scripting','recording','editing'].includes(o.status));

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">

      {/* ── VENSTRE: SKJEMA ── */}
      <div className="space-y-5">

        {/* ── Trending Topics ── */}
        <div className="bg-[#111118] border border-white/6 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-teal-400" />
            <h2 className="text-sm font-semibold text-white">Trending Topics</h2>
            {trendsLoading && <RefreshCw size={12} className="text-white/30 animate-spin ml-1" />}
            {!trendsLoading && (
              <span className="text-[10px] text-white/25 ml-1">{trends.length} live</span>
            )}
            {selectedTrend && (
              <button onClick={clearTrend} className="ml-auto text-xs text-white/35 hover:text-white/60 transition-colors">
                Fjern valg
              </button>
            )}
          </div>

          {trends.length === 0 && !trendsLoading ? (
            <div className="flex flex-col items-center py-8 gap-2">
              <TrendingUp size={24} className="text-white/15" />
              <p className="text-xs text-white/30">Ingen trender ennå</p>
              <p className="text-[11px] text-white/20">n8n henter dem automatisk hvert 6. time</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {trends.slice(0, 8).map(trend => {
                const isSelected    = selectedTrend?.id === trend.id;
                const normalPlatform = normalizePlatform(trend.platform);
                const pCfg          = PLATFORM_CFG[normalPlatform];

                return (
                  <button
                    key={trend.id}
                    onClick={() => isSelected ? clearTrend() : handleSelectTrend(trend)}
                    className={`text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-teal-500/50 bg-teal-500/10'
                        : 'border-white/6 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                    }`}
                  >
                    {/* Row 1: viral score + platform badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] font-bold ${isSelected ? 'text-teal-400' : 'text-orange-400/70'}`}>
                          🔥 {trend.viral_score ?? '—'}
                        </span>
                        {trend.heat_level && (
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${
                            trend.heat_level === 'fire'   ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' :
                            trend.heat_level === 'hot'    ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
                            trend.heat_level === 'rising' ? 'text-teal-400   bg-teal-500/10   border-teal-500/20'   :
                                                            'text-white/30   bg-white/5        border-white/10'
                          }`}>
                            {trend.heat_level}
                          </span>
                        )}
                      </div>
                      <PlatformBadge rawPlatform={trend.platform} active={isSelected} />
                    </div>

                    {/* Row 2: Title */}
                    <p className="text-xs font-semibold text-white leading-snug line-clamp-2 mb-1.5">
                      {trend.title}
                    </p>

                    {/* Row 3: What it's about (growth_stat / description) */}
                    {trend.growth_stat && (
                      <p className={`text-[10px] leading-snug mb-1.5 ${isSelected ? 'text-teal-400/80' : 'text-white/35'}`}>
                        📈 {trend.growth_stat}
                      </p>
                    )}

                    {/* Row 4: Target audience */}
                    {trend.target_audience && (
                      <div className={`flex items-center gap-1 text-[10px] mb-1.5 ${isSelected ? 'text-teal-300/70' : 'text-white/30'}`}>
                        <Users size={9} />
                        <span className="truncate">{trend.target_audience}</span>
                      </div>
                    )}

                    {/* Row 5: Tags */}
                    {(trend.tags ?? []).length > 0 && (
                      <div className="flex gap-1 flex-wrap mb-1.5">
                        {(trend.tags ?? []).slice(0, 3).map(tag => (
                          <span key={tag} className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                            isSelected ? 'bg-teal-500/15 text-teal-400/80' : 'bg-white/6 text-white/30'
                          }`}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Row 6: Updated at */}
                    <div className={`flex items-center justify-between text-[9px] ${isSelected ? 'text-teal-400/50' : 'text-white/20'}`}>
                      <span className="flex items-center gap-1">
                        <Calendar size={8} />
                        {timeAgo(trend.updated_at ?? trend.created_at ?? new Date().toISOString())}
                      </span>
                      {isSelected && (
                        <span className="flex items-center gap-0.5 text-teal-400 font-semibold">
                          <Zap size={8} />
                          Alle felt fylt
                          <ChevronRight size={8} />
                        </span>
                      )}
                    </div>

                    {/* Selected platform accent bar */}
                    {isSelected && (
                      <div className={`mt-2 h-0.5 rounded-full ${pCfg?.bg ?? 'bg-teal-500/30'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Form sections (scrolled to when trend selected) ── */}
        <div ref={formRef} className="space-y-5">

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

          {/* ── 03 Målgruppe ── */}
          <div className="bg-[#111118] border border-white/6 rounded-xl p-5 space-y-2">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2 block">
              <Users size={12} />
              03 · Målgruppe (seere)
            </label>
            <input
              type="text"
              value={form.targetAudience}
              onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value }))}
              placeholder="Hvem er videoen for? f.eks. «Tech-entusiaster 18–35», «Foreldre med barn»"
              className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-teal-500/50 transition-all"
            />
          </div>

          {/* ── 04 Platform ── */}
          <div className="bg-[#111118] border border-white/6 rounded-xl p-5 space-y-3">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block">
              04 · Plattform
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

          {/* ── 05 Språk + 06 Stemme ── */}
          <div className="bg-[#111118] border border-white/6 rounded-xl p-5 space-y-5">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block">
                05 · Videospråk
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
                06 · AI-stemme
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

          {/* ── 07 Videoformat ── */}
          <div className="bg-[#111118] border border-white/6 rounded-xl p-5 space-y-3">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block">
              07 · Videoformat
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
              : <><Send size={18} /> Start AI-Produksjon</>
            }
          </button>

          {submitResult && (
            <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm font-medium ${
              submitResult.ok
                ? 'bg-teal-500/10 border-teal-500/20 text-teal-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {submitResult.ok
                ? <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                : <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              }
              <span>{submitResult.msg}</span>
            </div>
          )}
        </div>
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
              {orders.slice(0, 10).map(order => (
                <div key={order.id} className="px-5 py-3.5 hover:bg-white/2 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-xs font-semibold text-white leading-snug line-clamp-2 flex-1">
                      {order.topic ?? order.title ?? '—'}
                    </p>
                    <StatusBadge status={order.status} size="sm" />
                  </div>
                  {/* Progress bar for active jobs */}
                  {['queued','scripting','recording','editing'].includes(order.status) && order.progress > 0 && (
                    <div className="h-1 bg-white/6 rounded-full overflow-hidden mb-1.5">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-700"
                        style={{ width: `${order.progress}%` }}
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[10px] text-white/30 flex-wrap">
                    <PlatformBadge rawPlatform={order.platform} active={false} />
                    <span>·</span>
                    <span>{LANGUAGES.find(l => l.id === order.language)?.flag ?? ''} {order.language?.toUpperCase()}</span>
                    <span>·</span>
                    <span>{order.aspect_ratio ?? '—'}</span>
                    {order.target_audience && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-0.5"><Users size={8} />{order.target_audience}</span>
                      </>
                    )}
                    <span className="ml-auto">
                      {new Date(order.created_at).toLocaleString('nb-NO', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {order.sub_status && (
                    <p className="text-[10px] text-white/25 mt-1 italic">{order.sub_status}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* n8n status hint */}
        <div className="bg-white/2 border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={12} className="text-orange-400" />
            <p className="text-xs font-semibold text-white/50">Pipeline-status</p>
          </div>
          <p className="text-[11px] text-white/30 leading-relaxed">
            Bestillinger sendes til n8n via Supabase Edge Function. Status oppdateres automatisk i sanntid (Realtime).
          </p>
        </div>
      </div>
    </div>
  );
}
