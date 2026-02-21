import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import Link from "next/link";
import { AnimateOnScroll } from "@/components/shared/AnimateOnScroll";
import { FAQ } from "@/components/shared/FAQ";
import { FAQ_ITEMS } from "@/lib/constants";
import { ArrowLeft } from "lucide-react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — AISkillScore",
  description:
    "Answers to common questions about AISkillScore's 11 AI career tools, token pricing, the Lifetime Deal, data privacy, and how to optimize your job search with AI.",
  alternates: { canonical: `${APP_URL}/faq` },
  openGraph: {
    title: "Frequently Asked Questions — AISkillScore",
    description:
      "Everything you need to know about AI-powered career analysis, token pricing, and getting started with AISkillScore.",
    url: `${APP_URL}/faq`,
  },
};

export const dynamic = "force-dynamic";

interface FaqCategory {
  label: string;
  description: string;
  items: { q: string; a: string }[];
}

const GETTING_STARTED_QS = [
  "How does the token system work?",
  "Is the AI Displacement Score really free?",
  "Do I get free tokens every day?",
  "Can I use AISkillScore on my phone?",
  "What is the best free AI career tool?",
];

const TOOLS_ANALYSIS_QS = [
  "How does Job Match Score work?",
  "What is the best AI tool to check if my resume will pass ATS?",
  "How long does resume optimization take?",
  "How do I know if AI will replace my job?",
  "What AI tools help with job searching in 2026?",
  "How accurate are the AI career scores?",
  "What AI model does AISkillScore use?",
  "Will recruiters know my resume was AI-optimized?",
  "Can AISkillScore help me make money while job hunting?",
  "How many tokens do I need for 5 job applications?",
];

const PRICING_QS = [
  "Is AI resume optimization worth paying for?",
  "What's the Lifetime Deal?",
  "How is the Lifetime Deal different from token packs?",
  "Can I get a refund?",
  "Is AISkillScore better than hiring a career coach?",
  "How is AISkillScore different from Jobscan or Teal?",
];

const PRIVACY_QS = [
  "Is my data safe and private?",
  "What data does the AI use about me?",
];

function pickItems(questions: string[]): { q: string; a: string }[] {
  return questions
    .map((q) => FAQ_ITEMS.find((item) => item.q === q))
    .filter((item): item is { q: string; a: string } => !!item);
}

const CATEGORIES: FaqCategory[] = [
  {
    label: "Getting Started",
    description: "Tokens, free tools, and how to begin",
    items: pickItems(GETTING_STARTED_QS),
  },
  {
    label: "Tools & Analysis",
    description: "How the AI career tools work and what you get",
    items: pickItems(TOOLS_ANALYSIS_QS),
  },
  {
    label: "Pricing & Plans",
    description: "Token packs, Lifetime Deal, and value comparison",
    items: pickItems(PRICING_QS),
  },
  {
    label: "Privacy & Trust",
    description: "Data safety, AI detection, and your control",
    items: pickItems(PRIVACY_QS),
  },
];

export default async function FaqPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profile = user
    ? (await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()).data
    : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: APP_URL },
      { "@type": "ListItem", position: 2, name: "FAQ", item: `${APP_URL}/faq` },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const content = (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <AnimateOnScroll>
            {/* Breadcrumb */}
            <nav className="mb-8" aria-label="Breadcrumb">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Home
              </Link>
            </nav>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-500 mb-12 max-w-xl leading-relaxed">
              Everything you need to know about AISkillScore&apos;s AI career
              tools, token pricing, and getting started.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll>
            <div className="space-y-12 stagger-children">
              {CATEGORIES.map((cat) => (
                <section key={cat.label}>
                  <div className="mb-4">
                    <h2 className="text-lg font-bold text-gray-900">
                      {cat.label}
                    </h2>
                    <p className="text-sm text-gray-500">{cat.description}</p>
                  </div>
                  <FAQ items={cat.items} />
                </section>
              ))}
            </div>
          </AnimateOnScroll>

          {/* Popular tools */}
          <AnimateOnScroll>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Popular tools:</span>
            <Link href="/tools/displacement" className="ui-badge ui-badge-green hover:opacity-80 transition-opacity">AI Displacement Score — Free</Link>
            <Link href="/tools/jd_match" className="ui-badge ui-badge-blue hover:opacity-80 transition-opacity">Job Match Score — 5 tokens (~$1)</Link>
            <Link href="/tools/resume" className="ui-badge ui-badge-blue hover:opacity-80 transition-opacity">Resume Optimizer — 15 tokens (~$3)</Link>
            </div>
          </AnimateOnScroll>

          {/* Bottom CTA */}
          <AnimateOnScroll>
            <div className="mt-8 surface-hero p-6 sm:p-8 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Still have questions?
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Start free with the AI Displacement Score or sign up for 15 free
              tokens to try any tool.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth" className="btn-primary sm:w-auto px-6">
                Create Account — 15 Free Tokens (~$3 value)
              </Link>
              <Link href="/pricing" className="btn-secondary sm:w-auto px-6">
                View Token Pricing
              </Link>
            </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );

  if (user) {
    return <AppShell isLoggedIn={true} profile={profile}>{content}</AppShell>;
  }
  return <AppShell isLoggedIn={false}>{content}</AppShell>;
}
