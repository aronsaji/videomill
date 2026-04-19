import { useState } from 'react';
import { Plus, RefreshCw, AlertCircle, CheckCircle2, Clock, FileText, Mic, Scissors, ChevronDown, ChevronUp, Film, RotateCcw } from 'lucide-react';
import { Production as ProductionType, Page } from '../lib/types';
import { useProductions, updateVideoStatus } from '../lib/hooks/uselivedata';
import { useLanguage } from '../contexts/languageContext';
import { supabase } from '../lib/supabaseClient';
import StatusBadge from '../components/statusbadge';

const steps = [
  { key: 'queued',    labelNb: 'I kø',        labelEn: 'Queued',     icon: <Clock size={14} /> },
  { key: 'scripting', labelNb: 'Manus',        labelEn: 'Script',     icon: <FileText size={14} /> },
  { key: 'recording', labelNb: 'Innspilling',  labelEn: 'Recording',  icon: <Mic size={14} /> },
  { key: 'editing',   labelNb: 'Redigering',   labelEn: 'Editing',    icon: <Scissors size={14} /> },
  { key: 'complete',  labelNb: 'Ferdig',       labelEn: 'Done',       icon: <CheckCircle2 size={14} /> },
];

function getStepIndex(status: string) {
  return steps.findIndex(s => s.key === status);
}

interface CardProps {
  prod: ProductionType;
  lang: 'nb' | 'en';
}

