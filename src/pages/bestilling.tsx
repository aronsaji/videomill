import { useState, useEffect, useRef } from 'react';
import {
  TrendingUp, Youtube, Instagram, Monitor,
  CheckCircle2, AlertCircle, RefreshCw, Clock, Send,
  Mic, Smartphone, Square, Zap, ChevronRight, Users,
  Flame, Calendar, Sparkles, X,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/authContext';
import { useTrends, createOrder, useOrders } from '../lib/hooks/uselivedata';
import { consumePendingTrend } from '../lib/pendingTrend';
import { useLanguage } from '../contexts/languageContext';
import StatusBadge from '../components/statusbadge';
import type { Trend } from '../lib/types';

// ─────────────────────────────────────
// TikTok SVG
// ─────────────────────────────────────
function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
    </svg>
  );
}

// ─────────────────────────────────────
// Bilingual labels
// ─────────────────────────────────────
const LABELS = {
  nb: {
    trendingTopics:       'Trending Topics',
    noTrends:             'Ingen trender ennå',
    noTrendsHint:         'n8n henter dem automatisk hvert 6. time',
    clearTrend:           'Fjern valg',
    autoFilled:           'Auto-fylt',
    filledAll:            'Fylte alle felt',
    topicLabel:           '01 · Tema / Tittel',
    topicPlaceholder:     'Hva skal videoen handle om?',
    styleLabel:           '02 · Stil og tone',
    styleHint:            'Velg eller skriv selv',
    promptPlaceholderPre: 'Beskriv vinkling, tone og instruksjoner til AI-en...\n\nEksempel: «Lag en dramatisk video om',
    promptPlaceholderPost:'Start med et sterkt spørsmål, bruk fakta og avslutt med call-to-action.»',
    aiTip:                'AI bruker dette som instruksjon. Jo mer detaljert, jo bedre video.',
    audienceLabel:        '03 · Målgruppe',
    customAudiencePh:     'Eller skriv egendefinert målgruppe...',
    platformLabel:        '04 · Plattform',
    videoLangLabel:       '05 · Videospråk',
    voiceLabel:           '06 · AI-stemme',
    formatLabel:          '07 · Videoformat',
    submitBtn:            'Start AI-Produksjon',
    submitting:           'Sender til n8n...',
    orderLog:             'Bestillingslogg',
    noOrders:             'Ingen bestillinger ennå',
    pipeline:             'Pipeline',
    pipelineActive:       'Aktiv',
    activeOrders:         (n: number) => `${n} video${n > 1 ? 'er' : ''} produseres nå`,
    successMsg:           '🎬 Bestilling sendt! AI-produksjon starter nå.',
    tones: {
      engaging:      '⚡ Engasjerende',
      informative:   '📚 Informativ',
      humorous:      '😄 Humoristisk',
      dramatic:      '🎭 Dramatisk',
      inspirational: '✨ Inspirerende',
      viral:         '🔥 Viral',
    },
    audiences: {
      'Unge voksne 18–25':     '🎮 Unge (18–25)',
      'Voksne 25–45':          '👔 Voksne (25–45)',
      'Eldre 45+':             '🏡 Eldre (45+)',
      'Tech-interesserte':     '💻 Tech',
      'Foreldre med barn':     '👨‍👩‍👧 Foreldre',
      'Studenter':             '🎓 Studenter',
      'Profesjonelle':         '💼 Business',
      'Helse og fitness':      '💪 Helse',
      'Kreative og designere': '🎨 Kreative',
      'Gamere':                '🕹️ Gamere',
    } as Record<string, string>,
    statusMap: {
      pending:   'Venter...',
      queued:    'I kø',
      scripting: 'Skriver manus',
      recording: 'Innspilling',
      editing:   'Redigerer',
      complete:  'Ferdig',
      failed:    'Feilet',
    } as Record<string, string>,
    timeAgo: (m: number, h: number, d: number) =>
      m < 1 ? 'Nå nettopp' : m < 60 ? `${m}m siden` : h < 24 ? `${h}t siden` : `${d}d siden`,
  },
  en: {
    trendingTopics:       'Trending Topics',
    noTrends:             'No trends yet',
    noTrendsHint:         'n8n fetches them automatically every 6 hours',
    clearTrend:           'Clear selection',
    autoFilled:           'Auto-filled',
    filledAll:            'Filled all fields',
    topicLabel:           '01 · Topic / Title',
    topicPlaceholder:     'What should the video be about?',
    styleLabel:           '02 · Style & tone',
    styleHint:            'Choose or write yourself',
    promptPlaceholderPre: 'Describe angle, tone and instructions for the AI...\n\nExample: "Create a dramatic video about',
    promptPlaceholderPost:'Start with a strong question, use facts and end with a call to action."',
    aiTip:                'AI uses this as instruction. The more detailed, the better the video.',
    audienceLabel:        '03 · Target audience',
    customAudiencePh:     'Or write a custom target audience...',
    platformLabel:        '04 · Platform',
    videoLangLabel:       '05 · Video language',
    voiceLabel:           '06 · AI voice',
    formatLabel:          '07 · Video format',
    submitBtn:            'Start AI Production',
    submitting:           'Sending to n8n...',
    orderLog:             'Order Log',
    noOrders:             'No orders yet',
    pipeline:             'Pipeline',
    pipelineActive:       'Active',
    activeOrders:         (n: number) => `${n} video${n > 1 ? 's' : ''} being produced`,
    successMsg:           '🎬 Order sent! AI production starting now.',
    tones: {
      engaging:      '⚡ Engaging',
      informative:   '📚 Informative',
      humorous:      '😄 Humorous',
      dramatic:      '🎭 Dramatic',
      inspirational: '✨ Inspiring',
      viral:         '🔥 Viral',
    },
    audiences: {
      'Unge voksne 18–25':     '🎮 Youth (18–25)',
      'Voksne 25–45':          '👔 Adults (25–45)',
      'Eldre 45+':             '🏡 Seniors (45+)',
      'Tech-interesserte':     '💻 Tech',
      'Foreldre med barn':     '👨‍👩‍👧 Parents',
      'Studenter':             '🎓 Students',
      'Profesjonelle':         '💼 Business',
      'Helse og fitness':      '💪 Health',
      'Kreative og designere': '🎨 Creative',
      'Gamere':                '🕹️ Gamers',
    } as Record<string, string>,
    statusMap: {
      pending:   'Pending...',
      queued:    'In queue',
      scripting: 'Writing script',
      recording: 'Recording',
      editing:   'Editing',
      complete:  'Done',
      failed:    'Failed',
    } as Record<string, string>,
    timeAgo: (m: number, h: number, d: number) =>
      m < 1 ? 'Just now' : m < 60 ? `${m}m ago` : h < 24 ? `${h}h ago` : `${d}d ago`,
  },
};

