import { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, Play, ChevronRight, ChevronDown, Film, Loader2,
  Check, Clock, AlertCircle, RefreshCw, Layers, BookOpen,
  Zap, Globe, Youtube, Plus, Trash2, ChevronUp, PlayCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/authContext';
import { useLanguage } from '../contexts/languageContext';

// ── Types ────────────────────────────────────────────────────────────────────

interface SeriesRow {
  id: string;
  user_id: string;
  title: string;
  prompt: string | null;
  season_number: number;
  total_episodes: number;
  language: string;
  platform: string;
  status: string;
  created_at: string;
}

interface EpisodeRow {
  id: string;
  series_id: string;
  episode_number: number;
  title: string;
  description: string | null;
  video_id: string | null;
  video_url: string | null;
  status: string; // pending | queued | producing | complete | failed
  created_at: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: 'ta', label: 'Tamil',    flag: '🇮🇳' },
  { code: 'nb', label: 'Norsk',    flag: '🇳🇴' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'es', label: 'Español',  flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch',  flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'hi', label: 'Hindi',    flag: '🇮🇳' },
];

const PLATFORMS = [
  { id: 'youtube',   label: 'YouTube',   color: 'text-red-400' },
  { id: 'tiktok',    label: 'TikTok',    color: 'text-pink-400' },
  { id: 'instagram', label: 'Instagram', color: 'text-purple-400' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:   { label: 'Venter',     color: 'text-white/40',    bg: 'bg-white/5',         icon: <Clock size={10} /> },
  queued:    { label: 'I kø',       color: 'text-yellow-400',  bg: 'bg-yellow-500/10',   icon: <Loader2 size={10} className="animate-spin" /> },
  producing: { label: 'Produserer', color: 'text-teal-400',    bg: 'bg-teal-500/10',     icon: <Loader2 size={10} className="animate-spin" /> },
  complete:  { label: 'Ferdig',     color: 'text-emerald-400', bg: 'bg-emerald-500/10',  icon: <Check size={10} /> },
  failed:    { label: 'Feilet',     color: 'text-red-400',     bg: 'bg-red-500/10',      icon: <AlertCircle size={10} /> },
};

// ── Helper: call Groq directly from browser ───────────────────────────────────

async function generateEpisodesWithGroq(
  prompt: string,
  seasonTitle: string,
  episodeCount: number,
  language: string,
  groqKey: string,
): Promise<{ title: string; description: string }[]> {
  const langNames: Record<string, string> = {
    ta: 'Tamil', nb: 'Norwegian', en: 'English',
    es: 'Spanish', de: 'German', fr: 'French', hi: 'Hindi',
  };
  const langName = langNames[language] ?? 'English';

  const systemPrompt = `You are a professional video series creator and historian.
Generate exactly ${episodeCount} episode titles and descriptions for a YouTube documentary series.
Each episode should be compelling, specific, and educational.
Episode titles should be dramatic and hook viewers.
Descriptions should be 1-2 sentences explaining the key content.
Return ONLY a valid JSON array, no markdown, no extra text.`;

  const userPrompt = `Series concept: "${seasonTitle}"

Additional context:
${prompt}

Create exactly ${episodeCount} episodes in ${langName}.
Return format:
[
  {"title": "Episode title here", "description": "Brief episode description here."},
  ...
]`;

  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 4000,
      temperature: 0.7,
    }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(`Groq API feil: ${err?.error?.message ?? resp.status}`);
  }

  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content ?? '';

  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Klarte ikke parse episode-listen fra AI');
  }
}

// ── Fallback episode generation (no API key needed) ──────────────────────────

function generateFallbackEpisodes(
  prompt: string,
  count: number,
): { title: string; description: string }[] {
  const lines = prompt.split('\n').filter(l => l.trim().length > 10);
  const topics = lines.slice(0, count).map((l, i) => ({
    title: `Episode ${i + 1}: ${l.trim().replace(/^[-•*]\s*/, '').slice(0, 60)}`,
    description: `En dyptgående utforskning av ${l.trim().slice(0, 80)}.`,
  }));

  while (topics.length < count) {
    topics.push({
      title: `Episode ${topics.length + 1}`,
      description: 'Kommer snart.',
    });
  }
  return topics.slice(0, count);
}

