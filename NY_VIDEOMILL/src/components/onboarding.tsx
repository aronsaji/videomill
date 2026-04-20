import { useState, useEffect } from 'react';
import { 
  ArrowRight, Check, X, Play, Settings, 
  Zap, Globe, Music, Sparkles, Upload,
  ChevronRight, ChevronLeft, HelpCircle,
  Video, Mic, Wand2, Share2, BarChart3
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  icon: React.ReactNode;
  tips?: string[];
  tips_en?: string[];
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Velkommen til VideoMill',
    title_en: 'Welcome to VideoMill',
    description: 'Den NON-STOP Viral Engine som lager videoer 100% automatisk. Alt du trenger å gjøre er å velge et tema.',
    description_en: 'The NON-STOP Viral Engine that creates videos 100% automatically. All you need to do is choose a topic.',
    icon: <Zap size={24} />,
  },
  {
    id: 'trends',
    title: 'Trend-Radar',
    title_en: 'Trend Radar',
    description: 'Vi scanner kontinuerlig TikTok, YouTube og Google etter de heteste trendene. Velg en trend og la AI-en lage video for deg.',
    description_en: 'We continuously scan TikTok, YouTube and Google for the hottest trends. Choose a trend and let AI create the video for you.',
    icon: <Globe size={24} />,
    tips: [
      'Høy viral_score = høyere potensial for views',
      'Velg trender som matcher din niche',
      'Godkjente trender går til produksjon',
    ],
    tips_en: [
      'Higher viral_score = higher potential for views',
      'Choose trends that match your niche',
      'Approved trends go to production',
    ],
  },
  {
    id: 'production',
    title: 'AI-Produksjon',
    title_en: 'AI Production',
    description: 'Claude genererer manus, ElevenLabs lager stemme, og Pexels henter video. Hele prosessen er automatisert.',
    description_en: 'Claude generates script, ElevenLabs creates voice, and Pexels fetches video. The entire process is automated.',
    icon: <Video size={24} />,
    tips: [
      'Du kan legge til egne instruksjoner',
      'Velg format (9:16 for TikTok/Reels)',
      'Sett ønsket språk for stemmen',
    ],
    tips_en: [
      'You can add your own instructions',
      'Choose format (9:16 for TikTok/Reels)',
      'Set desired language for the voice',
    ],
  },
  {
    id: 'quality',
    title: 'Kvalitetsinnstillinger',
    title_en: 'Quality Settings',
    description: 'Juster videooppløsning, fps, stemme, bakgrunnsmusikk og teksting. Alt for optimal viral-effect.',
    description_en: 'Adjust video resolution, fps, voice, background music and captions. All for optimal viral effect.',
    icon: <Settings size={24} />,
    tips: [
      '1080p @ 30fps = beste balanse',
      'Velg stemme som matcher innholdet',
      'Viral Pop teksting = høyere engagement',
    ],
    tips_en: [
      '1080p @ 30fps = best balance',
      'Choose voice that matches content',
      'Viral Pop captioning = higher engagement',
    ],
  },
  {
    id: 'distribution',
    title: 'Auto-Distribusjon',
    title_en: 'Auto Distribution',
    description: 'Ferdig video publiseres automatisk til TikTok, YouTube Shorts og Instagram Reels basert på dine innstillinger.',
    description_en: 'Finished video is automatically published to TikTok, YouTube Shorts and Instagram Reels based on your settings.',
    icon: <Share2 size={24} />,
    tips: [
      'Koble til kontoer i Innstillinger',
      'Velg format per plattform',
      'Sett privat først, deretter publikum',
    ],
    tips_en: [
      'Connect accounts in Settings',
      'Choose format per platform',
      'Set private first, then public',
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics & Læring',
    title_en: 'Analytics & Learning',
    description: 'Track views, likes og engage. AI-en lærer av data og Optimaliserer fremtidige videoer.',
    description_en: 'Track views, likes and engage. AI learns from data and optimizes future videos.',
    icon: <BarChart3 size={24} />,
    tips: [
      'Se hvilke temaer gir mest views',
      'A/B test ulike åpninger',
      'Iterer basert på data',
    ],
    tips_en: [
      'See which topics give most views',
      'A/B test different openings',
      'Iterate based on data',
    ],
  },
];

interface OnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
  language?: 'nb' | 'en';
}

export default function Onboarding({ onComplete, onSkip, language = 'nb' }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const goNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsVisible(false);
      onComplete();
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkip();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 bg-[#0B0F1A] border border-white/10 rounded-2xl overflow-hidden">
        {/* Progress Bar */}
        <div className="h-1 bg-white/5">
          <div 
            className="h-full bg-cyan-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              {step.icon}
            </div>
            <span className="text-xs text-white/40">
              {currentStep + 1} / {ONBOARDING_STEPS.length}
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="p-2 text-white/40 hover:text-white/70 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              {language === 'nb' ? step.title : step.title_en}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              {language === 'nb' ? step.description : step.description_en}
            </p>
          </div>

          {/* Tips */}
          {step.tips && (
            <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle size={14} className="text-cyan-400" />
                <span className="text-xs font-medium text-cyan-400">Tips</span>
              </div>
              <ul className="space-y-2">
                {(language === 'nb' ? step.tips : step.tips_en || step.tips)?.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                    <Check size={12} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Feature Highlights */}
          {step.id === 'quality' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/5 rounded-xl">
                <Video size={18} className="text-cyan-400 mb-2" />
                <div className="text-xs text-white/80 font-medium">1080p @ 30fps</div>
                <div className="text-xs text-white/40">Optimal kvalitet</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <Mic size={18} className="text-cyan-400 mb-2" />
                <div className="text-xs text-white/80 font-medium">9+ stemmer</div>
                <div className="text-xs text-white/40">NB, EN, ES, DE</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <Music size={18} className="text-cyan-400 mb-2" />
                <div className="text-xs text-white/80 font-medium">Bakgrunnsmusikk</div>
                <div className="text-xs text-white/40">Auto-miks</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <Sparkles size={18} className="text-cyan-400 mb-2" />
                <div className="text-xs text-white/80 font-medium">Teksting</div>
                <div className="text-xs text-white/40">Viral Pop style</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-white/5">
          <button
            onClick={goBack}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
              currentStep === 0 
                ? 'text-white/20 cursor-not-allowed' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            <ChevronLeft size={16} />
            Forrige
          </button>

          <div className="flex items-center gap-2">
            {ONBOARDING_STEPS.map((_, i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStep 
                    ? 'bg-cyan-400 w-4' 
                    : i < currentStep 
                      ? 'bg-cyan-400/50' 
                      : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black rounded-lg text-sm font-medium hover:bg-cyan-400 transition-colors"
          >
            {currentStep === ONBOARDING_STEPS.length - 1 ? 'Kom i gang!' : 'Neste'}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function useOnboarding() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('vm_onboarding_seen');
    if (!saved) {
      setShowOnboarding(true);
      setHasSeenOnboarding(false);
    } else {
      setHasSeenOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('vm_onboarding_seen', 'true');
    setHasSeenOnboarding(true);
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    localStorage.setItem('vm_onboarding_seen', 'true');
    setHasSeenOnboarding(true);
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('vm_onboarding_seen');
    setShowOnboarding(true);
    setHasSeenOnboarding(false);
  };

  return {
    hasSeenOnboarding,
    showOnboarding,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
  };
}