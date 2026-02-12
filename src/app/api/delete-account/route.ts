import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabaseServer = await createServerClient();
  const { data: { user } } = await supabaseServer.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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
