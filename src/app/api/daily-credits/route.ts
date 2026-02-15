import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * POST /api/daily-credits
 * Awards 2 daily credits if not yet awarded today (UTC).
 * Called on authenticated page load via useTokens hook.
 * Requires browser session cookies — direct curl/API calls without cookies
 * will correctly return 401.
 * Returns: { awarded, daily_balance, purchased_balance }
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateCheck = checkRateLimit(`daily-credits:${user.id}`, { limit: 5, windowSeconds: 60 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rateCheck.resetMs / 1000)) } }
      );
    }

    const { data, error } = await supabase.rpc("award_daily_credits", {
      p_user_id: user.id,
    });

    if (error) {
      console.error("award_daily_credits RPC error:", error);

      // Fallback: return current balance from profile if RPC fails
      // (e.g., RPC not deployed yet, or schema mismatch)
      const { data: profile } = await supabase
        .from("profiles")
        .select("token_balance, daily_credits_balance")
        .eq("id", user.id)
        .single();

      if (profile) {
        return NextResponse.json({
          awarded: false,
          daily_balance: profile.daily_credits_balance ?? 0,
          purchased_balance: profile.token_balance ?? 0,
        });
      }

      return NextResponse.json(
        { error: "Failed to award daily credits" },
        { status: 500 }
      );
    }

    // Guard against null RPC response
    if (!data) {
      return NextResponse.json({
        awarded: false,
        daily_balance: 0,
        purchased_balance: 0,
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Daily credits error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
