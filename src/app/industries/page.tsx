import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { INDUSTRY_PAGES } from "@/lib/industries";

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

export default function IndustriesIndexPage() {
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

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-3 tracking-tight">
          Industry Career Guides
        </h1>
        <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto leading-relaxed">
          See how AI is reshaping your industry. Get a displacement risk profile, then follow an evidence-based action plan for your next role.
        </p>

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
      </div>
    </div>
  );
}
