import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { INDUSTRY_PAGES, getIndustry } from "@/lib/industries";
import { TOOLS_MAP } from "@/lib/constants";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

interface IndustryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return INDUSTRY_PAGES.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: IndustryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) return { title: "Industry Not Found" };

  return {
    title: `${industry.name} Career Guide — AI Displacement & Resume Optimization | AISkillScore`,
    description: industry.description,
    alternates: { canonical: `${APP_URL}/industries/${slug}` },
    keywords: industry.keywords,
    openGraph: {
      type: "article",
      title: `${industry.name} — AI Career Guide`,
      description: industry.description,
      url: `${APP_URL}/industries/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${industry.name} — AI Career Guide`,
      description: industry.description,
    },
  };
}

export default async function IndustryPage({ params }: IndustryPageProps) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) notFound();

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${industry.name} Career Guide`,
    description: industry.description,
    url: `${APP_URL}/industries/${slug}`,
    publisher: { "@type": "Organization", name: "AISkillScore", url: APP_URL },
    keywords: industry.keywords.join(", "),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: APP_URL },
      { "@type": "ListItem", position: 2, name: "Industries", item: `${APP_URL}/industries` },
      { "@type": "ListItem", position: 3, name: industry.name, item: `${APP_URL}/industries/${slug}` },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: industry.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const tools = industry.toolSequence.map((id) => TOOLS_MAP[id]).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-600">Home</Link>
          <span>/</span>
          <Link href="/industries" className="hover:text-gray-600">Industries</Link>
          <span>/</span>
          <span className="text-gray-600 truncate">{industry.name}</span>
        </nav>

        <Link href="/industries" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4" /> All industries
        </Link>

        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4 leading-tight">
            {industry.name}: AI Career &amp; Resume Guide
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">{industry.description}</p>
        </header>

        {/* AI displacement context */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">AI displacement in {industry.name}</h2>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
            <p className="text-sm text-amber-800 leading-relaxed">{industry.displacementContext}</p>
            <Link href="/tools/displacement" className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-amber-700 hover:text-amber-900">
              Run free AI Displacement Score <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Top roles */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Key roles in {industry.name}</h2>
          <div className="flex flex-wrap gap-2">
            {industry.topRoles.map((role) => (
              <span key={role} className="ui-badge ui-badge-gray">{role}</span>
            ))}
          </div>
        </section>

        {/* Tool sequence */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended tool sequence</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tools.map((tool, i) => (
              <Link key={tool.id} href={`/tools/${tool.id}`} className="surface-card surface-card-hover p-4 group">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-blue-600">Step {i + 1}</span>
                  <span className={`ui-badge ${tool.tokens === 0 ? "ui-badge-green" : "ui-badge-blue"}`}>
                    {tool.tokens === 0 ? "Free" : `${tool.tokens} tokens`}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">{tool.title}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{tool.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
          <div className="space-y-4">
            {industry.faq.map((item, i) => (
              <details key={i} className="surface-card p-4 group">
                <summary className="text-sm font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                  {item.q}
                  <ArrowRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Start your {industry.name} career mission</h2>
          <p className="text-blue-100 mb-6">Free AI Displacement Score + 15 tokens on signup. No credit card required.</p>
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
