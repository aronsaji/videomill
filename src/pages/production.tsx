import { useState } from 'react';
import { Plus, RefreshCw, AlertCircle, CheckCircle2, Clock, FileText, Mic, Scissors, ChevronDown, ChevronUp, Film } from 'lucide-react';
import { Production as ProductionType } from '../lib/types';
import { useProductions } from '../lib/hooks/uselivedata';
import { useLanguage } from '../contexts/languageContext';
import StatusBadge from '../components/statusbadge';

const steps = [
  { key: 'queued', label: 'I kø', icon: <Clock size={14} /> },
  { key: 'scripting', label: 'Manus', icon: <FileText size={14} /> },
  { key: 'recording', label: 'Innspilling', icon: <Mic size={14} /> },
  { key: 'editing', label: 'Redigering', icon: <Scissors size={14} /> },
  { key: 'complete', label: 'Ferdig', icon: <CheckCircle2 size={14} /> },
];

function getStepIndex(status: string) {
  return steps.findIndex(s => s.key === status);
}

function ProductionCard({ prod }: { prod: ProductionType }) {
  const [expanded, setExpanded] = useState(false);
  const stepIdx = getStepIndex(prod.status);

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
              Startet {new Date(prod.created_at).toLocaleString('nb-NO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              <span className="mx-1.5 text-white/20">·</span>
              {prod.language.toUpperCase()}
              <span className="mx-1.5 text-white/20">·</span>
              {prod.audience}
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
              <div className="flex items-center gap-3">
                {steps.map((step, i) => {
                  const done = i < stepIdx || prod.status === 'complete';
                  const active = i === stepIdx && prod.status !== 'complete';
                  return (
                    <div key={step.key} className="flex items-center gap-2">
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                        done ? 'text-teal-400 bg-teal-500/10' :
                        active ? 'text-white/80 bg-white/8' :
                        'text-white/20 bg-transparent'
                      }`}>
                        {done ? <CheckCircle2 size={11} className="text-teal-400" /> : step.icon}
                        {step.label}
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

        {prod.status === 'failed' && prod.error_message && (
          <div className="mt-3 flex items-start gap-2 p-3 bg-red-500/8 border border-red-500/15 rounded-lg">
            <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-300/80">{prod.error_message}</p>
          </div>
        )}
      </div>

      {expanded && (
        <div className="border-t border-white/5 px-5 py-4 bg-white/1.5">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-white/30 mb-1">Produksjons-ID</p>
              <p className="text-white/60 font-mono">{prod.id}</p>
            </div>
            <div>
              <p className="text-white/30 mb-1">Sist oppdatert</p>
              <p className="text-white/60">{new Date(prod.updated_at).toLocaleString('nb-NO')}</p>
            </div>
            <div>
              <p className="text-white/30 mb-1">Trend-ID</p>
              <p className="text-white/60 font-mono">{prod.trend_id ?? '—'}</p>
            </div>
          </div>
          {prod.status === 'failed' && (
            <button className="mt-3 px-3 py-1.5 bg-white/6 border border-white/10 text-white/60 text-xs rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1.5">
              <RefreshCw size={12} />
              Prøv på nytt
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Production() {
  const { t } = useLanguage();
  const { data: productions, loading } = useProductions();
  const [filter, setFilter] = useState<'all' | 'active' | 'complete' | 'failed'>('all');

  const filtered = productions.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['queued','scripting','recording','editing'].includes(p.status);
    if (filter === 'complete') return p.status === 'complete';
    if (filter === 'failed') return p.status === 'failed';
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-white/4 p-1 rounded-xl border border-white/6">
          {([
            { key: 'all', label: t.production.all },
            { key: 'active', label: t.production.active },
            { key: 'complete', label: t.production.completed },
            { key: 'failed', label: t.production.failed },
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
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-xl hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/20">
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
            <ProductionCard key={prod.id} prod={prod} />
          ))}
        </div>
      )}
    </div>
  );
}
