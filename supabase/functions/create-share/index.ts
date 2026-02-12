import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

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

// --- Validation ---
const VALID_SCORE_TYPES = [
  "displacement",
  "jd_match",
  "resume",
  "cover_letter",
  "linkedin",
  "skills_gap",
  "roadmap",
  "salary",
  "entrepreneurship",
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), {
        status: 401,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: authHeader, apikey: SUPABASE_SERVICE_ROLE_KEY! },
    });
    const userData = await userResponse.json();
    if (!userData.id) {
      return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), {
        status: 401,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Rate limit by user: 10/min
    if (!checkRate(`create-share:${userData.id}`, 10, 60000)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait and try again." }), {
        status: 429,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const { score_type, score_value, title, industry, detail } = await req.json();

    // Validate score_type
    if (!score_type || !VALID_SCORE_TYPES.includes(score_type)) {
      return new Response(JSON.stringify({ error: `Invalid score_type. Must be one of: ${VALID_SCORE_TYPES.join(", ")}` }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Validate score_value: number 0-100
    if (typeof score_value !== "number" || score_value < 0 || score_value > 100) {
      return new Response(JSON.stringify({ error: "score_value must be a number between 0 and 100" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Validate title: required string, max 200 chars
    if (!title || typeof title !== "string" || title.length > 200) {
      return new Response(JSON.stringify({ error: "title is required and must be 200 characters or less" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Validate industry: optional string, max 100 chars
    if (industry !== undefined && industry !== null) {
      if (typeof industry !== "string" || industry.length > 100) {
        return new Response(JSON.stringify({ error: "industry must be a string of 100 characters or less" }), {
          status: 400,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
    }

    // Validate detail: optional object
    if (detail !== undefined && detail !== null) {
      if (typeof detail !== "object" || Array.isArray(detail)) {
        return new Response(JSON.stringify({ error: "detail must be an object" }), {
          status: 400,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
    }

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
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to create share" }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
