import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { ToolPageContent } from "@/components/tools/ToolPageContent";

export const dynamic = "force-dynamic";

interface ToolPageProps {
  params: Promise<{ toolId: string }>;
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { toolId } = await params;
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

  const { data: activeJobTarget } = await supabase
    .from("job_targets")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  return (
    <AppShell
      isLoggedIn={true}
      profile={profile}
      careerProfile={careerProfile}
      activeJobTarget={activeJobTarget}
    >
      <ToolPageContent toolId={toolId} />
    </AppShell>
  );
}
