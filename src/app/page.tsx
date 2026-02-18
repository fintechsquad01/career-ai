import type { Metadata } from "next";
import { LandingContent } from "@/components/landing/LandingContent";
import { AppShell } from "@/components/layout/AppShell";
import { FAQ_ITEMS } from "@/lib/constants";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

export const metadata: Metadata = {
  title: "AISkillScore — Evidence-First AI Career Analysis in 30 Seconds",
  description:
    "Paste a job posting or resume. Get an honest AI assessment with evidence in 30 seconds — not generic keyword scores. Premium-quality output at fair, pay-per-use pricing.",
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    title: "AISkillScore — Evidence-First AI Career Analysis in 30 Seconds",
    description:
      "Paste a job posting or resume. Get AI-powered career intelligence with evidence. 11 tools from free to $0.195/token. No subscriptions.",
    url: APP_URL,
    images: [
      {
        url: `${APP_URL}/api/og`,
        width: 1200,
        height: 630,
        alt: "AISkillScore — Stop guessing. Know exactly where you stand.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AISkillScore — Evidence-First AI Career Analysis in 30 Seconds",
    description:
      "Paste a job posting or resume. Get AI-powered career intelligence with evidence. 11 tools, pay per use.",
    images: [`${APP_URL}/api/og`],
  },
};

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  let isLoggedIn = false;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      isLoggedIn = !!user;
    } catch {
      // Supabase not configured yet
    }
  }

  // FAQ JSON-LD for AI search citability
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  // HowTo schema for "How It Works" section
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to get an AI career analysis with AISkillScore",
    description: "Get an honest AI assessment of your resume or job match in 30 seconds.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Paste your input",
        text: "Paste a job description, LinkedIn job URL, or your resume text into the Smart Input field.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "AI detects and routes",
        text: "Our AI automatically detects whether you pasted a job description, URL, or resume and routes to the right analysis tool.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Get evidence-based results",
        text: "Receive a detailed AI analysis in 30 seconds with scores, evidence, and actionable recommendations — powered by Gemini 2.5 Pro.",
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Apply and negotiate",
        text: "Use Quick Apply to batch-run tools, craft custom cover letters, and negotiate your salary with data-backed scripts.",
      },
    ],
  };

  return (
    <AppShell isLoggedIn={isLoggedIn}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <LandingContent />
    </AppShell>
  );
}
