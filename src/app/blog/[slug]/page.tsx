import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, Calendar, User, Tag } from "lucide-react";
import { notFound } from "next/navigation";
import { ARTICLES, getArticle } from "@/lib/content";
import { TOOLS_MAP } from "@/lib/constants";
import { EVENTS } from "@/lib/analytics";
import { TrackedLink } from "@/components/shared/TrackedLink";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { AnimateOnScroll } from "@/components/shared/AnimateOnScroll";
import { StatBlock } from "@/components/shared/StatBlock";
import { ExpertQuote } from "@/components/shared/ExpertQuote";
import { getStatsByTag, getQuoteByTopic } from "@/lib/pain-stats";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

const CATEGORY_BADGES: Record<string, string> = {
  guides: "ui-badge ui-badge-blue",
  research: "ui-badge ui-badge-amber",
  tips: "ui-badge ui-badge-green",
  news: "ui-badge ui-badge-gray",
};

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

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profile = user
    ? (await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()).data
    : null;

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

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: APP_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${APP_URL}/blog` },
      { "@type": "ListItem", position: 3, name: article.title, item: `${APP_URL}/blog/${slug}` },
    ],
  };

  const faqJsonLd = article.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: article.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      }
    : null;

  const relatedTools = article.relatedTools
    .map((id) => TOOLS_MAP[id])
    .filter(Boolean);

  const primaryTag = article.tags[0] ?? "resume";
  const contextStats = getStatsByTag(primaryTag);
  const contextQuote = getQuoteByTopic(primaryTag);

  const content = (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-gray-600">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-gray-600">Blog</Link>
          <span>/</span>
          <span className="text-gray-600 truncate">{article.title}</span>
        </nav>

        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4" /> All articles
        </Link>

        {/* Desktop: article + sidebar, Mobile: stacked */}
        <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-8">
          <article>
            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className={CATEGORY_BADGES[article.category] || "ui-badge ui-badge-gray"}>
                  {article.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" /> {article.readTime}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4 leading-tight">
                {article.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" /> {article.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Updated {article.updatedAt}
                </span>
              </div>
            </header>

            {/* Key Takeaway — highest-citation block for AI systems */}
            <div className="surface-hero p-5 mb-8">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Key Takeaway</p>
              <p className="text-sm text-gray-800 leading-relaxed font-medium">{article.tldr}</p>
            </div>

            {/* In This Article — TOC */}
            {article.sections.length > 2 && (
              <nav className="surface-base p-4 mb-8">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">In this article</p>
                <ol className="space-y-1">
                  {article.sections.map((section, i) => (
                    <li key={i}>
                      <a
                        href={`#section-${i}`}
                        className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {i + 1}. {section.heading}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {/* Article body */}
            <div className="space-y-10">
              {article.sections.map((section, i) => (
                <section key={i} id={`section-${i}`}>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                    {section.heading}
                  </h2>
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {section.body}
                  </div>
                </section>
              ))}
            </div>

            {/* Related Tools — card layout */}
            {relatedTools.length > 0 && (
              <div className="mt-12">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Try these tools</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {relatedTools.map((tool) => (
                    <TrackedLink
                      key={tool.id}
                      href={`/tools/${tool.id}`}
                      event={EVENTS.CONTENT_TOOL_CLICKED}
                      properties={{ from_article: slug, to_tool: tool.id }}
                      className="surface-base surface-hover p-4 group"
                    >
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {tool.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{tool.description}</p>
                      <span className={`ui-badge mt-2 ${tool.tokens === 0 ? "ui-badge-green" : "ui-badge-blue"}`}>
                        {tool.tokens === 0 ? "Free" : `${tool.tokens} tokens`}
                      </span>
                    </TrackedLink>
                  ))}
                </div>
              </div>
            )}

            {/* Related Reading — card layout */}
            {article.relatedLinks && article.relatedLinks.length > 0 && (
              <div className="mt-10">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Continue reading</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {article.relatedLinks.map((link) => (
                    <TrackedLink
                      key={link.href}
                      href={link.href}
                      event={EVENTS.CONTENT_RELATED_CLICKED}
                      properties={{ from_article: slug, to_href: link.href }}
                      className="surface-base surface-hover p-4 flex items-center justify-between group"
                    >
                      <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {link.label}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 shrink-0" />
                    </TrackedLink>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10 mb-4 space-y-6">
              <StatBlock stats={contextStats} />
              <ExpertQuote
                quote={contextQuote.quote}
                attribution={contextQuote.attribution}
                role={contextQuote.role}
              />
            </div>

            {/* FAQ */}
            {article.faq && article.faq.length > 0 && (
              <>
                <div className="gradient-divider mt-12" />
                <AnimateOnScroll>
                  <div className="mt-12">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4 stagger-children">
                      {article.faq.map((item, i) => (
                        <details key={i} className="group surface-base">
                          <summary className="flex items-center justify-between cursor-pointer p-4 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                            {item.q}
                            <span className="ml-2 text-gray-400 group-open:rotate-45 transition-transform text-lg">+</span>
                          </summary>
                          <p className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{item.a}</p>
                        </details>
                      ))}
                    </div>
                  </div>
                </AnimateOnScroll>
              </>
            )}

            {/* Bottom CTA */}
            <AnimateOnScroll>
              <div className="mt-12 surface-hero p-8 text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Take action on what you learned</h2>
                <p className="text-sm text-gray-500 mb-6">Free AI Displacement Score + 15 tokens on signup. No credit card.</p>
                <Link
                  href="/auth"
                  className="btn-primary sm:w-auto px-6 inline-flex"
                >
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </AnimateOnScroll>
          </article>

          {/* Sidebar — desktop only */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Quick Facts */}
              <div className="surface-base p-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Facts</p>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{article.readTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Updated {article.updatedAt}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {article.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="ui-badge ui-badge-gray text-[10px]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick TOC for sidebar */}
              {article.sections.length > 2 && (
                <div className="surface-base p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sections</p>
                  <ol className="space-y-1.5">
                    {article.sections.map((section, i) => (
                      <li key={i}>
                        <a href={`#section-${i}`} className="text-xs text-gray-500 hover:text-blue-600 transition-colors line-clamp-1">
                          {section.heading}
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Pricing link */}
              <Link href="/pricing" className="surface-base surface-hover p-4 flex items-center gap-2 group">
                <div>
                  <p className="text-xs font-semibold text-gray-900 group-hover:text-blue-600">Token Pricing</p>
                  <p className="text-[10px] text-gray-400">From free. No subscriptions.</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );

  return user ? (
    <AppShell isLoggedIn={true} profile={profile}>{content}</AppShell>
  ) : (
    <AppShell isLoggedIn={false}>{content}</AppShell>
  );
}
