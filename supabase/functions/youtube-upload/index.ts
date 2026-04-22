import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * youtube-upload — Supabase Edge Function
 *
 * Kalles fra n8n etter ferdig produksjon ELLER fra frontend.
 * 1. Henter OAuth-token fra user_social_accounts
 * 2. Refresher token om nødvendig
 * 3. Laster opp video til YouTube via resumable upload
 * 4. Oppdaterer videos-tabellen med youtube_url
 */

function buildCorsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin":  origin ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Service-Key",
    "Vary": "Origin",
  };
}

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    const padded  = payload + "=".repeat((4 - payload.length % 4) % 4);
    return JSON.parse(atob(padded.replace(/-/g, "+").replace(/_/g, "/")));
  } catch { return null; }
}

async function refreshAccessToken(refreshToken: string, clientId: string, clientSecret: string) {
  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type:    "refresh_token",
      refresh_token: refreshToken,
      client_id:     clientId,
      client_secret: clientSecret,
    }),
  });
  if (!resp.ok) throw new Error(`Token refresh feilet: ${resp.status}`);
  return await resp.json() as { access_token: string; expires_in: number };
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin");
  const cors   = buildCorsHeaders(origin);

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST")    return new Response("Method not allowed", { status: 405, headers: cors });

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")              ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    // Auth — accept either user JWT or internal service key
    const authHeader  = req.headers.get("Authorization") ?? "";
    const serviceKey  = req.headers.get("X-Service-Key") ?? "";
    const internalKey = Deno.env.get("INTERNAL_SERVICE_KEY") ?? "";

    let userId: string | null = null;

    if (serviceKey && internalKey && serviceKey === internalKey) {
      // Called from n8n — body must include user_id
      const body = await req.json();
      userId = body.user_id ?? null;
      if (!userId) return new Response(JSON.stringify({ error: "user_id mangler" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });

      return await handleUpload(adminClient, userId, body, cors);
    }

    if (authHeader.startsWith("Bearer ")) {
      const jwt  = authHeader.replace("Bearer ", "");
      const pl   = decodeJwt(jwt);
      userId     = (pl?.sub as string) ?? null;
      if (!userId) return new Response(JSON.stringify({ error: "Ugyldig token" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });

      const body = await req.json();
      return await handleUpload(adminClient, userId, body, cors);
    }

    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });

  } catch (err) {
    console.error("[youtube-upload] feil:", err);
    return new Response(JSON.stringify({ error: "Intern feil" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});

async function handleUpload(
  admin: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>,
  cors: Record<string, string>,
): Promise<Response> {
  const { video_id, video_url, title, description, tags } = body as {
    video_id:    string;
    video_url:   string;
    title:       string;
    description?: string;
    tags?:        string[];
  };

  if (!video_id || !video_url) {
    return new Response(JSON.stringify({ error: "video_id og video_url er påkrevd" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  }

  // 1. Hent OAuth-konto
  const { data: account, error: accErr } = await admin
    .from("user_social_accounts")
    .select("access_token, refresh_token, channel_id")
    .eq("user_id", userId)
    .eq("platform", "youtube")
    .maybeSingle();

  if (accErr || !account) {
    return new Response(JSON.stringify({ success: false, message: "YouTube ikke koblet til. Gå til Innstillinger → YouTube." }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
  }

  // 2. Refresh token
  const clientId     = Deno.env.get("GOOGLE_CLIENT_ID")     ?? "";
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET") ?? "";
  let accessToken    = account.access_token ?? "";

  if (account.refresh_token && clientId && clientSecret) {
    try {
      const refreshed = await refreshAccessToken(account.refresh_token, clientId, clientSecret);
      accessToken = refreshed.access_token;
      // Update stored token
      await admin.from("user_social_accounts").update({ access_token: accessToken }).eq("user_id", userId).eq("platform", "youtube");
    } catch (e) {
      console.warn("[youtube-upload] Token refresh feilet:", e);
    }
  }

  // 3. Hent video-filen
  const videoResp = await fetch(video_url as string);
  if (!videoResp.ok) {
    return new Response(JSON.stringify({ success: false, message: `Klarte ikke hente video: ${videoResp.status}` }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
  }
  const videoBuffer = await videoResp.arrayBuffer();
  const contentType = videoResp.headers.get("content-type") ?? "video/mp4";

  // 4. Start resumable YouTube upload
  const metadata = {
    snippet: {
      title:       title ?? "VideoMill Video",
      description: description ?? "Produsert av VideoMill AI",
      tags:        tags ?? [],
      categoryId:  "22",
    },
    status: { privacyStatus: "public", selfDeclaredMadeForKids: false },
  };

  const initResp = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization:           `Bearer ${accessToken}`,
        "Content-Type":          "application/json; charset=UTF-8",
        "X-Upload-Content-Type": contentType,
        "X-Upload-Content-Length": videoBuffer.byteLength.toString(),
      },
      body: JSON.stringify(metadata),
    }
  );

  if (!initResp.ok) {
    const err = await initResp.text();
    return new Response(JSON.stringify({ success: false, message: `YouTube avviste opplasting: ${err.slice(0, 200)}` }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
  }

  const uploadUrl = initResp.headers.get("Location");
  if (!uploadUrl) {
    return new Response(JSON.stringify({ success: false, message: "Fikk ikke upload URL fra YouTube" }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
  }

  // 5. Upload
  const uploadResp = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType, "Content-Length": videoBuffer.byteLength.toString() },
    body:   videoBuffer,
  });

  if (!uploadResp.ok) {
    return new Response(JSON.stringify({ success: false, message: `Upload feilet: HTTP ${uploadResp.status}` }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
  }

  const ytData = await uploadResp.json() as { id?: string };
  const ytId   = ytData.id ?? "";
  const ytUrl  = `https://www.youtube.com/watch?v=${ytId}`;

  // 6. Oppdater videos-tabellen
  await admin.from("videos").update({ video_url: ytUrl, status: "complete", metadata: { youtube_id: ytId, youtube_url: ytUrl } }).eq("id", video_id);

  // 7. Logg til agent_logs
  await admin.from("agent_logs").insert({ agent_id: "Publisher", action: `Video lastet opp til YouTube: ${title}`, status: "ok", video_id, details: { youtube_url: ytUrl } }).catch(() => {});

  return new Response(JSON.stringify({ success: true, youtube_url: ytUrl, youtube_id: ytId }), { headers: { ...cors, "Content-Type": "application/json" } });
}
