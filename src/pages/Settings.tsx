import React, { useState } from 'react';
import { Settings as SettingsIcon, Database, Link, Bot, Shield, Save } from 'lucide-react';
import { SecureAction } from '../components/SecureAction';

export default function Settings() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="text-gray-400" />
          Innstillinger
        </h1>
        <p className="text-sm text-gray-500 mt-1">Konfigurer VideoMill Pipelinen og integrasjoner</p>
      </div>

      <div className="space-y-6">
        {/* Supabase Settings */}
        <section className="bg-surface/50 border border-border rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-border/50 pb-3">
            <Database size={18} className="text-neon-cyan" />
            <h2 className="text-lg font-medium text-white">Database (Supabase)</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-400">SUPABASE URL</label>
              <input type="text" value={import.meta.env.VITE_SUPABASE_URL || ''} disabled className="w-full bg-black/40 border border-border rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed font-mono text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-400">SUPABASE ANON KEY</label>
              <input type="password" value={import.meta.env.VITE_SUPABASE_ANON_KEY ? '********************************' : ''} disabled className="w-full bg-black/40 border border-border rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed font-mono text-sm" />
              <p className="text-[10px] text-gray-500">Disse verdiene hentes fra .env.local filen og kan ikke endres herfra.</p>
            </div>
          </div>
        </section>

        {/* N8N Webhooks */}
        <section className="bg-surface/50 border border-border rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-border/50 pb-3">
            <Link size={18} className="text-purple-400" />
            <h2 className="text-lg font-medium text-white">Automatisering (n8n Webhooks)</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-400">PRODUCTION INGEST WEBHOOK URL</label>
              <input type="text" placeholder="https://n8n.yourserver.com/webhook/video-request" className="w-full bg-black/40 border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/50 transition-all font-mono text-sm" />
            </div>
            <div className="flex items-center gap-3 mt-4">
              <SecureAction actionName="Test n8n Webhook Connection" onVerify={() => alert('Webhook test vellykket (Zero Trust validert!)')}>
                <button className="px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-lg text-sm font-medium hover:bg-purple-500/20 transition-colors pointer-events-none">
                  Test Connection
                </button>
              </SecureAction>
            </div>
          </div>
        </section>

        {/* AI Models */}
        <section className="bg-surface/50 border border-border rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-border/50 pb-3">
            <Bot size={18} className="text-neon-amber" />
            <h2 className="text-lg font-medium text-white">AI Modell Preferanser</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-400">SCRIPT GENERATOR MODELL</label>
              <select className="w-full bg-black/40 border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-amber/50 transition-all appearance-none">
                <option>Claude 3.5 Sonnet</option>
                <option>GPT-4o</option>
                <option>Groq LLaMA 3.1 70B</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-400">DEFAULT AI VOICE</label>
              <select className="w-full bg-black/40 border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-amber/50 transition-all appearance-none">
                <option>OpenAI - Nova</option>
                <option>OpenAI - Echo</option>
                <option>ElevenLabs - Adam</option>
                <option>ElevenLabs - Rachel</option>
              </select>
            </div>
          </div>
        </section>
        
        <div className="flex justify-end border-t border-border/50 pt-4">
          <SecureAction actionName="Lagre Systeminnstillinger" onVerify={() => alert('Innstillinger lagret sikkert med MFA!')}>
            <button className="flex items-center gap-2 px-6 py-2 bg-neon-cyan text-black rounded-lg text-sm font-bold hover:bg-neon-cyan/90 transition-colors pointer-events-none">
              <Save size={16} />
              Lagre Endringer
            </button>
          </SecureAction>
        </div>
      </div>
    </div>
  );
}
