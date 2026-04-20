import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * video-status — Supabase Edge Function
 *
 * Called by n8n to update a video's status/progress in the DB.
 * Auth: Either a valid Bearer JWT (user) OR the X-VideoMill-Auth header secret (n8n server).
 *
 * POST body:
 * {
 *   video_id:        string   (required)
 *   status?:         string   e.g. "processing" | "complete" | "failed"
 *   progress?:       number   0–100
 *   sub_status?:     string   human-readable step description
 *   video_url_16x9?: string
 *   video_url_9x16?: string
 *   video_url_1x1?:  string
 * }
 */

function buildCorsHeaders(origin: string | null): Record<string, string> {
  return {
    "Access-Control-Allow-Origin":  origin ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-VideoMill-Auth, X-ViraNode-Secret, Apikey",
    "Vary": "Origin",
  };
}

Deno.serve(async (req: Request) => {
  const origin  = req.headers.get("Origin");
  const cors    = buildCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  try {
    // ── 1. Verify caller ──────────────────────────────────────────
    const authHeader     = req.headers.get("Authorization");
    const videoMillAuth  = req.headers.get("X-VideoMill-Auth") ?? req.headers.get("X-ViraNode-Secret");
    const expectedSecret = Deno.env.get("N8N_HEADER_AUTH_VALUE") ?? Deno.env.get("VIRANODE_SECRET");

    const isN8nCall  = expectedSecret && videoMillAuth === expectedSecret;
    const isJwtCall  = authHeader?.startsWith("Bearer ");

    if (!isN8nCall && !isJwtCall) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // ── 2. Admin client (service role — can write any row) ────────
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")              ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // ── 3. Parse body ─────────────────────────────────────────────
    const body = await req.json();
    const {
      video_id,
      status,
      progress,
      sub_status,
      video_url_16x9,
      video_url_9x16,
      video_url_1x1,
    } = body;

    if (!video_id) {
      return new Response(JSON.stringify({ error: "video_id required" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // ── 4. Build update payload ───────────────────────────────────
    const update: Record<string, unknown> = {};
    if (status     !== undefined) update.status     = status;
    if (progress   !== undefined) update.progress   = progress;
    if (sub_status !== undefined) update.sub_status = sub_status;

    // Store video URLs: primary in video_url, extras in metadata
    if (video_url_16x9 || video_url_9x16 || video_url_1x1) {
      // Get existing metadata to merge
      const { data: existing } = await adminClient
        .from("videos")
        .select("metadata, video_url")
        .eq("id", video_id)
        .maybeSingle();

      const prevMeta = (existing?.metadata as Record<string, unknown>) ?? {};
      update.metadata = {
        ...prevMeta,
        ...(video_url_16x9 ? { video_url_16x9 } : {}),
        ...(video_url_9x16 ? { video_url_9x16 } : {}),
        ...(video_url_1x1  ? { video_url_1x1  } : {}),
      };
      // Set primary video_url (prefer 16x9)
      if (video_url_16x9 && !existing?.video_url) update.video_url = video_url_16x9;
    }

    if (Object.keys(update).length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No fields to update" }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // ── 5. Update videos table ────────────────────────────────────
    const { error } = await adminClient
      .from("videos")
      .update(update)
      .eq("id", video_id);

    if (error) {
      console.error("[video-status] DB update error:", error.code, error.message);
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    console.log(`[video-status] Updated video ${video_id}: status=${status}, progress=${progress}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[video-status] Unhandled error:", err instanceof Error ? err.message : "unknown");
    return new Response(JSON.stringify({ success: false, error: "Internal error" }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
