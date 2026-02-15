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
    subject: "Welcome to AISkillScore — your 15 free tokens are ready",
    html: emailWrapper(`
      <h1 style="font-size:22px;color:#111827;margin:0 0 16px;">Hey ${firstName}, welcome aboard!</h1>
      <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 12px;">
        You now have <strong>15 free tokens</strong> to try any of our 11 AI career tools. Plus, log in daily for <strong>2 extra tokens</strong> — enough for a free JD Match scan every day.
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
        Create a free account to unlock all 11 AI career tools, save your results, and start your Job Mission. You'll get <strong>15 free tokens</strong> plus <strong>2 daily credits</strong>.
      </p>
      <div style="text-align:center;">
        ${ctaButton("Create Account — 15 Free Tokens", `${appUrl}/auth`)}
      </div>
      <p style="color:#9ca3af;font-size:11px;margin-top:24px;text-align:center;">
        Encrypted · Never sold · Your data, your control
      </p>
    `),
  });
}

// ---------------------------------------------------------------------------
// Template: Activation Day 1 (signup + 1 day, no tools used)
// ---------------------------------------------------------------------------

export async function sendActivationDay1(email: string, name: string): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";
  const firstName = name.split(" ")[0] || "there";

  return sendEmail({
    to: email,
    subject: `${firstName}, did you know? Your 15 tokens unlock 11 AI tools`,
    html: emailWrapper(`
      <h1 style="font-size:22px;color:#111827;margin:0 0 16px;">Your tokens are more powerful than you think</h1>
      <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 12px;">
        Hey ${firstName}, your <strong>15 free tokens</strong> can run a complete career analysis:
      </p>
      <div style="background:#f0f9ff;border-radius:12px;padding:16px;margin:16px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#1e40af;font-size:13px;">AI Displacement Score</td><td style="text-align:right;color:#059669;font-weight:700;font-size:13px;">FREE</td></tr>
          <tr><td style="padding:6px 0;color:#1e40af;font-size:13px;">JD Match (paste a job posting)</td><td style="text-align:right;color:#4b5563;font-size:13px;">2 tokens</td></tr>
          <tr><td style="padding:6px 0;color:#1e40af;font-size:13px;">Resume Optimizer</td><td style="text-align:right;color:#4b5563;font-size:13px;">10 tokens</td></tr>
          <tr><td style="padding:6px 0;color:#1e40af;font-size:13px;">Cover Letter + Interview Prep</td><td style="text-align:right;color:#4b5563;font-size:13px;">3 tokens each</td></tr>
        </table>
      </div>
      <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 12px;">
        <strong>Most users start with the AI Displacement Score</strong> — it's free and takes 30 seconds. Then they run JD Match on a real job posting.
      </p>
      <div style="text-align:center;">
        ${ctaButton("Start with Your Free AI Risk Score", `${appUrl}/tools/displacement`)}
      </div>
    `),
  });
}

// ---------------------------------------------------------------------------
// Template: Activation Day 3 (signup + 3 days, no paid tools used)
// ---------------------------------------------------------------------------

export async function sendActivationDay3(email: string, name: string, tokensRemaining: number): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";
  const firstName = name.split(" ")[0] || "there";

  return sendEmail({
    to: email,
    subject: `You still have ${tokensRemaining} tokens waiting, ${firstName}`,
    html: emailWrapper(`
      <h1 style="font-size:22px;color:#111827;margin:0 0 16px;">Your tokens are waiting</h1>
      <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 12px;">
        Hey ${firstName}, you have <strong>${tokensRemaining} tokens</strong> ready to use. Most users run <strong>JD Match</strong> next — just paste any job posting and get an honest assessment of your fit.
      </p>
      <div style="background:#fef3c7;border-radius:12px;padding:16px;margin:16px 0;text-align:center;">
        <p style="color:#92400e;font-size:14px;font-weight:600;margin:0;">
          💡 Pro tip: Paste a LinkedIn job URL for instant analysis
        </p>
      </div>
      <div style="text-align:center;">
        ${ctaButton("Use Your Tokens Now", `${appUrl}/dashboard`)}
      </div>
    `),
  });
}

// ---------------------------------------------------------------------------
// Template: Activation Day 7 (signup + 7 days, significant tokens unused)
// ---------------------------------------------------------------------------

export async function sendActivationDay7(email: string, name: string, tokensRemaining: number): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";
  const firstName = name.split(" ")[0] || "there";

  return sendEmail({
    to: email,
    subject: `Last chance: ${tokensRemaining} tokens expiring soon`,
    html: emailWrapper(`
      <h1 style="font-size:22px;color:#111827;margin:0 0 16px;">Don't let your tokens go to waste</h1>
      <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 12px;">
        Hey ${firstName}, you signed up a week ago but still have <strong>${tokensRemaining} tokens</strong> unused. Daily credits cap at 14 — use your signup bonus before it gets crowded out.
      </p>
      <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 12px;">
        Here's a 10-minute career checkup:
      </p>
      <ol style="color:#4b5563;font-size:14px;line-height:1.9;padding-left:20px;margin:0 0 12px;">
        <li>Run your <strong>AI Displacement Score</strong> (free, 30 sec)</li>
        <li>Paste a job you like into <strong>JD Match</strong> (2 tokens)</li>
        <li>Get your resume <strong>ATS-optimized</strong> (10 tokens)</li>
      </ol>
      <div style="text-align:center;">
        ${ctaButton("Use My Tokens Now", `${appUrl}/dashboard`)}
      </div>
    `),
  });
}

