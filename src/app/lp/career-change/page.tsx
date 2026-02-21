import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  BarChart3,
  Map,
  DollarSign,
} from "lucide-react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

export const metadata: Metadata = {
  title:
    "Planning a Career Change? Get Your Free Career Analysis | AISkillScore",
  description:
    "53% of professionals plan to switch careers by end of 2026. Get a data-driven skills gap analysis, career roadmap, and salary benchmarks — free.",
  alternates: { canonical: `${APP_URL}/lp/career-change` },
  openGraph: {
    title: "Planning a Career Change? Get Your Free Career Analysis",
    description:
      "Get a data-driven skills gap analysis, career roadmap, and salary benchmarks — free.",
    url: `${APP_URL}/lp/career-change`,
    type: "website",
    siteName: "AISkillScore",
    images: [{ url: `${APP_URL}/api/og`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Planning a Career Change? Get Your Free Career Analysis",
    description:
      "Get a data-driven skills gap analysis, career roadmap, and salary benchmarks — free.",
    images: [`${APP_URL}/api/og`],
  },
};

export default function CareerChangeLandingPage() {
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Career Change Analysis",
    description: "Data-driven career transition planning with skills gap analysis, roadmap, and salary benchmarks.",
    url: `${APP_URL}/lp/career-change`,
    publisher: { "@type": "Organization", name: "AISkillScore", url: APP_URL },
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
            <Compass className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-700">
              Free Career Analysis
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
            Planning a career change?{" "}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Start with the data.
            </span>
          </h1>
          <p className="text-lg text-gray-500 max-w-lg mx-auto">
            53% of professionals plan to switch careers by end of 2026. The ones
            who succeed don&apos;t wing it — they build a transition plan based
            on real market data.
          </p>
        </div>

        {/* Key Takeaway — AI extraction target */}
        <div className="mt-8 max-w-lg mx-auto surface-hero p-5">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Key Takeaway</p>
          <p className="text-sm text-gray-800 leading-relaxed font-medium">
            53% of professionals plan career changes by 2026. AISkillScore provides free skills gap analysis, career roadmaps with timelines, and salary benchmarks — using a data-driven dual-track approach that builds both transition skills and income resilience.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/?focus=displacement"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-lg font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-600/20 min-h-[56px]"
          >
            Map Your Career Transition — Free Analysis
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-gray-400 mt-3">
            No signup required · 30 seconds · Data-driven insights
          </p>
        </div>

        {/* What you get */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: BarChart3,
              title: "Skills gap analysis",
              desc: "See exactly which skills transfer to your target role and which gaps you need to close first.",
            },
            {
              icon: Map,
              title: "Career roadmap",
              desc: "Get a step-by-step transition plan with timelines, milestones, and recommended learning paths.",
            },
            {
              icon: DollarSign,
              title: "Salary benchmarking",
              desc: "Know your earning potential in the new role — including during the transition period.",
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

        {/* Dual-track approach */}
        <div className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center space-y-3">
          <h3 className="font-semibold text-blue-900 text-sm">
            The dual-track approach that works
          </h3>
          <p className="text-sm text-blue-800 max-w-md mx-auto">
            The best career changers don&apos;t quit and hope. They build a{" "}
            <strong>transition track</strong> (new skills + network) alongside
            an <strong>income track</strong> (current role + side projects) until
            the switch is safe.
          </p>
          <p className="text-xs text-blue-600">
            Our analysis maps both tracks for your specific situation.
          </p>
        </div>

        {/* Secondary CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/?focus=displacement"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors min-h-[48px]"
          >
            Start My Career Analysis — Free
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
