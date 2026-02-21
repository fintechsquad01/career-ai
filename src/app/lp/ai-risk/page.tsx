import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldAlert, Zap, Clock, Shield } from "lucide-react";
import { StatBlock } from "@/components/shared/StatBlock";
import { ExpertQuote } from "@/components/shared/ExpertQuote";
import { AI_DISPLACEMENT_STATS, RECRUITER_QUOTES } from "@/lib/pain-stats";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

export const metadata: Metadata = {
  title: "Is AI Coming for Your Job? Free AI Risk Score | AISkillScore",
  description:
    "Find out your AI displacement risk score in 30 seconds. Free, no signup required. Powered by ILO 2025 research data.",
  alternates: { canonical: `${APP_URL}/lp/ai-risk` },
  openGraph: {
    title: "Is AI Coming for Your Job? Free AI Risk Score",
    description:
      "Find out your AI displacement risk score in 30 seconds. Free, no signup required.",
    url: `${APP_URL}/lp/ai-risk`,
    type: "website",
    siteName: "AISkillScore",
    images: [{ url: `${APP_URL}/api/og`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Is AI Coming for Your Job? Free AI Risk Score",
    description:
      "Find out your AI displacement risk score in 30 seconds. Free, no signup required.",
    images: [`${APP_URL}/api/og`],
  },
};

export default function AiRiskLandingPage() {
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "AI Displacement Risk Score",
    description: "Free AI displacement risk assessment powered by ILO 2025 research data.",
    url: `${APP_URL}/lp/ai-risk`,
    publisher: { "@type": "Organization", name: "AISkillScore", url: APP_URL },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".key-takeaway"],
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24">
        {/* Hero */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-full">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-700">
              Free AI Risk Analysis
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
            Is AI coming for{" "}
            <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
              your job?
            </span>
          </h1>
          <p className="text-lg text-gray-500 max-w-lg mx-auto">
            1 in 4 workers globally have roles exposed to generative AI. Find
            out where you stand — in 30 seconds.
          </p>
        </div>

        {/* Key Takeaway — AI extraction target */}
        <div className="mt-8 max-w-lg mx-auto surface-hero p-5">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Key Takeaway</p>
          <p className="text-sm text-gray-800 leading-relaxed font-medium key-takeaway">
            1 in 4 workers globally face AI displacement risk. AISkillScore&apos;s free AI Displacement Score analyzes your specific role against ILO 2025 research data in 30 seconds — breaking down which tasks are at risk and providing a personalized action plan.
          </p>
        </div>

        <div className="mt-8 max-w-lg mx-auto">
          <StatBlock stats={AI_DISPLACEMENT_STATS.slice(0, 3)} />
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/?focus=displacement"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-lg font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-600/20 min-h-[56px]"
          >
            Get Your Free AI Risk Score
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-gray-400 mt-3">
            No signup required · 30 seconds · 100% free
          </p>
        </div>

        {/* What you get */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Zap,
              title: "Task-by-task risk breakdown",
              desc: "See exactly which of your daily tasks AI threatens — and which make you irreplaceable.",
            },
            {
              icon: Clock,
              title: "Timeline estimate",
              desc: "Know when AI could impact your role, so you can prepare — not panic.",
            },
            {
              icon: Shield,
              title: "Action plan",
              desc: "Get specific recommendations to future-proof your career and increase your value.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl border border-gray-100 p-5 text-center"
            >
              <item.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Data credibility */}
        <div className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
          <p className="text-sm text-blue-800">
            Powered by <strong>ILO 2025 research data</strong> and{" "}
            <strong>Gemini 2.5 Pro AI</strong>. Not a quiz — a real analysis of
            your specific role.
          </p>
        </div>

        <div className="mt-8 max-w-lg mx-auto">
          <ExpertQuote
            quote={RECRUITER_QUOTES[3].quote}
            attribution={RECRUITER_QUOTES[3].attribution}
            role={RECRUITER_QUOTES[3].role}
          />
        </div>

        {/* Secondary CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/?focus=displacement"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors min-h-[48px]"
          >
            Check My AI Risk — Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-16">
          © {new Date().getFullYear()} AISkillScore ·{" "}
          <Link href="/privacy" className="hover:text-gray-600">
            Privacy
          </Link>{" "}
          ·{" "}
          <Link href="/terms" className="hover:text-gray-600">
            Terms
          </Link>
        </p>
      </div>
    </div>
  );
}
