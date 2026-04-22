import { useState } from 'react';
import { useLanguage } from '../contexts/languageContext';
import { useAuth } from '../contexts/authContext';
import { supabase, createOrder } from '../lib/supabase';
import { clapperboard, check, loading } from 'lucide-react';

const DISPLAY_TOPICS = [
  { id: '1', title: 'AI News', platform: 'youtube', growth_stat: '+340%' },
  { id: '2', title: 'Tech Reviews', platform: 'youtube', growth_stat: '+220%' },
  { id: '3', title: 'Coding Tips', platform: 'tiktok', growth_stat: '+180%' },
  { id: '4', title: 'Productivity', platform: 'instagram', growth_stat: '+150%' },
  { id: '5', title: 'Daily Hacks', platform: 'tiktok', growth_stat: '+280%' },
];

export default function Studio() {
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCreate = async (topic: typeof DISPLAY_TOPICS[0]) => {
    if (!user || generating) return;

    setSelectedId(topic.id);
    setGenerating(true);

    try {
      const currentLang = 'nb';
      
      const { data: order, error } = await createOrder({
        user_id: user.id,
        topic: topic.title,
        title: topic.title.slice(0, 80),
        promp: `Lag en-engasjerende video om: ${topic.title}. ${topic.growth_stat || ''}`,
        platform: topic.platform || 'tiktok',
        language: currentLang,
        voice_id: 'XB0fDUnXU5powFXDhCwa',
        aspect_ratio: '9:16',
      });

      if (error) throw error;

      if (order) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trigger-n8n`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'new_order',
                video_id: order.id,
                title: topic.title,
                topic: topic.title,
                language: currentLang,
                platform: topic.platform || 'tiktok',
                promp: topic.title,
                voice_id: 'XB0fDUnXU5powFXDhCwa',
                aspect_ratio: '9:16',
              }),
            }
          );
        }
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.hash = 'library';
      }, 2000);

    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AI Video Studio</h1>
        <p className="text-white/50">Velg et tema og vi lager videoen for deg</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DISPLAY_TOPICS.map((topic) => {
          const isSelected = selectedId === topic.id;
          const isGenerating = generating && isSelected;
          const isDone = success && isSelected;

          return (
            <button
              key={topic.id}
              onClick={() => handleCreate(topic)}
              disabled={generating || success}
              className={`glass-card p-4 text-left hover-lift transition-all ${
                isSelected ? 'border-cyan-500/50' : ''
              } ${(generating || success) ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isDone ? 'bg-cyan-500' : generating ? 'bg-orange-500' : 'bg-white/10'
                }`}>
                  {isDone ? (
                    <check size={18} className="text-white" />
                  ) : isGenerating ? (
                    <loading size={18} className="text-white animate-spin" />
                  ) : (
                    <clapperboard size={18} className="text-white/50" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{topic.title}</h3>
                  <p className="text-xs text-white/40 mt-1">
                    {topic.platform} • {topic.growth_stat}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {(generating || success) && (
        <div className="mt-6 glass-card p-4 text-center">
          <p className="text-white/70">
            {success ? 'Videoen lages! Sjekk biblioteket straks.' : 'Lager video...'}
          </p>
        </div>
      )}
    </div>
  );
}