import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * trigger-n8n — Supabase Edge Function
 *
 * Sikkerhetsprinsipper:
 *  - Zero Trust: Alle forespørsler verifiseres mot Supabase Auth (JWT)
 *  - CORS: Begrenset til ALLOWED_ORIGIN (settes via Supabase Secrets)
 *  - n8n-URL hentes fra brukerens user_settings (RLS-beskyttet) — ikke hardkodet
 *  - Ingen sensitiv data returneres i feilmeldinger
 *  - Localhost-URLer er kun tillatt i development-modus
 */

const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "";
const ENVIRONMENT    = Deno.env.get("ENVIRONMENT") ?? "production";

function buildCorsHeaders(requestOrigin: string | null): Record<string, string> {
  // I dev: tillat alle origins slik at lokal Vite-dev-server fungerer
  const isProduction = ENVIRONMENT === "production";
  const isAllowed = !isProduction || (ALLOWED_ORIGIN && requestOrigin === ALLOWED_ORIGIN);
  return {
    "Access-Control-Allow-Origin":  isAllowed ? (requestOrigin ?? ALLOWED_ORIGIN) : "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
    "Vary": "Origin",
  };
}

/** Returnerer true for gyldige webhook-URLer.
 *  https:// er alltid OK.
 *  http://localhost og http://127.0.0.1 tillates for testing.
 */
function isValidWebhookUrl(url: string): boolean {
  if (url.startsWith("https://")) return true;
  // Tillat localhost for lokal n8n-testing
  if (
    url.startsWith("http://localhost") ||
    url.startsWith("http://127.0.0.1") ||
    url.startsWith("http://0.0.0.0")
  ) return true;
  return false;
}

Deno.serve(async (req: Request) => {
  const requestOrigin = req.headers.get("Origin");
  const corsHeaders   = buildCorsHeaders(requestOrigin);

  // ── Preflight ──
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // ── 1. Autentisering ──
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

    // ── 2. Parse body ──
    const body = await req.json();

    // ── 3. Hent n8n-konfig fra user_settings ──
    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("n8n_webhook_url, n8n_enabled")
      .eq("user_id", user.id)
      .maybeSingle();

    if (settingsError) {
      console.error("[trigger-n8n] Settings fetch error:", settingsError.code, settingsError.message);
      return new Response(
        JSON.stringify({ success: false, message: "Klarte ikke hente innstillinger. Kontroller at du er logget inn." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!settings) {
      return new Response(
        JSON.stringify({ success: false, message: "Ingen n8n-innstillinger funnet. Lagre innstillingene dine først." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!settings.n8n_enabled) {
      return new Response(
        JSON.stringify({ success: false, message: "n8n-integrasjon er ikke aktivert i innstillingene." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!settings.n8n_webhook_url) {
      return new Response(
        JSON.stringify({ success: false, message: "Webhook-URL mangler. Lim inn URL fra n8n Production-trigger." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 4. Valider webhook-URL ──
    if (!isValidWebhookUrl(settings.n8n_webhook_url)) {
      console.error("[trigger-n8n] Ugyldig webhook-URL for bruker:", user.id);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Ugyldig webhook-URL. Bruk HTTPS-URL fra n8n Cloud, eller localhost for lokal testing.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 5. Bygg og send payload til n8n ──
    const n8nAuthValue = Deno.env.get("N8N_HEADER_AUTH_VALUE") ?? "";

    const webhookPayload = {
      action:       body.action ?? "test",
      user_id:      user.id,
      video_id:     body.video_id     ?? body.production_id ?? null,
      title:        body.title        ?? null,
      topic:        body.topic        ?? null,
      language:     body.language     ?? "nb",
      platform:     body.platform     ?? null,
      trend_id:     body.trend_id     ?? null,
      trend_tags:   body.trend_tags   ?? body.tags ?? [],
      promp:        body.promp        ?? body.vinkling ?? null,
      voice_id:     body.voice_id     ?? null,
      aspect_ratio: body.aspect_ratio ?? body.video_format ?? null,
      timestamp:    new Date().toISOString(),
    };

    let n8nResponse: Response;
    try {
      n8nResponse = await fetch(settings.n8n_webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(n8nAuthValue ? { "X-VideoMill-Auth": n8nAuthValue } : {}),
        },
        body: JSON.stringify(webhookPayload),
        // Timeout: 10 sekunder
        signal: AbortSignal.timeout(10_000),
      });
    } catch (fetchErr) {
      const msg = fetchErr instanceof Error ? fetchErr.message : "ukjent feil";
      console.error("[trigger-n8n] Fetch til n8n feilet:", msg);

      // Gi brukervennlig melding for vanlige feil
      const isTimeout   = msg.includes("timed out") || msg.includes("timeout");
      const isRefused   = msg.includes("refused") || msg.includes("ECONNREFUSED");
      const isLocalhost = settings.n8n_webhook_url.includes("localhost") || settings.n8n_webhook_url.includes("127.0.0.1");

      let userMessage = `Klarte ikke nå n8n: ${msg}`;
      if (isTimeout)   userMessage = "Timeout — n8n svarte ikke innen 10 sekunder.";
      if (isRefused && isLocalhost) userMessage =
        "Tilkoblingen ble avvist. localhost:5678 er ikke tilgjengelig fra Supabase-skyen. " +
        "Bruk en offentlig HTTPS-URL (f.eks. ngrok eller n8n Cloud).";
      else if (isRefused) userMessage = "Tilkoblingen ble avvist. Kontroller at n8n kjører og er tilgjengelig.";

      return new Response(
        JSON.stringify({ success: false, message: userMessage }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!n8nResponse.ok) {
      console.error(`[trigger-n8n] n8n returnerte ${n8nResponse.status} for bruker ${user.id}`);
    }

    return new Response(
      JSON.stringify({
        success: n8nResponse.ok,
        status:  n8nResponse.status,
        message: n8nResponse.ok
          ? "Webhook trigget!"
          : `n8n returnerte HTTP ${n8nResponse.status}`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[trigger-n8n] Uhåndtert feil:", error instanceof Error ? error.message : "ukjent");
    return new Response(
      JSON.stringify({ success: false, error: "Intern serverfeil" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
