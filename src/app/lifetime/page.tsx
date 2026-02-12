"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Shield, Clock, Gem, Sparkles } from "lucide-react";
import { FAQ } from "@/components/shared/FAQ";
import { TOOLS } from "@/lib/constants";

const LIFETIME_FAQ = [
  { q: "What happens after I buy?", a: "You immediately receive 100 tokens. Every 30 days, another 100 tokens are added automatically. Unused tokens cap at 300." },
  { q: "Is this really one-time?", a: "Yes. One payment of $49, tokens forever. No hidden fees, no recurring charges." },
  { q: "What if I'm not satisfied?", a: "30-day money-back guarantee. Full refund, no questions asked." },
  { q: "How many spots are left?", a: "We're limiting early bird pricing to 500 users. Once filled, the price goes to $79." },
];

export default function LifetimePage() {
  const handlePurchase = async () => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId: "lifetime_early" }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      console.error("Purchase error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-8">
          <ArrowLeft className="w-4 h-4" /> Pricing
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 border border-violet-100 rounded-full text-sm font-medium text-violet-700 mb-4">
            <Gem className="w-4 h-4" /> Early Bird Lifetime Deal
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            100 tokens/month. Forever.
          </h1>
          <p className="text-lg text-gray-500">
            One payment. Unlimited career growth.
          </p>

          {/* Spots counter */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-full">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-red-700">127 of 500 spots remaining</span>
          </div>
        </div>

        {/* Price comparison */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white rounded-2xl border-2 border-violet-600 p-6 text-center ring-1 ring-violet-600">
            <p className="text-xs font-bold text-violet-600 uppercase mb-2">Early Bird</p>
            <p className="text-4xl font-bold text-gray-900">$49</p>
            <p className="text-sm text-gray-500 mt-1">one-time</p>
            <p className="text-xs text-violet-600 font-medium mt-2">$0.041/token</p>
          </div>
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 text-center opacity-60">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Standard (Later)</p>
            <p className="text-4xl font-bold text-gray-400 line-through">$79</p>
            <p className="text-sm text-gray-400 mt-1">one-time</p>
            <p className="text-xs text-gray-400 font-medium mt-2">$0.066/token</p>
          </div>
        </div>

        {/* ROI */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-10">
          <h3 className="font-semibold text-gray-900 mb-4">ROI Calculator</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Monthly tokens</span>
              <span className="font-medium text-gray-900">100 tokens</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Value at Pro rate ($0.075/tok)</span>
              <span className="font-medium text-gray-900">$7.50/month</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-3">
              <span className="text-gray-500">Break even in</span>
              <span className="font-bold text-green-600">~7 months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Year 1 value</span>
              <span className="font-bold text-green-600">$90 worth of tokens</span>
            </div>
          </div>
        </div>

        {/* What 100 tokens covers */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-10">
          <h3 className="font-semibold text-gray-900 mb-4">What 100 tokens covers monthly</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              "2 Resume Optimizations (20 tok)",
              "3 JD Match Analyses (6 tok)",
              "2 Cover Letters (6 tok)",
              "2 Interview Preps (6 tok)",
              "1 Skills Gap Analysis (5 tok)",
              "1 Career Roadmap (8 tok)",
              "2 Salary Negotiations (6 tok)",
              "Unlimited AI Displacement (Free)",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
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

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-8 text-center text-white mb-10">
          <Sparkles className="w-8 h-8 mx-auto mb-3 text-blue-200" />
          <h2 className="text-2xl font-bold mb-2">Lock in your lifetime deal</h2>
          <p className="text-blue-100 mb-6">$49 today. 100 tokens every month. Forever.</p>
          <button
            onClick={handlePurchase}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 text-base font-bold rounded-xl hover:bg-blue-50 transition-colors min-h-[48px] shadow-lg"
          >
            Get Lifetime Deal — $49
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-blue-200 mt-3">One-time payment · 30-day guarantee · Cancel never</p>
        </div>

        {/* FAQ */}
        <FAQ items={LIFETIME_FAQ} />
      </div>
    </div>
  );
}
