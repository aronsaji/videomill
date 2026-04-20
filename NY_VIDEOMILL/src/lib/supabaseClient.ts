/**
 * supabaseClient.ts — VideoMill Sikker Supabase-klient
 *
 * Sikkerhetsmandat:
 *  - Singleton-mønster: én instans for hele applikasjonen
 *  - Miljøvariabler valideres ved oppstart — feiler tidlig, tydelig
 *  - Ingen sensitive verdier logges til konsollen (kun variabelnavn)
 *  - PKCE flow aktivert mot CSRF-angrep
 *  - Kompatibel med Vercel Edge og standard Node.js-miljøer
 *
 * Vite-miljø: klientkoden bruker import.meta.env.VITE_* (ikke process.env)
 * Hemmeligheter som SUPABASE_SERVICE_ROLE_KEY skal ALDRI ha VITE_-prefix
 * og skal kun brukes i Supabase Edge Functions via Deno.env.get()
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────
// Intern validering — eksponerer aldri verdier
// ─────────────────────────────────────────────
function resolveEnv(): { url: string; anonKey: string } {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  const missing: string[] = [];
  if (!url?.startsWith('https://')) missing.push('VITE_SUPABASE_URL');
  if (!anonKey || anonKey.length < 20) missing.push('VITE_SUPABASE_ANON_KEY');

  if (missing.length > 0) {
    // Kaster Error med variabelnavn — aldri med verdier
    throw new Error(
      `[VideoMill] Konfigurasjonsfeil: Manglende eller ugyldige miljøvariabler: ${missing.join(', ')}. ` +
      'Sjekk .env.local-filen og Vercel-innstillingene dine.'
    );
  }

  return { url: url as string, anonKey: anonKey as string };
}

// ─────────────────────────────────────────────
// Singleton-holder (module-scoped)
// ─────────────────────────────────────────────
let _instance: SupabaseClient | null = null;

/**
 * Returnerer den globale Supabase-singleton.
 * Første kall initialiserer klienten og validerer miljøvariabler.
 * Påfølgende kall returnerer cachet instans uten overhead.
 */
export function getSupabaseClient(): SupabaseClient {
  if (_instance !== null) return _instance;

  const { url, anonKey } = resolveEnv();

  _instance = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // PKCE (Proof Key for Code Exchange) beskytter mot CSRF og authorization-code interception
      flowType: 'pkce',
    },
    global: {
      headers: {
        // Brukes til telemetri og sporing i Supabase-dashbordet
        'X-Client-Info': 'videomill/2.0',
      },
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  return _instance;
}

/**
 * Pre-initialisert singleton — bruk denne i komponenter og hooks.
 * Import: import { supabase } from '@/lib/supabaseClient'
 */
export const supabase = getSupabaseClient();
