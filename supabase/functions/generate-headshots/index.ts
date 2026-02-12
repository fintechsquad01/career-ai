import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const REPLICATE_API_TOKEN = Deno.env.get("REPLICATE_API_TOKEN");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: authHeader, apikey: SUPABASE_SERVICE_ROLE_KEY! },
    });
    const userData = await userResponse.json();
    if (!userData.id) {
      return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { image_paths, style, background } = await req.json();

    if (!image_paths || image_paths.length === 0) {
      return new Response(JSON.stringify({ error: "No images provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduct 20 tokens
    const headers = {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY!,
      "Content-Type": "application/json",
    };

    const spendRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/spend_tokens`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        p_user_id: userData.id,
        p_amount: 20,
        p_tool_id: "headshots",
        p_tool_result_id: "00000000-0000-0000-0000-000000000000",
      }),
    });

    if (!spendRes.ok) {
      return new Response(JSON.stringify({ error: "INSUFFICIENT_TOKENS" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call Replicate API (FLUX.1 Pro)
    const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "latest",
        input: {
          prompt: `Professional ${style || "corporate"} headshot, ${background || "studio gradient"} background, photorealistic, high quality`,
          num_outputs: 8,
        },
      }),
    });

    const prediction = await replicateResponse.json();

    return new Response(
      JSON.stringify({
        job_id: prediction.id,
        status: "processing",
        message: "Headshots are being generated. Check back in 2-5 minutes.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