// ─────────────────────────────────────
// Platform-konfig
// ─────────────────────────────────────
const PLATFORM_CFG: Record<string, {
  label: string; color: string; bg: string; border: string;
  icon: React.ReactNode; badge: string; defaultFormat: string;
}> = {
  tiktok:    { label: 'TikTok / Shorts',  color: 'text-pink-400',   bg: 'bg-pink-500/10',   border: 'border-pink-500/40',   icon: <TikTokIcon size={16} />,  badge: 'TikTok',    defaultFormat: '9:16' },
  youtube:   { label: 'YouTube',          color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/40',    icon: <Youtube size={16} />,     badge: 'YouTube',   defaultFormat: '16:9' },
  instagram: { label: 'Instagram Reels',  color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/40', icon: <Instagram size={16} />,   badge: 'Instagram', defaultFormat: '9:16' },
  desktop:   { label: 'YouTube (16:9)',   color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/40',   icon: <Monitor size={16} />,     badge: 'Desktop',   defaultFormat: '16:9' },
};
const PLATFORMS = Object.entries(PLATFORM_CFG).map(([id, v]) => ({ id, ...v }));

const FORMATS = [
  { id: '9:16', label: '9:16',  sub: 'Shorts / Reels',    icon: <Smartphone size={14} /> },
  { id: '16:9', label: '16:9',  sub: 'YouTube / Desktop', icon: <Monitor size={14} />    },
  { id: '1:1',  label: '1:1',   sub: 'Instagram Feed',    icon: <Square size={14} />     },
];

const LANGUAGES = [
  { id: 'ta', label: 'Tamil',     flag: '🇮🇳' },
  { id: 'nb', label: 'Norsk',     flag: '🇳🇴' },
  { id: 'en', label: 'English',   flag: '🇬🇧' },
  { id: 'es', label: 'Español',   flag: '🇪🇸' },
  { id: 'de', label: 'Deutsch',   flag: '🇩🇪' },
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
  { id: 'hi', label: 'Hindi',     flag: '🇮🇳' },
];

// Voices: Edge-TTS (all languages use same API)
const VOICES: Record<string, { id: string; name: string; gender: string; quality: 'best' | 'good' | 'standard' }[]> = {
  ta: [
    { id: 'ta-IN-PallaviNeural', name: 'Pallavi',  gender: 'Kvinne', quality: 'best' },
    { id: 'ta-IN-ValluvarNeural', name: 'Valluvar', gender: 'Mann',  quality: 'best' },
  ],
  nb: [
    { id: 'nb-NO-PernilleNeural', name: 'Pernille', gender: 'Kvinne', quality: 'best' },
    { id: 'nb-NO-FinnNeural',     name: 'Finn',    gender: 'Mann',  quality: 'best' },
  ],
  en: [
    { id: 'en-US-AriaNeural',   name: 'Aria',    gender: 'Female', quality: 'best' },
    { id: 'en-US-AndrewNeural', name: 'Andrew', gender: 'Male',   quality: 'best' },
  ],
  es: [
    { id: 'es-ES-ElviraNeural', name: 'Elvira', gender: 'Kvinne', quality: 'best' },
    { id: 'es-ES-AlvaroNeural', name: 'Álvaro', gender: 'Mann',  quality: 'best' },
  ],
  de: [
    { id: 'de-DE-KatjaNeural',   name: 'Katja',   gender: 'Kvinne', quality: 'best' },
    { id: 'de-DE-ConradNeural', name: 'Conrad', gender: 'Mann',  quality: 'best' },
  ],
  fr: [
    { id: 'fr-FR-DeniseNeural', name: 'Denise', gender: 'Kvinne', quality: 'best' },
    { id: 'fr-FR-HenriNeural',  name: 'Henri',  gender: 'Mann',  quality: 'best' },
  ],
  hi: [
    { id: 'hi-IN-SwaraNeural',  name: 'Swara',  gender: 'Kvinne', quality: 'best' },
    { id: 'hi-IN-MadhurNeural', name: 'Madhur', gender: 'Mann',  quality: 'best' },
  ],
};

// Målgruppe-knapper (id stored in DB, never changes)
const AUDIENCES = [
  { id: 'Unge voksne 18–25'    },
  { id: 'Voksne 25–45'         },
  { id: 'Eldre 45+'            },
  { id: 'Tech-interesserte'    },
  { id: 'Foreldre med barn'    },
  { id: 'Studenter'            },
  { id: 'Profesjonelle'        },
  { id: 'Helse og fitness'     },
  { id: 'Kreative og designere'},
  { id: 'Gamere'               },
];

// Tone/stil — id and prompt text (always Norwegian for AI)
const PROMPT_TONES = [
  { id: 'engaging',      text: 'Lag en ekstremt engasjerende og fengende video med rask klipping og energisk tone.' },
  { id: 'informative',   text: 'Lag en informativ og faktabasert video med tydelig struktur og lærerikt innhold.' },
  { id: 'humorous',      text: 'Lag en morsom og underholdende video med humor, memes og lettbeint tone.' },
  { id: 'dramatic',      text: 'Lag en dramatisk og følelsesladet video med cinematisk stemning og sterk fortelling.' },
  { id: 'inspirational', text: 'Lag en inspirerende og motiverende video som berører seerne og gir dem lyst til å handle.' },
  { id: 'viral',         text: 'Lag en ultra-viral video optimalisert for delinger, med hook de første 3 sekundene og sterk CTA.' },
];

// ─────────────────────────────────────
// Hjelpefunksjoner
// ─────────────────────────────────────
function normalizePlatform(raw: string | null | undefined): string {
  if (!raw) return 'desktop';
  const p = raw.toLowerCase().trim();
  if (p.includes('tiktok') || p.includes('shorts')) return 'tiktok';
  if (p.includes('youtube') || p.includes('yt'))    return 'youtube';
  if (p.includes('instagram') || p.includes('ig'))  return 'instagram';
  return 'desktop';
}

function buildPrompt(trend: Trend, toneText?: string): string {
  const tags     = (trend.tags ?? []).slice(0, 5).filter(Boolean).join(', ');
  const growth   = trend.growth_stat ? ` Veksttall: ${trend.growth_stat}.` : '';
  const tagStr   = tags ? ` Fokusér på nøkkelord: ${tags}.` : '';
  const platform = trend.platform ?? 'sosiale medier';
  const toneStr  = toneText ? ` ${toneText}` : '';
  return `Lag en engasjerende video om: "${trend.title}".${growth}${tagStr}${toneStr} Hold innholdet kortfattet, fengende og optimalisert for ${platform}.`;
}

/** Map heat_level → tone id */
function heatLevelToToneId(heatLevel: string | null | undefined): string {
  if (heatLevel === 'fire')   return 'viral';
  if (heatLevel === 'hot')    return 'engaging';
  if (heatLevel === 'rising') return 'inspirational';
  return 'informative';
}

/** Fuzzy-match trend.target_audience → AUDIENCES id (or '' if no match) */
function matchAudienceId(raw: string | null | undefined): string {
  if (!raw) return '';
  const ta = raw.toLowerCase();
  // Exact match
  const exact = AUDIENCES.find(a => a.id.toLowerCase() === ta);
  if (exact) return exact.id;
  // Fuzzy
  if (ta.includes('18') || ta.includes('unge') || ta.includes('young') || ta.includes('teen'))          return 'Unge voksne 18–25';
  if (ta.includes('25') || ta.includes('voksne') || ta.includes('adult'))                               return 'Voksne 25–45';
  if (ta.includes('45') || ta.includes('eldre') || ta.includes('older') || ta.includes('senior'))       return 'Eldre 45+';
  if (ta.includes('tech'))                                                                               return 'Tech-interesserte';
  if (ta.includes('foreldre') || ta.includes('parent') || ta.includes('family') || ta.includes('barn')) return 'Foreldre med barn';
  if (ta.includes('student'))                                                                            return 'Studenter';
  if (ta.includes('business') || ta.includes('profesjonell') || ta.includes('professional'))            return 'Profesjonelle';
  if (ta.includes('helse') || ta.includes('fitness') || ta.includes('health'))                          return 'Helse og fitness';
  if (ta.includes('kreativ') || ta.includes('design') || ta.includes('creative'))                       return 'Kreative og designere';
  if (ta.includes('gamer') || ta.includes('gaming') || ta.includes('spill'))                            return 'Gamere';
  return '';
}

function timeAgoFn(dateStr: string, lbl: typeof LABELS['nb']): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  return lbl.timeAgo(m, h, d);
}

// ─────────────────────────────────────
// Platform-badge
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
// Form state
// ─────────────────────────────────────
interface FormState {
  topic:          string;
  prompt:         string;
  platform:       string;
  language:       string;
  voiceId:        string;
  format:         string;
  targetAudience: string;
}

const DEFAULT_FORM: FormState = {
  topic:          '',
  prompt:         '',
  platform:       'tiktok',
  language:       'nb',
  voiceId:        'nb-NO-PernilleNeural',
  format:         '9:16',
  targetAudience: '',
};

// ─────────────────────────────────────
// Komponent
// ─────────────────────────────────────
export default function Bestilling() {
  const { user }                                      = useAuth();
  const { language }                                  = useLanguage();
  const { data: trends, loading: trendsLoading, refresh: refreshTrends } = useTrends();
  const { data: orders, refresh: refreshOrders }       = useOrders();
  const formRef                                         = useRef<HTMLDivElement>(null);

  // Pick label set: English or Norwegian (fallback for es/de/fr/pt)
  const lbl = language === 'en' ? LABELS.en : LABELS.nb;

  const [selectedTrend,   setSelectedTrend]   = useState<Trend | null>(null);
  const [selectedToneId,  setSelectedToneId]  = useState<string | null>(null);
  const [form,            setForm]            = useState<FormState>(DEFAULT_FORM);
  const [submitting,      setSubmitting]      = useState(false);
  const [submitResult,    setSubmitResult]    = useState<{ ok: boolean; msg: string } | null>(null);
  const [lastRefreshed,   setLastRefreshed]   = useState<Date>(new Date());
  const [customAudience,  setCustomAudience]  = useState('');

  // ── Auto-refresh trends every 5 min ──
  useEffect(() => {
    const interval = setInterval(() => {
      refreshTrends();
      setLastRefreshed(new Date());
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshTrends]);

  // ── Poll orders every 4s while pipeline is running (Realtime fallback) ──
  useEffect(() => {
    const hasActive = orders.some(o =>
      ['pending','queued','scripting','recording','editing'].includes(o.status)
    );
    if (!hasActive) return;
    const id = setInterval(() => refreshOrders(), 4000);
    return () => clearInterval(id);
  }, [orders, refreshOrders]);

  // ── Consume pending trend from Trends page ──
  useEffect(() => {
    const pending = consumePendingTrend();
    if (pending) handleSelectTrend(pending);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-update voice when language changes ──
  useEffect(() => {
    const firstVoice = VOICES[form.language]?.[0];
    if (firstVoice) setForm(f => ({ ...f, voiceId: firstVoice.id }));
  }, [form.language]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Velg trend — auto-fills tone + audience ──
  const handleSelectTrend = (trend: Trend) => {
    const mapped      = normalizePlatform(trend.platform);
    const platformCfg = PLATFORM_CFG[mapped];

    // Auto-select tone from heat_level
    const toneId   = heatLevelToToneId(trend.heat_level);
    const toneObj  = PROMPT_TONES.find(t => t.id === toneId);

    // Auto-select audience — fuzzy match or custom field
    const audienceId = matchAudienceId(trend.target_audience);
    const isPreset   = AUDIENCES.some(a => a.id === audienceId);

    setSelectedTrend(trend);
    setSelectedToneId(toneId);
    if (!isPreset && trend.target_audience) {
      setCustomAudience(trend.target_audience);
    } else {
      setCustomAudience('');
    }
    setForm(f => ({
      ...f,
      topic:          trend.title ?? '',
      prompt:         buildPrompt(trend, toneObj?.text),
      platform:       mapped,
      format:         platformCfg?.defaultFormat ?? f.format,
      targetAudience: audienceId || trend.target_audience || '',
    }));
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const clearTrend = () => {
    setSelectedTrend(null);
    setSelectedToneId(null);
    setCustomAudience('');
    setForm(DEFAULT_FORM);
  };

  const applyTone = (toneId: string, toneText: string) => {
    const base = form.topic
      ? `Lag en engasjerende video om: "${form.topic}". ${toneText}`
      : toneText;
    setForm(f => ({ ...f, prompt: base }));
    setSelectedToneId(toneId);
  };

  const handleManualRefresh = () => {
    refreshTrends();
    setLastRefreshed(new Date());
  };

  /** Selecting a format also snaps platform to a compatible one */
  const handleFormatSelect = (formatId: string) => {
    let newPlatform = form.platform;
    if (formatId === '9:16') {
      // 9:16 → keep if already tiktok/instagram, else default to tiktok
      if (!['tiktok', 'instagram'].includes(form.platform)) newPlatform = 'tiktok';
    } else if (formatId === '16:9') {
      // 16:9 → keep if already youtube/desktop, else default to youtube
      if (!['youtube', 'desktop'].includes(form.platform)) newPlatform = 'youtube';
    } else if (formatId === '1:1') {
      // 1:1 is always Instagram Feed
      newPlatform = 'instagram';
    }
    setForm(f => ({ ...f, format: formatId, platform: newPlatform }));
  };

  const handleAudienceSelect = (audienceId: string) => {
    if (form.targetAudience === audienceId) {
      setForm(f => ({ ...f, targetAudience: '' }));
    } else {
      setForm(f => ({ ...f, targetAudience: audienceId }));
      setCustomAudience('');
    }
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

      setSubmitResult({ ok: true, msg: lbl.successMsg });
      setSelectedTrend(null);
      setSelectedToneId(null);
      setForm(DEFAULT_FORM);
      setCustomAudience('');
      setTimeout(() => setSubmitResult(null), 6000);
    } catch (err) {
      setSubmitResult({ ok: false, msg: (err instanceof Error ? err.message : 'Ukjent feil') });
      setTimeout(() => setSubmitResult(null), 6000);
    }
    setSubmitting(false);
  };

  const availableVoices  = VOICES[form.language] ?? [];
  const activeOrders     = orders.filter(o => ['pending','queued','scripting','recording','editing'].includes(o.status));

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-5 items-start">

      {/* ══════════════════════════════════
          VENSTRE: SKJEMA
      ══════════════════════════════════ */}
      <div className="space-y-4">

        {/* ── Trending Topics ── */}
        <div className="bg-[#111118] border border-white/6 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-teal-400" />
            <h2 className="text-sm font-semibold text-white">{lbl.trendingTopics}</h2>
            {trendsLoading
              ? <RefreshCw size={12} className="text-white/30 animate-spin ml-1" />
              : <span className="text-[10px] text-white/25 ml-1">{trends.length} live</span>
            }
            {/* Live puls */}
            <div className="flex items-center gap-1.5 ml-auto">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-[10px] text-white/25 hidden sm:block">
                {timeAgoFn(lastRefreshed.toISOString(), lbl)}
              </span>
              <button
                onClick={handleManualRefresh}
                disabled={trendsLoading}
                className="p-1.5 rounded-lg hover:bg-white/8 text-white/30 hover:text-white/60 transition-colors ml-1"
                title="Refresh"
              >
                <RefreshCw size={12} className={trendsLoading ? 'animate-spin' : ''} />
              </button>
              {selectedTrend && (
                <button onClick={clearTrend} className="text-xs text-white/35 hover:text-white/60 transition-colors ml-1">
                  {lbl.clearTrend}
                </button>
              )}
            </div>
          </div>

          {trends.length === 0 && !trendsLoading ? (
            <div className="flex flex-col items-center py-8 gap-2">
              <TrendingUp size={24} className="text-white/15" />
              <p className="text-xs text-white/30">{lbl.noTrends}</p>
              <p className="text-[11px] text-white/20">{lbl.noTrendsHint}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {trends.slice(0, 8).map(trend => {
                const isSelected     = selectedTrend?.id === trend.id;
                const normalPlatform = normalizePlatform(trend.platform);
                const pCfg           = PLATFORM_CFG[normalPlatform];
                return (
                  <button
                    key={trend.id}
                    onClick={() => isSelected ? clearTrend() : handleSelectTrend(trend)}
                    className={`text-left p-3.5 rounded-xl border transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'border-teal-500/50 bg-teal-500/10'
                        : 'border-white/6 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                    }`}
                  >
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
                    <p className="text-xs font-semibold text-white leading-snug line-clamp-2 mb-1.5">
                      {trend.title}
                    </p>
                    {trend.growth_stat && (
                      <p className={`text-[10px] leading-snug mb-1.5 ${isSelected ? 'text-teal-400/80' : 'text-white/35'}`}>
                        📈 {trend.growth_stat}
                      </p>
                    )}
                    {trend.target_audience && (
                      <div className={`flex items-center gap-1 text-[10px] mb-1.5 ${isSelected ? 'text-teal-300/70' : 'text-white/30'}`}>
                        <Users size={9} /><span className="truncate">{trend.target_audience}</span>
                      </div>
                    )}
                    {(trend.tags ?? []).length > 0 && (
                      <div className="flex gap-1 flex-wrap mb-1.5">
                        {(trend.tags ?? []).slice(0, 3).map(tag => (
                          <span key={tag} className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                            isSelected ? 'bg-teal-500/15 text-teal-400/80' : 'bg-white/6 text-white/30'
                          }`}>#{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className={`flex items-center justify-between text-[9px] ${isSelected ? 'text-teal-400/50' : 'text-white/20'}`}>
                      <span className="flex items-center gap-1">
                        <Calendar size={8} />
                        {timeAgoFn(trend.updated_at ?? trend.created_at ?? new Date().toISOString(), lbl)}
                      </span>
                      {isSelected && (
                        <span className="flex items-center gap-0.5 text-teal-400 font-semibold">
                          <Zap size={8} />{lbl.filledAll}<ChevronRight size={8} />
                        </span>
                      )}
                    </div>
                    {isSelected && <div className={`mt-2 h-0.5 rounded-full ${pCfg?.bg ?? 'bg-teal-500/30'}`} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Form sections ── */}
        <div ref={formRef} className="space-y-4">

          {/* ── 01 · Topic ── */}
          <div className="bg-[#111118] border border-white/6 rounded-xl p-4 sm:p-5 space-y-2">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block">
              {lbl.topicLabel}
            </label>
            <input
              type="text"
              value={form.topic}
              onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
              placeholder={lbl.topicPlaceholder}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-teal-500/50 transition-all"
            />
          </div>

          {/* ── 02 · Prompt + Tone ── */}
          <div className="bg-[#111118] border border-white/6 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                {lbl.styleLabel}
              </label>
              <span className="text-[10px] text-white/25">{lbl.styleHint}</span>
            </div>

            {/* Tone-knapper */}
            <div className="flex gap-2 flex-wrap">
              {PROMPT_TONES.map(tone => {
                const isActive = selectedToneId === tone.id;
                const toneLabel = lbl.tones[tone.id as keyof typeof lbl.tones];
                return (
                  <button
                    key={tone.id}
                    onClick={() => applyTone(tone.id, tone.text)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border active:scale-[0.97] ${
                      isActive
                        ? 'bg-teal-500/15 border-teal-500/30 text-teal-400'
                        : 'bg-white/4 border-white/8 text-white/50 hover:text-white/80 hover:border-white/20'
                    }`}
                  >
                    {toneLabel}
                  </button>
                );
              })}
            </div>

            {/* Prompt-felt */}
            <div className="relative">
              <textarea
                value={form.prompt}
                onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
                placeholder={`${lbl.promptPlaceholderPre} ${form.topic || '…'}. ${lbl.promptPlaceholderPost}`}
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-teal-500/50 transition-all resize-none leading-relaxed"
              />
              {form.prompt && (
                <button
                  onClick={() => { setForm(f => ({ ...f, prompt: '' })); setSelectedToneId(null); }}
                  className="absolute top-2.5 right-2.5 text-white/20 hover:text-white/50 transition-colors"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <p className="text-[10px] text-white/20 flex items-center gap-1">
              <Sparkles size={9} />
              {lbl.aiTip}
            </p>
          </div>

          {/* ── 03 · Målgruppe ── */}
          <div className="bg-[#111118] border border-white/6 rounded-xl p-4 sm:p-5 space-y-3">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
              <Users size={12} />
              {lbl.audienceLabel}
              {form.targetAudience && selectedTrend && (
                <span className="ml-auto text-[10px] text-teal-400/70 normal-case font-normal flex items-center gap-1">
                  <Zap size={9} /> {lbl.autoFilled}
                </span>
              )}
            </label>

            {/* Predefinerte publikum-knapper */}
            <div className="flex flex-wrap gap-2">
              {AUDIENCES.map(a => {
                const aLabel = lbl.audiences[a.id] ?? a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => handleAudienceSelect(a.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border active:scale-[0.97] ${
                      form.targetAudience === a.id
                        ? 'bg-teal-500/15 border-teal-500/30 text-teal-300'
                        : 'bg-white/4 border-white/8 text-white/50 hover:text-white/80 hover:border-white/20'
                    }`}
                  >
                    {aLabel}
                  </button>
                );
              })}
            </div>

            {/* Custom input */}
            <div className="relative">
              <input
                type="text"
                value={customAudience}
                onChange={e => {
                  setCustomAudience(e.target.value);
                  setForm(f => ({ ...f, targetAudience: e.target.value }));
                }}
                placeholder={lbl.customAudiencePh}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-teal-500/50 transition-all"
              />
              {form.targetAudience && (
                <button
                  onClick={() => { setForm(f => ({ ...f, targetAudience: '' })); setCustomAudience(''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {form.targetAudience && (
              <div className="flex items-center gap-2 px-3 py-2 bg-teal-500/8 border border-teal-500/20 rounded-lg">
                <Users size={11} className="text-teal-400 flex-shrink-0" />
                <span className="text-xs text-teal-300">{form.targetAudience}</span>
              </div>
            )}
          </div>

          {/* ── 04 · Plattform ── */}
          <div className="bg-[#111118] border border-white/6 rounded-xl p-4 sm:p-5 space-y-3">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block">
              {lbl.platformLabel}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setForm(f => ({ ...f, platform: p.id, format: p.defaultFormat }))}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all active:scale-[0.98] ${
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

          {/* ── 05 · Språk + 06 · Stemme ── */}
          <div className="bg-[#111118] border border-white/6 rounded-xl p-4 sm:p-5 space-y-5">

            {/* Språk */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block">
                {lbl.videoLangLabel}
              </label>
              <div className="flex gap-2 flex-wrap">
                {LANGUAGES.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setForm(f => ({ ...f, language: l.id }))}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all active:scale-[0.97] ${
                      form.language === l.id
                        ? 'border-teal-500/40 bg-teal-500/10 text-teal-400'
                        : 'border-white/6 bg-white/2 text-white/45 hover:border-white/20'
                    }`}
                  >
                    <span>{l.flag}</span>{l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stemme */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
                <Mic size={12} />
                {lbl.voiceLabel}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableVoices.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setForm(f => ({ ...f, voiceId: v.id }))}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all active:scale-[0.97] ${
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
                      <p className={`text-[9px] mt-0.5 ${
                        v.quality === 'best' ? 'text-yellow-400/70' : 'text-white/20'
                      }`}>
                        {v.quality === 'best' ? '⭐ Best' : '· Standard'}
                      </p>
                    </div>
                    {form.voiceId === v.id && <CheckCircle2 size={13} className="text-teal-400 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── 07 · Videoformat ── */}
          <div className="bg-[#111118] border border-white/6 rounded-xl p-4 sm:p-5 space-y-3">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block">
              {lbl.formatLabel}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {FORMATS.map(f => (
                <button
                  key={f.id}
                  onClick={() => handleFormatSelect(f.id)}
                  className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all active:scale-[0.97] ${
                    form.format === f.id
                      ? 'border-teal-500/40 bg-teal-500/10'
                      : 'border-white/6 bg-white/2 hover:border-white/15'
                  }`}
                >
                  <span className={form.format === f.id ? 'text-teal-400' : 'text-white/30'}>{f.icon}</span>
                  <p className={`text-sm font-bold ${form.format === f.id ? 'text-teal-400' : 'text-white/60'}`}>{f.label}</p>
                  <p className="text-[10px] text-white/25 text-center">{f.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* ── Send-knapp ── */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !form.topic.trim()}
            className="w-full flex items-center justify-center gap-3 py-4 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-white font-bold text-base rounded-xl transition-all shadow-lg shadow-teal-500/25 active:scale-[0.98]"
          >
            {submitting
              ? <><RefreshCw size={18} className="animate-spin" /> {lbl.submitting}</>
              : <><Send size={18} /> {lbl.submitBtn}</>
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

      {/* ══════════════════════════════════
          HØYRE: LOGG
      ══════════════════════════════════ */}
      <div className="space-y-4 lg:sticky lg:top-6">

        {/* Aktive bestillinger banner */}
        {activeOrders.length > 0 && (
          <div className="bg-teal-500/8 border border-teal-500/20 rounded-xl p-4 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse flex-shrink-0" />
            <p className="text-xs text-teal-300 font-medium">
              {lbl.activeOrders(activeOrders.length)}
            </p>
          </div>
        )}

        {/* Bestillingslogg */}
        <div className="bg-[#111118] border border-white/6 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">{lbl.orderLog}</h3>
              {orders.some(o => ['pending','queued','scripting','recording','editing'].includes(o.status)) && (
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  <span className="text-[10px] text-teal-400/60">Live</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/30">{orders.length} totalt</span>
              <button
                onClick={() => refreshOrders()}
                className="p-1 rounded-lg hover:bg-white/8 text-white/25 hover:text-white/60 transition-colors"
                title="Refresh"
              >
                <RefreshCw size={11} />
              </button>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center">
              <Clock size={24} className="text-white/15 mx-auto mb-2" />
              <p className="text-xs text-white/25">{lbl.noOrders}</p>
            </div>
          ) : (
            <div className="divide-y divide-white/4">
              {orders.slice(0, 15).map(order => {
                const isActive = ['queued','scripting','recording','editing','pending'].includes(order.status);
                const progress = order.progress ?? 0;
                return (
                  <div key={order.id} className="px-4 py-3.5 hover:bg-white/2 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-xs font-semibold text-white leading-snug line-clamp-2 flex-1">
                        {order.topic ?? order.title ?? '—'}
                      </p>
                      <StatusBadge status={order.status} size="sm" />
                    </div>

                    {/* Progress bar — alltid synlig for aktive */}
                    {isActive && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-white/30 italic">
                            {order.sub_status || lbl.statusMap[order.status] || order.status}
                          </span>
                          <span className="text-[10px] font-bold text-teal-400">
                            {progress}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              progress === 0
                                ? 'bg-white/20 animate-pulse w-full'
                                : 'bg-gradient-to-r from-teal-500 to-cyan-400'
                            }`}
                            style={progress > 0 ? { width: `${progress}%` } : {}}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-[10px] text-white/30 flex-wrap">
                      <PlatformBadge rawPlatform={order.platform} active={false} />
                      <span>·</span>
                      <span>{LANGUAGES.find(l => l.id === order.language)?.flag ?? ''} {order.language?.toUpperCase()}</span>
                      <span>·</span>
                      <span>{order.aspect_ratio ?? '—'}</span>
                      <span className="ml-auto">
                        {new Date(order.created_at).toLocaleString('nb-NO', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pipeline status */}
        <div className="bg-white/2 border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={12} className="text-orange-400" />
            <p className="text-xs font-semibold text-white/50">{lbl.pipeline}</p>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-[10px] text-teal-400/60">{lbl.pipelineActive}</span>
            </div>
          </div>
          <div className="space-y-1.5 text-[11px] text-white/30">
            <div className="flex items-center gap-2">
              <span className="text-teal-400">①</span> Gemini → Script
            </div>
            <div className="flex items-center gap-2">
              <span className="text-teal-400">②</span> ElevenLabs → Voiceover
            </div>
            <div className="flex items-center gap-2">
              <span className="text-teal-400">③</span> Pexels → Videoklipp
            </div>
            <div className="flex items-center gap-2">
              <span className="text-teal-400">④</span> FFmpeg → Ferdig video
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
