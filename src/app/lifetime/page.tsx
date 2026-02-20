"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Shield, Gem, Sparkles, Loader2 } from "lucide-react";
import { FAQ } from "@/components/shared/FAQ";
import { createClient } from "@/lib/supabase/client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

function getTimeLeftToEndOfMonth() {
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const diff = endOfMonth.getTime() - now.getTime();

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
  };
}

function CountdownTimer() {
  // Countdown to end of month for urgency
  const [timeLeft, setTimeLeft] = useState(getTimeLeftToEndOfMonth);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeftToEndOfMonth()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-3 flex items-center justify-center gap-3">
      <span className="text-xs font-medium text-gray-500">Early bird pricing ends in:</span>
      <div className="flex items-center gap-1.5">
        {[
          { value: timeLeft.days, label: "d" },
          { value: timeLeft.hours, label: "h" },
          { value: timeLeft.minutes, label: "m" },
        ].map((unit) => (
          <span key={unit.label} className="inline-flex items-center gap-0.5 px-2 py-1 bg-gray-900 text-white text-xs font-mono font-bold rounded">
            {String(unit.value).padStart(2, "0")}{unit.label}
          </span>
        ))}
      </div>
    </div>
  );
}

const LIFETIME_FAQ = [
  { q: "What happens after I buy?", a: "You immediately receive 120 tokens (180 for VIP). Every 30 days, tokens are refilled automatically. Unused tokens cap at 300." },
  { q: "Is this really one-time?", a: "Yes. One payment, tokens forever. No hidden fees, no recurring charges." },
  { q: "What if I'm not satisfied?", a: "30-day money-back guarantee. Full refund, no questions asked." },
  { q: "How many spots are left?", a: "We're limiting early bird pricing to 500 users. Once filled, the price goes to $179." },
  { q: "What's the difference between tiers?", a: "Early Bird ($119) and Standard ($179) both get 120 tokens/month. VIP ($279) gets 180 tokens/month plus priority AI processing for faster results." },
];

const LIFETIME_TIERS = [
  { id: "lifetime_early", label: "Early Bird", price: 119, tokens: 120 },
  { id: "lifetime_standard", label: "Standard", price: 179, tokens: 120 },
  { id: "lifetime_vip", label: "VIP", price: 279, tokens: 180 },
] as const;

