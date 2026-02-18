import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export const metadata: Metadata = {
  title: "Dashboard — AISkillScore",
  description: "Your career intelligence hub. View token balance, recent analyses, and access all 11 AI career tools.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { data: careerProfile } = await supabase
    .from("career_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: allJobTargets } = await supabase
    .from("job_targets")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const activeJobTarget = allJobTargets?.find((t) => t.is_active) ?? null;

  const { data: recentResults } = await supabase
    .from("tool_results")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <AppShell
      isLoggedIn={true}
      profile={profile}
      careerProfile={careerProfile}
      activeJobTarget={activeJobTarget}
      jobTargets={allJobTargets || []}
    >
      <DashboardContent
        profile={profile}
        careerProfile={careerProfile}
        activeJobTarget={activeJobTarget}
        allJobTargets={allJobTargets || []}
        recentResults={recentResults || []}
      />
    </AppShell>
  );
}
