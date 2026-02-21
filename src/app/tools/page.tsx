import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { ToolsGrid } from "@/components/dashboard/ToolsGrid";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Career Tools — AISkillScore",
  description:
    "11 AI-powered career tools. Resume optimizer, Job Match Score, interview prep, skills gap analysis, salary negotiation, and more. Pay per use with tokens.",
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

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://aiskillscore.com" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://aiskillscore.com/tools" },
    ],
  };

  const content = (
    <div className="max-w-4xl mx-auto px-4 py-5 sm:py-8 space-y-6 stagger-children">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />
      {/* Hero section */}
      <div className="surface-hero p-6 sm:p-8">
        <h1 className="text-h1 mb-2">AI-Powered Career Intelligence</h1>
        <p className="text-body-sm leading-relaxed max-w-lg mb-4">
          Professional-grade analysis that costs others $50–200/month. Yours for tokens.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="ui-badge ui-badge-blue">11 tools</span>
          <span className="ui-badge ui-badge-green">1 free tool</span>
          <span className="ui-badge ui-badge-gray">Avg 30s analysis</span>
        </div>
      </div>

      {!user && (
        <div className="surface-card-soft p-5 flex items-center justify-between gap-4">
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
            className="btn-primary flex-shrink-0 px-5 !w-auto"
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
