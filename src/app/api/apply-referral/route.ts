import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * POST /api/apply-referral
 * Applies a referral code to the authenticated user's profile.
 * Looks up the referrer by code, sets referred_by, calls process_referral RPC.
 * Idempotent: no-op if user already has referred_by set.
 * Body: { referral_code: string }
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateCheck = checkRateLimit(`apply-referral:${user.id}`, { limit: 5, windowSeconds: 60 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rateCheck.resetMs / 1000)) } }
      );
    }

    const { referral_code } = await request.json();
    if (!referral_code || typeof referral_code !== "string") {
      return NextResponse.json({ error: "referral_code is required" }, { status: 400 });
    }

    const trimmedCode = referral_code.trim().toLowerCase();

    // Check if user already has a referrer (idempotent)
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("referred_by, referral_code")
      .eq("id", user.id)
      .single();

    if (currentProfile?.referred_by) {
      return NextResponse.json({ applied: false, reason: "already_referred" });
    }

    // Prevent self-referral
    if (currentProfile?.referral_code === trimmedCode) {
      return NextResponse.json({ applied: false, reason: "self_referral" });
    }

    // Look up the referrer by their referral code
    const { data: referrer } = await supabase
      .from("profiles")
      .select("id")
      .eq("referral_code", trimmedCode)
      .single();

    if (!referrer) {
      return NextResponse.json({ applied: false, reason: "invalid_code" });
    }

    // Set referred_by on the user's profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ referred_by: referrer.id })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to set referred_by:", updateError);
      return NextResponse.json({ error: "Failed to apply referral" }, { status: 500 });
    }

    // Call process_referral to credit both parties
    const { error: rpcError } = await supabase.rpc("process_referral", {
      p_referrer_id: referrer.id,
      p_new_user_id: user.id,
    });

    if (rpcError) {
      console.error("process_referral RPC error:", rpcError);
      // Referral link is set even if bonus fails — can retry
      return NextResponse.json({ applied: true, bonuses_credited: false });
    }

    return NextResponse.json({ applied: true, bonuses_credited: true });
  } catch (error) {
    console.error("Apply referral error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
