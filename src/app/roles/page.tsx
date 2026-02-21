import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ROLES } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { AnimateOnScroll } from "@/components/shared/AnimateOnScroll";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

export const metadata: Metadata = {
  title: "Career Roles — AI-Powered Resume and Interview Guides | AISkillScore",
  description: "Role-specific career guides with AI-powered resume optimization, job match analysis, and interview preparation. Find your role and start your mission.",
  alternates: { canonical: `${APP_URL}/roles` },
  openGraph: {
    title: "Career Roles — AI-Powered Resume and Interview Guides",
    description: "Role-specific career guides with AI-powered resume optimization, job match analysis, and interview preparation.",
    url: `${APP_URL}/roles`,
    type: "website",
    siteName: "AISkillScore",
    images: [{ url: `${APP_URL}/api/og`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Career Roles — AI-Powered Resume and Interview Guides | AISkillScore",
    description: "Role-specific career guides with AI-powered resume optimization, job match analysis, and interview preparation.",
    images: [`${APP_URL}/api/og`],
  },
};

export const dynamic = "force-dynamic";

export default async function RolesIndexPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profile = user
    ? (await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()).data
    : null;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AISkillScore Career Role Guides",
    description: "Role-specific career optimization guides powered by AI.",
    url: `${APP_URL}/roles`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: ROLES.map((role, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${APP_URL}/roles/${role.slug}`,
        name: role.title,
      })),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: APP_URL },
      { "@type": "ListItem", position: 2, name: "Roles", item: `${APP_URL}/roles` },
    ],
  };

  const grouped = ROLES.reduce<Record<string, typeof ROLES>>((acc, role) => {
    const key = role.industry;
    if (!acc[key]) acc[key] = [];
    acc[key].push(role);
    return acc;
  }, {});

  const content = (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
        <AnimateOnScroll>
          <div className="surface-hero p-6 sm:p-8 mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
              Career Role Guides
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed max-w-2xl mb-3">
              Role-specific career strategies with tailored hiring checklists, tool sequences, and FAQ.
              Find your exact role and get an AI-powered action plan.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="ui-badge ui-badge-blue">{ROLES.length} roles</span>
              <span className="ui-badge ui-badge-gray">{Object.keys(grouped).length} industries</span>
            </div>
          </div>
        </AnimateOnScroll>

        {Object.entries(grouped).map(([industry, roles]) => (
          <AnimateOnScroll key={industry}>
            <div className="mb-10">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">{industry}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
                {roles.map((role) => (
                  <Link
                    key={role.slug}
                    href={`/roles/${role.slug}`}
                    className="surface-card surface-card-hover p-5 group"
                  >
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {role.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{role.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="ui-badge ui-badge-blue">{role.persona}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500 transition-colors ml-auto" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        ))}

        {/* Cross-link */}
        <div className="mt-4 text-center">
          <Link
            href="/industries"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
          >
            Browse by industry instead <ArrowRight className="w-3.5 h-3.5" />
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
