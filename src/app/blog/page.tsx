import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Tag } from "lucide-react";
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

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            AI Career Intelligence Blog
          </h1>
          <p className="text-lg text-gray-500">
            Data-backed guides for navigating your career in the age of AI.
          </p>
        </div>

        <div className="space-y-6">
          {ARTICLES.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="block glass-card p-6 sm:p-8 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0 mt-1">{article.heroEmoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                      {article.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {article.description}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="flex items-center gap-1 text-xs text-gray-400">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                    <span className="text-xs text-blue-600 font-medium flex items-center gap-1 ml-auto">
                      Read more <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Ready to take action?</h2>
          <p className="text-blue-100 mb-6">Try our free AI Displacement Score — no signup required.</p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors min-h-[48px]"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
