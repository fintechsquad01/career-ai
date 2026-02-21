"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Check, X, Loader2 } from "lucide-react";
import { PACKS, TOOLS, FAQ_ITEMS, CANONICAL_COPY, formatTokenAmountLabel } from "@/lib/constants";
import { trackPurchase, track, EVENTS } from "@/lib/analytics";
import { TrackedLink } from "@/components/shared/TrackedLink";
import { FAQ } from "@/components/shared/FAQ";

const PRICING_FAQ_QUESTIONS = [
  "How does the token system work?",
  "What's the Lifetime Deal?",
  "How is the Lifetime Deal different from token packs?",
  "Can I get a refund?",
  "How many tokens do I need for 5 job applications?",
];
const PRICING_FAQS = FAQ_ITEMS.filter((item) =>
  PRICING_FAQ_QUESTIONS.includes(item.q)
);

function TokenCalculator() {
  const [jobApps, setJobApps] = useState(5);
  const calculatorTracked = useRef(false);
  const tokensNeeded = useMemo(() => jobApps * 36, [jobApps]);
  const recommendedPack = tokensNeeded <= 50 ? "Starter" : tokensNeeded <= 200 ? "Pro" : tokensNeeded <= 500 ? "Power" : "Lifetime";

  return (
    <div className="surface-base p-6">
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
            onChange={(e) => {
              setJobApps(Number(e.target.value));
              if (!calculatorTracked.current) {
                calculatorTracked.current = true;
                track(EVENTS.PRICING_CALCULATOR_USED, { initial_value: 5, new_value: Number(e.target.value) });
              }
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 app</span>
            <span>30 apps</span>
          </div>
        </div>
        <div className="surface-hero p-4 text-center space-y-1">
          <p className="text-sm text-gray-600">
            You&apos;ll need approximately <span className="font-bold text-blue-600">{tokensNeeded} tokens</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Job Match Score + Resume Optimizer + Cover Letter + Interview Prep per application
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
  { name: "AISkillScore", price: "From $14", tools: "11", model: "Pay per use" },
  { name: "Jobscan", price: "$599/yr", tools: "2", model: "Annual subscription" },
  { name: "Teal", price: "$348/yr", tools: "4", model: "Annual subscription" },
  { name: "FinalRound", price: "$1,788/yr", tools: "1", model: "Annual subscription" },
];

export function PricingContent() {
  const [purchaseError, setPurchaseError] = useState("");
  const [purchasing, setPurchasing] = useState<string>("");
  const [selectedPackId, setSelectedPackId] = useState<string>("pro");

  const selectedPack = PACKS.find((p) => p.id === selectedPackId) ?? PACKS[0];
  const selectedPackWorkflowCoverage = selectedPack.tokens >= 200
    ? "Covers multiple full job cycles: Job Match Score -> Resume -> Cover Letter -> Interview Prep."
    : selectedPack.tokens >= 50
      ? "Covers a focused run: Job Match Score + Resume Optimizer + one follow-up tool."
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
        const pack = PACKS.find((p) => p.id === packId);
        if (pack) trackPurchase({ id: pack.id, name: pack.name, price: pack.price, tokens: pack.tokens });
        window.location.href = data.url;
      }
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : "Purchase failed. Please try again.");
    } finally {
      setPurchasing("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-14 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
          Pay per use. No subscriptions.
        </h1>
        <p className="text-body max-w-xl mx-auto leading-relaxed">
          11 evidence-first tools powered by Gemini 2.5 Pro. Choose the right pack for your mission.
        </p>
        <div className="inline-flex items-center gap-2 ui-badge ui-badge-green">
          {CANONICAL_COPY.tokens.dailyFreeMessage}
        </div>
      </div>

      {/* Token Calculator — moved up so user knows their need first */}
      <TokenCalculator />

      {/* Pack Cards */}
      <div className="space-y-5">
        <h2 className="text-h2 text-center">Choose your pack</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PACKS.map((pack) => (
            <button
              key={pack.id}
              type="button"
              onClick={() => {
                setSelectedPackId(pack.id);
                track(EVENTS.PRICING_PACK_SELECTED, { pack_id: pack.id });
              }}
              className={`text-left surface-base p-6 transition-all ${
                selectedPackId === pack.id
                  ? "border-blue-600 shadow-lg shadow-blue-600/10 ring-1 ring-blue-600"
                  : "surface-hover"
              }`}
            >
              {selectedPackId === pack.id && (
                <span className="ui-badge ui-badge-blue mb-3">Selected</span>
              )}
              {pack.save && selectedPackId !== pack.id && (
                <span className="ui-badge ui-badge-green mb-3">Save {pack.save}</span>
              )}
              <h3 className="text-h3">{pack.name}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-1 leading-none">${pack.price}</p>
              <p className="text-xs text-gray-500 mt-1">
                {pack.tokens} {CANONICAL_COPY.tokens.unit} · {pack.rate}{CANONICAL_COPY.tokens.rateSuffix}
              </p>
              <p className="text-xs text-gray-600 mt-2 font-medium">{pack.description}</p>
            </button>
          ))}
        </div>

        {/* Recommended + CTA */}
        <div className="surface-soft p-4 sm:p-5">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Recommended now</p>
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
                Processing...
              </>
            ) : (
              `Continue with ${selectedPack.name}`
            )}
          </button>
        </div>

        {purchaseError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-sm text-red-600">{purchaseError}</p>
          </div>
        )}
      </div>

      {/* Lifetime Deal upsell — compact */}
      <div className="surface-hero p-6 sm:p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Want unlimited value?</h2>
        <p className="text-sm text-gray-600 mb-4 max-w-lg mx-auto">
          Lifetime Deal — $119 once for 120 tokens/month forever. Break even in 3 months vs Pro packs.
        </p>
        <TrackedLink href="/lifetime" event={EVENTS.PRICING_LIFETIME_CLICKED} className="btn-primary sm:w-auto px-6 inline-flex">
          Learn More <ArrowRight className="w-4 h-4" />
        </TrackedLink>
      </div>

      {/* Compact Competitor Summary — 3 rows only */}
      <div className="space-y-3">
        <h2 className="text-h3 text-center">How we compare</h2>
        <div className="surface-base overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-500" />
                {COMPETITORS.map((c) => (
                  <th key={c.name} className={`text-center px-3 py-3 font-semibold whitespace-nowrap ${c.name === "AISkillScore" ? "text-blue-600" : "text-gray-900"}`}>
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Price", key: "price" as const },
                { label: "AI Tools", key: "tools" as const },
                { label: "Pay Model", key: "model" as const },
              ].map((row) => (
                <tr key={row.key} className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-700 font-medium">{row.label}</td>
                  {COMPETITORS.map((c) => (
                    <td key={c.name} className={`text-center px-3 py-3 ${c.name === "AISkillScore" ? "text-blue-600 font-semibold" : "text-gray-600"}`}>
                      {c[row.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-center">
          <TrackedLink href="/compare" event={EVENTS.PRICING_COMPARE_CLICKED} className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
            See detailed comparisons <ArrowRight className="w-3 h-3" />
          </TrackedLink>
        </p>
      </div>

      {/* Tools grid — compact */}
      <details className="group">
        <summary className="text-h3 text-center cursor-pointer list-none flex items-center justify-center gap-2 select-none">
          What can you do with tokens?
          <span className="text-xs text-gray-400 group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 mt-4">
          {TOOLS.map((tool) => (
            <div key={tool.id} className="surface-base p-2 sm:p-3 text-center min-w-0">
              <p className="text-body-sm font-medium text-gray-900 line-clamp-2 break-words leading-tight">{tool.title}</p>
              <p className={`text-caption font-bold mt-1 whitespace-nowrap ${tool.tokens === 0 ? "text-green-600" : "text-blue-600"}`}>
                {formatTokenAmountLabel(tool.tokens)}
              </p>
            </div>
          ))}
        </div>
      </details>

      {/* Pricing FAQ — 5 items only */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-h2 text-center mb-6">Pricing FAQ</h2>
        <FAQ items={PRICING_FAQS} />
        <p className="text-center mt-5">
          <Link
            href="/faq"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
          >
            See all {FAQ_ITEMS.length} questions <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </p>
      </div>
    </div>
  );
}
