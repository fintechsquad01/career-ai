import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- CORS: Dynamic origin check ---
const ALLOWED_ORIGINS = [
  Deno.env.get("APP_URL") || "https://careerai.com",
  "http://localhost:3000",
  "http://localhost:3001",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

// --- Rate Limiting ---
const rateLimitMap = new Map<string, number[]>();

function checkRate(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(key) || [];
  const valid = timestamps.filter((t) => now - t < windowMs);
  if (valid.length >= limit) return false;
  valid.push(now);
  rateLimitMap.set(key, valid);
  return true;
}

const VALID_STYLES = ["professional", "casual", "modern"];
const VALID_BACKGROUNDS = ["neutral", "office", "gradient"];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Rate limit by user: 3/min
    if (!checkRate(`generate-headshots:${user.id}`, 3, 60000)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait and try again." }), {
        status: 429,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { image_paths, style, background } = body;

    // Validate inputs
    if (!Array.isArray(image_paths) || image_paths.length === 0 || image_paths.length > 5) {
      return new Response(JSON.stringify({ error: "Provide 1-5 image paths" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }
    // Validate each image_path is a string
    for (const path of image_paths) {
      if (typeof path !== "string" || path.length === 0 || path.length > 500) {
        return new Response(JSON.stringify({ error: "Each image path must be a non-empty string (max 500 chars)" }), {
          status: 400,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
    }
    if (style && !VALID_STYLES.includes(style)) {
      return new Response(JSON.stringify({ error: `Invalid style. Must be one of: ${VALID_STYLES.join(", ")}` }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }
    if (background && !VALID_BACKGROUNDS.includes(background)) {
      return new Response(JSON.stringify({ error: `Invalid background. Must be one of: ${VALID_BACKGROUNDS.join(", ")}` }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const COST = 20; // tokens — matches TOOL_COSTS in constants

    // Check balance (don't deduct yet)
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("token_balance")
      .eq("id", user.id)
      .single();

    if (!profile || profile.token_balance < COST) {
      return new Response(JSON.stringify({ error: "Insufficient tokens" }), {
        status: 402,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Get signed URLs for the uploaded images
    const signedUrls: string[] = [];
    for (const path of image_paths) {
      const { data: urlData } = await supabaseClient.storage
        .from("headshots-input")
        .createSignedUrl(path, 3600);
      if (urlData?.signedUrl) {
        signedUrls.push(urlData.signedUrl);
      }
    }

    if (signedUrls.length === 0) {
      return new Response(JSON.stringify({ error: "Could not access uploaded images" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Call Replicate API
    const replicateToken = Deno.env.get("REPLICATE_API_TOKEN");
    if (!replicateToken) {
      return new Response(JSON.stringify({ error: "Headshot service not configured" }), {
        status: 503,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // 120s timeout

    try {
      // Start prediction
      const startRes = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${replicateToken}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          version: "black-forest-labs/flux-1.1-pro",
          input: {
            prompt: `Professional ${style === "casual" ? "relaxed professional portrait, natural soft lighting, warm friendly expression, gentle smile, softly blurred background" : style === "modern" ? "contemporary professional portrait, creative studio lighting with subtle gradient, modern aesthetic, confident expression, clean minimalist background" : "corporate business headshot, clean studio lighting, sharp focus, confident subtle smile, straight-on or slight angle, solid neutral background"}, ${background === "office" ? "softly blurred modern office environment in background" : background === "gradient" ? "smooth professional gradient background in subtle blue-to-gray tones" : "solid light gray or white studio backdrop"}, 8K resolution, ultra-detailed skin texture, professional DSLR photography quality, Rembrandt lighting with soft fill, natural skin tones, no artifacts, LinkedIn-ready headshot`,
            image: signedUrls[0],
            num_outputs: 4,
            guidance_scale: 7.5,
          },
        }),
      });

      if (!startRes.ok) {
        const err = await startRes.json();
        throw new Error(err.detail || "Replicate API error");
      }

      const prediction = await startRes.json();
      let result = prediction;

      // Poll for completion
      if (result.status !== "succeeded") {
        const pollUrl = result.urls?.get || `https://api.replicate.com/v1/predictions/${result.id}`;
        for (let i = 0; i < 60; i++) {
          await new Promise((r) => setTimeout(r, 2000)); // poll every 2s
          const pollRes = await fetch(pollUrl, {
            headers: { Authorization: `Bearer ${replicateToken}` },
            signal: controller.signal,
          });
          result = await pollRes.json();
          if (result.status === "succeeded" || result.status === "failed" || result.status === "canceled") {
            break;
          }
        }
      }

      if (result.status !== "succeeded") {
        throw new Error(`Headshot generation ${result.status || "timed out"}`);
      }

      const outputUrls = Array.isArray(result.output) ? result.output : [result.output];

      const toolResult = {
        headshots: outputUrls.map((url: string, i: number) => ({
          url,
          style: style || "professional",
          background: background || "studio",
          index: i,
        })),
        input_count: image_paths.length,
        generated_count: outputUrls.length,
      };

      // Store result first to get the actual result ID
      const { data: insertedResult, error: insertError } = await supabaseClient
        .from("tool_results")
        .insert({
          user_id: user.id,
          tool_id: "headshots",
          inputs: { image_paths, style, background },
          result: toolResult,
          tokens_spent: COST,
        })
        .select("id")
        .single();

      if (insertError || !insertedResult) {
        throw new Error("Failed to store result");
      }

      // SUCCESS — now deduct tokens with actual result ID
      const { error: spendError } = await supabaseClient.rpc("spend_tokens", {
        p_user_id: user.id,
        p_amount: COST,
        p_tool_id: "headshots",
        p_tool_result_id: insertedResult.id,
      });

      if (spendError) {
        throw new Error("Failed to deduct tokens");
      }

      return new Response(
        JSON.stringify({
          result: toolResult,
          result_id: insertedResult.id,
        }),
        {
          status: 200,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        }
      );
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Headshot generation failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
