import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const ref = searchParams.get("ref");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Send welcome email for new accounts (fire-and-forget)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, created_at")
            .eq("id", user.id)
            .maybeSingle();

          if (profile) {
            const createdAt = new Date(profile.created_at);
            const isNew = Date.now() - createdAt.getTime() < 5 * 60 * 1000; // 5 min
            if (isNew) {
              // Fire-and-forget: don't block the redirect
              sendWelcomeEmail(user.email, profile.full_name || "there").catch(() => {});
            }
          }
        }
      } catch {
        // Non-critical — never block auth flow for email
      }

      // Pass referral code to dashboard via query param if present
      // (useTokens will pick it up from localStorage which was set on auth page)
      const redirectUrl = ref ? `${origin}${next}?ref=${encodeURIComponent(ref)}` : `${origin}${next}`;
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=could-not-authenticate`);
}
