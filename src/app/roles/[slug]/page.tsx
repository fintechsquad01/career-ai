import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { ROLES, getRole } from "@/lib/roles";
import { TOOLS_MAP } from "@/lib/constants";
import { ContentSidebar } from "@/components/shared/ContentSidebar";
import { RelatedContent } from "@/components/shared/RelatedContent";
import { DidYouKnow } from "@/components/shared/DidYouKnow";
import { getRelatedContent } from "@/lib/content-links";
import { getInsightForPage } from "@/lib/pain-stats";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

interface RolePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ROLES.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: RolePageProps): Promise<Metadata> {
  const { slug } = await params;
  const role = getRole(slug);
  if (!role) return { title: "Role Not Found" };

  return {
    title: `${role.title} Resume, Interview & Career Guide | AISkillScore`,
    description: role.description,
    alternates: { canonical: `${APP_URL}/roles/${slug}` },
    keywords: role.keywords,
    openGraph: {
      type: "article",
      title: `${role.title} — AI Career Guide`,
      description: role.description,
      url: `${APP_URL}/roles/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${role.title} — AI Career Guide`,
      description: role.description,
    },
  };
}

export default async function RolePage({ params }: RolePageProps) {
  const { slug } = await params;
  const role = getRole(slug);
  if (!role) notFound();

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${role.title} Career Guide`,
    description: role.description,
    url: `${APP_URL}/roles/${slug}`,
    publisher: { "@type": "Organization", name: "AISkillScore", url: APP_URL },
    keywords: role.keywords.join(", "),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: APP_URL },
      { "@type": "ListItem", position: 2, name: "Resources", item: `${APP_URL}/resources` },
      { "@type": "ListItem", position: 3, name: "Roles", item: `${APP_URL}/roles` },
      { "@type": "ListItem", position: 4, name: role.title, item: `${APP_URL}/roles/${slug}` },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: role.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const tools = role.toolSequence.map((id) => TOOLS_MAP[id]).filter(Boolean);

  const relatedItems = getRelatedContent("role", slug);
  const insight = getInsightForPage("role", slug);

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-8">
        <div>
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-600">Home</Link>
          <span>/</span>
          <Link href="/resources" className="hover:text-gray-600">Resources</Link>
          <span>/</span>
          <Link href="/roles" className="hover:text-gray-600">Roles</Link>
          <span>/</span>
          <span className="text-gray-600 truncate">{role.title}</span>
        </nav>

        <Link href="/roles" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4" /> All roles
        </Link>

        <header className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase">{role.persona}</span>
            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full uppercase">{role.industry}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4 leading-tight">
            {role.title}: Resume, Interview &amp; Career Guide
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">{role.description}</p>
        </header>

        {/* Pain points */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Common challenges for {role.title}s</h2>
          <ul className="space-y-2">
            {role.painPoints.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-red-500 mt-0.5 flex-shrink-0">&#x2022;</span>
                {p}
              </li>
            ))}
          </ul>
        </section>

        {/* Hiring checklist */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">What hiring teams look for</h2>
          <div className="surface-card p-5">
            <ul className="space-y-2">
              {role.hiringChecklist.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">&#x2713;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Tool sequence */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your AISkillScore workflow</h2>
          <p className="text-sm text-gray-500 mb-4">Follow this sequence for the highest-impact preparation:</p>
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
            {role.faq.map((item, i) => (
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

        {insight && <DidYouKnow text={insight.text} source={insight.source} />}
        <RelatedContent items={relatedItems} />

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Start your {role.title} mission</h2>
          <p className="text-blue-100 mb-6">Run Job Match Score against a real posting, then follow the steps above.</p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors min-h-[48px]"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        </div>
        <ContentSidebar
          tools={role.toolSequence}
          relatedPages={[
            { label: `${role.industry} Industry Guide`, href: `/industries/${role.industry.toLowerCase().replace(/[\s&]+/g, "-")}` },
          ]}
          insight={insight ?? undefined}
        />
        </div>
      </div>
    </div>
  );
}