// ---------------------------------------------------------------------------
// Template: Post-Purchase Day 0 (immediately after token pack purchase)
// ---------------------------------------------------------------------------

export async function sendPostPurchaseWelcome(email: string, name: string, packName: string, tokensAdded: number): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";
  const firstName = name.split(" ")[0] || "there";

  return sendEmail({
    to: email,
    subject: `Your ${packName} is ready — here's the optimal order`,
    html: emailWrapper(`
      <h1 style="font-size:22px;color:#111827;margin:0 0 16px;">Thank you, ${firstName}!</h1>
      <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 12px;">
        Your <strong>${packName}</strong> is active. You now have <strong>${tokensAdded} tokens</strong> to work with.
      </p>
      <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 12px;">
        Here's the optimal order for maximum impact:
      </p>
      <ol style="color:#4b5563;font-size:14px;line-height:1.9;padding-left:20px;margin:0 0 12px;">
        <li><strong>JD Match</strong> on your top target job (2 tokens)</li>
        <li><strong>Resume Optimizer</strong> tailored to that role (10 tokens)</li>
        <li><strong>Cover Letter</strong> that tells your story (3 tokens)</li>
        <li><strong>Interview Prep</strong> for the likely questions (3 tokens)</li>
        <li><strong>Salary Negotiation</strong> data for when you get the offer (3 tokens)</li>
      </ol>
      <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 12px;">
        Total: 21 tokens for a complete application package. You have plenty to spare.
      </p>
      <div style="text-align:center;">
        ${ctaButton("Start Your Career Overhaul", `${appUrl}/dashboard`)}
      </div>
    `),
  });
}

// ---------------------------------------------------------------------------
// Template: Re-engagement Day 14 (14 days inactive)
// ---------------------------------------------------------------------------

export async function sendReengagementDay14(email: string, name: string, dailyCreditsAvailable: number): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";
  const firstName = name.split(" ")[0] || "there";

  return sendEmail({
    to: email,
    subject: `${firstName}, your daily credits are piling up`,
    html: emailWrapper(`
      <h1 style="font-size:22px;color:#111827;margin:0 0 16px;">Your credits are waiting</h1>
      <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 12px;">
        Hey ${firstName}, you have <strong>${dailyCreditsAvailable} free daily credits</strong> waiting. That's enough for a JD Match scan every day this week.
      </p>
      <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 12px;">
        The job market shifts fast. A quick daily check keeps you ahead:
      </p>
      <ul style="color:#4b5563;font-size:14px;line-height:1.9;padding-left:20px;margin:0 0 12px;">
        <li>Paste any new job posting → instant JD Match</li>
        <li>Track how your match scores change as you improve</li>
        <li>Daily tokens are free — use them or lose them</li>
      </ul>
      <div style="text-align:center;">
        ${ctaButton("Claim Your Free Credits", `${appUrl}/dashboard`)}
      </div>
    `),
  });
}

// ---------------------------------------------------------------------------
// Template: Career Pulse — Monthly re-engagement
// ---------------------------------------------------------------------------

export async function sendCareerPulse(
  email: string,
  name: string,
  title: string,
  industry: string,
  displacementScore: number,
  topSkill: string,
  changeDirection: "up" | "down" | "stable",
): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";
  const firstName = name.split(" ")[0] || "there";
  const monthName = new Date().toLocaleString("en-US", { month: "long" });
  
  const changeText = changeDirection === "up"
    ? '<span style="color:#dc2626;font-weight:700;">↑ Increased</span> from last month'
    : changeDirection === "down"
      ? '<span style="color:#059669;font-weight:700;">↓ Decreased</span> from last month'
      : '<span style="color:#6b7280;font-weight:700;">→ Stable</span> from last month';

  const scoreColor = displacementScore >= 60 ? "#dc2626" : displacementScore >= 40 ? "#d97706" : "#059669";

  return sendEmail({
    to: email,
    subject: `Your ${monthName} AI Career Pulse: ${title}`,
    html: emailWrapper(`
      <h1 style="font-size:22px;color:#111827;margin:0 0 16px;">Your ${monthName} Career Pulse</h1>
      <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 16px;">
        Hey ${firstName}, here's your monthly AI career update for <strong>${title}</strong> in <strong>${industry}</strong>.
      </p>
      
      <div style="background:#f9fafb;border-radius:16px;padding:24px;margin:0 0 20px;text-align:center;">
        <p style="color:#6b7280;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.05em;">AI Displacement Risk</p>
        <p style="font-size:48px;font-weight:800;color:${scoreColor};margin:0;">${displacementScore}<span style="font-size:20px;color:#9ca3af;">/100</span></p>
        <p style="font-size:13px;margin:8px 0 0;">${changeText}</p>
      </div>

      <div style="background:#eff6ff;border-radius:12px;padding:16px;margin:0 0 20px;">
        <p style="color:#1e40af;font-size:13px;margin:0;">
          <strong>Top emerging skill for your field:</strong> ${topSkill}
        </p>
      </div>

      <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 12px;">
        The AI landscape shifts monthly. Stay ahead by checking your full dashboard and running updated analyses.
      </p>
      
      <div style="text-align:center;">
        ${ctaButton("Check Your Full Dashboard", `${appUrl}/dashboard`)}
      </div>
      
      <p style="color:#9ca3af;font-size:11px;margin-top:24px;text-align:center;">
        You receive this monthly because you have a career profile on AISkillScore. 
        <a href="${appUrl}/settings" style="color:#6b7280;">Manage preferences</a>
      </p>
    `),
  });
}
