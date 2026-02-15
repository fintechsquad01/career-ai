import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { ToolsGrid } from "@/components/dashboard/ToolsGrid";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Career Tools — AISkillScore",
  description:
    "11 AI-powered career tools. Resume optimizer, JD match score, interview prep, skills gap analysis, salary negotiation, and more.",
  robots: { index: true, follow: true },
};

export const dynamic = "force-dynamic";

export default async function ToolsHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user
    ? (
        await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle()
      ).data
    : null;

  const content = (
    <div className="max-w-4xl mx-auto px-4 py-5 sm:py-8 space-y-6 stagger-children">
      {/* Hero section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 p-6 sm:p-8 text-white">
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-violet-400/20 rounded-full blur-2xl" />
        <div className="relative">
          <h1 className="text-xl sm:text-2xl font-bold mb-2">AI-Powered Career Intelligence</h1>
          <p className="text-sm sm:text-base text-blue-100 leading-relaxed max-w-lg mb-4">
            Professional-grade analysis that costs others $50–200/month. Yours for tokens.
          </p>
          <div className="flex flex-wrap gap-3 text-xs font-medium">
            <span className="px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">11 tools</span>
            <span className="px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">6 free</span>
            <span className="px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">Avg 30s analysis</span>
          </div>
        </div>
      </div>

      {!user && (
        <div className="bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-100 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Sign up to use any tool
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Get 15 free tokens — enough for your first 3 analyses.
            </p>
          </div>
          <Link
            href="/auth"
            className="flex-shrink-0 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity min-h-[44px] flex items-center"
          >
            Get Started Free
          </Link>
        </div>
      )}

      <ToolsGrid />
    </div>
  );

  if (user) {
    return (
      <AppShell isLoggedIn={true} profile={profile}>
        {content}
      </AppShell>
    );
  }

  // Unauthenticated: simple layout without AppShell
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="h-16 border-b border-gray-200 bg-white/80 backdrop-blur-xl flex items-center px-4">
        <Link
          href="/"
          className="text-lg font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"
        >
          AISkillScore
        </Link>
        <div className="flex-1" />
        <Link
          href="/auth"
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          Sign Up Free
        </Link>
      </nav>
      {content}
    </div>
  );
}
