"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimateOnScroll } from "@/components/shared/AnimateOnScroll";
import { StatBlock } from "@/components/shared/StatBlock";
import { ExpertQuote } from "@/components/shared/ExpertQuote";
import { ATS_STATS, RECRUITER_QUOTES } from "@/lib/pain-stats";
import { ArrowRight, Clock, Briefcase, Building2, GitCompareArrows } from "lucide-react";
import type { TArticle } from "@/lib/content";

const CATEGORY_BADGES: Record<string, string> = {
  guides: "ui-badge ui-badge-blue",
  research: "ui-badge ui-badge-amber",
  tips: "ui-badge ui-badge-green",
  news: "ui-badge ui-badge-gray",
};

const FILTER_CATEGORIES = ["all", "guides", "research", "tips"] as const;
type FilterCategory = (typeof FILTER_CATEGORIES)[number];

const FILTER_LABELS: Record<FilterCategory, string> = {
  all: "All",
  guides: "Guides",
  research: "Research",
  tips: "Tips",
};

interface BlogContentProps {
  articles: TArticle[];
}

export function BlogContent({ articles }: BlogContentProps) {
  const [filter, setFilter] = useState<FilterCategory>("all");

  const filtered = filter === "all"
    ? articles
    : articles.filter((a) => a.category === filter);

  const [hero, ...rest] = filtered;

  return (
    <>
      {/* Category pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10 stagger-children">
        {FILTER_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`${filter === cat ? "ui-badge ui-badge-blue" : "ui-badge ui-badge-gray"} cursor-pointer transition-colors min-h-[32px]`}
          >
            {FILTER_LABELS[cat]}
          </button>
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

      <div className="mb-10">
        <StatBlock stats={ATS_STATS.slice(0, 3)} />
      </div>

      {/* Article grid */}
      {rest.length > 0 && (
        <AnimateOnScroll>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14 stagger-children">
            {rest.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="surface-base surface-hover p-5 flex flex-col group"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{article.heroEmoji}</span>
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
        </AnimateOnScroll>
      )}

      {filtered.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-8">No articles in this category yet.</p>
      )}

      <div className="mb-10">
        <ExpertQuote
          quote={RECRUITER_QUOTES[0].quote}
          attribution={RECRUITER_QUOTES[0].attribution}
          role={RECRUITER_QUOTES[0].role}
        />
      </div>

      {/* Browse by topic */}
      <div className="gradient-divider mb-14" />
      <AnimateOnScroll>
        <div className="mb-14">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Browse by topic</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 stagger-children">
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
      </AnimateOnScroll>

      {/* Bottom CTA */}
      <AnimateOnScroll>
        <div className="surface-hero p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to take action?</h2>
        <p className="text-sm text-gray-500 mb-6">Try our free AI Displacement Score — no signup required.</p>
        <Link href="/auth" className="btn-primary sm:w-auto px-6 inline-flex">
          Get Started Free <ArrowRight className="w-4 h-4" />
        </Link>
        </div>
      </AnimateOnScroll>
    </>
  );
}
