import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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

    const { score_type, score_value, title, industry, detail } = await req.json();

    // Generate short hash
    const hash = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map((b) => b.toString(36))
      .join("")
      .slice(0, 8);

    const headers = {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY!,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/shared_scores`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        hash,
        user_id: userData.id,
        score_type,
        score_value,
        title,
        industry,
        detail,
      }),
    });

    const data = await res.json();
    const appUrl = Deno.env.get("APP_URL") || "https://careerai.com";

    return new Response(
      JSON.stringify({ hash, url: `${appUrl}/share/${hash}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to create share" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
