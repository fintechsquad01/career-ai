import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  FileWarning,
  ScanSearch,
  Mic,
  GitCompareArrows,
} from "lucide-react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

export const metadata: Metadata = {
  title:
    "Your Resume Is Getting Rejected — Fix It in Minutes | AISkillScore",
  description:
    "43% of ATS rejections are formatting errors, not qualification gaps. Get your ATS score and AI-powered resume optimization. 15 free tokens on signup.",
  alternates: { canonical: `${APP_URL}/lp/resume` },
  openGraph: {
    title: "Your Resume Is Getting Rejected — Fix It in Minutes",
    description:
      "43% of ATS rejections are formatting errors. Get your ATS score and AI-powered resume optimization.",
    url: `${APP_URL}/lp/resume`,
    type: "website",
    siteName: "AISkillScore",
    images: [{ url: `${APP_URL}/api/og`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Resume Is Getting Rejected — Fix It in Minutes",
    description:
      "43% of ATS rejections are formatting errors. Get your ATS score and AI-powered resume optimization.",
    images: [`${APP_URL}/api/og`],
  },
};

export default function ResumeLandingPage() {
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Resume ATS Optimization",
    description: "AI-powered resume optimization that passes ATS screening while preserving your authentic voice.",
    url: `${APP_URL}/lp/resume`,
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-full">
            <FileWarning className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-700">
              Resume ATS Analysis
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
            Your resume is getting rejected —{" "}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              and it&apos;s not your qualifications
            </span>
          </h1>
          <p className="text-lg text-gray-500 max-w-lg mx-auto">
            43% of ATS rejections are formatting errors, not qualification gaps.
            See your real ATS score and fix it in minutes.
          </p>
        </div>

        {/* Key Takeaway — AI extraction target */}
        <div className="mt-8 max-w-lg mx-auto surface-hero p-5">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Key Takeaway</p>
          <p className="text-sm text-gray-800 leading-relaxed font-medium">
            43% of ATS rejections stem from formatting errors, not qualifications. AISkillScore&apos;s Resume Optimizer fixes parsing issues and optimizes keywords while preserving your authentic voice — starting free with 15 tokens, no subscription required.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/auth?redirect=/tools/resume"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-lg font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-600/20 min-h-[56px]"
          >
            Optimize Your Resume — 15 Free Tokens
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-gray-400 mt-3">
            Create account · Get 15 free tokens · Instant results
          </p>
        </div>

        {/* What you get */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: ScanSearch,
              title: "ATS score + optimization",
              desc: "Get your real ATS compatibility score and line-by-line fixes to pass automated screening.",
            },
            {
              icon: Mic,
              title: "Voice preservation",
              desc: "AI improves your resume while keeping your authentic voice — no generic templates.",
            },
            {
              icon: GitCompareArrows,
              title: "Before/after comparison",
              desc: "See exactly what changed with a side-by-side diff of your original vs. optimized resume.",
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

        {/* Competitive comparison */}
        <div className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                Jobscan
              </p>
              <p className="text-2xl font-bold text-gray-400 line-through">
                $599/yr
              </p>
            </div>
            <div className="hidden sm:block w-px h-12 bg-blue-200" />
            <div className="text-center">
              <p className="text-xs text-blue-600 uppercase tracking-wide font-semibold">
                AISkillScore
              </p>
              <p className="text-2xl font-bold text-blue-700">
                Free to start
              </p>
              <p className="text-xs text-blue-500">
                15 tokens on signup · No credit card
              </p>
            </div>
          </div>
        </div>

        {/* Secondary CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/auth?redirect=/tools/resume"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors min-h-[48px]"
          >
            Fix My Resume Now
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
