import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Briefcase,
  Building2,
  GitCompareArrows,
  HelpCircle,
  ArrowRight,
  Clock,
} from "lucide-react";
import { ARTICLES, COMPARISONS } from "@/lib/content";
import { ROLES } from "@/lib/roles";
import { INDUSTRY_PAGES } from "@/lib/industries";
import { FAQ_ITEMS } from "@/lib/constants";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

export const metadata: Metadata = {
  title: "Career Resources — Guides, Comparisons & FAQ",
  description:
    "Free career guides, role-specific AI tool strategies, industry intelligence, competitor comparisons, and answers to your career questions. All powered by AISkillScore.",
  alternates: { canonical: `${APP_URL}/resources` },
  openGraph: {
    title: "Career Resources — AISkillScore",
    description:
      "Explore career guides, role strategies, industry intelligence, and comparisons to make smarter career decisions.",
    url: `${APP_URL}/resources`,
  },
};

const CATEGORY_BADGES: Record<string, string> = {
  guides: "ui-badge ui-badge-blue",
  research: "ui-badge ui-badge-amber",
  tips: "ui-badge ui-badge-green",
  news: "ui-badge ui-badge-gray",
};

export default function ResourcesPage() {
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AISkillScore Career Resources",
    description:
      "Career guides, role-specific strategies, industry intelligence, and competitor comparisons.",
    url: `${APP_URL}/resources`,
    publisher: { "@id": `${APP_URL}/#organization` },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: APP_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Resources",
        item: `${APP_URL}/resources`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-14">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">
              Career Resources
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Guides, strategies, and tools to navigate your job search with
              evidence — not guesswork.
            </p>
          </div>

          {/* Section: Career Guides (Blog) */}
          <section className="mb-14">
            <div className="flex items-center gap-2 mb-5">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">
                Career Guides
              </h2>
              <span className="ui-badge ui-badge-gray ml-auto">
                {ARTICLES.length} articles
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ARTICLES.map((article) => (
                <Link
                  key={article.slug}
                  href={`/blog/${article.slug}`}
                  className="surface-card surface-card-hover p-5 flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={
                        CATEGORY_BADGES[article.category] ||
                        "ui-badge ui-badge-gray"
                      }
                    >
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-600">
                    {article.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">
                    {article.description}
                  </p>
                </Link>
              ))}
            </div>
            <p className="mt-4">
              <Link
                href="/blog"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                All articles <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </section>

          {/* Section: Role Guides */}
          <section className="mb-14">
            <div className="flex items-center gap-2 mb-5">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-900">
                Role-Specific Guides
              </h2>
              <span className="ui-badge ui-badge-gray ml-auto">
                {ROLES.length} roles
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ROLES.map((role) => (
                <Link
                  key={role.slug}
                  href={`/roles/${role.slug}`}
                  className="surface-card surface-card-hover p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {role.title}
                    </h3>
                    <p className="text-xs text-gray-500">{role.industry}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                </Link>
              ))}
            </div>
            <p className="mt-4">
              <Link
                href="/roles"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                All role guides <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </section>

          {/* Section: Industry Intelligence */}
          <section className="mb-14">
            <div className="flex items-center gap-2 mb-5">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-gray-900">
                Industry Intelligence
              </h2>
              <span className="ui-badge ui-badge-gray ml-auto">
                {INDUSTRY_PAGES.length} industries
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INDUSTRY_PAGES.map((ind) => (
                <Link
                  key={ind.slug}
                  href={`/industries/${ind.slug}`}
                  className="surface-card surface-card-hover p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {ind.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {ind.topRoles.length} top roles covered
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                </Link>
              ))}
            </div>
            <p className="mt-4">
              <Link
                href="/industries"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                All industry guides <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </section>

          {/* Section: Tool Comparisons */}
          <section className="mb-14">
            <div className="flex items-center gap-2 mb-5">
              <GitCompareArrows className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-gray-900">
                Tool Comparisons
              </h2>
              <span className="ui-badge ui-badge-gray ml-auto">
                {COMPARISONS.length} comparisons
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COMPARISONS.map((comp) => (
                <Link
                  key={comp.slug}
                  href={`/compare/${comp.slug}`}
                  className="surface-card surface-card-hover p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {comp.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      vs {comp.competitor} ({comp.competitorPrice})
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                </Link>
              ))}
            </div>
            <p className="mt-4">
              <Link
                href="/compare"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                All comparisons <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </section>

          {/* Section: FAQ */}
          <section className="mb-14">
            <Link
              href="/faq"
              className="surface-card surface-card-hover p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-xs text-gray-500">
                    {FAQ_ITEMS.length} answers about tools, pricing, privacy,
                    and more
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
            </Link>
          </section>

          {/* Bottom CTA */}
          <div className="surface-card p-6 sm:p-8 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Ready to start?
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Create a free account and get 15 tokens to try any AI career tool.
            </p>
            <Link href="/auth" className="btn-primary sm:w-auto px-6 inline-flex">
              Create Account — 15 Free Tokens
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
