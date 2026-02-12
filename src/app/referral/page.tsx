import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { ReferralContent } from "@/components/referral/ReferralContent";

export const dynamic = "force-dynamic";

export default async function ReferralPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <AppShell isLoggedIn={true} profile={profile}>
      <ReferralContent profile={profile} />
    </AppShell>
  );
}
