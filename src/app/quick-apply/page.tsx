import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { QuickApplyFlow } from "@/components/quick-apply/QuickApplyFlow";

export const metadata: Metadata = {
  title: "Quick Apply — AISkillScore",
  description: "Paste a job description and run JD Match, Resume Optimizer, and Cover Letter in one go.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function QuickApplyPage() {
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

  return (
    <AppShell
      isLoggedIn={true}
      profile={profile}
      careerProfile={careerProfile}
      activeJobTarget={activeJobTarget}
      jobTargets={allJobTargets || []}
    >
      <QuickApplyFlow hasResume={!!careerProfile?.resume_text} />
    </AppShell>
  );
}
