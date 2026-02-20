"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Check, X, Loader2 } from "lucide-react";
import { PACKS, TOOLS, FAQ_ITEMS, CANONICAL_COPY, formatTokenAmountLabel } from "@/lib/constants";
import { FAQ } from "@/components/shared/FAQ";
import { Insight } from "@/components/shared/Insight";
import { EmailCapture } from "@/components/landing/EmailCapture";

function TokenCalculator() {
  const [jobApps, setJobApps] = useState(5);
  // Average tokens per full job application: JD Match (5) + Resume (15) + Cover Letter (8) + Interview (8) = 36
  const tokensNeeded = useMemo(() => {
    const perApp = 36; // JD Match + Resume + Cover Letter + Interview
    const base = jobApps * perApp;
    return base;
  }, [jobApps]);

  const recommendedPack = tokensNeeded <= 50 ? "Starter" : tokensNeeded <= 200 ? "Pro" : tokensNeeded <= 500 ? "Power" : "Lifetime";

  return (
    <div className="surface-card p-6">
      <h2 className="text-h3 text-center mb-4">How many tokens do you need?</h2>
      <div className="max-w-md mx-auto space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2.5">
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
        <div className="surface-card-hero p-4 text-center space-y-1">
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
  { name: "AISkillScore", price: "From $14", ats: true, match: true, cover: true, interview: true, linkedin: true, mission: true, gap: "" },
  { name: "Jobscan", price: "$599/yr", ats: true, match: true, cover: false, interview: false, linkedin: false, mission: false, gap: "Keyword counting only. No evidence, no recruiter perspective." },
  { name: "Teal", price: "$348/yr", ats: true, match: false, cover: true, interview: false, linkedin: true, mission: false, gap: "Generic templates. Destroys your authentic voice." },
  { name: "FinalRound", price: "$1,788/yr", ats: false, match: false, cover: false, interview: true, linkedin: false, mission: false, gap: "No follow-up prep. The thing that actually decides interviews." },
];

export default function PricingPage() {
  const [purchaseError, setPurchaseError] = useState("");
  const [purchasing, setPurchasing] = useState<string>("");
  const [selectedPackId, setSelectedPackId] = useState<string>("pro");

  const selectedPack = PACKS.find((p) => p.id === selectedPackId) ?? PACKS[0];
  const selectedPackWorkflowCoverage = selectedPack.tokens >= 200
    ? "Covers multiple full job cycles: JD Match -> Resume -> Cover Letter -> Interview Prep."
    : selectedPack.tokens >= 50
      ? "Covers a focused run: JD Match + Resume Optimizer + one follow-up tool."
      : "Best for trying one to two tools and validating fit before scaling.";

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

  const productsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "AISkillScore Token Packs",
    description: "AI career tool token packs — pay per use, no subscriptions.",
    numberOfItems: PACKS.length,
    itemListElement: PACKS.map((pack, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Product",
        name: `${pack.name} Pack — ${pack.tokens} AI Career Tokens`,
        description: `${pack.description}. ${pack.tokens} tokens at ${pack.rate}/token.${pack.save ? ` Save ${pack.save}.` : ""}`,
        offers: {
          "@type": "Offer",
          price: String(pack.price),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          priceValidUntil: "2027-12-31",
        },
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productsJsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Continue your mission. Pay per use.
          </h1>
          <p className="text-body max-w-2xl mx-auto leading-relaxed">
            AISkillScore is an AI-powered career intelligence platform with 11 evidence-first tools. This pricing page shows how token packs map to real workflows so you can pay per use, avoid annual lock-in, and choose the right plan fast.
          </p>
          <div className="max-w-2xl mx-auto">
            <Insight
              type="competitive"
              text="Claim: Jobscan is $599/year, Teal is $348/year, and FinalRound is $1,788/year. Mechanism: AISkillScore runs premium, evidence-first analysis with pay-per-use tokens. Evidence: most users can start from $14 without annual lock-in."
            />
          </div>
          <div className="inline-flex items-center gap-2 ui-badge ui-badge-green">
            {CANONICAL_COPY.tokens.dailyFreeMessage}
          </div>
        </div>

        {/* Packs */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-h2 mb-2">Choose your pack</h2>
            <p className="text-body-sm max-w-2xl mx-auto leading-relaxed">
              Every pack uses the same Gemini 2.5 Pro workflow. Bigger packs reduce cost per token and prevent mission interruptions.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PACKS.map((pack) => (
            <button
              key={pack.id}
              type="button"
              onClick={() => setSelectedPackId(pack.id)}
              className={`text-left surface-card p-6 transition-all ${
                selectedPackId === pack.id
                  ? "border-blue-600 shadow-lg shadow-blue-600/10 ring-1 ring-blue-600"
                  : "surface-card-hover"
              }`}
            >
              {selectedPackId === pack.id && (
                <span className="ui-badge ui-badge-blue mb-4">
                  Selected
                </span>
              )}
              {pack.save && selectedPackId !== pack.id && (
                <span className="ui-badge ui-badge-green mb-4">
                  Save {pack.save}
                </span>
              )}
              <h3 className="text-h3">{pack.name}</h3>
              <p className="text-4xl font-bold text-gray-900 mt-2 leading-none">${pack.price}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{pack.tokens} {CANONICAL_COPY.tokens.unit} · {pack.rate}{CANONICAL_COPY.tokens.rateSuffix}</p>
              <p className="text-xs text-gray-400 mt-2 mb-4">{pack.description}</p>
              {pack.vsNote && (
                <p className="text-caption text-blue-600 bg-blue-50 p-2 rounded-lg mb-4 leading-relaxed">
                  {pack.vsNote}
                </p>
              )}
            </button>
          ))}
          </div>
          <div className="surface-card-soft p-4 sm:p-5">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Recommended next unlock</p>
            <p className="text-sm text-gray-900 font-semibold">{selectedPack.name} · {selectedPack.tokens} tokens</p>
            <p className="text-xs text-gray-600 mt-1">{selectedPackWorkflowCoverage}</p>
            <button
              onClick={() => handlePurchase(selectedPack.id)}
              disabled={purchasing === selectedPack.id}
              className="btn-primary mt-3 w-full sm:w-auto"
            >
              {purchasing === selectedPack.id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing…
                </>
              ) : (
                `Continue with ${selectedPack.name}`
              )}
            </button>
          </div>
        </div>

        {purchaseError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center mb-8">
            <p className="text-sm text-red-600">{purchaseError}</p>
          </div>
        )}

        {/* Token Calculator */}
        <TokenCalculator />

        {/* What can you do */}
        <div className="space-y-8">
          <h2 className="text-h2 text-center">
            What can you do with tokens?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {TOOLS.map((tool) => (
            <div key={tool.id} className="surface-card p-2 sm:p-3 text-center min-w-0">
                <p className="text-body-sm font-medium text-gray-900 line-clamp-2 break-words leading-tight">{tool.title}</p>
                <p className={`text-caption font-bold mt-1 whitespace-nowrap ${tool.tokens === 0 ? "text-green-600" : "text-blue-600"}`}>
                  {formatTokenAmountLabel(tool.tokens)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Competitor comparison */}
        <div className="space-y-4">
          <h2 className="text-h2 text-center">
            How we compare
          </h2>
          <p className="text-body-sm text-center max-w-2xl mx-auto leading-relaxed">
            Comparison is based on publicly listed pricing and core workflow coverage. We optimize for cited evidence and practical outputs.
          </p>
          <div className="surface-card overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-xs sm:text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-3 sm:px-4 py-3 font-medium text-gray-500 whitespace-nowrap">Feature</th>
                  {COMPETITORS.map((c) => (
                    <th key={c.name} className={`text-center px-2 sm:px-4 py-3 font-semibold whitespace-nowrap ${c.name === "AISkillScore" ? "text-blue-600" : "text-gray-900"}`}>
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
                      <span className="inline-block max-w-[180px] leading-relaxed">
                        {c.name === "AISkillScore" ? "Nothing — 11 tools in one" : c.gap}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Track B ROI */}
        <div className="surface-card-hero p-8 text-center space-y-4">
          <h2 className="text-h2 mb-2">Not just job hunting</h2>
          <p className="text-body mb-4 max-w-2xl mx-auto leading-relaxed">
            Our tools help you build income while you search. Every analysis surfaces freelance, consulting, and entrepreneurship opportunities based on your skills.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto mt-6">
            <div className="surface-card p-3 sm:p-4">
              <p className="text-sm font-semibold text-indigo-700">Entrepreneurship Assessment</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Business ideas from your skills + 90-day launch plan</p>
            </div>
            <div className="surface-card p-3 sm:p-4">
              <p className="text-sm font-semibold text-indigo-700">Career Roadmap</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Dual-track: job hunt + income building with monthly targets</p>
            </div>
            <div className="surface-card p-3 sm:p-4">
              <p className="text-sm font-semibold text-indigo-700">Every Tool</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Freelance and consulting opportunities surfaced in every result</p>
            </div>
          </div>
        </div>

        {/* Email Capture */}
        <div className="surface-card-soft p-8 text-center">
          <h2 className="text-h3 mb-2">Not ready to buy? Stay in the loop.</h2>
          <p className="text-sm text-gray-500 mb-4 max-w-xl mx-auto">
            Get career tips, product updates, and occasional deals. No spam.
          </p>
          <div className="max-w-md mx-auto">
            <EmailCapture context="pricing" />
          </div>
        </div>

        {/* Lifetime Deal CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2 tracking-tight">Want unlimited value?</h2>
          <p className="text-blue-100 mb-4 max-w-2xl mx-auto">
            Get the Lifetime Deal — from $119 for 120 tokens/month forever.
          </p>
          <p className="text-xs text-blue-200 mb-6 max-w-2xl mx-auto leading-relaxed">
            Less than the cost of one TopResume review ($149). Already a lifetime subscriber? Top up with any pack above for extra tokens.
          </p>
          <Link
            href="/lifetime"
            className="btn-secondary inline-flex sm:w-auto px-6 bg-white text-blue-700 border-white hover:bg-blue-50"
          >
            Learn More <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-h2 text-center mb-8">FAQ</h2>
          <FAQ items={FAQ_ITEMS} />
        </div>
      </div>
    </div>
  );
}
