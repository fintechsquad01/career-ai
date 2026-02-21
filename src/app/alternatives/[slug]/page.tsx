import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { AnimateOnScroll } from "@/components/shared/AnimateOnScroll";
import { CompetitorAnchor } from "@/components/shared/CompetitorAnchor";
import { PainSolution } from "@/components/shared/PainSolution";
import { PAIN_SOLUTIONS } from "@/lib/pain-stats";
import { ALTERNATIVES, getAlternative, getComparison } from "@/lib/content";
import { ContentSidebar } from "@/components/shared/ContentSidebar";
import { RelatedContent } from "@/components/shared/RelatedContent";
import { DidYouKnow } from "@/components/shared/DidYouKnow";
import { getRelatedContent } from "@/lib/content-links";
import { getInsightForPage } from "@/lib/pain-stats";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

interface AlternativesPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ALTERNATIVES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: AlternativesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const alt = getAlternative(slug);
  if (!alt) return { title: "Not Found" };

  return {
    title: `${alt.title} | AISkillScore`,
    description: alt.description,
    alternates: { canonical: `${APP_URL}/alternatives/${slug}` },
    openGraph: {
      title: alt.title,
      description: alt.description,
      url: `${APP_URL}/alternatives/${slug}`,
      type: "article",
      siteName: "AISkillScore",
      images: [{ url: `${APP_URL}/api/og`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: alt.title,
      description: alt.description,
      images: [`${APP_URL}/api/og`],
    },
  };
}

export default async function AlternativesPage({ params }: AlternativesPageProps) {
  const { slug } = await params;
  const alt = getAlternative(slug);
  if (!alt) notFound();

  const comp = getComparison(alt.comparisonSlug);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profile = user
    ? (await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()).data
    : null;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: alt.title,
    description: alt.description,
    author: { "@type": "Organization", name: "AISkillScore", url: APP_URL },
    publisher: {
      "@type": "Organization",
      name: "AISkillScore",
      url: APP_URL,
      logo: { "@type": "ImageObject", url: `${APP_URL}/icon.png` },
    },
    mainEntityOfPage: `${APP_URL}/alternatives/${slug}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: APP_URL },
      { "@type": "ListItem", position: 2, name: "Alternatives", item: `${APP_URL}/alternatives` },
      { "@type": "ListItem", position: 3, name: `${alt.competitor} Alternatives`, item: `${APP_URL}/alternatives/${slug}` },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: alt.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const relatedItems = getRelatedContent("alternative", slug);
  const insight = getInsightForPage("alternative", slug);

  const pageContent = (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-8">
          <div>
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-600">Home</Link>
          <span>/</span>
          <Link href="/compare" className="hover:text-gray-600">Compare</Link>
          <span>/</span>
          <span className="text-gray-600">{alt.competitor} Alternatives</span>
        </nav>

        <AnimateOnScroll>
          <header className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
              {alt.title}
            </h1>
            <div className="surface-hero p-5">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Key Takeaway</p>
              <p className="text-sm text-gray-800 leading-relaxed font-medium">
                {alt.description}
              </p>
            </div>
            <div className="mt-4">
              <CompetitorAnchor competitors={[alt.competitor]} />
            </div>
          </header>
        </AnimateOnScroll>

        {comp && (
          <>
            <AnimateOnScroll>
              <section className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Why people switch from {alt.competitor}
                </h2>
                <div className="space-y-3">
                  {comp.competitorMissing.map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm text-gray-600">
                      <Minus className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            </AnimateOnScroll>

            <AnimateOnScroll>
              <section className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  How AISkillScore compares to {alt.competitor}
                </h2>
                <div className="glass-card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Feature</th>
                        <th className="text-center px-4 py-3 font-semibold text-blue-600">AISkillScore</th>
                        <th className="text-center px-4 py-3 font-semibold text-gray-700">{alt.competitor}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="px-4 py-3 text-gray-700">Price</td>
                        <td className="px-4 py-3 text-center font-semibold text-blue-600">From free</td>
                        <td className="px-4 py-3 text-center text-gray-700">{alt.competitorPrice}</td>
                      </tr>
                      {comp.features.slice(0, 5).map((f) => (
                        <tr key={f.name} className="border-b border-gray-100">
                          <td className="px-4 py-3 text-gray-700">{f.name}</td>
                          <td className="px-4 py-3 text-center">
                            {f.us === true ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-xs font-medium text-blue-600">{String(f.us)}</span>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {f.them === true ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : f.them === false ? <Minus className="w-4 h-4 text-gray-300 mx-auto" /> : <span className="text-xs text-gray-500">{String(f.them)}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3">
                  <Link href={`/compare/${alt.comparisonSlug}`} className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
                    Full feature comparison <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </p>
              </section>
            </AnimateOnScroll>

            <AnimateOnScroll>
              <section className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  What makes AISkillScore the top {alt.competitor} alternative
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
                  {comp.advantages.map((adv) => (
                    <div key={adv.title} className="glass-card p-5">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {adv.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{adv.detail}</p>
                    </div>
                  ))}
                </div>
              </section>
            </AnimateOnScroll>
          </>
        )}

        <AnimateOnScroll>
          <div className="mb-8">
            <PainSolution
              pain={PAIN_SOLUTIONS[5].pain}
              solution={PAIN_SOLUTIONS[5].solution}
            />
          </div>
        </AnimateOnScroll>

        <div className="gradient-divider mb-10" />

        <AnimateOnScroll>
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4 stagger-children">
              {alt.faq.map((item, i) => (
                <details key={i} className="group glass-card">
                  <summary className="flex items-center justify-between cursor-pointer p-4 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                    {item.q}
                    <span className="ml-2 text-gray-400 group-open:rotate-45 transition-transform text-lg">+</span>
                  </summary>
                  <p className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        </AnimateOnScroll>

        {insight && <DidYouKnow text={insight.text} source={insight.source} />}
        <RelatedContent items={relatedItems} />

        <AnimateOnScroll>
          <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-2">Switch from {alt.competitor} — Start free</h2>
            <p className="text-blue-100 mb-6">15 free tokens + AI Displacement Score always free. No credit card.</p>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors min-h-[48px]"
            >
              Try AISkillScore Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </AnimateOnScroll>
          </div>
          <ContentSidebar
            relatedPages={[
              { label: `Full ${alt.competitor} Comparison`, href: `/compare/${alt.comparisonSlug}` },
              { label: "Token Pricing", href: "/pricing" },
              { label: "All Comparisons", href: "/compare" },
            ]}
            insight={insight ?? undefined}
          />
        </div>
      </div>
    </>
  );

  return user ? (
    <AppShell isLoggedIn={true} profile={profile}>{pageContent}</AppShell>
  ) : (
    <AppShell isLoggedIn={false}>{pageContent}</AppShell>
  );
}
