"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Check, X, Loader2 } from "lucide-react";
import { PACKS, TOOLS, FAQ_ITEMS } from "@/lib/constants";
import { FAQ } from "@/components/shared/FAQ";
import { Insight } from "@/components/shared/Insight";
import { EmailCapture } from "@/components/landing/EmailCapture";

function TokenCalculator() {
  const [jobApps, setJobApps] = useState(5);
  // Average tokens per full job application: JD Match (2) + Resume (10) + Cover Letter (3) + Interview (3) = 18
  const tokensNeeded = useMemo(() => {
    const perApp = 18; // JD Match + Resume + Cover Letter + Interview
    const base = jobApps * perApp;
    return base;
  }, [jobApps]);

  const recommendedPack = tokensNeeded <= 50 ? "Starter" : tokensNeeded <= 200 ? "Pro" : "Power";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-16">
      <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">How many tokens do you need?</h2>
      <div className="max-w-md mx-auto space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Job applications you&apos;re targeting: <span className="text-blue-600 font-bold">{jobApps}</span>
          </label>
          <input
            type="range"
            min={1}
            max={30}
            value={jobApps}
            onChange={(e) => setJobApps(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 app</span>
            <span>30 apps</span>
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600">
            You&apos;ll need approximately <span className="font-bold text-blue-600">{tokensNeeded} tokens</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Based on JD Match + Resume Optimizer + Cover Letter + Interview Prep per application
          </p>
          <p className="text-sm font-semibold text-blue-700 mt-2">
            Recommended: {recommendedPack} Pack
          </p>
        </div>
      </div>
    </div>
  );
}

const COMPETITORS = [
  { name: "AISkillScore", price: "From $5", ats: true, match: true, cover: true, interview: true, linkedin: true, mission: true, gap: "" },
  { name: "Jobscan", price: "$49.95/mo", ats: true, match: true, cover: false, interview: false, linkedin: false, mission: false, gap: "Keyword counting only. No evidence, no recruiter perspective." },
  { name: "Teal", price: "$29/mo", ats: true, match: false, cover: true, interview: false, linkedin: true, mission: false, gap: "Generic templates. Destroys your authentic voice." },
  { name: "FinalRound", price: "$149/mo", ats: false, match: false, cover: false, interview: true, linkedin: false, mission: false, gap: "No follow-up prep. The thing that actually decides interviews." },
];

export default function PricingPage() {
  const [purchaseError, setPurchaseError] = useState("");
  const [purchasing, setPurchasing] = useState<string>("");

  const handlePurchase = async (packId: string) => {
    setPurchaseError("");
    setPurchasing(packId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Purchase failed. Please try again.");
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : "Purchase failed. Please try again.");
    } finally {
      setPurchasing("");
    }
  };

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

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Pay per use. No subscriptions.
          </h1>
          <p className="text-lg text-gray-500 mb-4">
            Others charge $29–$149/month. We charge per tool, starting at free.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-full text-sm font-medium text-green-700 mb-6">
            Log in daily for 2 free tokens. That&apos;s a free JD Match scan every day.
          </div>
          <Insight type="competitive" text="Jobscan = $49.95/mo for just resume scanning. Teal = $29/mo. FinalRound = $149/mo. AISkillScore = pay per use." />
        </div>

        {/* Packs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          {PACKS.map((pack) => (
            <div
              key={pack.id}
              className={`rounded-2xl border p-6 ${
                pack.highlighted
                  ? "border-blue-600 bg-white shadow-lg shadow-blue-600/10 ring-1 ring-blue-600"
                  : "border-gray-200 bg-white"
              }`}
            >
              {pack.highlighted && (
                <span className="inline-block px-2.5 py-0.5 mb-3 text-[10px] font-bold text-blue-600 bg-blue-50 rounded-full uppercase">
                  Most Popular · Save {pack.save}
                </span>
              )}
              {pack.save && !pack.highlighted && (
                <span className="inline-block px-2.5 py-0.5 mb-3 text-[10px] font-bold text-green-600 bg-green-50 rounded-full uppercase">
                  Save {pack.save}
                </span>
              )}
              <h3 className="text-lg font-bold text-gray-900">{pack.name}</h3>
              <p className="text-4xl font-bold text-gray-900 mt-2">${pack.price}</p>
              <p className="text-sm text-gray-500 mt-1">{pack.tokens} tokens · {pack.rate}/token</p>
              <p className="text-xs text-gray-400 mt-2 mb-4">{pack.description}</p>
              {pack.vsNote && (
                <p className="text-[10px] text-blue-600 bg-blue-50 p-2 rounded-lg mb-4">{pack.vsNote}</p>
              )}
              <button
                onClick={() => handlePurchase(pack.id)}
                disabled={purchasing === pack.id}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors min-h-[48px] flex items-center justify-center gap-2 disabled:opacity-60 ${
                  pack.highlighted
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {purchasing === pack.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  `Get ${pack.name}`
                )}
              </button>
            </div>
          ))}
        </div>

        {purchaseError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center mb-8">
            <p className="text-sm text-red-600">{purchaseError}</p>
          </div>
        )}

        {/* Token Calculator */}
        <TokenCalculator />

        {/* What can you do */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            What can you do with tokens?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {TOOLS.map((tool) => (
              <div key={tool.id} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
                <p className="text-sm font-medium text-gray-900">{tool.title}</p>
                <p className={`text-xs font-bold mt-1 ${tool.tokens === 0 ? "text-green-600" : "text-blue-600"}`}>
                  {tool.tokens === 0 ? "Free" : `${tool.tokens} tokens`}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Competitor comparison */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            How we compare
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Feature</th>
                  {COMPETITORS.map((c) => (
                    <th key={c.name} className={`text-center px-4 py-3 font-semibold ${c.name === "AISkillScore" ? "text-blue-600" : "text-gray-900"}`}>
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-700">Price</td>
                  {COMPETITORS.map((c) => (
                    <td key={c.name} className={`text-center px-4 py-3 font-medium ${c.name === "AISkillScore" ? "text-blue-600" : "text-gray-900"}`}>
                      {c.price}
                    </td>
                  ))}
                </tr>
                {[
                  { key: "ats", label: "ATS Resume Scan" },
                  { key: "match", label: "JD Matching" },
                  { key: "cover", label: "Cover Letters" },
                  { key: "interview", label: "Interview Prep" },
                  { key: "linkedin", label: "LinkedIn Optimization" },
                  { key: "mission", label: "Mission Workflow" },
                ].map((feature) => (
                  <tr key={feature.key} className="border-b border-gray-100">
                    <td className="px-4 py-3 text-gray-700">{feature.label}</td>
                    {COMPETITORS.map((c) => (
                      <td key={c.name} className="text-center px-4 py-3">
                        {(c as Record<string, unknown>)[feature.key] ? (
                          <Check className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-700 font-medium">What they miss</td>
                  {COMPETITORS.map((c) => (
                    <td key={c.name} className={`text-center px-4 py-3 text-xs ${c.name === "AISkillScore" ? "text-blue-600 font-medium" : "text-gray-500"}`}>
                      {c.name === "AISkillScore" ? "Nothing — 11 tools in one" : c.gap}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Track B ROI */}
        <div className="mb-16 bg-violet-50 border border-violet-200 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Not just job hunting</h2>
          <p className="text-gray-600 mb-4">
            Our tools help you build income while you search. Every analysis surfaces freelance, consulting, and entrepreneurship opportunities based on your skills.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mt-6">
            <div className="bg-white rounded-xl p-4">
              <p className="text-sm font-semibold text-violet-700">Entrepreneurship Assessment</p>
              <p className="text-xs text-gray-500 mt-1">Business ideas from your skills + 90-day launch plan</p>
            </div>
            <div className="bg-white rounded-xl p-4">
              <p className="text-sm font-semibold text-violet-700">Career Roadmap</p>
              <p className="text-xs text-gray-500 mt-1">Dual-track: job hunt + income building with monthly targets</p>
            </div>
            <div className="bg-white rounded-xl p-4">
              <p className="text-sm font-semibold text-violet-700">Every Tool</p>
              <p className="text-xs text-gray-500 mt-1">Freelance and consulting opportunities surfaced in every result</p>
            </div>
          </div>
        </div>

        {/* Email Capture */}
        <div className="mb-16 bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Not ready to buy? Stay in the loop.</h2>
          <p className="text-sm text-gray-500 mb-4">Get career tips, product updates, and occasional deals. No spam.</p>
          <div className="max-w-md mx-auto">
            <EmailCapture context="pricing" />
          </div>
        </div>

        {/* Lifetime Deal CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-8 text-white text-center mb-16">
          <h2 className="text-2xl font-bold mb-2">Want unlimited value?</h2>
          <p className="text-blue-100 mb-4">Get the Lifetime Deal — $49 for 100 tokens/month forever.</p>
          <p className="text-xs text-blue-200 mb-6">Already a lifetime subscriber? You can top up with any pack above for extra tokens in busy months.</p>
          <Link
            href="/lifetime"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors min-h-[48px]"
          >
            Learn More <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">FAQ</h2>
          <FAQ items={FAQ_ITEMS} />
        </div>
      </div>
    </div>
  );
}
