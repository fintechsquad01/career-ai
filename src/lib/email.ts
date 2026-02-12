/**
 * Email integration via Resend.
 * No-ops gracefully when RESEND_API_KEY is not configured.
 */

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
        from: "CareerAI <noreply@careerai.com>",
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

/** Send results PDF email to captured lead */
export async function sendResultsEmail(email: string, context: string): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://careerai.com";
  return sendEmail({
    to: email,
    subject: `Your CareerAI ${context === "resume_xray" ? "Resume X-Ray" : "Job Match"} Results`,
    html: `
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="font-size: 24px; color: #111827;">Your CareerAI Results</h1>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          Thanks for trying CareerAI! Your ${context === "resume_xray" ? "resume analysis" : "job match analysis"} results are ready.
        </p>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          Create a free account to unlock all 11 AI career tools, save your results, and start your Job Mission.
        </p>
        <a href="${appUrl}/auth" style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #2563eb, #7c3aed); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 14px; margin-top: 16px;">
          Create Account — 5 Free Tokens
        </a>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
          Encrypted · Never sold · 30 second analysis
        </p>
      </div>
    `,
  });
}
