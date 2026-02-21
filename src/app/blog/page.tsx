import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Tag, Briefcase, Building2, GitCompareArrows } from "lucide-react";
import { ARTICLES } from "@/lib/content";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

export const metadata: Metadata = {
  title: "Blog — AI Career Intelligence Insights | AISkillScore",
  description:
    "Expert guides on AI job displacement, ATS resume optimization, interview preparation, salary negotiation, and career growth. Data-backed insights from AISkillScore Research.",
  alternates: { canonical: `${APP_URL}/blog` },
  openGraph: {
    title: "AISkillScore Blog — AI Career Intelligence Insights",
    description: "Expert guides, original research, and actionable tips for AI-age career success.",
    url: `${APP_URL}/blog`,
  },
  twitter: {
    card: "summary_large_image",
    title: "AISkillScore Blog — AI Career Intelligence",
    description: "Expert guides on AI displacement, ATS optimization, and interview prep.",
  },
};

const CATEGORY_BADGES: Record<string, string> = {
  guides: "ui-badge ui-badge-blue",
  research: "ui-badge ui-badge-amber",
  tips: "ui-badge ui-badge-green",
  news: "ui-badge ui-badge-gray",
};

export default function BlogIndex() {
  const blogCollectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${APP_URL}/blog#collection`,
    url: `${APP_URL}/blog`,
    name: "AISkillScore Blog",
    description:
      "AISkillScore is an AI-powered career intelligence platform. This blog publishes answer-first guides and research on resume optimization, job matching, interview prep, and salary negotiation.",
    isPartOf: { "@id": `${APP_URL}/#website` },
  };

  const blogItemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "AISkillScore Blog Articles",
    numberOfItems: ARTICLES.length,
    itemListElement: ARTICLES.map((article, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "BlogPosting",
        headline: article.title,
        description: article.description,
        url: `${APP_URL}/blog/${article.slug}`,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        author: { "@type": "Organization", name: article.author, url: APP_URL },
        publisher: { "@type": "Organization", name: "AISkillScore", url: APP_URL },
      },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: APP_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${APP_URL}/blog` },
    ],
  };

  const [hero, ...rest] = ARTICLES;

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogCollectionJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogItemListJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />

      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            AI Career Intelligence Blog
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Direct, data-backed answers for navigating your career in the age of AI.
          </p>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {["All", "Guides", "Research", "Tips"].map((cat) => (
            <span
              key={cat}
              className={cat === "All" ? "ui-badge ui-badge-blue" : "ui-badge ui-badge-gray"}
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Featured article */}
        {hero && (
          <Link
            href={`/blog/${hero.slug}`}
            className="surface-hero p-6 sm:p-8 flex flex-col sm:flex-row gap-5 mb-8 group"
          >
            <span className="text-4xl shrink-0">{hero.heroEmoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={CATEGORY_BADGES[hero.category] || "ui-badge ui-badge-gray"}>
                  {hero.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" /> {hero.readTime}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {hero.title}
              </h2>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{hero.description}</p>
              <span className="text-sm text-blue-600 font-medium inline-flex items-center gap-1">
                Read guide <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        )}

        {/* Article grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
          {rest.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="surface-base surface-hover p-5 flex flex-col group"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{article.heroEmoji}</span>
                <span className={CATEGORY_BADGES[article.category] || "ui-badge ui-badge-gray"}>
                  {article.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                  <Clock className="w-3 h-3" /> {article.readTime}
                </span>
              </div>
              <h2 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {article.title}
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">
                {article.description}
              </p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {article.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="ui-badge ui-badge-gray text-[10px]">{tag}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        {/* Browse by topic */}
        <div className="mb-14">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Browse by topic</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/roles" className="surface-base surface-hover p-4 flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">Role Guides</p>
                <p className="text-xs text-gray-500">By job title</p>
              </div>
            </Link>
            <Link href="/industries" className="surface-base surface-hover p-4 flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">Industry Guides</p>
                <p className="text-xs text-gray-500">By sector</p>
              </div>
            </Link>
            <Link href="/compare" className="surface-base surface-hover p-4 flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <GitCompareArrows className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">Comparisons</p>
                <p className="text-xs text-gray-500">vs competitors</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="surface-hero p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to take action?</h2>
          <p className="text-sm text-gray-500 mb-6">Try our free AI Displacement Score — no signup required.</p>
          <Link
            href="/auth"
            className="btn-primary sm:w-auto px-6 inline-flex"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
