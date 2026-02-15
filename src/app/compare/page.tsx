import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { COMPARISONS } from "@/lib/content";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

export const metadata: Metadata = {
  title: "AISkillScore vs Competitors — Feature Comparison | 2026",
  description:
    "Compare AISkillScore with Jobscan ($599/yr), Teal ($348/yr), and FinalRound ($1,788/yr). 11 AI career tools, pay per use, no subscriptions.",
  alternates: { canonical: `${APP_URL}/compare` },
  openGraph: {
    title: "AISkillScore vs Jobscan vs Teal vs FinalRound — 2026 Comparison",
    description: "11 AI career tools from free vs single-purpose $29-$149/month subscriptions.",
    url: `${APP_URL}/compare`,
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Career Tools Comparison 2026",
    description: "AISkillScore vs Jobscan vs Teal vs FinalRound — features, pricing, and verdict.",
  },
};

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            How AISkillScore Compares
          </h1>
          <p className="text-lg text-gray-500">
            11 AI career tools, pay per use — vs single-purpose monthly subscriptions.
          </p>
        </div>

        {/* Quick comparison table */}
        <div className="glass-card overflow-x-auto mb-12">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Feature</th>
                <th className="text-center px-4 py-3 font-semibold text-blue-600">AISkillScore</th>
                {COMPARISONS.map((c) => (
                  <th key={c.slug} className="text-center px-4 py-3 font-semibold text-gray-700">
                    {c.competitor}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-3 text-gray-700">Price</td>
                <td className="px-4 py-3 text-center font-semibold text-blue-600">From free</td>
                {COMPARISONS.map((c) => (
                  <td key={c.slug} className="px-4 py-3 text-center text-gray-700">{c.competitorPrice}</td>
                ))}
              </tr>
              {["AI Career Tools", "Pay Per Use", "Interview Follow-ups", "Voice Preservation", "Free Daily Credits"].map((feature, i) => (
                <tr key={feature} className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-700">{feature}</td>
                  <td className="px-4 py-3 text-center">
                    <Check className="w-4 h-4 text-green-500 mx-auto" />
                  </td>
                  {COMPARISONS.map((c) => (
                    <td key={c.slug} className="px-4 py-3 text-center">
                      {i === 0 ? (
                        <span className="text-xs text-gray-500">{c.competitorFeatures.length}</span>
                      ) : (
                        <X className="w-4 h-4 text-gray-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Individual comparison cards */}
        <div className="space-y-6">
          {COMPARISONS.map((comp) => (
            <Link
              key={comp.slug}
              href={`/compare/${comp.slug}`}
              className="block glass-card p-6 sm:p-8 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  AISkillScore vs {comp.competitor}
                </h2>
                <span className="text-xs font-medium text-gray-400">{comp.competitorPrice}</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">{comp.description}</p>
              <div className="flex items-center gap-4 flex-wrap">
                {comp.advantages.slice(0, 2).map((adv) => (
                  <span key={adv.title} className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">
                    ✓ {adv.title}
                  </span>
                ))}
                <span className="text-xs text-blue-600 font-medium flex items-center gap-1 ml-auto">
                  Full comparison <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Try it free — no credit card required</h2>
          <p className="text-blue-100 mb-6">15 free tokens + AI Displacement Score always free.</p>
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
