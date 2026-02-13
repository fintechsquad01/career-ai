import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";
  const ref = searchParams.get("ref");

  const supabase = await createClient();
  let authError: Error | null = null;

  // Flow 1: PKCE code exchange (OAuth and some magic link flows)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    authError = error;
  }
  // Flow 2: Token hash verification (magic link / email OTP)
  else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "magiclink" | "email" | "signup" | "recovery" | "invite" | "email_change",
    });
    authError = error;
  }

  if (!authError && (code || token_hash)) {
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

  // Auth failed — include error detail for debugging
  const errorMsg = authError?.message || "could-not-authenticate";
  return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(errorMsg)}`);
}
