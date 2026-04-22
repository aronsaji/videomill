import { useMemo, useState } from 'react';
import { Bot, TrendingUp, DollarSign, Shield, MessageSquare, RefreshCw, AlertTriangle, CheckCircle2, Lightbulb, Clock, Hash, Megaphone, Activity, Zap, Brain, Eye, Play, Music, ChevronDown, ChevronUp, Cpu, Radar, Upload, Captions } from 'lucide-react';
import { useAgentReports, useSocialResponses } from '../lib/hooks/uselivedata';
import { useLanguage } from '../contexts/languageContext';
import { PageHeader } from '../components/PageHeader';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/authContext';

const AGENT_CONFIG = {
  COO: {
    name: 'COO',
    title: 'Chief Operating Officer',
    icon: TrendingUp,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    accent: 'from-blue-500/20 to-cyan-500/10',
    description: 'Operasjoner, effektivitet og produksjons-KPIer',
    schedule: 'Daglig kl 02:00',
  },
  CFO: {
    name: 'CFO',
    title: 'Chief Financial Officer',
    icon: DollarSign,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    accent: 'from-emerald-500/20 to-green-500/10',
    description: 'Økonomi, ROI og kostnadsanalyse',
    schedule: 'Daglig kl 02:00',
  },
  Marketing: {
    name: 'Marketing',
    title: 'Marketing Director',
    icon: Megaphone,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    accent: 'from-purple-500/20 to-pink-500/10',
    description: 'Trender, content-strategi og hashtags',
    schedule: 'Hver 4. time',
  },
  CISO: {
    name: 'CISO',
    title: 'Chief Security Officer',
    icon: Shield,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    accent: 'from-red-500/20 to-orange-500/10',
    description: 'Sikkerhet og ISO 27001 compliance',
    schedule: 'Hver time',
  },
  ErrorFixer: {
    name: 'Error Fixer',
    title: 'Auto-Error Resolution',
    icon: Zap,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    accent: 'from-amber-500/20 to-yellow-500/10',
    description: 'Auto-retter feilede videoer',
    schedule: 'Hver 15. min',
  },
  SocialResponse: {
    name: 'Social Response',
    title: 'Social Media Agent',
    icon: MessageSquare,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    accent: 'from-cyan-500/20 to-blue-500/10',
    description: 'Svarer automatisk på kommentarer og DMs',
    schedule: 'Ved webhook',
  },
  Watchdog: {
    name: 'Watchdog',
    title: 'Video Failure Monitor',
    icon: Radar,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    accent: 'from-orange-500/20 to-red-500/10',
    description: 'Oppdager og starter feilede videoer på nytt automatisk',
    schedule: 'Hvert 10. min',
  },
  TrendHunter: {
    name: 'Trend Hunter',
    title: 'Auto Content Planner',
    icon: Eye,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    accent: 'from-violet-500/20 to-purple-500/10',
    description: 'Finner trending topics og bestiller nye videoer automatisk',
    schedule: 'Daglig kl 06:00',
  },
  Publisher: {
    name: 'Publisher',
    title: 'Auto YouTube Uploader',
    icon: Upload,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    accent: 'from-rose-500/20 to-pink-500/10',
    description: 'Laster opp ferdige videoer til YouTube og TikTok',
    schedule: 'Etter ferdig produksjon',
  },
};

