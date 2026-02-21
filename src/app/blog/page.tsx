import type { Metadata } from "next";
import { ARTICLES } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { AnimateOnScroll } from "@/components/shared/AnimateOnScroll";
import { BlogContent } from "@/components/blog/BlogContent";

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

export const dynamic = "force-dynamic";

export default async function BlogIndex() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profile = user
    ? (await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()).data
    : null;

  const blogCollectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${APP_URL}/blog#collection`,
    url: `${APP_URL}/blog`,
    name: "AISkillScore Blog",
    description: "Answer-first guides and research on resume optimization, job matching, interview prep, and salary negotiation.",
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

  const content = (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogCollectionJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogItemListJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />

      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
        <AnimateOnScroll>
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              AI Career Intelligence Blog
            </h1>
            <p className="text-gray-500 max-w-xl mx-auto">
              Direct, data-backed answers for navigating your career in the age of AI.
            </p>
          </div>
        </AnimateOnScroll>

        <BlogContent articles={ARTICLES} />
      </div>
    </>
  );

  return user ? (
    <AppShell isLoggedIn={true} profile={profile}>{content}</AppShell>
  ) : (
    <AppShell isLoggedIn={false}>{content}</AppShell>
  );
}
