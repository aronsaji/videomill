import { usePipelineStore } from '../store/pipelineStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Play, ArrowUpRight, Flame, CheckCircle2, Clock, AlertTriangle, Loader, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Order, OrderStatus } from '../types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  queued:           { label: 'Queued',           color: 'text-gray-400',      bg: 'bg-gray-400/10 border-gray-400/20',      icon: Clock },
  script_generation:{ label: 'Scripting',         color: 'text-blue-400',      bg: 'bg-blue-400/10 border-blue-400/20',      icon: Loader },
  rendering:        { label: 'Rendering',          color: 'text-neon-cyan',     bg: 'bg-neon-cyan/10 border-neon-cyan/20',    icon: Loader },
  uploading:        { label: 'Uploading',          color: 'text-purple-400',    bg: 'bg-purple-400/10 border-purple-400/20',  icon: Loader },
  published:        { label: 'Published',          color: 'text-green-400',     bg: 'bg-green-400/10 border-green-400/20',    icon: CheckCircle2 },
  analyzing:        { label: 'Analyzing',          color: 'text-neon-amber',    bg: 'bg-neon-amber/10 border-neon-amber/20',  icon: Loader },
  optimizing:       { label: 'Optimizing',         color: 'text-pink-400',      bg: 'bg-pink-400/10 border-pink-400/20',      icon: Loader },
  failed:           { label: 'Failed',             color: 'text-red-400',       bg: 'bg-red-400/10 border-red-400/20',        icon: AlertTriangle },
  needs_attention:  { label: 'Needs Attention',    color: 'text-neon-amber',    bg: 'bg-neon-amber/10 border-neon-amber/20',  icon: AlertTriangle },
};

import React, { useState } from 'react';

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs px-2 py-1 rounded border ${cfg.color} ${cfg.bg}`}>
      <Icon size={11} className={status !== 'queued' && status !== 'published' && status !== 'failed' && status !== 'needs_attention' ? 'animate-spin' : ''} />
      {cfg.label}
    </span>
  );
}

function PipelineStage({ step, label, status, detail }: { step: number; label: string; status: 'done' | 'active' | 'pending'; detail?: string }) {
  return (
    <div className={`flex items-center gap-4 p-3 rounded-lg border transition-all duration-500 ${
      status === 'active' ? 'border-neon-cyan/40 bg-neon-cyan/5 shadow-[0_0_20px_rgba(0,245,255,0.05)]' :
      status === 'done' ? 'border-green-500/30 bg-green-500/5' :
      'border-border bg-black/20'
    }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 ${
        status === 'active' ? 'bg-neon-cyan text-background' :
        status === 'done' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
        'bg-white/5 text-gray-600 border border-border'
      }`}>
        {status === 'active' ? <span className="animate-pulse">{step}</span> : status === 'done' ? '✓' : step}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-mono font-medium ${
          status === 'active' ? 'text-neon-cyan' : status === 'done' ? 'text-green-400' : 'text-gray-600'
        }`}>{label}</p>
        {detail && <p className="text-xs text-gray-500 mt-0.5 truncate">{detail}</p>}
      </div>
      {status === 'active' && <div className="w-2 h-2 rounded-full bg-neon-cyan animate-ping flex-shrink-0" />}
    </div>
  );
}