// ── Status badge ──────────────────────────────────────────────────────────────

function EpisodeStatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${cfg.color} ${cfg.bg}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ── Series card (existing series) ─────────────────────────────────────────────

function SeriesCard({
  series, onDelete, onStartProduction,
}: {
  series: SeriesRow;
  episodes: EpisodeRow[];
  onDelete: (id: string) => void;
  onStartProduction: (series: SeriesRow) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [eps, setEps] = useState<EpisodeRow[]>([]);
  const [loadingEps, setLoadingEps] = useState(false);

  const loadEpisodes = useCallback(async () => {
    setLoadingEps(true);
    const { data } = await supabase
      .from('episodes')
      .select('*')
      .eq('series_id', series.id)
      .order('episode_number');
    setEps(data ?? []);
    setLoadingEps(false);
  }, [series.id]);

  useEffect(() => {
    if (expanded) loadEpisodes();
  }, [expanded, loadEpisodes]);

  const done     = eps.filter(e => e.status === 'complete').length;
  const progress = series.total_episodes > 0 ? (done / series.total_episodes) * 100 : 0;

  const langFlag = LANGUAGES.find(l => l.code === series.language)?.flag ?? '🌐';

  return (
    <div className="bg-[#111118] border border-white/8 rounded-xl overflow-hidden hover:border-white/12 transition-all">
      <div
        className="p-4 cursor-pointer select-none"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-teal-400/70 uppercase tracking-wider">
                S{series.season_number}
              </span>
              <span className="text-white/20 text-xs">•</span>
              <span className="text-xs text-white/30">{langFlag} {series.language.toUpperCase()}</span>
            </div>
            <h3 className="text-sm font-bold text-white truncate">{series.title}</h3>
            <p className="text-xs text-white/35 mt-0.5">
              {series.total_episodes} episoder
              {done > 0 && <span className="text-emerald-400 ml-2">• {done} ferdige</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {series.status !== 'complete' && (
              <button
                onClick={e => { e.stopPropagation(); onStartProduction(series); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-400 text-xs font-semibold border border-teal-500/20 transition-all"
              >
                <Play size={11} fill="currentColor" /> Start
              </button>
            )}
            <button
              onClick={e => { e.stopPropagation(); onDelete(series.id); }}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/25 hover:text-red-400 transition-all"
            >
              <Trash2 size={13} />
            </button>
            {expanded ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
          </div>
        </div>

        {/* Progress bar */}
        {series.total_episodes > 0 && (
          <div className="mt-3 h-1 bg-white/6 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {expanded && (
        <div className="border-t border-white/6 px-4 pb-4 pt-3 space-y-1.5">
          {loadingEps ? (
            <div className="flex justify-center py-4">
              <Loader2 size={16} className="animate-spin text-white/30" />
            </div>
          ) : eps.length === 0 ? (
            <p className="text-xs text-white/30 text-center py-3">Ingen episoder ennå</p>
          ) : (
            eps.map(ep => (
              <div key={ep.id} className="flex items-center gap-3 py-2 border-b border-white/4 last:border-0">
                <span className="text-[10px] font-bold text-white/25 w-6 flex-shrink-0">
                  E{ep.episode_number}
                </span>
                <p className="flex-1 text-xs text-white/70 truncate">{ep.title}</p>
                <EpisodeStatusBadge status={ep.status} />
                {ep.video_url && (
                  <a href={ep.video_url} target="_blank" rel="noopener noreferrer"
                    className="p-1 hover:bg-white/5 rounded text-white/30 hover:text-teal-400 transition-colors">
                    <PlayCircle size={13} />
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type Phase = 'input' | 'generating' | 'preview' | 'producing';

export default function SeriesPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  // ── Form state
  const [prompt, setPrompt]           = useState('');
  const [seasonTitle, setSeasonTitle] = useState('');
  const [seasonNum, setSeasonNum]     = useState(1);
  const [epCount, setEpCount]         = useState(10);
  const [language, setLanguage]       = useState('ta');
  const [platform, setPlatform]       = useState('youtube');

  // ── Flow state
  const [phase, setPhase]             = useState<Phase>('input');
  const [genError, setGenError]       = useState<string | null>(null);
  const [genStatus, setGenStatus]     = useState('');

  // ── Generated data
  const [draftEpisodes, setDraftEpisodes] = useState<{ title: string; description: string }[]>([]);
  const [savedSeries, setSavedSeries]     = useState<SeriesRow | null>(null);
  const [prodProgress, setProdProgress]  = useState<Record<number, string>>({});

  // ── Existing series
  const [allSeries, setAllSeries]         = useState<SeriesRow[]>([]);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [activeTab, setActiveTab]         = useState<'new' | 'mine'>('new');

  // ── Load existing series
  const loadAllSeries = useCallback(async () => {
    if (!user) return;
    setLoadingSeries(true);
    const { data } = await supabase
      .from('series')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setAllSeries(data ?? []);
    setLoadingSeries(false);
  }, [user]);

  useEffect(() => { loadAllSeries(); }, [loadAllSeries]);

  // ── Groq key from settings
  const [groqKey, setGroqKey] = useState<string | null>(null);
  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_settings')
      .select('groq_api_key')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => { if (data?.groq_api_key) setGroqKey(data.groq_api_key); });
  }, [user]);

  // ── Generate episodes ────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!seasonTitle.trim()) { setGenError('Skriv inn en serietittel'); return; }
    setGenError(null);
    setPhase('generating');
    setGenStatus('AI analyserer konseptet ditt...');

    try {
      let episodes: { title: string; description: string }[];

      if (groqKey) {
        setGenStatus('Groq AI genererer episoder...');
        episodes = await generateEpisodesWithGroq(prompt, seasonTitle, epCount, language, groqKey);
      } else {
        setGenStatus('Genererer episodeplan...');
        await new Promise(r => setTimeout(r, 800));
        episodes = generateFallbackEpisodes(prompt || seasonTitle, epCount);
      }

      setDraftEpisodes(episodes.slice(0, epCount));
      setPhase('preview');
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Generering feilet');
      setPhase('input');
    }
  };

  // ── Save & start production ──────────────────────────────────────────────────
  const handleStartProduction = async (
    seriesOverride?: SeriesRow,
  ) => {
    if (!user) return;
    setGenError(null);

    let series = seriesOverride ?? savedSeries;

    // Save series + episodes if not saved yet
    if (!series) {
      setPhase('producing');
      setGenStatus('Lagrer serie i databasen...');

      const { data: newSeries, error: seriesErr } = await supabase
        .from('series')
        .insert({
          user_id:        user.id,
          title:          seasonTitle,
          prompt:         prompt || null,
          season_number:  seasonNum,
          total_episodes: draftEpisodes.length,
          language,
          platform,
          status:         'producing',
        })
        .select()
        .single();

      if (seriesErr || !newSeries) {
        setGenError('Kunne ikke lagre serien: ' + (seriesErr?.message ?? 'ukjent'));
        setPhase('preview');
        return;
      }

      series = newSeries as SeriesRow;
      setSavedSeries(series);

      const episodeRows = draftEpisodes.map((ep, i) => ({
        series_id:      series!.id,
        episode_number: i + 1,
        title:          ep.title,
        description:    ep.description,
        status:         'pending',
      }));

      const { error: epErr } = await supabase.from('episodes').insert(episodeRows);
      if (epErr) {
        setGenError('Kunne ikke lagre episoder: ' + epErr.message);
        setPhase('preview');
        return;
      }
    } else {
      setPhase('producing');
    }

    // Send each episode to n8n
    setGenStatus('Sender episoder til produksjon...');
    const { data: { session } } = await supabase.auth.getSession();

    const { data: episodes } = await supabase
      .from('episodes')
      .select('*')
      .eq('series_id', series.id)
      .order('episode_number');

    const eps: EpisodeRow[] = episodes ?? [];

    for (const ep of eps) {
      if (ep.status === 'complete') continue;

      setProdProgress(prev => ({ ...prev, [ep.episode_number]: 'queued' }));

      // Update status in DB
      await supabase.from('episodes').update({ status: 'queued' }).eq('id', ep.id);

      // Trigger n8n
      if (session) {
        try {
          await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trigger-n8n`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action:         'new_order',
                title:          ep.title,
                topic:          ep.title,
                promp:          ep.description ?? ep.title,
                language,
                platform,
                series_id:      series!.id,
                episode_number: ep.episode_number,
                episode_id:     ep.id,
                is_series:      true,
                series_name:    seasonTitle,
              }),
            }
          );
          setProdProgress(prev => ({ ...prev, [ep.episode_number]: 'producing' }));
        } catch {
          setProdProgress(prev => ({ ...prev, [ep.episode_number]: 'queued' }));
        }
      }

      // Small delay between episodes
      await new Promise(r => setTimeout(r, 400));
    }

    // Update series status
    await supabase.from('series').update({ status: 'producing' }).eq('id', series.id);
    await loadAllSeries();
    setGenStatus('Alle episoder sendt til produksjon! ✅');
  };

  // ── Delete series ────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    await supabase.from('series').delete().eq('id', id);
    setAllSeries(prev => prev.filter(s => s.id !== id));
  };

  // ── Reset form ───────────────────────────────────────────────────────────────
  const handleReset = () => {
    setPhase('input');
    setDraftEpisodes([]);
    setSavedSeries(null);
    setProdProgress({});
    setGenError(null);
    setGenStatus('');
    setSeasonTitle('');
    setPrompt('');
    loadAllSeries();
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers size={20} className="text-teal-400" />
            Auto-Serie Studio
          </h1>
          <p className="text-sm text-white/35 mt-0.5">
            Lim inn en idé → AI genererer hele sesongen → automatisk produksjon
          </p>
        </div>
        <div className="flex gap-1 bg-white/4 p-1 rounded-xl border border-white/6">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'new' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/20' : 'text-white/40 hover:text-white/70'}`}
          >
            <Plus size={12} className="inline mr-1" />Ny serie
          </button>
          <button
            onClick={() => { setActiveTab('mine'); loadAllSeries(); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'mine' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/20' : 'text-white/40 hover:text-white/70'}`}
          >
            <BookOpen size={12} className="inline mr-1" />Mine serier
            {allSeries.length > 0 && (
              <span className="ml-1.5 bg-white/10 text-white/50 text-[10px] px-1.5 py-0.5 rounded-full">
                {allSeries.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ══════════════ TAB: NY SERIE ══════════════ */}
      {activeTab === 'new' && (
        <div className="space-y-4">

          {/* ── PHASE: input ── */}
          {phase === 'input' && (
            <div className="space-y-4">
              <div className="bg-[#0e0e18] border border-white/8 rounded-2xl p-6 space-y-5">

                {/* Tittel */}
                <div>
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">
                    Serietittel / Sesong
                  </label>
                  <input
                    type="text"
                    value={seasonTitle}
                    onChange={e => setSeasonTitle(e.target.value)}
                    placeholder="Sesong 1: Muvendar — De tre store Tamil-kongene"
                    className="w-full px-4 py-3 bg-[#1a1a28] border border-white/10 rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-teal-500/40 transition-colors"
                  />
                </div>

                {/* Prompt */}
                <div>
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">
                    Beskriv innholdet (jo mer detaljer, jo bedre episoder)
                  </label>
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    rows={6}
                    placeholder={`Eksempel:\n\nFokus: Chola, Chera og Pandya-dynastiene\nInnhold: Opprinnelsen, de største kongene, handel og de første store militære konfliktene\nVinkling: Episk historiefortelling — som en Netflix-serie om det virkelige Tamil Nadu\nMålgruppe: Tamil-diaspora og historieinteresserte worldwide`}
                    className="w-full px-4 py-3 bg-[#1a1a28] border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-teal-500/40 transition-colors resize-none leading-relaxed"
                  />
                </div>

                {/* Språk */}
                <div>
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Globe size={11} />Språk
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map(l => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => setLanguage(l.code)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          language === l.code
                            ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                            : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80'
                        }`}
                      >
                        <span>{l.flag}</span> {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plattform */}
                <div>
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Youtube size={11} />Plattform
                  </label>
                  <div className="flex gap-2">
                    {PLATFORMS.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlatform(p.id)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                          platform === p.id
                            ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                            : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sesong # og episoder */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">
                      Sesong #
                    </label>
                    <div className="flex items-center gap-2 bg-[#1a1a28] border border-white/10 rounded-xl px-3 py-2.5">
                      <button type="button" onClick={() => setSeasonNum(n => Math.max(1, n - 1))}
                        className="w-6 h-6 rounded-lg bg-white/8 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center text-sm font-bold transition-all">−</button>
                      <span className="flex-1 text-center text-sm font-bold text-white">{seasonNum}</span>
                      <button type="button" onClick={() => setSeasonNum(n => Math.min(20, n + 1))}
                        className="w-6 h-6 rounded-lg bg-white/8 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center text-sm font-bold transition-all">+</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">
                      Antall episoder
                    </label>
                    <div className="flex items-center gap-2 bg-[#1a1a28] border border-white/10 rounded-xl px-3 py-2.5">
                      <button type="button" onClick={() => setEpCount(n => Math.max(1, n - 1))}
                        className="w-6 h-6 rounded-lg bg-white/8 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center text-sm font-bold transition-all">−</button>
                      <span className="flex-1 text-center text-sm font-bold text-white">{epCount}</span>
                      <button type="button" onClick={() => setEpCount(n => Math.min(50, n + 1))}
                        className="w-6 h-6 rounded-lg bg-white/8 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center text-sm font-bold transition-all">+</button>
                    </div>
                  </div>
                </div>

                {genError && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    <AlertCircle size={15} /> {genError}
                  </div>
                )}

                {!groqKey && (
                  <div className="flex items-start gap-2 px-4 py-3 bg-yellow-500/8 border border-yellow-500/15 rounded-xl text-yellow-400/80 text-xs">
                    <Zap size={13} className="flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Tips:</strong> Legg til Groq API-nøkkel i{' '}
                      <span className="underline cursor-pointer">Innstillinger → Groq API Key</span>{' '}
                      for AI-genererte episodetitler. Uten nøkkel brukes mal-generering.
                    </span>
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={!seasonTitle.trim()}
                  className="w-full flex items-center justify-center gap-2.5 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-white font-bold text-sm transition-all shadow-lg shadow-teal-500/20 active:scale-[0.99]"
                >
                  <Sparkles size={18} />
                  Generer {epCount} episoder automatisk
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── PHASE: generating ── */}
          {phase === 'generating' && (
            <div className="bg-[#0e0e18] border border-teal-500/20 rounded-2xl p-12 text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-2xl bg-teal-500/20 animate-ping" />
                  <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500/30 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center">
                    <Sparkles size={32} className="text-teal-400 animate-pulse" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">AI jobber...</h3>
                <p className="text-white/40 text-sm">{genStatus}</p>
              </div>
              <div className="flex justify-center gap-1.5">
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-teal-400/50 animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── PHASE: preview ── */}
          {phase === 'preview' && (
            <div className="space-y-4">
              {/* Series summary */}
              <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/5 border border-teal-500/20 rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">
                      Sesong {seasonNum} generert ✨
                    </div>
                    <h2 className="text-lg font-bold text-white">{seasonTitle}</h2>
                    <p className="text-white/40 text-sm mt-1">
                      {draftEpisodes.length} episoder •{' '}
                      {LANGUAGES.find(l => l.code === language)?.flag}{' '}
                      {LANGUAGES.find(l => l.code === language)?.label} •{' '}
                      {platform}
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="text-xs text-white/30 hover:text-white/60 transition-colors"
                  >
                    Start på nytt
                  </button>
                </div>
              </div>

              {/* Episode list */}
              <div className="bg-[#0e0e18] border border-white/8 rounded-2xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-white/6 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Episodeliste</h3>
                  <span className="text-xs text-white/30">{draftEpisodes.length} episoder</span>
                </div>
                <div className="divide-y divide-white/4 max-h-96 overflow-y-auto">
                  {draftEpisodes.map((ep, i) => (
                    <div key={i} className="px-5 py-3.5 flex items-start gap-4 hover:bg-white/2 transition-colors">
                      <span className="text-xs font-bold text-teal-400/60 w-6 flex-shrink-0 mt-0.5">
                        E{i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={ep.title}
                          onChange={e => setDraftEpisodes(prev => prev.map((x, j) => j === i ? { ...x, title: e.target.value } : x))}
                          className="w-full text-sm font-semibold text-white bg-transparent border-0 outline-none hover:bg-[#1a1a28] focus:bg-[#1a1a28] px-2 py-1 rounded-lg -ml-2 transition-colors"
                        />
                        <p className="text-xs text-white/35 mt-0.5 px-2 line-clamp-2">{ep.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {genError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  <AlertCircle size={15} /> {genError}
                </div>
              )}

              {/* Start production button */}
              <button
                onClick={() => handleStartProduction()}
                className="w-full flex items-center justify-center gap-3 py-5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 rounded-2xl text-white font-bold text-base transition-all shadow-xl shadow-teal-500/25 active:scale-[0.99]"
              >
                <Play size={20} fill="currentColor" />
                Start automatisk produksjon av alle {draftEpisodes.length} episoder
              </button>
              <p className="text-center text-xs text-white/25">
                Alle episoder sendes til n8n og produseres én etter én. Du trenger ikke gjøre noe mer.
              </p>
            </div>
          )}

          {/* ── PHASE: producing ── */}
          {phase === 'producing' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/5 border border-teal-500/20 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                    <Film size={20} className="text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Produksjon i gang 🎬</h3>
                    <p className="text-xs text-white/40">{genStatus || 'Episoder sendes til n8n...'}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {draftEpisodes.map((ep, i) => {
                    const st = prodProgress[i + 1] ?? 'pending';
                    const cfg = STATUS_CONFIG[st] ?? STATUS_CONFIG.pending;
                    return (
                      <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/3">
                        <span className="text-[10px] font-bold text-white/25 w-5">E{i + 1}</span>
                        <p className="flex-1 text-xs text-white/60 truncate">{ep.title}</p>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${cfg.color}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setActiveTab('mine'); handleReset(); }}
                  className="flex-1 py-3 border border-white/10 hover:bg-white/5 rounded-xl text-white/60 text-sm font-medium transition-all"
                >
                  Se mine serier
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/20 rounded-xl text-teal-400 text-sm font-semibold transition-all"
                >
                  Lag ny serie
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ TAB: MINE SERIER ══════════════ */}
      {activeTab === 'mine' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/40">
              {allSeries.length === 0 ? 'Ingen serier ennå' : `${allSeries.length} serie${allSeries.length !== 1 ? 'r' : ''}`}
            </p>
            <button
              onClick={loadAllSeries}
              className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
            >
              <RefreshCw size={13} className={loadingSeries ? 'animate-spin' : ''} />
            </button>
          </div>

          {loadingSeries ? (
            <div className="flex justify-center py-12">
              <Loader2 size={20} className="animate-spin text-white/30" />
            </div>
          ) : allSeries.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Layers size={32} className="text-white/15 mx-auto" />
              <p className="text-white/30 text-sm">Ingen serier ennå</p>
              <button
                onClick={() => setActiveTab('new')}
                className="px-5 py-2.5 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/20 rounded-xl text-teal-400 text-sm font-semibold transition-all"
              >
                Lag din første serie
              </button>
            </div>
          ) : (
            allSeries.map(s => (
              <SeriesCard
                key={s.id}
                series={s}
                episodes={[]}
                onDelete={handleDelete}
                onStartProduction={handleStartProduction}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
