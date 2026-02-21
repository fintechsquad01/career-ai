import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { INDUSTRY_PAGES } from "@/lib/industries";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

export const metadata: Metadata = {
  title: "Industries — AI Career Guides by Industry | AISkillScore",
  description: "Industry-specific career guides with AI displacement analysis, resume optimization, and job match tools. Find your industry and start your career mission.",
  alternates: { canonical: `${APP_URL}/industries` },
  openGraph: {
    title: "Industries — AI Career Guides by Industry",
    description: "Industry-specific career guides with AI displacement analysis, resume optimization, and job match tools.",
    url: `${APP_URL}/industries`,
  },
};

export const dynamic = "force-dynamic";

export default async function IndustriesIndexPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profile = user
    ? (await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()).data
    : null;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AISkillScore Industry Career Guides",
    description: "Industry-specific career optimization guides powered by AI.",
    url: `${APP_URL}/industries`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: INDUSTRY_PAGES.map((ind, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${APP_URL}/industries/${ind.slug}`,
        name: ind.name,
      })),
    },
  };

  const content = (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
        <div className="surface-hero p-6 sm:p-8 mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
            Industry Career Guides
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed max-w-2xl mb-3">
            Industry-by-industry AI impact analysis. See displacement risk, recommended tools, and top roles for your sector.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="ui-badge ui-badge-blue">{INDUSTRY_PAGES.length} industries</span>
            <span className="ui-badge ui-badge-gray">AI displacement context</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {INDUSTRY_PAGES.map((ind) => (
            <Link
              key={ind.slug}
              href={`/industries/${ind.slug}`}
              className="surface-card surface-card-hover p-5 group"
            >
              <h2 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {ind.name}
              </h2>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ind.description}</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                <span>{ind.topRoles.length} key roles</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto text-gray-300 group-hover:text-blue-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        {/* Cross-link */}
        <div className="mt-8 text-center">
          <Link
            href="/roles"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
          >
            Browse by role instead <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </>
  );

  if (user) {
    return <AppShell isLoggedIn={true} profile={profile}>{content}</AppShell>;
  }
  return <AppShell isLoggedIn={false}>{content}</AppShell>;
}
