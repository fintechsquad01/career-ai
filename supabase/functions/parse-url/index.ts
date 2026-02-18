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

// --- SSRF Protection ---
function isPrivateUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase();

    // Block non-http(s) protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return true;
    }

    // Block localhost and loopback
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]" || hostname === "0.0.0.0") {
      return true;
    }

    // Block private IP ranges: 10.x.x.x
    if (hostname.startsWith("10.")) return true;

    // Block private IP ranges: 192.168.x.x
    if (hostname.startsWith("192.168.")) return true;

    // Block private IP ranges: 172.16.0.0 - 172.31.255.255
    if (hostname.startsWith("172.")) {
      const second = parseInt(hostname.split(".")[1], 10);
      if (second >= 16 && second <= 31) return true;
    }

    // Block link-local: 169.254.x.x
    if (hostname.startsWith("169.254.")) return true;

    // Block cloud metadata endpoints
    if (hostname === "metadata.google.internal" || hostname === "metadata.google.com") return true;

    // Block common internal hostnames
    if (hostname.endsWith(".local") || hostname.endsWith(".internal")) return true;

    return false;
  } catch {
    return true; // If URL parsing fails, block it
  }
}

// --- Validation ---
const URL_REGEX = /^https?:\/\//i;

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
    if (!checkRate(`parse-url:${clientIp}`, 10, 60000)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait and try again." }), {
        status: 429,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const { url } = await req.json();

    // Validate url: required, valid format, max 2000 chars
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "url is required and must be a string" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }
    if (url.length > 2000) {
      return new Response(JSON.stringify({ error: "url must be 2,000 characters or less" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }
    if (!URL_REGEX.test(url)) {
      return new Response(JSON.stringify({ error: "url must start with http:// or https://" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // SSRF protection: block private/internal URLs
    if (isPrivateUrl(url)) {
      return new Response(JSON.stringify({ error: "URL points to a private or internal address" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Fetch page content with 10-second timeout
    let pageContent: string;
    const fetchController = new AbortController();
    const fetchTimeout = setTimeout(() => fetchController.abort(), 10000);
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; AISkillScore/1.0)",
        },
        signal: fetchController.signal,
      });
      pageContent = await response.text();
    } catch (fetchError) {
      if ((fetchError as Error).name === "AbortError") {
        return new Response(JSON.stringify({ error: "URL fetch timed out (10s limit)" }), {
          status: 504,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "URL_FETCH_FAILED" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    } finally {
      clearTimeout(fetchTimeout);
    }

    // Strip HTML tags for cleaner extraction
    const textContent = pageContent
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);

    // Call OpenRouter with fallback to extract structured JD data
    const jdPrompt = `Extract job posting information from this web page content. Respond ONLY in valid JSON:
{
  "title": "<job title>",
  "company": "<company>",
  "location": "<location>",
  "description_text": "<job description text>",
  "salary_range": "<salary if mentioned>"
}

PAGE CONTENT:
${textContent}`;

    const callModel = async (model: string) => {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": APP_URL,
          "X-Title": "AISkillScore",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "You are an expert data extraction AI. Always respond with valid JSON only." },
            { role: "user", content: jdPrompt },
          ],
          max_tokens: 1024,
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
      });
      if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content || "";
    };

    let responseText: string;
    try {
      responseText = await callModel(PRIMARY_MODEL);
    } catch {
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

    if (result && typeof result === "object") {
      const parsed = result as Record<string, unknown>;
      const company = typeof parsed.company === "string" ? parsed.company.trim() : "";
      if (!company) {
        const fallback = extractCompanyFallback(textContent);
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
