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

const CATEGORIES = [
  {
    title: "Career Guides",
    description: "Evidence-based articles on resumes, interviews, salary negotiation, and career strategy.",
    href: "/blog",
    icon: BookOpen,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    count: ARTICLES.length,
    countLabel: "articles",
  },
  {
    title: "Role Guides",
    description: "Role-specific hiring checklists, tool sequences, and career strategies for your exact position.",
    href: "/roles",
    icon: Briefcase,
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-50",
    count: ROLES.length,
    countLabel: "roles",
  },
  {
    title: "Industry Intelligence",
    description: "AI displacement context, recommended tools, and top roles for your industry sector.",
    href: "/industries",
    icon: Building2,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    count: INDUSTRY_PAGES.length,
    countLabel: "industries",
  },
  {
    title: "Tool Comparisons",
    description: "See how AISkillScore compares to Jobscan, Teal, Resume Worded, and other career platforms.",
    href: "/compare",
    icon: GitCompareArrows,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
    count: COMPARISONS.length,
    countLabel: "comparisons",
  },
  {
    title: "FAQ",
    description: "Answers about tokens, pricing, tools, privacy, and how to get the most from AISkillScore.",
    href: "/faq",
    icon: HelpCircle,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    count: FAQ_ITEMS.length,
    countLabel: "questions",
  },
];

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
      { "@type": "ListItem", position: 2, name: "Resources", item: `${APP_URL}/resources` },
    ],
  };

  const featured = ARTICLES.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />

      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">
              Career Resources
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Guides, strategies, and intelligence to navigate your job search
              with evidence — not guesswork.{" "}
              <Link href="/tools" className="text-blue-600 hover:text-blue-700 font-medium">
                Or explore all 11 AI tools
              </Link>
            </p>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="surface-base surface-hover p-5 flex flex-col gap-3 group"
              >
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl ${cat.iconBg} flex items-center justify-center`}>
                    <cat.icon className={`w-5 h-5 ${cat.iconColor}`} />
                  </div>
                  <span className="ui-badge ui-badge-gray">
                    {cat.count} {cat.countLabel}
                  </span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                    {cat.title}
                  </h2>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <span className="text-xs text-blue-600 font-medium inline-flex items-center gap-1 mt-auto">
                  Browse <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>

          {/* Featured Guides */}
          <div className="mb-16">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Featured Guides</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {featured.map((article, i) => (
                <Link
                  key={article.slug}
                  href={`/blog/${article.slug}`}
                  className={`surface-base surface-hover p-5 flex flex-col ${i === 0 ? "sm:col-span-2 sm:row-span-1" : ""}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={CATEGORY_BADGES[article.category] || "ui-badge ui-badge-gray"}>
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    {article.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">
                    {article.description}
                  </p>
                  <span className="text-xs text-blue-600 font-medium inline-flex items-center gap-1 mt-3">
                    Read guide <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              ))}
            </div>
            <p className="mt-4">
              <Link
                href="/blog"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                All {ARTICLES.length} articles <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>

          {/* Bottom CTA */}
          <div className="surface-base p-6 sm:p-8 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Ready to start?
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Create a free account and get 15 tokens to try any AI career tool.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth" className="btn-primary sm:w-auto px-6 inline-flex">
                Create Account — 15 Free Tokens
              </Link>
              <Link href="/pricing" className="btn-secondary sm:w-auto px-6 inline-flex">
                View Token Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