function AgentSummaryCard({ agentKey, config, latestReport, enabled, onToggle, onTrigger }: {
  agentKey: string; config: any; latestReport?: any;
  enabled: boolean; onToggle: (key: string, val: boolean) => void; onTrigger: (key: string) => void;
}) {
  const Icon = config.icon;
  const hasData = !!latestReport;
  const [triggering, setTriggering] = useState(false);

  const handleTrigger = async () => {
    setTriggering(true);
    await onTrigger(agentKey);
    setTimeout(() => setTriggering(false), 2000);
  };

  return (
    <div className={`relative overflow-hidden ${config.bg} border ${config.border} rounded-2xl p-5 hover:border-white/20 transition-all group`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${config.accent} opacity-50`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${config.bg} border ${config.border}`}>
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <h3 className={`font-bold ${config.color}`}>{config.name}</h3>
              <p className="text-xs text-white/40">{config.title}</p>
            </div>
          </div>
          {/* Toggle on/off */}
          <button
            onClick={() => onToggle(agentKey, !enabled)}
            className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 ${enabled ? 'bg-teal-500' : 'bg-white/10'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${enabled ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>

        <p className="text-sm text-white/60 mb-3">{config.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${hasData ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/30'}`}>
              <Activity size={10} />
              {enabled ? (hasData ? 'Aktiv' : 'Venter') : 'Pauset'}
            </div>
            <div className="flex items-center gap-1 text-xs text-white/30">
              <Clock size={10} /> {config.schedule}
            </div>
          </div>
          {/* Manual trigger */}
          <button
            onClick={handleTrigger}
            disabled={triggering || !enabled}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all disabled:opacity-40 ${config.border} ${config.color} hover:bg-white/5`}
          >
            {triggering ? <><RefreshCw size={10} className="animate-spin" /> Kjører</> : <><Zap size={10} /> Kjør nå</>}
          </button>
        </div>

        {latestReport && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-white/50 line-clamp-2">
              {latestReport.report || latestReport.financial_summary || latestReport.content_strategy || latestReport.security_status || 'Ingen data'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function AgentDetailCard({ report, config }: { report: any; config: any }) {
  const Icon = config.icon;
  
  return (
    <div className={`${config.bg} border ${config.border} rounded-xl p-4`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2 rounded-lg ${config.bg}`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${config.color}`}>{config.name}</h3>
          <p className="text-xs text-white/40">{config.title}</p>
        </div>
        <span className="text-xs text-white/30">
          {new Date(report.created_at).toLocaleString('nb-NO', { 
            hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' 
          })}
        </span>
      </div>

      <p className="text-sm text-white/80 mb-3 line-clamp-3">
        {report.report || report.financial_summary || report.content_strategy || report.security_status || report.message || 'Ingen data'}
      </p>

      {report.recommendations && report.recommendations.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-white/40 mb-1.5 flex items-center gap-1">
            <Lightbulb className="w-3 h-3" /> Anbefalinger
          </p>
          <div className="flex flex-wrap gap-1">
            {report.recommendations.slice(0, 3).map((r: string, i: number) => (
              <span key={i} className="text-xs bg-white/5 px-2 py-1 rounded text-white/60">{r}</span>
            ))}
          </div>
        </div>
      )}

      {report.alerts && report.alerts.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-orange/40 mb-1.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Varsler
          </p>
          <div className="flex flex-wrap gap-1">
            {report.alerts.slice(0, 2).map((a: string, i: number) => (
              <span key={i} className="text-xs bg-orange/10 px-2 py-1 rounded text-orange">{a}</span>
            ))}
          </div>
        </div>
      )}

      {report.hashtag_suggestions && report.hashtag_suggestions.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-white/40 mb-1.5 flex items-center gap-1">
            <Hash className="w-3 h-3" /> Hashtags
          </p>
          <div className="flex flex-wrap gap-1">
            {report.hashtag_suggestions.slice(0, 5).map((h: string, i: number) => (
              <span key={i} className="text-xs bg-purple-500/10 px-2 py-1 rounded text-purple-300">#{h}</span>
            ))}
          </div>
        </div>
      )}

      {report.viral_tips && report.viral_tips.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-white/40 mb-1.5">Viral-tips</p>
          <div className="flex flex-wrap gap-1">
            {report.viral_tips.slice(0, 3).map((t: string, i: number) => (
              <span key={i} className="text-xs bg-green-500/10 px-2 py-1 rounded text-green-300">{t}</span>
            ))}
          </div>
        </div>
      )}

      {report.anomalies && report.anomalies.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-red/40 mb-1.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Anomalier
          </p>
          <div className="flex flex-wrap gap-1">
            {report.anomalies.slice(0, 3).map((a: string, i: number) => (
              <span key={i} className="text-xs bg-red-500/10 px-2 py-1 rounded text-red-300">{a}</span>
            ))}
          </div>
        </div>
      )}

      {report.risk_level && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-white/40">Risikonivå:</span>
          <span className={`text-xs px-2 py-1 rounded ${
            report.risk_level === 'low' ? 'bg-green-500/20 text-green-400' :
            report.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>{report.risk_level}</span>
        </div>
      )}
    </div>
  );
}

function SocialResponseCard({ response }: { response: any }) {
  return (
    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-medium text-cyan-400">Svar sendt</span>
        <span className="text-xs text-white/30 ml-auto">
          {new Date(response.created_at).toLocaleString('nb-NO')}
        </span>
      </div>
      {response.original_message && (
        <div className="mb-2">
          <p className="text-xs text-white/40">Original:</p>
          <p className="text-sm text-white/70 italic">"{response.original_message}"</p>
        </div>
      )}
      <div className="mt-2 pt-2 border-t border-cyan-500/20">
        <p className="text-xs text-cyan/40">Svar:</p>
        <p className="text-sm text-white">{response.message}</p>
      </div>
    </div>
  );
}

const PIPELINE_SNIPPETS = [
  {
    title: '🎵 Bakgrunnsmusikk — legg til etter "FFmpeg - Add Voiceover"',
    code: `const { execSync } = require('child_process');
const item = items[0].json;
const dir = \`/workspace/video_assets/\${item.video_id}\`;
const musicUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
try {
  execSync(\`wget -q -O \${dir}/music.mp3 "\${musicUrl}"\`, { shell: '/bin/bash', timeout: 30000 });
  execSync(\`ffmpeg -y -i \${dir}/final_16x9.mp4 -i \${dir}/music.mp3 -filter_complex "[1:a]volume=0.08[m];[0:a][m]amix=inputs=2:duration=first[a]" -map 0:v -map "[a]" -c:v copy -c:a aac \${dir}/final_music.mp4\`, { shell: '/bin/bash', timeout: 120000 });
  execSync(\`mv \${dir}/final_music.mp4 \${dir}/final_16x9.mp4\`, { shell: '/bin/bash' });
} catch(e) { console.log('Musikk hoppet over:', e.message); }
return [{ json: item }];`,
  },
  {
    title: '📝 Auto-undertekster — legg til etter musikk',
    code: `const { execSync } = require('child_process');
const item = items[0].json;
const dir = \`/workspace/video_assets/\${item.video_id}\`;
const scenes = item.scenes || [];
let srt = ''; let t = 0;
scenes.forEach((s, i) => {
  const dur = s.duration || 5;
  const ts = d => new Date(d*1000).toISOString().substr(11,12).replace('.',',');
  srt += \`\${i+1}\\n\${ts(t)} --> \${ts(t+dur)}\\n\${(s.narration||'').substring(0,80)}\\n\\n\`;
  t += dur;
});
try {
  require('fs').writeFileSync(\`\${dir}/subs.srt\`, srt);
  execSync(\`ffmpeg -y -i \${dir}/final_16x9.mp4 -vf "subtitles=\${dir}/subs.srt:force_style='FontSize=16,PrimaryColour=&Hffffff,OutlineColour=&H000000,Outline=2'" -c:a copy \${dir}/final_subs.mp4\`, { shell: '/bin/bash', timeout: 120000 });
  execSync(\`mv \${dir}/final_subs.mp4 \${dir}/final_16x9.mp4\`, { shell: '/bin/bash' });
} catch(e) { console.log('Undertekster hoppet over:', e.message); }
return [{ json: item }];`,
  },
  {
    title: '🤖 Kommentar-svar agent — ny workflow, Cron hvert 30. min',
    code: `const supabaseUrl = $env.SUPABASE_URL;
const supabaseKey = $env.SUPABASE_SERVICE_ROLE_KEY;
const groqKey = $env.GROQ_API_KEY;
const { data: comments } = await this.helpers.httpRequest({
  method: 'GET',
  url: supabaseUrl + '/rest/v1/comments?replied=eq.false&limit=10',
  headers: { apikey: supabaseKey, Authorization: 'Bearer ' + supabaseKey }, json: true
});
const results = [];
for (const c of (comments || [])) {
  const r = await this.helpers.httpRequest({
    method: 'POST', url: 'https://api.groq.com/openai/v1/chat/completions',
    headers: { Authorization: 'Bearer ' + groqKey, 'Content-Type': 'application/json' },
    body: { model: 'llama-3.1-8b-instant', messages: [
      { role: 'system', content: 'Svar kort og vennlig på norsk. Maks 2 setninger.' },
      { role: 'user',   content: 'Kommentar: ' + c.text }
    ], max_tokens: 100 }, json: true
  });
  const reply = r.choices?.[0]?.message?.content || '';
  await this.helpers.httpRequest({
    method: 'PATCH', url: supabaseUrl + '/rest/v1/comments?id=eq.' + c.id,
    headers: { apikey: supabaseKey, Authorization: 'Bearer ' + supabaseKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: { replied: true, reply_text: reply }, json: true
  });
  results.push({ id: c.id, reply });
}
return results.length ? results.map(r => ({ json: r })) : [{ json: { status: 'ingen nye kommentarer' } }];`,
  },
  {
    title: '🐕 Watchdog — ny workflow, Cron hvert 10. min',
    code: `const supabaseUrl = $env.SUPABASE_URL;
const supabaseKey = $env.SUPABASE_SERVICE_ROLE_KEY;
// Finn videoer som har stått "queued" eller "scripting" i mer enn 30 min
const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
const { data: stuck } = await this.helpers.httpRequest({
  method: 'GET',
  url: supabaseUrl + '/rest/v1/videos?status=in.(queued,scripting,recording)&updated_at=lt.' + cutoff + '&limit=5',
  headers: { apikey: supabaseKey, Authorization: 'Bearer ' + supabaseKey }, json: true
});
const results = [];
for (const v of (stuck || [])) {
  // Increment retry_count
  const retries = (v.retry_count || 0) + 1;
  if (retries > 3) {
    // Mark as failed after 3 attempts
    await this.helpers.httpRequest({
      method: 'PATCH', url: supabaseUrl + '/rest/v1/videos?id=eq.' + v.id,
      headers: { apikey: supabaseKey, Authorization: 'Bearer ' + supabaseKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: { status: 'failed', retry_count: retries }, json: true
    });
    results.push({ id: v.id, action: 'marked_failed' });
  } else {
    // Reset to queued for retry
    await this.helpers.httpRequest({
      method: 'PATCH', url: supabaseUrl + '/rest/v1/videos?id=eq.' + v.id,
      headers: { apikey: supabaseKey, Authorization: 'Bearer ' + supabaseKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: { status: 'queued', retry_count: retries }, json: true
    });
    results.push({ id: v.id, action: 'requeued', attempt: retries });
  }
  // Log to agent_logs
  await this.helpers.httpRequest({
    method: 'POST', url: supabaseUrl + '/rest/v1/agent_logs',
    headers: { apikey: supabaseKey, Authorization: 'Bearer ' + supabaseKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: { agent_id: 'watchdog', action: 'Stuck video oppdaget: ' + (v.title || v.id), status: 'ok', video_id: v.id }, json: true
  });
}
return results.length ? results.map(r => ({ json: r })) : [{ json: { status: 'ingen saker' } }];`,
  },
  {
    title: '🔭 Trend Hunter — ny workflow, Cron daglig kl 06:00',
    code: `const supabaseUrl = $env.SUPABASE_URL;
const supabaseKey = $env.SUPABASE_SERVICE_ROLE_KEY;
const groqKey = $env.GROQ_API_KEY;
// Hent top trending topics
const { data: trends } = await this.helpers.httpRequest({
  method: 'GET',
  url: supabaseUrl + '/rest/v1/trending_topics?active=eq.true&order=viral_score.desc&limit=3',
  headers: { apikey: supabaseKey, Authorization: 'Bearer ' + supabaseKey }, json: true
});
function makeUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}
const results = [];
for (const trend of (trends || [])) {
  const videoId = makeUUID();
  // Insert video order
  await this.helpers.httpRequest({
    method: 'POST', url: supabaseUrl + '/rest/v1/videos',
    headers: { apikey: supabaseKey, Authorization: 'Bearer ' + supabaseKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: { id: videoId, title: trend.title, topic: trend.title, status: 'queued', language: 'nb', platforms: ['youtube'], retry_count: 0, views: 0, progress: 0, captions_enabled: true }, json: true
  });
  results.push({ video_id: videoId, title: trend.title, viral_score: trend.viral_score });
}
return results.length ? results.map(r => ({ json: r })) : [{ json: { status: 'ingen trending topics' } }];`,
  },
  {
    title: '🎙️ ElevenLabs TTS — erstatt "Generate Voiceover"-noden',
    code: `const item = items[0].json;
const elevenKey = $env.ELEVENLABS_API_KEY;
const text = item.script || item.narration || '';
const voiceId = item.voice_id || 'pNInz6obpgDQGcFmaJgB'; // Adam (default)
if (!elevenKey || !text) return [{ json: item }];
const dir = \`/workspace/video_assets/\${item.video_id}\`;
const { execSync } = require('child_process');
// Call ElevenLabs API
const resp = await this.helpers.httpRequest({
  method: 'POST',
  url: \`https://api.elevenlabs.io/v1/text-to-speech/\${voiceId}\`,
  headers: { 'xi-api-key': elevenKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
  body: {
    text,
    model_id: 'eleven_multilingual_v2',
    voice_settings: { stability: 0.5, similarity_boost: 0.75 }
  },
  encoding: 'arraybuffer', json: false
});
const fs = require('fs');
fs.writeFileSync(\`\${dir}/voiceover.mp3\`, Buffer.from(resp));
return [{ json: { ...item, tts_provider: 'elevenlabs' } }];`,
  },
  {
    title: '📺 Auto YouTube-upload — legg til etter "Upload to Supabase Storage"',
    code: `const item = items[0].json;
const supabaseUrl = $env.SUPABASE_URL;
const supabaseKey = $env.SUPABASE_SERVICE_ROLE_KEY;
// Finn video_url fra metadata
const videoUrl = item.video_url_16x9 || item.video_url || item.final_url || '';
if (!videoUrl || !item.video_id) return [{ json: { ...item, youtube_skip: true } }];
// Sjekk om auto_publish er aktivert for bruker
const { data: settings } = await this.helpers.httpRequest({
  method: 'GET',
  url: supabaseUrl + '/rest/v1/user_settings?user_id=eq.' + item.user_id + '&select=auto_publish',
  headers: { apikey: supabaseKey, Authorization: 'Bearer ' + supabaseKey }, json: true
});
if (!settings?.[0]?.auto_publish) return [{ json: { ...item, youtube_skip: 'auto_publish disabled' } }];
// Kall youtube-upload edge function
const result = await this.helpers.httpRequest({
  method: 'POST',
  url: supabaseUrl.replace('/rest/v1','') + '/functions/v1/youtube-upload',
  headers: {
    'Content-Type': 'application/json',
    'X-Service-Key': $env.INTERNAL_SERVICE_KEY,
  },
  body: {
    user_id:     item.user_id,
    video_id:    item.video_id,
    video_url:   videoUrl,
    title:       item.title || item.topic || 'VideoMill Video',
    description: item.script?.substring(0, 500) || '',
    tags:        item.tags || [],
  }, json: true
});
return [{ json: { ...item, youtube_result: result } }];`,
  },
  {
    title: '📣 Promoterings-agent — ny workflow, trigger ved ferdig video',
    code: `const supabaseUrl = $env.SUPABASE_URL;
const supabaseKey = $env.SUPABASE_SERVICE_ROLE_KEY;
const groqKey = $env.GROQ_API_KEY;
const video = $('Webhook - Video Request').first().json.body;
const promo = await this.helpers.httpRequest({
  method: 'POST', url: 'https://api.groq.com/openai/v1/chat/completions',
  headers: { Authorization: 'Bearer ' + groqKey, 'Content-Type': 'application/json' },
  body: { model: 'llama-3.1-8b-instant', messages: [
    { role: 'system', content: 'Lag en kort og engasjerende promoteringstekst for en YouTube-video. Inkluder 5 relevante hashtags. Svar på norsk.' },
    { role: 'user',   content: 'Video tittel: ' + (video.title || video.topic) }
  ], max_tokens: 200 }, json: true
});
const promoText = promo.choices?.[0]?.message?.content || '';
await this.helpers.httpRequest({
  method: 'POST', url: supabaseUrl + '/rest/v1/agent_logs',
  headers: { apikey: supabaseKey, Authorization: 'Bearer ' + supabaseKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
  body: { agent_id: 'promoter', action: 'Promoteringstekst generert for: ' + (video.title || video.topic), status: 'ok', details: { text: promoText, video_id: video.video_id } },
  json: true
});
return [{ json: { promo_text: promoText, video_id: video.video_id } }];`,
  },
];

function PipelinePanel({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <div className="bg-[#0e0e18] border border-white/8 rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-teal-400" />
          <span className="text-sm font-bold text-white">Pipeline v6 — n8n kode-noder</span>
          <span className="text-[10px] bg-teal-500/15 text-teal-400 px-2 py-0.5 rounded-full font-bold">8 kode-noder</span>
        </div>
        {show ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
      </button>
      {show && (
        <div className="border-t border-white/6 p-4 space-y-4">
          <p className="text-xs text-white/40">Kopier og lim inn disse kodene som nye <strong className="text-white/60">Code-noder</strong> i n8n-pipelinen din:</p>
          {PIPELINE_SNIPPETS.map(s => (
            <div key={s.title} className="bg-[#070710] border border-white/6 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/6 bg-white/2">
                <p className="text-xs font-semibold text-white/70">{s.title}</p>
              </div>
              <pre className="p-4 text-[11px] text-teal-300/80 overflow-x-auto leading-relaxed whitespace-pre-wrap font-mono max-h-48">{s.code}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Agents() {
  const { user } = useAuth();
  const { data: reports, loading, refresh } = useAgentReports();
  const { data: socialResponses } = useSocialResponses();
  const { t } = useLanguage();
  const [agentEnabled, setAgentEnabled] = useState<Record<string, boolean>>({});
  const [showPipeline, setShowPipeline] = useState(false);

  const handleToggle = async (key: string, val: boolean) => {
    setAgentEnabled(prev => ({ ...prev, [key]: val }));
    if (user) {
      await supabase.from('agent_settings').upsert(
        { user_id: user.id, agent_id: key, enabled: val },
        { onConflict: 'user_id,agent_id' }
      );
    }
  };

  const handleTrigger = async (key: string) => {
    if (user) {
      await supabase.from('agent_logs').insert({ agent_id: key, action: 'Manuelt startet av bruker', status: 'ok' }).catch(() => {});
    }
  };

  const reportsByAgent = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    (reports ?? []).forEach(r => {
      const agent = r.agent ?? 'Unknown';
      if (!grouped[agent]) grouped[agent] = [];
      grouped[agent].push(r);
    });
    return grouped;
  }, [reports]);

  const latestByAgent = useMemo(() => {
    const latest: Record<string, any> = {};
    Object.entries(reportsByAgent).forEach(([agent, list]) => {
      if (list.length > 0) latest[agent] = list[0];
    });
    return latest;
  }, [reportsByAgent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Agenter"
        subtitle="Automatiserte executive assistenter"
        icon={Bot}
        onRefresh={refresh}
        loading={loading}
      />

      {/* Agent Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(AGENT_CONFIG).map(([key, config]) => (
          <AgentSummaryCard
            key={key}
            agentKey={key}
            config={config}
            latestReport={latestByAgent[key]}
            enabled={agentEnabled[key] !== false}
            onToggle={handleToggle}
            onTrigger={handleTrigger}
          />
        ))}
      </div>

      {/* Detailed Reports by Agent */}
      {Object.entries(AGENT_CONFIG).map(([key, config]) => {
        const agentReports = reportsByAgent[key] ?? [];
        if (agentReports.length === 0) return null;
        
        return (
          <div key={key}>
            <h2 className={`text-lg font-semibold ${config.color} mb-3 flex items-center gap-2`}>
              <config.icon className="w-5 h-5" />
              {config.name} Rapporter
              <span className="text-xs text-white/30 font-normal">
                ({agentReports.length})
              </span>
            </h2>
            <div className="grid gap-4">
              {agentReports.slice(0, 3).map((report) => (
                <AgentDetailCard key={report.id} report={report} config={config} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Social Responses */}
      <div>
        <h2 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Sosiale medier-svar
          <span className="text-xs text-white/30 font-normal">
            ({(socialResponses ?? []).length})
          </span>
        </h2>
        {(socialResponses ?? []).length === 0 ? (
          <p className="text-sm text-white/40">Ingen responser enda</p>
        ) : (
          <div className="grid gap-3">
            {(socialResponses ?? []).slice(0, 5).map((response) => (
              <SocialResponseCard key={response.id} response={response} />
            ))}
          </div>
        )}
      </div>

      {/* Pipeline v6 — n8n code snippets */}
      <PipelinePanel show={showPipeline} onToggle={() => setShowPipeline(v => !v)} />

      {/* Info Box */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h3 className="text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
          <Brain className="w-4 h-4 text-blue-400" />
          Agent Oversikt
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-blue-400" />
            <span><strong className="text-blue-400">COO</strong> - Daglig</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-3 h-3 text-emerald-400" />
            <span><strong className="text-emerald-400">CFO</strong> - Daglig</span>
          </div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-3 h-3 text-purple-400" />
            <span><strong className="text-purple-400">Marketing</strong> - 4t</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3 text-red-400" />
            <span><strong className="text-red-400">CISO</strong> - Hver time</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-amber-400" />
            <span><strong className="text-amber-400">Error Fixer</strong> - 15m</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-3 h-3 text-cyan-400" />
            <span><strong className="text-cyan-400">Social</strong> - Webhook</span>
          </div>
          <div className="flex items-center gap-2">
            <Radar className="w-3 h-3 text-orange-400" />
            <span><strong className="text-orange-400">Watchdog</strong> - 10m</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-3 h-3 text-violet-400" />
            <span><strong className="text-violet-400">Trend Hunter</strong> - Daglig</span>
          </div>
          <div className="flex items-center gap-2">
            <Upload className="w-3 h-3 text-rose-400" />
            <span><strong className="text-rose-400">Publisher</strong> - Auto</span>
          </div>
        </div>
      </div>
    </div>
  );
}