import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
const APP_URL = Deno.env.get("APP_URL") || "https://aiskillscore.com";

// Model config: Tier 3 Lite (Gemini 2.5 Flash Lite: $0.10/$0.40 per M)
const PRIMARY_MODEL = "google/gemini-2.5-flash-lite";
const FALLBACK_MODEL = "openai/gpt-4.1-mini";

// --- CORS: Dynamic origin check ---
const ALLOWED_ORIGINS = [
  Deno.env.get("APP_URL") || "https://aiskillscore.com",
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
const VALID_DETECTED_TYPES = ["resume", "jd", "url", "unknown"];

function extractCompanyFallback(text: string): string {
  const header = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 10)
    .join(" ");
  const patterns = [
    /\bat\s+([A-Z][A-Za-z0-9&.\- ]{1,60})\b/,
    /\babout\s+([A-Z][A-Za-z0-9&.\- ]{1,60})\b/i,
    /\bjoin\s+([A-Z][A-Za-z0-9&.\- ]{1,60})\b/i,
  ];
  for (const pattern of patterns) {
    const match = header.match(pattern);
    if (match?.[1]) return match[1].replace(/[.,;:!?]$/, "").trim();
  }
  return "";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }

  try {
    // Rate limit by IP: 10/min
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRate(`parse-input:${clientIp}`, 10, 60000)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait and try again." }), {
        status: 429,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const { input_text, detected_type } = await req.json();

    // Validate input_text: required string, min 10, max 50000
    if (!input_text || typeof input_text !== "string") {
      return new Response(JSON.stringify({ error: "input_text is required and must be a string" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }
    if (input_text.length < 10) {
      return new Response(JSON.stringify({ error: "input_text must be at least 10 characters" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }
    if (input_text.length > 50000) {
      return new Response(JSON.stringify({ error: "input_text must be 50,000 characters or less" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Validate detected_type: optional, must be one of valid types
    if (detected_type !== undefined && detected_type !== null) {
      if (!VALID_DETECTED_TYPES.includes(detected_type)) {
        return new Response(JSON.stringify({ error: `Invalid detected_type. Must be one of: ${VALID_DETECTED_TYPES.join(", ")}` }), {
          status: 400,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
    }

    let prompt: string;

    if (detected_type === "resume") {
      prompt = `Extract structured data from this resume text. Respond ONLY in valid JSON:
{
  "type": "resume",
  "data": {
    "name": "<full name>",
    "title": "<current job title>",
    "company": "<current company>",
    "industry": "<industry>",
    "location": "<location>",
    "years_experience": <number>,
    "email": "<email if present>",
    "skills": ["<skill1>", "<skill2>"],
    "skill_gaps": [],
    "resume_score": <0-100 ATS score estimate>,
    "displacement_score": <0-100 AI displacement risk>
  }
}

RESUME TEXT:
${input_text}`;
    } else {
      prompt = `Extract structured job posting data from this text. Respond ONLY in valid JSON:
{
  "type": "jd",
  "data": {
    "title": "<job title>",
    "company": "<company name>",
    "location": "<location>",
    "salary_range": "<salary range if mentioned>",
    "requirements": [
      {"skill": "<requirement>", "priority": "req|pref", "match": false}
    ],
    "description_text": "<cleaned description>"
  }
}

JOB POSTING TEXT:
${input_text}`;
    }

    // Call OpenRouter with fallback
    const callModel = async (model: string) => {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 30000);
      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": APP_URL,
            "X-Title": "AISkillScore",
          },
          signal: ctrl.signal,
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: "You are an expert data extraction AI. Always respond with valid JSON only." },
              { role: "user", content: prompt },
            ],
            max_tokens: 2048,
            temperature: 0.3,
            response_format: { type: "json_object" },
          }),
        });
        if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
        const data = await res.json();
        return data.choices?.[0]?.message?.content || "";
      } finally {
        clearTimeout(t);
      }
    };

    let responseText: string;
    try {
      responseText = await callModel(PRIMARY_MODEL);
    } catch (primaryError) {
      if ((primaryError as Error).name === "AbortError") {
        return new Response(JSON.stringify({ error: "AI analysis timed out. Please try again." }), {
          status: 504,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
      // Fallback
      try {
        responseText = await callModel(FALLBACK_MODEL);
      } catch {
        return new Response(JSON.stringify({ error: "AI_ERROR" }), {
          status: 500,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
    }

    let result;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch {
      return new Response(JSON.stringify({ error: "PARSE_FAILED" }), {
        status: 500,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    if (result?.type === "jd" && result?.data && typeof result.data === "object") {
      const parsed = result.data as Record<string, unknown>;
      const company = typeof parsed.company === "string" ? parsed.company.trim() : "";
      if (!company) {
        const fallback = extractCompanyFallback(input_text);
        if (fallback) {
          parsed.company = fallback;
        }
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