export default function LifetimePage() {
  const [selectedTier, setSelectedTier] = useState<string>("lifetime_early");
  const [purchaseError, setPurchaseError] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const [spotsClaimed, setSpotsClaimed] = useState<number | null>(null);
  const TOTAL_SPOTS = 500;

  const activeTier = LIFETIME_TIERS.find((t) => t.id === selectedTier) ?? LIFETIME_TIERS[0];
  const lifetimeFaqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: LIFETIME_FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
  const lifetimeWebPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${APP_URL}/lifetime#webpage`,
    url: `${APP_URL}/lifetime`,
    name: "AISkillScore Lifetime Deal",
    description:
      "AISkillScore is an AI-powered career intelligence platform. The Lifetime Deal gives 120 tokens every month with one payment and no subscription lock-in.",
    isPartOf: { "@id": `${APP_URL}/#website` },
    about: {
      "@type": "Thing",
      name: "AI-powered career intelligence platform",
    },
    publisher: { "@id": `${APP_URL}/#organization` },
  };

  useEffect(() => {
    async function fetchSpotsClaimed() {
      try {
        const supabase = createClient();
        const { count } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("lifetime_deal", true);
        setSpotsClaimed(count ?? 0);
      } catch {
        // Fallback if query fails
        setSpotsClaimed(0);
      }
    }
    fetchSpotsClaimed();
  }, []);

  const handlePurchase = async () => {
    setPurchaseError("");
    setPurchasing(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId: selectedTier }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Purchase failed. Please try again.");
      }
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : "Purchase failed. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(lifetimeWebPageJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(lifetimeFaqJsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-8">
          <ArrowLeft className="w-4 h-4" /> Pricing
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-sm font-medium text-indigo-700 mb-4">
            <Gem className="w-4 h-4" /> Early Bird Lifetime Deal
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            120 tokens/month. Forever.
          </h1>
          <p className="text-lg text-gray-500">
            AISkillScore Lifetime gives you recurring tokens with a one-time payment, so you can run evidence-first career analysis every month without subscription lock-in.
          </p>

          {/* Spots counter */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-full">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-red-700">
              {spotsClaimed !== null
                ? `${TOTAL_SPOTS - spotsClaimed} of ${TOTAL_SPOTS} spots remaining`
                : "Loading spots…"}
            </span>
          </div>

          {/* Countdown timer */}
          <CountdownTimer />
        </div>

        {/* Price comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          <button
            type="button"
            onClick={() => setSelectedTier("lifetime_early")}
            className={`bg-white rounded-2xl p-5 text-center relative transition-all cursor-pointer ${
              selectedTier === "lifetime_early"
                ? "border-2 border-indigo-600 ring-2 ring-indigo-600/30"
                : "border-2 border-gray-200 hover:border-indigo-300"
            }`}
          >
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full uppercase whitespace-nowrap">Best Value</span>
            <p className="text-xs font-bold text-indigo-600 uppercase mb-2 mt-1">Early Bird</p>
            <p className="text-3xl sm:text-4xl font-bold text-gray-900">$119</p>
            <p className="text-sm text-gray-500 mt-1">one-time</p>
            <p className="text-xs text-indigo-600 font-medium mt-2 break-words">120 tokens/mo · $0.083/token</p>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTier("lifetime_standard")}
            className={`rounded-2xl p-5 text-center transition-all cursor-pointer ${
              selectedTier === "lifetime_standard"
                ? "bg-white border-2 border-indigo-600 ring-2 ring-indigo-600/30"
                : "bg-gray-50 border-2 border-gray-200 hover:border-indigo-300"
            }`}
          >
            <p className={`text-xs font-bold uppercase mb-2 ${selectedTier === "lifetime_standard" ? "text-indigo-600" : "text-gray-400"}`}>Standard</p>
            <p className={`text-3xl sm:text-4xl font-bold ${selectedTier === "lifetime_standard" ? "text-gray-900" : "text-gray-400"}`}>$179</p>
            <p className={`text-sm mt-1 ${selectedTier === "lifetime_standard" ? "text-gray-500" : "text-gray-400"}`}>one-time</p>
            <p className={`text-xs font-medium mt-2 break-words ${selectedTier === "lifetime_standard" ? "text-indigo-600" : "text-gray-400"}`}>120 tokens/mo · $0.124/token</p>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTier("lifetime_vip")}
            className={`bg-gradient-to-b from-amber-50 to-white rounded-2xl p-5 text-center transition-all cursor-pointer ${
              selectedTier === "lifetime_vip"
                ? "border-2 border-amber-500 ring-2 ring-amber-500/30"
                : "border-2 border-amber-200 hover:border-amber-400"
            }`}
          >
            <p className="text-xs font-bold text-amber-600 uppercase mb-2">VIP</p>
            <p className="text-3xl sm:text-4xl font-bold text-gray-900">$279</p>
            <p className="text-sm text-gray-500 mt-1">one-time</p>
            <p className="text-xs text-amber-600 font-medium mt-2">180 tokens/mo · $0.129/token</p>
            <p className="text-[10px] text-amber-700 mt-1">+ priority processing</p>
          </button>
        </div>

        {/* ROI */}
        <div className="surface-card p-6 sm:p-8 mb-10">
          <h3 className="font-semibold text-gray-900 mb-4">ROI Calculator</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Monthly tokens</span>
              <span className="font-medium text-gray-900">120 tokens (180 VIP)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Value at Pro rate ($0.195/token)</span>
              <span className="font-medium text-gray-900">$23.40/month</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-3">
              <span className="text-gray-500">Break even in</span>
              <span className="font-bold text-green-600">~3 months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Year 1 token value</span>
              <span className="font-bold text-green-600">$280 worth of tokens</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-3">
              <span className="text-gray-500">vs. Jobscan annual cost</span>
              <span className="font-bold text-red-500">$599/year</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            120 tokens covers a full application stack plus extra tools each month.
          </p>
        </div>

        {/* What 100 tokens covers */}
        <div className="surface-card p-6 sm:p-8 mb-10">
          <h3 className="font-semibold text-gray-900 mb-4">What 120 tokens covers monthly</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "1 Resume Optimization (15 tokens)",
              "2 Job Match Score Analyses (10 tokens)",
              "1 Cover Letter (8 tokens)",
              "1 Interview Prep (8 tokens)",
              "1 Skills Gap Analysis (8 tokens)",
              "1 Career Roadmap (15 tokens)",
              "1 Salary Negotiation (8 tokens)",
              "Unlimited AI Displacement (Free)",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Topup Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-10 flex items-start gap-4">
          <Sparkles className="w-8 h-8 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900">Need more in a busy month? Top up anytime.</h3>
            <p className="text-sm text-blue-800 mt-1">
              Lifetime subscribers can purchase any token pack on top of their monthly refill. Purchased tokens are separate from your 120/month and never expire.
            </p>
            <Link href="/pricing" className="text-sm font-semibold text-blue-600 hover:text-blue-700 mt-2 inline-block">
              View token packs →
            </Link>
          </div>
        </div>

        {/* Guarantee */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-10 flex items-start gap-4">
          <Shield className="w-8 h-8 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-green-900">30-Day Money-Back Guarantee</h3>
            <p className="text-sm text-green-800 mt-1">
              Not satisfied? We&apos;ll refund you in full within 30 days. No questions asked.
            </p>
          </div>
        </div>

        {purchaseError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center mb-6">
            <p className="text-sm text-red-600">{purchaseError}</p>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white mb-10">
          <Sparkles className="w-8 h-8 mx-auto mb-3 text-blue-200" />
          <h2 className="text-2xl font-bold mb-2">Lock in your lifetime deal</h2>
          <p className="text-blue-100 mb-6">
            ${activeTier.price} today. {activeTier.tokens} tokens every month. Forever.
          </p>
          <p className="text-xs text-blue-100/90 mb-4">
            Unlocks recurring mission flow coverage each month: Job Match Score -&gt; Resume -&gt; Interview Prep -&gt; Salary strategy.
          </p>
          <button
            onClick={handlePurchase}
            disabled={purchasing}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 text-base font-bold rounded-xl hover:bg-blue-50 transition-colors min-h-[48px] shadow-lg disabled:opacity-60"
          >
            {purchasing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                Get {activeTier.label} Deal — ${activeTier.price}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          <p className="text-xs text-blue-200 mt-3">One-time payment · 30-day guarantee · Cancel never</p>
        </div>

        {/* FAQ */}
        <FAQ items={LIFETIME_FAQ} />
      </div>
    </div>
  );
}
