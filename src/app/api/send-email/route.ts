import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail, sendDailyCreditReminder } from "@/lib/email";

/**
 * POST /api/send-email
 *
 * Server-side email sending endpoint. Requires authentication (or service-role for cron).
 * Body: { type: "welcome" | "daily_reminder", ...params }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type } = body as { type: string };

    if (type === "welcome") {
      // Called from auth callback — sends welcome email to the authenticated user
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, created_at")
        .eq("id", user.id)
        .maybeSingle();

      // Only send welcome email if account is freshly created (within last 5 minutes)
      if (profile) {
        const createdAt = new Date(profile.created_at);
        const now = new Date();
        const diffMs = now.getTime() - createdAt.getTime();
        const isNew = diffMs < 5 * 60 * 1000; // 5 minutes

        if (isNew) {
          await sendWelcomeEmail(user.email, profile.full_name || "there");
          return NextResponse.json({ sent: true });
        }
      }

      return NextResponse.json({ sent: false, reason: "not_new_account" });
    }

    if (type === "daily_reminder_batch") {
      // Cron job: find users who haven't logged in for 2+ days and send reminders
      const cronSecret = process.env.CRON_SECRET;
      const authHeader = request.headers.get("authorization");

      // Verify cron secret for batch operations
      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabaseAdmin = createAdminClient();

      // Find users who:
      // 1. Have daily_credits_balance < 14 (haven't maxed out)
      // 2. last_daily_credit_at is 2+ days ago
      // 3. Have notification_preferences.product_updates !== false
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
        // Respect notification preferences — skip users who opted out of product_updates
        const prefs = user.notification_preferences;
        if (
          prefs &&
          typeof prefs === "object" &&
          !Array.isArray(prefs) &&
          (prefs as Record<string, unknown>).product_updates === false
        ) {
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

      return NextResponse.json({ sent, skippedOptOut, total: inactiveUsers?.length || 0 });
    }

    return NextResponse.json({ error: "Unknown email type" }, { status: 400 });
  } catch (err) {
    console.error("[SendEmail] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
