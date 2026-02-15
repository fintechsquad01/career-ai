import { NextResponse } from "next/server";
import {
  sendActivationDay1,
  sendActivationDay3,
  sendActivationDay7,
  sendReengagementDay14,
} from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/email-sequences
 *
 * Daily cron that processes email sequences:
 * 1. Activation (Days 1, 3, 7 after signup) — for users with unused tokens
 * 2. Re-engagement (Day 14+ inactive)
 *
 * Post-purchase emails are sent synchronously from the webhook handler.
 */
export async function GET(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabaseAdmin = createAdminClient();

    const now = new Date();
    const results = { day1: 0, day3: 0, day7: 0, reengagement: 0, errors: 0, skippedOptOut: 0 };

    // ─── Activation Sequence ───
    // Get users who signed up 1-8 days ago
    const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

    const { data: newUsers } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, token_balance, daily_credits_balance, notification_preferences, created_at")
      .gte("created_at", eightDaysAgo.toISOString())
      .lte("created_at", oneDayAgo.toISOString())
      .limit(200);

    // Get tool_results for these users to check if they've used tools
    const userIds = (newUsers || []).map((u: { id: string }) => u.id);
    const { data: toolResults } = userIds.length > 0
      ? await supabaseAdmin
          .from("tool_results")
          .select("user_id, tool_id")
          .in("user_id", userIds)
      : { data: [] };

    const userToolMap = new Map<string, Set<string>>();
    for (const tr of toolResults || []) {
      if (!userToolMap.has(tr.user_id)) userToolMap.set(tr.user_id, new Set());
      userToolMap.get(tr.user_id)!.add(tr.tool_id);
    }

    for (const user of newUsers || []) {
      // Respect notification preferences
      if (hasOptedOut(user.notification_preferences)) {
        results.skippedOptOut++;
        continue;
      }

      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(user.id);
      if (!authUser?.user?.email) continue;

      const createdAt = new Date(user.created_at);
      const daysSinceSignup = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const toolsUsed = userToolMap.get(user.id) || new Set();
      const hasPaidTools = [...toolsUsed].some(t => t !== "displacement"); // Has run paid tools

      try {
        // Day 1: Send if they haven't used any tools yet
        if (daysSinceSignup === 1 && toolsUsed.size === 0) {
          await sendActivationDay1(authUser.user.email, user.full_name || "there");
          results.day1++;
        }
        // Day 3: Send if they haven't used paid tools and have tokens
        else if (daysSinceSignup === 3 && !hasPaidTools && user.token_balance > 0) {
          await sendActivationDay3(authUser.user.email, user.full_name || "there", user.token_balance);
          results.day3++;
        }
        // Day 7: Send if they still have significant tokens unused
        else if (daysSinceSignup === 7 && user.token_balance >= 5) {
          await sendActivationDay7(authUser.user.email, user.full_name || "there", user.token_balance);
          results.day7++;
        }
      } catch {
        results.errors++;
      }
    }

    // ─── Re-engagement Sequence ───
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);

    // Users who last had daily credit activity ~14 days ago
    const { data: inactiveUsers } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, daily_credits_balance, notification_preferences")
      .lt("last_daily_credit_at", fourteenDaysAgo.toISOString())
      .gte("last_daily_credit_at", fifteenDaysAgo.toISOString())
      .limit(100);

    for (const user of inactiveUsers || []) {
      if (hasOptedOut(user.notification_preferences)) {
        results.skippedOptOut++;
        continue;
      }

      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(user.id);
      if (!authUser?.user?.email) continue;

      try {
        await sendReengagementDay14(
          authUser.user.email,
          user.full_name || "there",
          user.daily_credits_balance || 0,
        );
        results.reengagement++;
      } catch {
        results.errors++;
      }
    }

    return NextResponse.json(results);
  } catch (err) {
    console.error("[EmailSequences] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function hasOptedOut(prefs: unknown): boolean {
  if (!prefs || typeof prefs !== "object" || Array.isArray(prefs)) return false;
  const obj = prefs as Record<string, unknown>;
  return obj.product_updates === false;
}
