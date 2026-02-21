import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { LifetimeContent } from "@/components/pricing/LifetimeContent";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

export const metadata: Metadata = {
  title: "Lifetime Deal — 120 Tokens/Month Forever | AISkillScore",
  description:
    "One-time payment from $119 for 120 AI career tokens refilled every month forever. 11 tools, no subscriptions. 30-day money-back guarantee.",
  alternates: { canonical: `${APP_URL}/lifetime` },
  openGraph: {
    title: "Lifetime Deal — AISkillScore",
    description: "From $119 once for 120 tokens/month forever. Break even in 3 months.",
    url: `${APP_URL}/lifetime`,
  },
};

export const dynamic = "force-dynamic";

export default async function LifetimePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profile = user
    ? (await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()).data
    : null;

  if (user) {
    return (
      <AppShell isLoggedIn={true} profile={profile}>
        <LifetimeContent />
      </AppShell>
    );
  }

  return <AppShell isLoggedIn={false}><LifetimeContent /></AppShell>;
}
