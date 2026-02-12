import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { HistoryContent } from "@/components/history/HistoryContent";

export const metadata: Metadata = {
  title: "Result History — CareerAI",
  description: "All your past analyses in one place.",
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Fetch first page + total count in parallel
  const [resultsResponse, countResponse] = await Promise.all([
    supabase
      .from("tool_results")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE),
    supabase
      .from("tool_results")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  return (
    <AppShell isLoggedIn={true} profile={profile}>
      <HistoryContent
        results={resultsResponse.data || []}
        totalCount={countResponse.count ?? 0}
      />
    </AppShell>
  );
}