function getStageStatus(order: Order, stageIndex: number): 'done' | 'active' | 'pending' {
  const stages: OrderStatus[] = ['queued', 'script_generation', 'rendering', 'uploading', 'published'];
  const currentIndex = stages.indexOf(order.status);
  if (stageIndex < currentIndex) return 'done';
  if (stageIndex === currentIndex) return 'active';
  return 'pending';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { orders, trends, addOrder } = usePipelineStore();
  const [orderingId, setOrderingId] = useState<string | null>(null);
  const [trendLanguage, setTrendLanguage] = useState('Norsk');

  const handleQuickOrder = (trend: any) => {
    if (orderingId) return;
    setOrderingId(trend.id);
    setTimeout(() => {
      addOrder({
        title: trend.title,
        topic: trend.tags[0] || 'Trend',
        platform_destinations: ['tiktok', 'youtube'],
        language: trendLanguage,
      });
      setOrderingId(null);
    }, 1500);
  };

  const activeOrder = orders.find(o => ['script_generation', 'rendering', 'uploading'].includes(o.status)) || orders[0];
  const recentOrders = orders.slice(0, 8);

  const stats = {
    queued: orders.filter(o => o.status === 'queued').length,
    processing: orders.filter(o => ['script_generation', 'rendering', 'uploading'].includes(o.status)).length,
    published: orders.filter(o => o.status === 'published').length,
    failed: orders.filter(o => o.status === 'failed' || o.status === 'needs_attention').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Factory Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Non-stop viral content engine — live production overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'In Queue', value: stats.queued, color: 'text-gray-400', border: 'border-gray-400/20' },
          { label: 'Processing', value: stats.processing, color: 'text-neon-cyan', border: 'border-neon-cyan/20' },
          { label: 'Published', value: stats.published, color: 'text-green-400', border: 'border-green-500/20' },
          { label: 'Failed', value: stats.failed, color: 'text-red-400', border: 'border-red-500/20' },
        ].map(stat => (
          <div key={stat.label} className={`bg-surface/50 border ${stat.border} rounded-xl p-4 backdrop-blur-sm`}>
            <p className="text-xs font-mono text-gray-500 uppercase">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Live Production Panel */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-surface/50 border border-border rounded-xl p-6 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-neon-cyan via-blue-500 to-purple-600" />
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-mono text-sm text-gray-400 uppercase flex items-center gap-2">
                  <Activity size={15} className="text-neon-cyan" />
                  Live Production Line
                </h2>
                {activeOrder && (
                  <div className="mt-2">
                    <h3 className="text-lg font-bold text-white">{activeOrder.title}</h3>
                    <p className="text-xs text-neon-cyan font-mono mt-0.5">{activeOrder.video_id} // {activeOrder.platform_destinations.join(' + ').toUpperCase()}</p>
                  </div>
                )}
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 rounded-lg font-mono text-xs uppercase transition-colors">
                <Play size={12} />
                Force Start
              </button>
            </div>

            {activeOrder ? (
              <div className="space-y-2">
                <PipelineStage step={1} label="TREND INGESTION" status={getStageStatus(activeOrder, 0)} detail="RSS + Google Trends" />
                <PipelineStage step={2} label="AI SCRIPTING" status={getStageStatus(activeOrder, 1)} detail={activeOrder.status === 'script_generation' ? activeOrder.sub_status || '' : ''} />
                <PipelineStage step={3} label="VIDEO RENDERING" status={getStageStatus(activeOrder, 2)} detail={activeOrder.status === 'rendering' ? activeOrder.sub_status || '' : 'Edge-TTS + FFmpeg'} />
                <PipelineStage step={4} label="DISTRIBUTION" status={getStageStatus(activeOrder, 3)} detail="Upload to platforms" />
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600 font-mono text-sm">
                WAITING FOR NEW TREND SIGNAL...
              </div>
            )}

            {/* Progress Bar */}
            {activeOrder && (
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-gray-500">
                  <span>Progress</span>
                  <span className="text-neon-cyan">{activeOrder.progress}%</span>
                </div>
                <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-neon-cyan to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${activeOrder.progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Order Queue */}
          <div className="bg-surface/50 border border-border rounded-xl p-6 backdrop-blur-sm">
            <h2 className="font-mono text-sm text-gray-400 uppercase mb-4">Production Queue</h2>
            <div className="space-y-1">
              <AnimatePresence>
                {recentOrders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between py-3 px-2 border-b border-border/50 hover:bg-white/3 rounded transition-colors cursor-pointer group"
                  >
                    <div className="min-w-0 flex-1 mr-4">
                      <p className="text-sm text-gray-200 font-medium truncate group-hover:text-white transition-colors">{order.title}</p>
                      <p className="text-xs font-mono text-gray-600 mt-0.5">{order.video_id} · {new Date(order.created_at).toLocaleTimeString('nb-NO')}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {order.status === 'failed' && order.error_type && (
                        <span className="text-xs font-mono text-gray-600">{order.error_type}</span>
                      )}
                      <StatusBadge status={order.status} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Trend Radar Sidebar */}
        <div className="bg-surface/50 border border-border rounded-xl p-6 backdrop-blur-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-mono text-sm text-gray-400 uppercase flex items-center gap-2">
              <Flame size={15} className="text-neon-amber" />
              Top Trend Radar
            </h2>
            <span className="text-xs font-mono bg-neon-amber/10 text-neon-amber border border-neon-amber/20 px-2 py-0.5 rounded">
              LIVE
            </span>
          </div>

          <div className="mb-4">
            <div className="flex gap-2">
              {['Norsk', 'Engelsk', 'Svensk'].map(lang => (
                <button
                  key={lang}
                  onClick={() => setTrendLanguage(lang)}
                  className={`flex-1 px-2 py-1.5 text-[10px] font-bold rounded border transition-all uppercase ${
                    trendLanguage === lang 
                      ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(0,245,255,0.1)]'
                      : 'bg-black/40 border-border text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <AnimatePresence>
              {[...trends].sort((a, b) => b.viral_score - a.viral_score).slice(0, 6).map((trend, i) => (
                <motion.div
                  key={trend.id}
                  onClick={() => handleQuickOrder(trend)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-3 border border-border rounded-lg bg-black/20 hover:border-neon-amber/40 transition-all group cursor-pointer relative"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-600">#{i + 1}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase ${
                        trend.source === 'tiktok' ? 'bg-pink-500/15 text-pink-400' :
                        trend.source === 'youtube' ? 'bg-red-500/15 text-red-400' :
                        'bg-blue-500/15 text-blue-400'
                      }`}>{trend.source === 'google' ? 'twitter' : trend.source}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-neon-amber font-mono text-xs bg-neon-amber/10 px-1.5 rounded">
                      <ArrowUpRight size={12} />
                      {trend.viral_score}%
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors line-clamp-1">{trend.title}</p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex flex-wrap gap-1">
                      {trend.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] font-mono bg-white/5 text-gray-500 px-1.5 py-0.5 rounded border border-white/5">#{tag}</span>
                      ))}
                    </div>
                    <button 
                      disabled={orderingId === trend.id}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-neon-cyan bg-neon-cyan/10 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100"
                    >
                      {orderingId === trend.id ? (
                        <><RefreshCw size={10} className="animate-spin" /> Sender...</>
                      ) : (
                        '1-Klikk Bestill'
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
