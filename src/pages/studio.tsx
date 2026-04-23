import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/languageContext';
import { useAuth } from '../contexts/authContext';
import { supabase, createOrder } from '../lib/supabase';
import { 
  Zap, Play, Settings, FileText, Mic, Video, 
  Sparkles, CheckCircle, Loader2, Plus, Image 
} from 'lucide-react';
import Dropzone from '../components/Dropzone';
import PipelineStep from '../components/PipelineStep';

type PipelineStatus = 'pending' | 'active' | 'complete' | 'error';

interface PipelineState {
  script: PipelineStatus;
  voice: PipelineStatus;
  vision: PipelineStatus;
  render: PipelineStatus;
}

const DISPLAY_TOPICS = [
  { id: '1', title: 'AI News', platform: 'youtube', growth_stat: '+340%' },
  { id: '2', title: 'Tech Reviews', platform: 'youtube', growth_stat: '+220%' },
  { id: '3', title: 'Coding Tips', platform: 'tiktok', growth_stat: '+180%' },
  { id: '4', title: 'Productivity', platform: 'instagram', growth_stat: '+150%' },
  { id: '5', title: 'Daily Hacks', platform: 'tiktok', growth_stat: '+280%' },
];

export default function Studio() {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [mode, setMode] = useState<'radar' | 'factory'>('radar');
  const [generating, setGenerating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pipeline, setPipeline] = useState<PipelineState>({
    script: 'pending',
    voice: 'pending', 
    vision: 'pending',
    render: 'pending',
  });

  const startPipeline = async (topic: typeof DISPLAY_TOPICS[0]) => {
    if (!user || generating) return;

    setSelectedId(topic.id);
    setGenerating(true);
    setMode('factory');

    // Simulate pipeline progression
    const progressPipeline = async () => {
      setPipeline({ script: 'active', voice: 'pending', vision: 'pending', render: 'pending' });
      await new Promise(r => setTimeout(r, 1000));
      setPipeline({ script: 'complete', voice: 'pending', vision: 'pending', render: 'pending' });
      
      setPipeline(p => ({ ...p, voice: 'active' }));
      await new Promise(r => setTimeout(r, 1500));
      setPipeline(p => ({ ...p, voice: 'complete' }));
      
      setPipeline(p => ({ ...p, vision: 'active' }));
      await new Promise(r => setTimeout(r, 2000));
      setPipeline(p => ({ ...p, vision: 'complete' }));
      
      setPipeline(p => ({ ...p, render: 'active' }));
      await new Promise(r => setTimeout(r, 2500));
      setPipeline(p => ({ ...p, render: 'complete' }));
      
      setSuccess(true);
      setGenerating(false);
    };

    try {
      const { data: order, error } = await createOrder({
        user_id: user.id,
        topic: topic.title,
        title: topic.title.slice(0, 80),
        promp: `Lag en-engasjerende video om: ${topic.title}. ${topic.growth_stat || ''}`,
        platform: topic.platform || 'tiktok',
        language: 'nb',
        voice_id: 'XB0fDUnXU5powFXDhCwa',
        aspect_ratio: '9:16',
      });

      if (error) throw error;
      
      // Start visual pipeline
      await progressPipeline();
      
    } catch (err) {
      console.error(err);
      setPipeline({ script: 'error', voice: 'error', vision: 'error', render: 'error' });
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      {/* Neural Grid */}
      <div className="fixed inset-0 neural-grid opacity-20 pointer-events-none z-0" />
      
      {/* Header */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {mode === 'radar' ? 'Mission Control' : 'Factory Floor'}
            </h1>
            <p className="text-sm text-white/40 mt-1">
              {mode === 'radar' ? 'Velg et tema og start produksjon' : `Pipeline: ${success ? 'Complete' : generating ? 'Processing' : 'Ready'}`}
            </p>
          </div>
          
          {/* Mode Toggle */}
          <div className="flex bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setMode('radar')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'radar' ? 'bg-violet-500 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              Radar
            </button>
            <button
              onClick={() => setMode('factory')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'factory' ? 'bg-violet-500 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              Factory
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Topic Selection / Prompt Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dropzone for source image */}
          <Dropzone onUpload={(url) => console.log('Uploaded:', url)} />
          
          {/* Topic Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DISPLAY_TOPICS.map((topic) => {
              const isSelected = selectedId === topic.id;
              const isGenerating = generating && isSelected;
              const isDone = success && isSelected;

              return (
                <motion.button
                  key={topic.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => !success && startPipeline(topic)}
                  disabled={generating}
                  className={`glass-card p-4 text-left ${
                    isSelected ? 'border-violet-500/50' : ''
                  } ${(generating || success) ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isDone ? 'bg-teal-500' : isGenerating ? 'bg-violet-500' : 'bg-white/10'
                    }`}>
                      {isDone ? (
                        <CheckCircle size={18} className="text-white" />
                      ) : isGenerating ? (
                        <Loader2 size={18} className="text-white animate-spin" />
                      ) : (
                        <Sparkles size={18} className="text-white/50" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{topic.title}</h3>
                      <p className="text-xs text-white/40 mt-1">
                        {topic.platform} • {topic.growth_stat}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Create Custom Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full p-4 border-2 border-dashed border-white/10 rounded-xl text-white/40 hover:border-violet-500/50 hover:text-white/60 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            <span className="text-sm font-medium">Custom Prompt</span>
          </motion.button>
        </div>

        {/* Right: Live Pipeline */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white">Live Pipeline</h3>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${generating ? 'bg-teal-400 animate-pulse' : success ? 'bg-teal-400' : 'bg-white/20'}`} />
              <span className="text-xs text-white/40">
                {success ? 'Complete' : generating ? 'Running' : 'Ready'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <PipelineStep 
              icon={FileText} 
              label="Script Generation" 
              status={pipeline.script}
              progress={pipeline.script === 'active' ? 75 : 100}
            />
            <PipelineStep 
              icon={Mic} 
              label="Voiceover (TTS)" 
              status={pipeline.voice}
              progress={pipeline.voice === 'active' ? 60 : 100}
            />
            <PipelineStep 
              icon={Image} 
              label="Vision & Assets" 
              status={pipeline.vision}
              progress={pipeline.vision === 'active' ? 45 : 100}
            />
            <PipelineStep 
              icon={Video} 
              label="Render & Export" 
              status={pipeline.render}
              progress={pipeline.render === 'active' ? 30 : 100}
            />
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-white/40 mb-2">
              <span>Progress</span>
              <span>
                {pipeline.script === 'complete' ? 25 : 0 +
                pipeline.voice === 'complete' ? 25 : 0 +
                pipeline.vision === 'complete' ? 25 : 0 +
                pipeline.render === 'complete' ? 25 : 0}%
              </span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-teal-500"
                initial={{ width: 0 }}
                animate={{ width: 
                  (pipeline.script === 'complete' ? 25 : 0) +
                  (pipeline.voice === 'complete' ? 25 : 0) +
                  (pipeline.vision === 'complete' ? 25 : 0) +
                  (pipeline.render === 'complete' ? 25 : 0) + '%'
                }}
                transition={{ type: 'spring', stiffness: 30 }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}