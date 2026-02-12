import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { ToolsGrid } from "@/components/dashboard/ToolsGrid";

export const metadata: Metadata = {
  title: "AI Career Tools — CareerAI",
  description: "11 AI tools to analyze, build, prepare, and grow your career.",
};

export const dynamic = "force-dynamic";

export default async function ToolsHubPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <AppShell isLoggedIn={true} profile={profile}>
      <div className="max-w-5xl mx-auto px-4 py-5 sm:py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">All Tools</h1>
        <p className="text-gray-500 text-sm mb-6">
          11 AI-powered career tools. Analyze, Build, Prepare, Grow.
        </p>
        <ToolsGrid />
      </div>
    </AppShell>
  );
}
