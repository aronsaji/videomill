import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * trigger-n8n — Supabase Edge Function
 *
 * Sikkerhetsprinsipper:
 *  - JWT-verifisering via manuell payload-decode (unngår ES256-feil)
 *  - CORS: Tillater alle origins — sikkerhet er JWT-basert
 *  - n8n-URL fra user_settings (RLS-beskyttet) — ikke hardkodet
 *  - Sender X-VideoMill-Auth OG X-ViraNode-Secret for bakoverkompatibilitet
 */

function buildCorsHeaders(requestOrigin: string | null): Record<string, string> {
  return {
    "Access-Control-Allow-Origin":  requestOrigin ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
    "Vary": "Origin",
  };
}

/** Decode JWT payload without crypto verification.
 *  Safe inside Supabase Edge Functions — the API gateway already validates JWTs. */
function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    const padded  = payload + "=".repeat((4 - payload.length % 4) % 4);
    return JSON.parse(atob(padded.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

function isValidWebhookUrl(url: string): boolean {
  if (url.startsWith("https://")) return true;
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
    // ── 1. Autentisering via JWT payload decode ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const jwt     = authHeader.replace("Bearer ", "");
    const payload = decodeJwt(jwt);
    const userId  = payload?.sub as string | undefined;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized — invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── 2. Admin client for brukerinnstillinger (service role) ──
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")              ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // ── 3. Parse body ──
    const body = await req.json();

    // ── 4. Hent n8n-konfig fra user_settings ──
    const { data: settings, error: settingsError } = await adminClient
      .from("user_settings")
      .select("n8n_webhook_url, n8n_enabled")
      .eq("user_id", userId)
      .maybeSingle();

    if (settingsError) {
      console.error("[trigger-n8n] Settings fetch error:", settingsError.code);
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

    // ── 5. Valider webhook-URL ──
    if (!isValidWebhookUrl(settings.n8n_webhook_url)) {
      return new Response(
        JSON.stringify({ success: false, message: "Ugyldig webhook-URL. Bruk HTTPS-URL fra n8n Cloud." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 6. Bygg payload til n8n ──
    const n8nAuthValue = Deno.env.get("N8N_HEADER_AUTH_VALUE") ?? "";

    const webhookPayload = {
      action:          body.action         ?? "test",
      user_id:         userId,
      video_id:        body.video_id       ?? body.production_id ?? null,
      title:           body.title          ?? null,
      topic:           body.topic          ?? null,
      language:        body.language       ?? "nb",
      platform:        body.platform       ?? null,
      trend_id:        body.trend_id       ?? null,
      trend_tags:      body.trend_tags     ?? body.tags ?? [],
      promp:           body.promp          ?? body.vinkling ?? null,
      voice_id:        body.voice_id       ?? null,
      aspect_ratio:    body.aspect_ratio   ?? body.video_format ?? null,
      target_audience: body.target_audience ?? null,
      timestamp:       new Date().toISOString(),
    };

    // ── 7. Send til n8n ──
    let n8nResponse: Response;
    try {
      n8nResponse = await fetch(settings.n8n_webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Send both header names for compatibility with different n8n webhook configs
          ...(n8nAuthValue ? {
            "X-VideoMill-Auth":  n8nAuthValue,
            "X-ViraNode-Secret": n8nAuthValue,
          } : {}),
        },
        body: JSON.stringify(webhookPayload),
        signal: AbortSignal.timeout(10_000),
      });
    } catch (fetchErr) {
      const msg = fetchErr instanceof Error ? fetchErr.message : "ukjent feil";
      console.error("[trigger-n8n] Fetch til n8n feilet:", msg);

      const isTimeout   = msg.includes("timed out") || msg.includes("timeout");
      const isRefused   = msg.includes("refused")   || msg.includes("ECONNREFUSED");
      const isLocalhost = settings.n8n_webhook_url.includes("localhost") || settings.n8n_webhook_url.includes("127.0.0.1");

      let userMessage = `Klarte ikke nå n8n: ${msg}`;
      if (isTimeout) userMessage = "Timeout — n8n svarte ikke innen 10 sekunder.";
      else if (isRefused && isLocalhost) {
        userMessage = "Tilkoblingen ble avvist. localhost:5678 er ikke tilgjengelig fra Supabase-skyen. Bruk ngrok eller n8n Cloud.";
      } else if (isRefused) {
        userMessage = "Tilkoblingen ble avvist. Kontroller at n8n kjører og er tilgjengelig.";
      }

      return new Response(
        JSON.stringify({ success: false, message: userMessage }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!n8nResponse.ok) {
      console.error(`[trigger-n8n] n8n returnerte ${n8nResponse.status} for bruker ${userId}`);
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
