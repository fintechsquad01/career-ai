import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const APP_URL = Deno.env.get("APP_URL") || "https://careerai.com";

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
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }

  try {
    // Rate limit by IP: 3/min
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRate(`capture-email:${clientIp}`, 3, 60000)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait and try again." }), {
        status: 429,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const { email, context, source } = await req.json();

    // Validate email
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Validate context: optional string, max 100 chars
    if (context !== undefined && context !== null) {
      if (typeof context !== "string" || context.length > 100) {
        return new Response(JSON.stringify({ error: "Context must be a string of 100 characters or less" }), {
          status: 400,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
    }

    // Validate source: optional string, max 100 chars
    if (source !== undefined && source !== null) {
      if (typeof source !== "string" || source.length > 100) {
        return new Response(JSON.stringify({ error: "Source must be a string of 100 characters or less" }), {
          status: 400,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
    }

    const headers = {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY!,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    };

    await fetch(`${SUPABASE_URL}/rest/v1/email_captures`, {
      method: "POST",
      headers: { ...headers, Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({
        email,
        context: context || null,
        source_page: source || "landing",
      }),
    });

    // Send a follow-up email via Resend (gracefully skip if not configured)
    if (RESEND_API_KEY) {
      try {
        const isResultsContext = context === "resume_xray" || context === "jd_match";
        const subject = isResultsContext
          ? "Your CareerAI Analysis Results"
          : "Welcome to CareerAI — Free AI Career Tools";
        const body = isResultsContext
          ? `<h1 style="font-size:22px;color:#111827;margin:0 0 16px;">Your results are ready</h1>
             <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 12px;">
               Thanks for trying CareerAI! Create a free account to save your results, unlock all 11 AI career tools, and start your Job Mission.
             </p>
             <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 12px;">
               You'll get <strong>5 free tokens</strong> plus <strong>2 daily credits</strong> — enough for a free JD Match scan every day.
             </p>
             <div style="text-align:center;margin-top:20px;">
               <a href="${APP_URL}/auth" style="display:inline-block;padding:14px 28px;background:linear-gradient(to right,#2563eb,#7c3aed);color:white;text-decoration:none;border-radius:12px;font-weight:600;font-size:14px;">Create Account — 5 Free Tokens</a>
             </div>`
          : `<h1 style="font-size:22px;color:#111827;margin:0 0 16px;">Welcome to CareerAI</h1>
             <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 12px;">
               Thanks for your interest! CareerAI gives you 11 AI-powered career tools — from resume optimization to salary negotiation — all pay-per-use with no subscriptions.
             </p>
             <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 12px;">
               <strong>Most popular tools:</strong>
             </p>
             <ul style="color:#4b5563;font-size:14px;line-height:1.9;padding-left:20px;margin:0 0 12px;">
               <li><strong>AI Displacement Score</strong> — free, 30 seconds</li>
               <li><strong>JD Match</strong> — see your real fit for any job posting</li>
               <li><strong>Resume Optimizer</strong> — ATS + recruiter optimized, voice preserved</li>
             </ul>
             <div style="text-align:center;margin-top:20px;">
               <a href="${APP_URL}/auth" style="display:inline-block;padding:14px 28px;background:linear-gradient(to right,#2563eb,#7c3aed);color:white;text-decoration:none;border-radius:12px;font-weight:600;font-size:14px;">Get Started — 5 Free Tokens</a>
             </div>`;

        const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Inter',system-ui,-apple-system,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:40px 24px;">
  <div style="text-align:center;margin-bottom:32px;">
    <div style="display:inline-block;width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#2563eb,#7c3aed);text-align:center;line-height:36px;color:white;font-weight:800;font-size:16px;">C</div>
    <span style="font-weight:700;font-size:18px;color:#111827;vertical-align:middle;margin-left:8px;">CareerAI</span>
  </div>
  <div style="background:white;border-radius:16px;border:1px solid #e5e7eb;padding:32px;margin-bottom:32px;">
    ${body}
  </div>
  <div style="text-align:center;">
    <p style="color:#9ca3af;font-size:11px;line-height:1.5;margin:0;">
      Encrypted · Never sold · Your data, your control
    </p>
  </div>
</div>
</body>
</html>`;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "CareerAI <noreply@careerai.com>",
            to: email,
            subject,
            html: emailHtml,
          }),
        });
      } catch (emailErr) {
        // Email sending is best-effort; don't fail the capture
        console.error("[capture-email] Email send failed:", emailErr);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to capture email" }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
