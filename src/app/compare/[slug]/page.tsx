import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, X, Minus } from "lucide-react";
import { notFound } from "next/navigation";
import { COMPARISONS, getComparison } from "@/lib/content";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

interface ComparePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return COMPARISONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
  const { slug } = await params;
  const comp = getComparison(slug);
  if (!comp) return { title: "Comparison Not Found" };

  return {
    title: `${comp.title} | AISkillScore`,
    description: comp.description,
    alternates: { canonical: `${APP_URL}/compare/${slug}` },
    openGraph: {
      title: comp.title,
      description: comp.description,
      url: `${APP_URL}/compare/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: comp.title,
      description: comp.description,
    },
  };
}

function FeatureCell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="w-4 h-4 text-green-500 mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-gray-300 mx-auto" />;
  return <span className="text-xs font-medium text-blue-600">{value}</span>;
}

export default async function ComparisonPage({ params }: ComparePageProps) {
  const { slug } = await params;
  const comp = getComparison(slug);
  if (!comp) notFound();

  // Article schema for comparison content
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: comp.title,
    description: comp.description,
    dateModified: comp.updatedAt,
    author: { "@type": "Organization", name: "AISkillScore", url: APP_URL },
    publisher: {
      "@type": "Organization",
      name: "AISkillScore",
      url: APP_URL,
      logo: { "@type": "ImageObject", url: `${APP_URL}/icon.png` },
    },
    mainEntityOfPage: `${APP_URL}/compare/${slug}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: APP_URL },
      { "@type": "ListItem", position: 2, name: "Compare", item: `${APP_URL}/compare` },
      { "@type": "ListItem", position: 3, name: `vs ${comp.competitor}`, item: `${APP_URL}/compare/${slug}` },
    ],
  };

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

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-600">Home</Link>
          <span>/</span>
          <Link href="/compare" className="hover:text-gray-600">Compare</Link>
          <span>/</span>
          <span className="text-gray-600">vs {comp.competitor}</span>
        </nav>

        <Link href="/compare" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4" /> All comparisons
        </Link>

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
            {comp.title}
          </h1>
          <p className="text-lg text-gray-500 mb-2">{comp.description}</p>
          <p className="text-xs text-gray-400">Last updated: {comp.updatedAt}</p>
        </header>

        {/* TL;DR verdict */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-10">
          <p className="text-sm font-semibold text-blue-800 mb-1">The Verdict</p>
          <p className="text-sm text-blue-700 leading-relaxed">{comp.verdict}</p>
        </div>

        {/* Feature comparison table */}
        <div className="glass-card overflow-x-auto mb-10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Feature</th>
                <th className="text-center px-4 py-3 font-semibold text-blue-600">AISkillScore</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">{comp.competitor}</th>
              </tr>
            </thead>
            <tbody>
              {comp.features.map((f) => (
                <tr key={f.name} className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-700">{f.name}</td>
                  <td className="px-4 py-3 text-center"><FeatureCell value={f.us} /></td>
                  <td className="px-4 py-3 text-center"><FeatureCell value={f.them} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Why AISkillScore wins */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Why choose AISkillScore over {comp.competitor}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        {/* What competitor offers */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            What {comp.competitor} does well
          </h2>
          <ul className="space-y-2">
            {comp.competitorFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* What competitor misses */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            What {comp.competitor} is missing
          </h2>
          <ul className="space-y-2">
            {comp.competitorMissing.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                <Minus className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Switch from {comp.competitor} — Start free</h2>
          <p className="text-blue-100 mb-6">5 tokens free + AI Displacement Score always free. No credit card.</p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors min-h-[48px]"
          >
            Try AISkillScore Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
