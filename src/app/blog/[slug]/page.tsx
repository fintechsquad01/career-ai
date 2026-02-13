import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, Calendar, User } from "lucide-react";
import { notFound } from "next/navigation";
import { ARTICLES, getArticle } from "@/lib/content";
import { TOOLS_MAP } from "@/lib/constants";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Article Not Found" };

  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `${APP_URL}/blog/${slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      url: `${APP_URL}/blog/${slug}`,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author],
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  // Article JSON-LD for AI citation
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Organization",
      name: article.author,
      url: APP_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "AISkillScore",
      url: APP_URL,
      logo: { "@type": "ImageObject", url: `${APP_URL}/icon.png` },
    },
    mainEntityOfPage: `${APP_URL}/blog/${slug}`,
    keywords: article.tags.join(", "),
    wordCount: article.sections.reduce((acc, s) => acc + s.body.split(/\s+/).length, 0),
  };

  // BreadcrumbList for navigation
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: APP_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${APP_URL}/blog` },
      { "@type": "ListItem", position: 3, name: article.title, item: `${APP_URL}/blog/${slug}` },
    ],
  };

  const relatedTools = article.relatedTools
    .map((id) => TOOLS_MAP[id])
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />

      <article className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-600">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-gray-600">Blog</Link>
          <span>/</span>
          <span className="text-gray-600 truncate">{article.title}</span>
        </nav>

        {/* Back */}
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4" /> All articles
        </Link>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase">
              {article.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" /> {article.readTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4 leading-tight">
            {article.title}
          </h1>

          {/* TLDR — first paragraph for AI extraction */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
            <p className="text-sm font-semibold text-blue-800 mb-1">TL;DR</p>
            <p className="text-sm text-blue-700 leading-relaxed">{article.tldr}</p>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" /> {article.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Updated {article.updatedAt}
            </span>
          </div>
        </header>

        {/* Article body */}
        <div className="space-y-10">
          {article.sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                {section.heading}
              </h2>
              <div className="prose-content text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {section.body}
              </div>
            </section>
          ))}
        </div>

        {/* Related tools CTA */}
        {relatedTools.length > 0 && (
          <div className="mt-12 glass-card p-6 sm:p-8">
            <h3 className="font-bold text-gray-900 mb-4">Try these tools</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {relatedTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.id}`}
                  className="bg-gray-50 rounded-xl p-4 hover:bg-blue-50 transition-colors group"
                >
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">
                    {tool.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{tool.description}</p>
                  <p className="text-xs font-bold mt-2 text-blue-600">
                    {tool.tokens === 0 ? "Free" : `${tool.tokens} tokens`}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Take action on what you learned</h2>
          <p className="text-blue-100 mb-6">Free AI Displacement Score + 5 tokens on signup. No credit card.</p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors min-h-[48px]"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </article>
    </div>
  );
}
