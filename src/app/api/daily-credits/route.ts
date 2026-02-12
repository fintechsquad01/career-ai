import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/daily-credits
 * Awards 2 daily credits if not yet awarded today (UTC).
 * Called on authenticated page load.
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

    const { data, error } = await supabase.rpc("award_daily_credits", {
      p_user_id: user.id,
    });

    if (error) {
      console.error("award_daily_credits RPC error:", error);
      return NextResponse.json(
        { error: "Failed to award daily credits" },
        { status: 500 }
      );
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