function ProductionCard({ prod, lang }: CardProps) {
  const [expanded,  setExpanded]  = useState(false);
  const [retrying,  setRetrying]  = useState(false);
  const [retryMsg,  setRetryMsg]  = useState<{ ok: boolean; text: string } | null>(null);
  const stepIdx = getStepIndex(prod.status);

  const lbl = lang === 'en'
    ? { retry: 'Retry', retryOk: 'Sent back to production!', retryFail: 'Retry failed — re-order from Orders', id: 'Video ID', format: 'Format', substatus: 'Sub-status' }
    : { retry: 'Prøv på nytt', retryOk: 'Sendt til produksjon igjen!', retryFail: 'Retry feilet – re-bestill fra Bestilling-siden', id: 'Video-ID', format: 'Format', substatus: 'Sub-status' };

  const handleRetry = async () => {
    setRetrying(true);
    setRetryMsg(null);
    try {
      // 1. Fetch the full video row so we can re-send all fields to n8n
      const { data: videoRow } = await supabase
        .from('videos')
        .select('*')
        .eq('id', prod.id)
        .single();

      // 2. Reset status to queued
      await updateVideoStatus(prod.id, 'queued', 0);

      // 3. Re-trigger n8n with the full original payload
      const { data: { session } } = await supabase.auth.getSession();
      if (session && videoRow) {
        const n8nResp = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trigger-n8n`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action:          'retry',
              video_id:        prod.id,
              title:           videoRow.title ?? videoRow.topic ?? '',
              topic:           videoRow.topic ?? videoRow.title ?? '',
              language:        videoRow.language ?? 'nb',
              platform:        videoRow.platform ?? 'tiktok',
              promp:           videoRow.promp ?? '',
              voice_id:        videoRow.voice_id ?? '',
              aspect_ratio:    videoRow.aspect_ratio ?? '9:16',
              target_audience: videoRow.target_audience ?? null,
            }),
          }
        );
        if (!n8nResp.ok) throw new Error(`n8n ${n8nResp.status}`);
      }
      setRetryMsg({ ok: true, text: lbl.retryOk });
    } catch {
      setRetryMsg({ ok: false, text: lbl.retryFail });
    }
    setRetrying(false);
    setTimeout(() => setRetryMsg(null), 5000);
  };

  return (
    <div className={`bg-[#111118] border rounded-xl overflow-hidden transition-all ${
      prod.status === 'failed' ? 'border-red-500/20' : 'border-white/6 hover:border-white/10'
    }`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-white truncate">{prod.title}</h3>
              <StatusBadge status={prod.status} />
            </div>
            <p className="text-xs text-white/35">
              {lang === 'en' ? 'Started' : 'Startet'}{' '}
              {new Date(prod.created_at).toLocaleString(lang === 'en' ? 'en-GB' : 'nb-NO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              {prod.language && <><span className="mx-1.5 text-white/20">·</span>{prod.language.toUpperCase()}</>}
              {prod.target_audience && <><span className="mx-1.5 text-white/20">·</span>{prod.target_audience}</>}
            </p>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="text-white/30 hover:text-white/60 transition-colors p-1"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {prod.status !== 'failed' && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3 flex-wrap">
                {steps.map((step, i) => {
                  const done   = i < stepIdx || prod.status === 'complete';
                  const active = i === stepIdx && prod.status !== 'complete';
                  const label  = lang === 'en' ? step.labelEn : step.labelNb;
                  return (
                    <div key={step.key} className="flex items-center gap-2">
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                        done   ? 'text-teal-400 bg-teal-500/10' :
                        active ? 'text-white/80 bg-white/8'     :
                                 'text-white/20 bg-transparent'
                      }`}>
                        {done ? <CheckCircle2 size={11} className="text-teal-400" /> : step.icon}
                        {label}
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`h-px w-4 ${i < stepIdx || prod.status === 'complete' ? 'bg-teal-500/40' : 'bg-white/8'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
              <span className="text-xs font-bold text-white/60">{prod.progress}%</span>
            </div>
            <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-teal-500 to-cyan-400"
                style={{ width: `${prod.progress}%` }}
              />
            </div>
          </div>
        )}

        {prod.status === 'failed' && (
          <div className="mt-3 flex items-start gap-2 p-3 bg-red-500/8 border border-red-500/15 rounded-lg">
            <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-300/80">{prod.sub_status ?? (lang === 'en' ? 'Production failed — check n8n logs' : 'Produksjon feilet — sjekk n8n-logg')}</p>
          </div>
        )}
      </div>

      {expanded && (
        <div className="border-t border-white/5 px-5 py-4 bg-white/1.5">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-white/30 mb-1">{lbl.id}</p>
              <p className="text-white/60 font-mono truncate">{prod.id}</p>
            </div>
            <div>
              <p className="text-white/30 mb-1">{lbl.format}</p>
              <p className="text-white/60">{prod.aspect_ratio ?? '—'}</p>
            </div>
            <div>
              <p className="text-white/30 mb-1">{lbl.substatus}</p>
              <p className="text-white/60 font-mono">{prod.sub_status ?? '—'}</p>
            </div>
          </div>

          {prod.status === 'failed' && (
            <div className="mt-3 space-y-2">
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="px-3 py-1.5 bg-white/6 border border-white/10 text-white/60 text-xs rounded-lg hover:bg-white/10 disabled:opacity-40 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw size={12} className={retrying ? 'animate-spin' : ''} />
                {retrying ? (lang === 'en' ? 'Retrying...' : 'Prøver igjen...') : lbl.retry}
              </button>
              {retryMsg && (
                <p className={`text-xs flex items-center gap-1.5 ${retryMsg.ok ? 'text-teal-400' : 'text-red-400'}`}>
                  {retryMsg.ok ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                  {retryMsg.text}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface Props {
  onNavigate: (page: Page) => void;
}

export default function Production({ onNavigate }: Props) {
  const { t, language } = useLanguage();
  const { data: productions, loading } = useProductions();
  const [filter, setFilter] = useState<'all' | 'active' | 'complete' | 'failed'>('all');

  const filtered = productions.filter(p => {
    if (filter === 'all')      return true;
    if (filter === 'active')   return ['queued','scripting','recording','editing'].includes(p.status);
    if (filter === 'complete') return p.status === 'complete';
    if (filter === 'failed')   return p.status === 'failed';
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-white/4 p-1 rounded-xl border border-white/6">
          {([
            { key: 'all',      label: t.production.all       },
            { key: 'active',   label: t.production.active    },
            { key: 'complete', label: t.production.completed },
            { key: 'failed',   label: t.production.failed    },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === key ? 'bg-teal-500/20 text-teal-400 border border-teal-500/25' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => onNavigate('bestilling')}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-xl hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/20"
        >
          <Plus size={15} />
          {t.production.newProduction}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32 text-white/30 text-sm">{t.common.loading}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Film size={32} className="text-white/15 mx-auto mb-3" />
          <p className="text-white/30 text-sm">{t.production.noProductions}</p>
          <p className="text-white/20 text-xs mt-1">{t.production.startFromTrend}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((prod) => (
            <ProductionCard key={prod.id} prod={prod} lang={language as 'nb' | 'en'} />
          ))}
        </div>
      )}
    </div>
  );
}
