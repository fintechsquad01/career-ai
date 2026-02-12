import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { ReferralContent } from "@/components/referral/ReferralContent";

export const metadata: Metadata = {
  title: "Refer & Earn — CareerAI",
  description: "Give 5 tokens, get 10. Share your referral link.",
};

export const dynamic = "force-dynamic";

export default async function ReferralPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const [{ data: profile }, { data: referralTransactions }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("token_transactions")
      .select("*")
      .eq("user_id", user.id)
      .eq("type", "referral_bonus")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <AppShell isLoggedIn={true} profile={profile}>
      <ReferralContent profile={profile} referralTransactions={referralTransactions || []} />
    </AppShell>
  );
}
