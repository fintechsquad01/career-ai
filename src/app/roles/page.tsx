import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ROLES } from "@/lib/roles";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

export const metadata: Metadata = {
  title: "Career Roles — AI-Powered Resume and Interview Guides | AISkillScore",
  description: "Role-specific career guides with AI-powered resume optimization, job match analysis, and interview preparation. Find your role and start your mission.",
  alternates: { canonical: `${APP_URL}/roles` },
  openGraph: {
    title: "Career Roles — AI-Powered Resume and Interview Guides",
    description: "Role-specific career guides with AI-powered resume optimization, job match analysis, and interview preparation.",
    url: `${APP_URL}/roles`,
  },
};

export default function RolesIndexPage() {
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

  const grouped = ROLES.reduce<Record<string, typeof ROLES>>((acc, role) => {
    const key = role.industry;
    if (!acc[key]) acc[key] = [];
    acc[key].push(role);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-3 tracking-tight">
          Career Role Guides
        </h1>
        <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto leading-relaxed">
          Find your role. See what hiring teams look for. Get an AI-powered action plan to close your gaps and land the job.
        </p>

        {Object.entries(grouped).map(([industry, roles]) => (
          <div key={industry} className="mb-10">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">{industry}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        ))}
      </div>
    </div>
  );
}
