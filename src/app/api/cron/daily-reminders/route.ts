import { NextResponse } from "next/server";
import { sendDailyCreditReminder } from "@/lib/email";

/**
 * GET /api/cron/daily-reminders
 *
 * Vercel Cron endpoint — runs daily at 10:00 AM UTC.
 * Vercel automatically sends CRON_SECRET as Bearer token in Authorization header.
 *
 * Finds users who haven't logged in for 2+ days, have room for daily credits,
 * and haven't opted out of product_updates notifications. Sends reminder emails.
 */
export async function GET(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");

    // Verify cron secret — Vercel sends this automatically
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabaseAdmin = createAdminClient();

    // Find users who:
    // 1. Have daily_credits_balance < 14 (haven't maxed out)
    // 2. last_daily_credit_at is 2+ days ago
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const { data: inactiveUsers, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, last_daily_credit_at, daily_credits_balance, notification_preferences")
      .lt("last_daily_credit_at", twoDaysAgo.toISOString())
      .lt("daily_credits_balance", 14)
      .limit(100);

    if (error) {
      console.error("[DailyReminder] Query error:", error);
      return NextResponse.json({ error: "Query failed" }, { status: 500 });
    }

    let sent = 0;
    let skippedOptOut = 0;

    for (const user of inactiveUsers || []) {
      // Respect notification preferences — skip users who opted out
      if (hasOptedOutOfProductUpdates(user.notification_preferences)) {
        skippedOptOut++;
        continue;
      }

      // Get the user's email from auth.users
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(user.id);
      if (!authUser?.user?.email) continue;

      if (!user.last_daily_credit_at) continue;
      const lastCredit = new Date(user.last_daily_credit_at);
      const daysMissed = Math.floor((Date.now() - lastCredit.getTime()) / (1000 * 60 * 60 * 24));

      if (daysMissed >= 2) {
        const success = await sendDailyCreditReminder(
          authUser.user.email,
          user.full_name || "there",
          daysMissed,
        );
        if (success) sent++;
      }
    }

    return NextResponse.json({
      sent,
      skippedOptOut,
      total: inactiveUsers?.length || 0,
    });
  } catch (err) {
    console.error("[DailyReminder] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * Check if user has opted out of product_updates notifications.
 * notification_preferences is a JSONB column: { marketing: boolean, product_updates: boolean }
 * Defaults to true (send emails) if not set or if the field is missing.
 */
function hasOptedOutOfProductUpdates(prefs: unknown): boolean {
  if (!prefs || typeof prefs !== "object" || Array.isArray(prefs)) {
    return false; // Default: opted in
  }
  const obj = prefs as Record<string, unknown>;
  // Only skip if explicitly set to false
  return obj.product_updates === false;
}
