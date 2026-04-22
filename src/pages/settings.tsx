import { useState, useEffect } from 'react';
import {
  Zap, Globe, Bell, CheckCircle2, XCircle, TestTube, Save,
  ToggleLeft, ToggleRight, Youtube, Link2, AlertTriangle,
  Radio, ChevronDown, ChevronUp, Instagram, Mic, Music, Captions, Send,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/authContext';
import { useLanguage } from '../contexts/languageContext';
import { Language } from '../lib/i18n';

// ── Types ────────────────────────────────────────────────────────────────────

interface ChannelEntry {
  youtube?:   string;
  tiktok?:    string;
  instagram?: string;
}
type ChannelRoutes = Record<string, ChannelEntry>;

interface Settings {
  n8n_webhook_url:   string;
  n8n_enabled:       boolean;
  language:          string;
  auto_distribute:   boolean;
  ai_reply_enabled:  boolean;
  channel_routes:    ChannelRoutes;
  groq_api_key:      string;
  elevenlabs_api_key: string;
  auto_publish:      boolean;
  music_enabled:     boolean;
  captions_enabled:  boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CONTENT_LANGUAGES = [
  { code: 'nb', label: 'Norsk',     flag: '🇳🇴' },
  { code: 'en', label: 'English',   flag: '🇬🇧' },
  { code: 'ta', label: 'Tamil',     flag: '🇮🇳' },
  { code: 'es', label: 'Español',   flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch',   flag: '🇩🇪' },
  { code: 'fr', label: 'Français',  flag: '🇫🇷' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
];

const PLATFORMS: {
  key: keyof ChannelEntry;
  label: string;
  placeholder: string;
  color: string;
  icon: React.ReactNode;
}[] = [
  {
    key:         'youtube',
    label:       'YouTube',
    placeholder: 'Channel ID  (UCxxxxxxxxxxxx…)',
    color:       'text-red-400',
    icon:        <Youtube size={14} />,
  },
  {
    key:         'tiktok',
    label:       'TikTok',
    placeholder: '@handle',
    color:       'text-white/70',
    icon:        (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
      </svg>
    ),
  },
  {
    key:         'instagram',
    label:       'Instagram',
    placeholder: '@handle',
    color:       'text-pink-400',
    icon:        <Instagram size={14} />,
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="text-teal-400 hover:text-teal-300 transition-colors">
      {value ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-white/25" />}
    </button>
  );
}

function LanguageChannelCard({
  lang,
  entry,
  onChange,
}: {
  lang: (typeof CONTENT_LANGUAGES)[0];
  entry: ChannelEntry;
  onChange: (key: keyof ChannelEntry, val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const filled = PLATFORMS.filter(p => entry[p.key]?.trim()).length;
  const total  = PLATFORMS.length;

  return (
    <div className="border border-white/6 rounded-xl overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-white/2 hover:bg-white/4 transition-colors text-left"
      >
        <span className="text-xl leading-none">{lang.flag}</span>
        <span className="text-sm font-semibold text-white/80">{lang.label}</span>

        {/* Platform pills */}
        <div className="flex items-center gap-1.5 ml-2 flex-1">
          {PLATFORMS.map(p => {
            const val = entry[p.key]?.trim();
            return val ? (
              <span
                key={p.key}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400 border border-teal-500/20"
              >
                {p.label}
              </span>
            ) : null;
          })}
          {filled === 0 && (
            <span className="text-[10px] text-white/25">Ikke konfigurert</span>
          )}
        </div>

        {/* Counter + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {filled > 0 && (
            <span className="text-[10px] text-teal-400/70">
              {filled}/{total}
            </span>
          )}
          {open
            ? <ChevronUp size={14} className="text-white/30" />
            : <ChevronDown size={14} className="text-white/30" />}
        </div>
      </button>

      {/* Platform inputs */}
      {open && (
        <div className="px-4 py-4 space-y-3 bg-white/1 border-t border-white/5">
          {PLATFORMS.map(plat => (
            <div key={plat.key} className="flex items-center gap-3">
              {/* Icon + label */}
              <div className={`flex items-center gap-1.5 w-28 flex-shrink-0 ${plat.color}`}>
                {plat.icon}
                <span className="text-xs font-medium">{plat.label}</span>
              </div>

              {/* Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={entry[plat.key] ?? ''}
                  onChange={e => onChange(plat.key, e.target.value)}
                  placeholder={plat.placeholder}
                  className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-teal-500/40 transition-all font-mono"
                />
              </div>

              {/* Status dot */}
              <div className="w-5 flex-shrink-0 flex justify-center">
                {entry[plat.key]?.trim() ? (
                  <CheckCircle2 size={13} className="text-teal-400" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/15" />
                )}
              </div>
            </div>
          ))}

          <p className="text-[10px] text-white/25 pt-1 leading-relaxed">
            n8n bruker dette for å velge riktig kanal automatisk når en video med dette språket er klar.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Settings() {
  const { user }                    = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [settings, setSettings] = useState<Settings>({
    n8n_webhook_url:    '',
    n8n_enabled:        false,
    language:           'nb',
    auto_distribute:    true,
    ai_reply_enabled:   true,
    channel_routes:     {},
    groq_api_key:       '',
    elevenlabs_api_key: '',
    auto_publish:       false,
    music_enabled:      false,
    captions_enabled:   true,
  });
  const [loading,          setLoading]          = useState(true);
  const [saving,           setSaving]           = useState(false);
  const [saveMsg,          setSaveMsg]          = useState('');
  const [testing,          setTesting]          = useState(false);
  const [testResult,       setTestResult]       = useState<'success' | 'failed' | null>(null);
  const [testMessage,      setTestMessage]      = useState('');
  const [webhookVerified,  setWebhookVerified]  = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setSettings(prev => ({
            ...prev,
            ...data,
            channel_routes: (data.channel_routes as ChannelRoutes) ?? {},
          }));
        }
        setLoading(false);
      });
  }, [user]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveMsg('');
    setLanguage(settings.language as Language);

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id:         user.id,
        ...settings,
        channel_routes:  settings.channel_routes,
        updated_at:      new Date().toISOString(),
      });

    setSaving(false);
    if (!error) {
      setSaveMsg(t.settings.savedSuccess);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const handleChannelChange = (
    langCode: string,
    platform: keyof ChannelEntry,
    value: string,
  ) => {
    setSettings(prev => ({
      ...prev,
      channel_routes: {
        ...prev.channel_routes,
        [langCode]: {
          ...(prev.channel_routes[langCode] ?? {}),
          [platform]: value,
        },
      },
    }));
  };

  const isLocalhost = settings.n8n_webhook_url.includes('localhost') ||
                      settings.n8n_webhook_url.includes('127.0.0.1');

  const handleTestWebhook = async () => {
    if (!settings.n8n_webhook_url) return;
    setTesting(true);
    setTestResult(null);
    setTestMessage('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trigger-n8n`,
        {
          method:  'POST',
          headers: {
            Authorization:  `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'test', title: 'VideoMill Test', language: 'nb' }),
        }
      );
      const result = await resp.json();
      const ok = result.success === true;
      setTestResult(ok ? 'success' : 'failed');
      setTestMessage(result.message ?? result.error ?? '');
      if (ok) setWebhookVerified(true);
    } catch (err) {
      setTestResult('failed');
      setTestMessage(err instanceof Error ? err.message : 'Ukjent feil');
      setWebhookVerified(false);
    }
    setTesting(false);
    setTimeout(() => { setTestResult(null); setTestMessage(''); }, 8000);
  };

  // ── SQL migration hint ─────────────────────────────────────────────────────
  // Run once in Supabase SQL Editor:
  // ALTER TABLE user_settings
  //   ADD COLUMN IF NOT EXISTS channel_routes jsonb DEFAULT '{}'::jsonb;

  if (loading) {
    return <div className="flex items-center justify-center h-48 text-white/30 text-sm">{t.common.loading}</div>;
  }

  // Count total configured channels across all languages
  const totalChannels = Object.values(settings.channel_routes)
    .flatMap(e => Object.values(e))
    .filter(v => v?.trim()).length;

  return (
    <div className="max-w-2xl space-y-6">

      {/* ── n8n Integration ──────────────────────────────────────────────── */}
      <div className="bg-[#111118] border border-white/6 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-teal-500/15 flex items-center justify-center">
            <Zap size={17} className="text-teal-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">{t.settings.n8nIntegration}</h2>
            <p className="text-xs text-white/35 mt-0.5">{t.settings.n8nDescription}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {webhookVerified && settings.n8n_enabled ? (
              <div className="flex items-center gap-1.5 text-xs text-teal-400">
                <CheckCircle2 size={13} />{t.settings.connected}
              </div>
            ) : settings.n8n_webhook_url && settings.n8n_enabled ? (
              <div className="flex items-center gap-1.5 text-xs text-amber-400">
                <AlertTriangle size={13} />Ikke testet
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-white/30">
                <XCircle size={13} />{t.settings.notConnected}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-white/50 block mb-1.5">{t.settings.webhookUrl}</label>
            <input
              type="url"
              value={settings.n8n_webhook_url}
              onChange={e => setSettings(s => ({ ...s, n8n_webhook_url: e.target.value }))}
              placeholder={t.settings.webhookPlaceholder}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-teal-500/50 focus:bg-white/8 transition-all font-mono"
            />
            <p className="text-xs text-white/30 mt-1.5">{t.settings.webhookHelp}</p>

            {isLocalhost && (
              <div className="mt-3 flex items-start gap-3 p-4 bg-amber-500/8 border border-amber-500/25 rounded-xl">
                <AlertTriangle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-amber-400">localhost fungerer ikke i produksjon</p>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Supabase Edge Functions kjører i skyen og kan ikke nå din lokale maskin. Bruk n8n Cloud eller ngrok.
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-bold text-teal-400 mt-0.5 flex-shrink-0">ALT 1</span>
                      <p className="text-xs text-white/60">
                        <span className="font-semibold text-white/80">n8n Cloud</span> —{' '}
                        <a href="https://app.n8n.cloud" target="_blank" rel="noopener noreferrer" className="text-teal-400 underline">app.n8n.cloud</a>
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-bold text-teal-400 mt-0.5 flex-shrink-0">ALT 2</span>
                      <p className="text-xs text-white/60">
                        <span className="font-semibold text-white/80">ngrok</span> —{' '}
                        <code className="bg-white/8 px-1 rounded text-[10px]">ngrok http 5678</code>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isLocalhost && settings.n8n_webhook_url && !settings.n8n_webhook_url.startsWith('https://') && (
              <div className="mt-3 flex items-center gap-2 p-3 bg-red-500/8 border border-red-500/20 rounded-xl">
                <XCircle size={13} className="text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-300">URL må starte med <code className="bg-white/8 px-1 rounded">https://</code></p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between py-3 border-t border-white/5">
            <div>
              <p className="text-sm font-medium text-white/70">{t.settings.enableN8n}</p>
              <p className="text-xs text-white/30 mt-0.5">Webhook trigges ved produksjonsstart</p>
            </div>
            <Toggle value={settings.n8n_enabled} onChange={v => setSettings(s => ({ ...s, n8n_enabled: v }))} />
          </div>

          <div className="py-3 border-t border-white/5">
            <label className="text-xs font-medium text-white/50 block mb-1.5">
              Groq API-nøkkel <span className="text-teal-400/60 ml-1">— for Auto-Serie Studio</span>
            </label>
            <input
              type="password"
              value={settings.groq_api_key}
              onChange={e => setSettings(s => ({ ...s, groq_api_key: e.target.value }))}
              placeholder="gsk_..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-teal-500/50 focus:bg-white/8 transition-all font-mono"
            />
            <p className="text-xs text-white/30 mt-1.5">
              Hent gratis nøkkel på{' '}
              <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-teal-400 underline">
                console.groq.com
              </a>{' '}
              — brukes til AI-generering av episodelister i Auto-Serie Studio.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-teal-500/20"
            >
              <Save size={14} />
              {saving ? t.common.saving : t.common.save}
            </button>
            <button
              onClick={handleTestWebhook}
              disabled={!settings.n8n_webhook_url || testing}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/60 text-sm rounded-xl hover:bg-white/8 disabled:opacity-40 transition-all"
            >
              <TestTube size={14} />
              {testing ? t.settings.testing : t.settings.testWebhook}
            </button>
            {saveMsg && (
              <span className="flex items-center gap-1.5 text-sm text-teal-400">
                <CheckCircle2 size={13} /> {saveMsg}
              </span>
            )}
          </div>

          {testResult && (
            <div className={`flex items-start gap-2 p-3 rounded-xl border text-sm ${
              testResult === 'success'
                ? 'bg-teal-500/10 border-teal-500/20 text-teal-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {testResult === 'success'
                ? <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" />
                : <XCircle     size={14} className="flex-shrink-0 mt-0.5" />}
              <div>
                <p className="font-medium">
                  {testResult === 'success' ? t.settings.testSuccess : t.settings.testFailed}
                </p>
                {testMessage && <p className="text-xs mt-0.5 opacity-80">{testMessage}</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Kanal per språk ──────────────────────────────────────────────── */}
      <div className="bg-[#111118] border border-white/6 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center">
            <Radio size={17} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Kanal per språk</h2>
            <p className="text-xs text-white/35 mt-0.5">
              Knytt hvert innholdsspråk til riktig publiseringskanal
            </p>
          </div>
          {totalChannels > 0 && (
            <div className="ml-auto flex items-center gap-1.5 text-xs text-teal-400">
              <CheckCircle2 size={13} />
              {totalChannels} kanal{totalChannels > 1 ? 'er' : ''} koblet
            </div>
          )}
        </div>

        {/* SQL migration hint */}
        <div className="mb-4 flex items-start gap-3 p-3 bg-blue-500/6 border border-blue-500/15 rounded-xl">
          <AlertTriangle size={13} className="text-blue-400/70 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-white/30 leading-relaxed font-mono">
            Supabase SQL (kjør én gang):{' '}
            <span className="text-blue-300/60">
              ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS channel_routes jsonb DEFAULT '{'{'}{'}'}'::jsonb;
            </span>
          </p>
        </div>

        <div className="space-y-2">
          {CONTENT_LANGUAGES.map(lang => (
            <LanguageChannelCard
              key={lang.code}
              lang={lang}
              entry={settings.channel_routes[lang.code] ?? {}}
              onChange={(platform, value) => handleChannelChange(lang.code, platform, value)}
            />
          ))}
        </div>

        <p className="mt-4 text-xs text-white/25 leading-relaxed">
          n8n-pipelinen leser automatisk riktig kanal-ID når en video med det aktuelle
          innholdsspråket er ferdig produsert.
        </p>

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-teal-500/20"
          >
            <Save size={14} />
            {saving ? t.common.saving : 'Lagre kanaler'}
          </button>
          {saveMsg && (
            <span className="flex items-center gap-1.5 text-sm text-teal-400">
              <CheckCircle2 size={13} /> {saveMsg}
            </span>
          )}
        </div>
      </div>

      {/* ── UI Language ──────────────────────────────────────────────────── */}
      <div className="bg-[#111118] border border-white/6 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center">
            <Globe size={17} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">{t.settings.language}</h2>
            <p className="text-xs text-white/35 mt-0.5">{t.settings.selectLanguage}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {([
            { code: 'nb', label: 'Norsk Bokmål', flag: '🇳🇴' },
            { code: 'en', label: 'English',       flag: '🇬🇧' },
          ] as const).map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSettings(s => ({ ...s, language: lang.code }))}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                settings.language === lang.code
                  ? 'bg-teal-500/10 border-teal-500/25 text-teal-400'
                  : 'bg-white/3 border-white/6 text-white/50 hover:bg-white/5'
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className="text-sm font-medium">{lang.label}</span>
              {settings.language === lang.code && <CheckCircle2 size={14} className="ml-auto" />}
            </button>
          ))}
        </div>
      </div>

      {/* ── Preferences ──────────────────────────────────────────────────── */}
      <div className="bg-[#111118] border border-white/6 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-orange-500/15 flex items-center justify-center">
            <Bell size={17} className="text-orange-400" />
          </div>
          <h2 className="text-base font-semibold text-white">{t.settings.preferences}</h2>
        </div>

        <div className="space-y-1">
          {([
            { key: 'auto_distribute'  as const, label: t.settings.enableAutoDistribute, desc: 'Publiserer automatisk til alle tilkoblede plattformer' },
            { key: 'ai_reply_enabled' as const, label: t.settings.enableAiReply,         desc: 'AI svarer automatisk på enkle kommentarer' },
          ]).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-3.5 border-b border-white/5 last:border-b-0">
              <div>
                <p className="text-sm font-medium text-white/70">{label}</p>
                <p className="text-xs text-white/30 mt-0.5">{desc}</p>
              </div>
              <Toggle value={settings[key]} onChange={v => setSettings(s => ({ ...s, [key]: v }))} />
            </div>
          ))}
        </div>
      </div>

      {/* ── YouTube OAuth ─────────────────────────────────────────────────── */}
      <div className="bg-[#111118] border border-white/6 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center">
            <Youtube size={17} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">YouTube-tilkobling</h2>
            <p className="text-xs text-white/35 mt-0.5">Koble til din YouTube-kanal for automatisk publisering</p>
          </div>
          <div className="ml-auto">
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-medium">
              OAuth 2.0
            </span>
          </div>
        </div>

        {!import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
          <div className="flex items-start gap-3 p-4 bg-amber-500/8 border border-amber-500/20 rounded-xl">
            <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-400 mb-1">Konfigurasjon mangler</p>
              <p className="text-xs text-white/50">
                Sett <code className="bg-white/8 px-1 rounded font-mono">VITE_GOOGLE_CLIENT_ID</code> i miljøvariablene for å aktivere YouTube-tilkobling.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-white/55 leading-relaxed">
              Klikk «Koble til» for å gi VideoMill tilgang til å laste opp videoer til din YouTube-kanal.
            </p>
            <div className="flex items-center gap-3 p-4 bg-white/3 border border-white/6 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <Youtube size={15} className="text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">YouTube / YouTube Shorts</p>
                <p className="text-xs text-white/35 mt-0.5">Opplasting + lesetilgang til kanalen din</p>
              </div>
              <button
                onClick={() => {
                  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
                  const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback/youtube`);
                  const scope = encodeURIComponent([
                    'https://www.googleapis.com/auth/youtube.upload',
                    'https://www.googleapis.com/auth/youtube.readonly',
                    'https://www.googleapis.com/auth/userinfo.email',
                  ].join(' '));
                  const state = user?.id ?? '';
                  if (!state) { alert('Logg inn på nytt og prøv igjen.'); return; }
                  window.location.href =
                    `https://accounts.google.com/o/oauth2/v2/auth` +
                    `?client_id=${encodeURIComponent(clientId)}` +
                    `&redirect_uri=${redirectUri}` +
                    `&response_type=code` +
                    `&scope=${scope}` +
                    `&access_type=offline` +
                    `&include_granted_scopes=true` +
                    `&prompt=consent` +
                    `&state=${encodeURIComponent(state)}`;
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/15 border border-red-500/25 text-red-400 text-sm font-semibold rounded-xl hover:bg-red-500/25 transition-all"
              >
                <Link2 size={14} />
                Koble til
              </button>
            </div>
            <p className="text-xs text-white/25 leading-relaxed">
              Vi ber kun om tillatelse til opplasting og lesetilgang.
              Tilgangen kan trekkes tilbake når som helst via Google-kontoen din.
            </p>
          </div>
        )}
      </div>

      {/* ── AI Produksjon ────────────────────────────────────────────────── */}
      <div className="bg-[#111118] border border-white/6 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-teal-500/15 flex items-center justify-center">
            <Mic size={17} className="text-teal-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">AI Produksjon</h2>
            <p className="text-xs text-white/35 mt-0.5">Stemme, musikk, undertekster og auto-publisering</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* ElevenLabs */}
          <div>
            <label className="text-xs font-medium text-white/50 block mb-1.5 flex items-center gap-1.5">
              <Mic size={11} /> ElevenLabs API-nøkkel <span className="text-teal-400/60 ml-1">— premium AI-stemmer</span>
            </label>
            <input
              type="password"
              value={settings.elevenlabs_api_key}
              onChange={e => setSettings(s => ({ ...s, elevenlabs_api_key: e.target.value }))}
              placeholder="sk_..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-teal-500/50 focus:bg-white/8 transition-all font-mono"
            />
            <p className="text-xs text-white/30 mt-1.5">
              Hent nøkkel på{' '}
              <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-teal-400 underline">elevenlabs.io</a>
              {' '}— brukes til høykvalitets stemme i pipeline. Uten nøkkel brukes edge-tts (gratis).
            </p>
          </div>

          {/* Toggles */}
          <div className="space-y-1 pt-2 border-t border-white/5">
            {([
              { key: 'music_enabled'    as const, icon: <Music size={14} />,    label: 'Bakgrunnsmusikk',   desc: 'Legg til royalty-fri musikk i alle videoer automatisk' },
              { key: 'captions_enabled' as const, icon: <Captions size={14} />, label: 'Auto-undertekster', desc: 'Brenn inn undertekster via FFmpeg' },
              { key: 'auto_publish'     as const, icon: <Send size={14} />,     label: 'Auto-publisering',  desc: 'Publiser direkte til YouTube/TikTok når produksjon er ferdig' },
            ]).map(({ key, icon, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-3.5 border-b border-white/5 last:border-b-0">
                <div className="flex items-start gap-2.5">
                  <span className="text-teal-400/70 mt-0.5">{icon}</span>
                  <div>
                    <p className="text-sm font-medium text-white/70">{label}</p>
                    <p className="text-xs text-white/30 mt-0.5">{desc}</p>
                  </div>
                </div>
                <Toggle value={settings[key]} onChange={v => setSettings(s => ({ ...s, [key]: v }))} />
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-teal-500/20"
          >
            <Save size={14} />
            {saving ? t.common.saving : t.common.save}
          </button>
          {saveMsg && (
            <span className="flex items-center gap-1.5 text-sm text-teal-400">
              <CheckCircle2 size={13} /> {saveMsg}
            </span>
          )}
        </div>
      </div>

      {/* ── Bottom save ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-teal-500/20"
        >
          <Save size={15} />
          {saving ? t.common.saving : t.common.save}
        </button>
        {saveMsg && (
          <div className="flex items-center gap-2 text-sm text-teal-400">
            <CheckCircle2 size={14} />
            {saveMsg}
          </div>
        )}
      </div>
    </div>
  );
}
