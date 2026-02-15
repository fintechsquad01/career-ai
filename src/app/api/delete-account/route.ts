import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabaseServer = await createServerClient();
  const { data: { user } } = await supabaseServer.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateCheck = checkRateLimit(`delete-account:${user.id}`, { limit: 2, windowSeconds: 60 });
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rateCheck.resetMs / 1000)) } }
    );
  }

  const supabaseAdmin = createAdminClient();

  try {
    // Delete user data from all tables (order matters for FK constraints)
    const tables = ["tool_results", "token_transactions", "job_targets", "career_profiles", "shared_scores"];
    for (const table of tables) {
      try {
        await supabaseAdmin.from(table).delete().eq("user_id", user.id);
      } catch (err) {
        console.error(`Failed to delete from ${table}:`, err);
      }
    }

    // Delete profile (uses "id" not "user_id")
    try {
      await supabaseAdmin.from("profiles").delete().eq("id", user.id);
    } catch (err) {
      console.error("Failed to delete profile:", err);
    }

    // Delete auth user (requires service role)
    await supabaseAdmin.auth.admin.deleteUser(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
