import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * trigger-n8n — Supabase Edge Function
 *
 * Sikkerhetsprinsipper:
 *  - Zero Trust: Alle forespørsler verifiseres mot Supabase Auth
 *  - CORS: Begrenset til ALLOWED_ORIGIN (settes via Supabase Secrets)
 *  - n8n-URL hentes fra brukerens user_settings (RLS-beskyttet) — ikke hardkodet
 *  - Ingen sensitiv data returneres i feilmeldinger
 */

// ─────────────────────────────────────────────
// CORS — Zero Trust: ingen wildcard
// ALLOWED_ORIGIN settes via: supabase secrets set ALLOWED_ORIGIN=https://din-app.vercel.app
// ─────────────────────────────────────────────
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "";

function buildCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const isAllowed = ALLOWED_ORIGIN && requestOrigin === ALLOWED_ORIGIN;
  return {
    "Access-Control-Allow-Origin": isAllowed ? ALLOWED_ORIGIN : "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
    "Vary": "Origin",
  };
}

Deno.serve(async (req: Request) => {
  const requestOrigin = req.headers.get("Origin");
  const corsHeaders = buildCorsHeaders(requestOrigin);

  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Kun POST tillatt
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // ── 1. Autentisering — verifiser JWT mot Supabase Auth ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── 2. Parse request body ──
    const body = await req.json();
    const { production_id, title, topic, language, audience, trend_id, vinkling, tags, action } = body;

    // ── 3. Hent n8n-konfig fra RLS-beskyttet user_settings ──
    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("n8n_webhook_url, n8n_enabled")
      .eq("user_id", user.id)
      .maybeSingle();

    if (settingsError) {
      // Logg intern feil — returner ikke detaljer til klient
      console.error("[trigger-n8n] Settings fetch error:", settingsError.code);
      return new Response(JSON.stringify({ success: false, message: "Configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!settings?.n8n_enabled || !settings?.n8n_webhook_url) {
      return new Response(
        JSON.stringify({ success: false, message: "n8n not configured or disabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 4. Valider at webhook-URL er HTTPS ──
    if (!settings.n8n_webhook_url.startsWith("https://")) {
      console.error("[trigger-n8n] Insecure webhook URL blocked for user:", user.id);
      return new Response(JSON.stringify({ success: false, message: "Invalid webhook configuration" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── 5. Bygg og send payload til n8n ──
    // Header-autentisering mot n8n bruker N8N_HEADER_AUTH_VALUE (satt via Supabase Secrets)
    const n8nAuthValue = Deno.env.get("N8N_HEADER_AUTH_VALUE") ?? "";

    const webhookPayload = {
      action: action ?? "init_production",
      user_id: user.id,
      production_id,
      title,
      topic,
      language,
      audience,
      trend_id,
      vinkling,
      tags,
      timestamp: new Date().toISOString(),
    };

    const n8nResponse = await fetch(settings.n8n_webhook_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(n8nAuthValue ? { "X-VideoMill-Auth": n8nAuthValue } : {}),
      },
      body: JSON.stringify(webhookPayload),
    });

    // Logg status uten å eksponere n8n-respons til klienten
    if (!n8nResponse.ok) {
      console.error(`[trigger-n8n] n8n returned ${n8nResponse.status} for user ${user.id}`);
    }

    return new Response(
      JSON.stringify({
        success: n8nResponse.ok,
        status: n8nResponse.status,
        message: n8nResponse.ok
          ? "Webhook triggered successfully"
          : `Webhook returned ${n8nResponse.status}`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    // Intern feil — logg detaljer, returner generisk melding
    console.error("[trigger-n8n] Unhandled error:", error instanceof Error ? error.message : "unknown");
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
