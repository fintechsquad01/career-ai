"use client";

import Link from "next/link";
import { ArrowRight, Check, X, Minus } from "lucide-react";
import { PACKS, TOOLS, FAQ_ITEMS } from "@/lib/constants";
import { FAQ } from "@/components/shared/FAQ";
import { Insight } from "@/components/shared/Insight";

const COMPETITORS = [
  { name: "CareerAI", price: "From $5", ats: true, match: true, cover: true, interview: true, linkedin: true, mission: true },
  { name: "Jobscan", price: "$49.95/mo", ats: true, match: true, cover: false, interview: false, linkedin: false, mission: false },
  { name: "Teal", price: "$29/mo", ats: true, match: false, cover: true, interview: false, linkedin: true, mission: false },
  { name: "FinalRound", price: "$149/mo", ats: false, match: false, cover: false, interview: true, linkedin: false, mission: false },
];

export default function PricingPage() {
  const handlePurchase = async (packId: string) => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Purchase error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Pay per use. No subscriptions.
          </h1>
          <p className="text-lg text-gray-500 mb-6">
            Others charge $29–$149/month. We charge per tool, starting at free.
          </p>
          <Insight type="competitive" text="Jobscan = $49.95/mo for just resume scanning. Teal = $29/mo. FinalRound = $149/mo. CareerAI = pay per use." />
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
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors min-h-[48px] ${
                  pack.highlighted
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Get {pack.name}
              </button>
            </div>
          ))}
        </div>

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
                    <th key={c.name} className={`text-center px-4 py-3 font-semibold ${c.name === "CareerAI" ? "text-blue-600" : "text-gray-900"}`}>
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-700">Price</td>
                  {COMPETITORS.map((c) => (
                    <td key={c.name} className={`text-center px-4 py-3 font-medium ${c.name === "CareerAI" ? "text-blue-600" : "text-gray-900"}`}>
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
              </tbody>
            </table>
          </div>
        </div>

        {/* Lifetime Deal CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-8 text-white text-center mb-16">
          <h2 className="text-2xl font-bold mb-2">Want unlimited value?</h2>
          <p className="text-blue-100 mb-6">Get the Lifetime Deal — $49 for 100 tokens/month forever.</p>
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
