/**
 * Email integration via Resend.
 * No-ops gracefully when RESEND_API_KEY is not configured.
 *
 * Templates: Welcome, Daily Credit Reminder, Results Email
 *
 * FROM ADDRESS & DOMAIN VERIFICATION:
 * - Production: "AISkillScore <noreply@aiskillscore.com>" — requires verified domain in Resend.
 * - Development: "Acme <onboarding@resend.dev>" — Resend's shared testing domain (no verification needed,
 *   but emails can only be sent to the email address associated with your Resend account).
 *
 * To verify your production domain:
 *   1. Go to https://resend.com/domains → Add "aiskillscore.com"
 *   2. Add the DNS records Resend provides: SPF (TXT), DKIM (TXT), optional DMARC (TXT)
 *   3. Wait for verification (typically < 1 hour)
 *   4. Until verified, production emails will fail or land in spam.
 */

const FROM_ADDRESS = process.env.NODE_ENV === "production"
  ? "AISkillScore <noreply@aiskillscore.com>"
  : "AISkillScore Dev <onboarding@resend.dev>";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("[Email] Resend not configured, skipping email:", options.subject);
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("[Email] Resend error:", err);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Email] Failed to send:", error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Shared wrapper for all templates
// ---------------------------------------------------------------------------

function emailWrapper(body: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Inter',system-ui,-apple-system,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:40px 24px;">
  <!-- Header -->
  <div style="text-align:center;margin-bottom:32px;">
    <div style="display:inline-block;width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#2563eb,#7c3aed);text-align:center;line-height:36px;color:white;font-weight:800;font-size:16px;">C</div>
    <span style="font-weight:700;font-size:18px;color:#111827;vertical-align:middle;margin-left:8px;">AISkillScore</span>
  </div>

  <!-- Body -->
  <div style="background:white;border-radius:16px;border:1px solid #e5e7eb;padding:32px;margin-bottom:32px;">
    ${body}
  </div>

  <!-- Footer -->
  <div style="text-align:center;">
    <p style="color:#9ca3af;font-size:11px;line-height:1.5;margin:0;">
      You received this because you signed up at <a href="${appUrl}" style="color:#6b7280;">aiskillscore.com</a>.<br>
      <a href="${appUrl}/settings" style="color:#6b7280;">Manage email preferences</a> · <a href="${appUrl}/settings" style="color:#6b7280;">Unsubscribe</a>
    </p>
  </div>
</div>
</body>
</html>`;
}

function ctaButton(text: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;padding:14px 28px;background:linear-gradient(to right,#2563eb,#7c3aed);color:white;text-decoration:none;border-radius:12px;font-weight:600;font-size:14px;margin-top:20px;">${text}</a>`;
}

// ---------------------------------------------------------------------------
// Template: Welcome Email
// ---------------------------------------------------------------------------

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";
  const firstName = name.split(" ")[0] || "there";

  return sendEmail({
    to: email,
    subject: "Welcome to AISkillScore — your 5 free tokens are ready",
    html: emailWrapper(`
      <h1 style="font-size:22px;color:#111827;margin:0 0 16px;">Hey ${firstName}, welcome aboard!</h1>
      <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 12px;">
        You now have <strong>5 free tokens</strong> to try any of our 11 AI career tools. Plus, log in daily for <strong>2 extra tokens</strong> — enough for a free JD Match scan every day.
      </p>
      <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 12px;">
        Here are the most popular ways to get started:
      </p>
      <ul style="color:#4b5563;font-size:14px;line-height:1.9;padding-left:20px;margin:0 0 12px;">
        <li><strong>AI Displacement Score</strong> — free, takes 30 seconds</li>
        <li><strong>JD Match</strong> — paste a job posting to see your real fit (2 tokens)</li>
        <li><strong>Resume Optimizer</strong> — ATS + recruiter-optimized, voice preserved (10 tokens)</li>
      </ul>
      <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 4px;">
        Unlike other tools, AISkillScore preserves your authentic voice — no "spearheaded" or "leveraged" here.
      </p>
      <div style="text-align:center;">
        ${ctaButton("Go to Dashboard", `${appUrl}/dashboard`)}
      </div>
    `),
  });
}

// ---------------------------------------------------------------------------
// Template: Daily Credit Reminder
// ---------------------------------------------------------------------------

export async function sendDailyCreditReminder(email: string, name: string, daysMissed: number): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";
  const firstName = name.split(" ")[0] || "there";
  const missedTokens = daysMissed * 2;

  return sendEmail({
    to: email,
    subject: `${firstName}, you have unclaimed daily tokens`,
    html: emailWrapper(`
      <h1 style="font-size:22px;color:#111827;margin:0 0 16px;">You're missing out on free tokens</h1>
      <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 12px;">
        Hey ${firstName}, you haven't logged in for ${daysMissed} day${daysMissed > 1 ? "s" : ""} — that's <strong>${missedTokens} tokens</strong> you could have earned.
      </p>
      <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 12px;">
        Daily tokens let you run a <strong>free JD Match scan every day</strong>. In a week, you'll have enough for a full Skills Gap Analysis (5 tokens) or an Interview Prep session (3 tokens).
      </p>
      <div style="background:#f0fdf4;border-radius:12px;padding:16px;margin:16px 0;text-align:center;">
        <p style="color:#166534;font-size:16px;font-weight:700;margin:0;">2 tokens waiting for you</p>
        <p style="color:#15803d;font-size:12px;margin:4px 0 0;">Log in to claim. Resets at midnight UTC.</p>
      </div>
      <div style="text-align:center;">
        ${ctaButton("Claim Your Tokens", `${appUrl}/dashboard`)}
      </div>
    `),
  });
}

// ---------------------------------------------------------------------------
// Template: Results PDF / Lead Capture Email
// ---------------------------------------------------------------------------

export async function sendResultsEmail(email: string, context: string): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";
  const contextLabel = context === "resume_xray" ? "Resume X-Ray" : context === "jd_match" ? "Job Match" : "Career Analysis";

  return sendEmail({
    to: email,
    subject: `Your AISkillScore ${contextLabel} Results`,
    html: emailWrapper(`
      <h1 style="font-size:22px;color:#111827;margin:0 0 16px;">Your ${contextLabel} Results</h1>
      <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 12px;">
        Thanks for trying AISkillScore! Your ${contextLabel.toLowerCase()} results are ready.
      </p>
      <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 12px;">
        Create a free account to unlock all 11 AI career tools, save your results, and start your Job Mission. You'll get <strong>5 free tokens</strong> plus <strong>2 daily credits</strong>.
      </p>
      <div style="text-align:center;">
        ${ctaButton("Create Account — 5 Free Tokens", `${appUrl}/auth`)}
      </div>
      <p style="color:#9ca3af;font-size:11px;margin-top:24px;text-align:center;">
        Encrypted · Never sold · Your data, your control
      </p>
    `),
  });
}
