import { useState, useEffect } from 'react';
import { CreditCard, Zap, Check, X, Crown, Star, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/authContext';
import { useLanguage } from '../contexts/languageContext';
import { useBilling } from '../lib/hooks/useBilling';

const PLANS = {
  subscription: [
    { name: 'Starter', price: 299, videos: 5, features: ['5 videoer/mnd', 'Grunnleggende AI', 'E-post support'] },
    { name: 'Pro', price: 599, videos: 15, features: ['15 videoer/mnd', 'Alle AI-agenter', 'Prioritet støtte'] },
    { name: 'Enterprise', price: 1999, videos: 999999, features: ['Ubegrenset', 'Alle funksjoner', 'Dedikert support'] },
  ],
  per_video: [
    { name: 'Standard', price: 149, time: '2 timer', features: ['HD kvalitet', 'Grunnleggende stemme'] },
    { name: 'Premium', price: 249, time: '1 time', features: ['4K kvalitet', 'Premium stemme'] },
    { name: 'Express', price: 399, time: '30 min', features: ['4K kvalitet', 'Premium stemme + musikk'] },
  ],
  credits: [
    { amount: 50, price: 500, discount: '10%' },
    { amount: 100, price: 900, discount: '18%' },
    { amount: 500, price: 3500, discount: '30%' },
  ],
};

const LABELS = {
  nb: {
    title: 'Abonnement & Betaling',
    current: 'Din plan',
    subscription: 'Månedlig abonnement',
    per_video: 'Per video',
    credits: 'Kjøp credits',
    active: 'Aktiv',
    paused: 'Pauset',
    expires: 'Utløper',
    videosLeft: 'Igjen denne måned',
    creditsLeft: 'Credits igjen',
    upgrade: 'Oppgrader',
    renew: 'Forny automatisk',
  },
  en: {
    title: 'Subscription & Billing',
    current: 'Your plan',
    subscription: 'Monthly subscription',
    per_video: 'Per video',
    credits: 'Buy credits',
    active: 'Active',
    paused: 'Paused',
    expires: 'Expires',
    videosLeft: 'Remaining this month',
    creditsLeft: 'Credits remaining',
    upgrade: 'Upgrade',
    renew: 'Auto-renew',
  },
};

export default function Billing() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { plans, credits, loading, getActivePlan, getTotalCredits, refresh } = useBilling();
  const lbl = language === 'en' ? LABELS.en : LABELS.nb;
  const [tab, setTab] = useState<'subscription' | 'per_video' | 'credits'>('subscription');

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <CreditCard size={24} className="text-teal-400" />
          {lbl.title}
        </h1>
      </div>

      {/* Current Plan */}
      <div className="bg-[#111118] border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">{lbl.current}</h2>
        {loading ? (
          <div className="animate-pulse h-20 bg-white/5 rounded-lg" />
        ) : getActivePlan() ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  getActivePlan()!.status === 'active' ? 'bg-teal-500/20 text-teal-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {getActivePlan()!.status === 'active' ? lbl.active : lbl.paused}
                </span>
                <span className="text-white/60 text-sm">{getActivePlan()!.plan_name}</span>
              </div>
              <p className="text-white/40 text-sm mt-1">
                {lbl.videosLeft}: {getActivePlan()!.videos_this_month} / {getActivePlan()!.videos_this_month + getActivePlan()!.credits_remaining}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{getActivePlan()!.price} kr</p>
              <p className="text-white/40 text-sm">/måned</p>
            </div>
          </div>
        ) : (
          <div className="text-white/40">Ingen aktiv plan</div>
        )}
      </div>

      {/* Credits */}
      {getTotalCredits() > 0 && (
        <div className="bg-[#111118] border border-amber-500/30 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{lbl.creditsLeft}</h2>
          <div className="flex items-center gap-3">
            <Sparkles size={24} className="text-amber-400" />
            <span className="text-3xl font-bold text-amber-400">{getTotalCredits()}</span>
            <span className="text-white/60">credits</span>
          </div>
        </div>
      )}

      {/* Plan Tabs */}
      <div className="border-b border-white/10">
        <div className="flex gap-6">
          {(['subscription', 'per_video', 'credits'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 px-1 text-sm font-medium transition-colors ${
                tab === t
                  ? 'text-teal-400 border-b-2 border-teal-400 -mb-px'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {t === 'subscription' ? lbl.subscription : t === 'per_video' ? lbl.per_video : lbl.credits}
            </button>
          ))}
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {PLANS[tab].map((plan: Record<string, unknown>, i: number) => (
          <div
            key={i}
            className={`bg-[#111118] border rounded-xl p-6 transition-all ${
              i === 1 ? 'border-teal-500/50 ring-1 ring-teal-500/20' : 'border-white/10 hover:border-white/20'
            }`}
          >
            {i === 1 && (
              <div className="flex items-center gap-1 text-xs text-teal-400 mb-2">
                <Star size={12} fill="currentColor" /> Most Popular
              </div>
            )}
            <h3 className="text-lg font-semibold text-white">{String(plan.name)}</h3>
            <div className="mt-2 mb-4">
              <span className="text-3xl font-bold text-white">{Number(plan.price)} kr</span>
              {tab === 'subscription' && <span className="text-white/40">/mnd</span>}
              {tab === 'per_video' && <span className="text-white/40">/video</span>}
            </div>
            <div className="space-y-2 mb-6">
              {plan.videos && <p className="text-white/60 text-sm">{Number(plan.videos)} videoer inkludert</p>}
              {plan.time && <p className="text-white/60 text-sm">Levering: {String(plan.time)}</p>}
              {plan.discount && <p className="text-teal-400 text-sm">{String(plan.discount)} rabatt</p>}
              {Array.isArray(plan.features) && plan.features.map((f: string, j: number) => (
                <div key={j} className="flex items-center gap-2 text-white/50 text-sm">
                  <Check size={14} className="text-teal-400" /> {f}
                </div>
              ))}
            </div>
            <button className="w-full py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 rounded-lg text-sm font-medium transition-colors">
              {lbl.upgrade}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}