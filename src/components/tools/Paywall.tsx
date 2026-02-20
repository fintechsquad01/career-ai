"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Coins, ArrowRight, Users } from "lucide-react";
import { PACKS, CANONICAL_COPY } from "@/lib/constants";
import { safeLocalStorage } from "@/lib/safe-storage";

const TOOL_UNLOCK_BULLETS: Record<string, string[]> = {
  resume: ["ATS-optimized rewrite preserving your voice", "Before/after score comparison", "Section-by-section recommendations"],
  jd_match: ["Fit score with evidence from your resume", "Critical gap identification", "Recruiter-perspective analysis"],
  cover_letter: ["Story-driven letter, not a template", "Company-specific research integrated", "Tone matched to industry norms"],
  interview: ["Role-specific questions with follow-ups", "STAR-format answer frameworks", "Company culture alignment tips"],
  linkedin: ["Headline & summary optimization", "Keyword strategy for recruiter AI", "Content calendar for visibility"],
  skills_gap: ["Gap prioritization by impact", "Week-by-week learning plan", "Free & paid resource recommendations"],
  roadmap: ["Dual-track: job hunt + income building", "Weekly milestones with checkpoints", "Skill development timeline"],
  salary: ["Market data with verification sources", "Word-for-word negotiation scripts", "Total compensation analysis"],
  headshots: ["Multiple professional styles", "LinkedIn-optimized dimensions", "Background options"],
  entrepreneurship: ["Founder-market fit analysis", "Revenue model suggestions", "First-week action plan"],
};

interface PaywallProps {
  requiredTokens: number;
  currentBalance?: number;
  toolName?: string;
  toolId?: string;
  toolDescription?: string;
  onClose: () => void;
  onPurchaseComplete: () => void;
}

export function Paywall({
  requiredTokens,
  currentBalance = 0,
  toolName,
  toolId,
  toolDescription,
  onClose,
  onPurchaseComplete,
}: PaywallProps) {
  const deficit = Math.max(0, requiredTokens - currentBalance);

  // Find the cheapest pack that covers the deficit
  const recommendedPack = PACKS.find((p) => p.tokens >= deficit) || PACKS[PACKS.length - 1];

  // Real-time social proof: count of analyses run in the last 24h
  const [recentToolCount, setRecentToolCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchRecentCount = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count } = await supabase
          .from("tool_results")
          .select("*", { count: "exact", head: true })
          .gte("created_at", yesterday);
        setRecentToolCount(count ?? 0);
      } catch {
        // silently fail
      }
    };
    fetchRecentCount();
  }, []);

  const bullets = toolId ? TOOL_UNLOCK_BULLETS[toolId] : undefined;

  const handlePurchase = async (packId: string) => {
    try {
      // Store pending tool so we can return after purchase
      if (toolId) {
        safeLocalStorage.setItem("pendingToolId", toolId);
      }
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
      // Fallback to pricing page
      window.location.href = "/pricing";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 animate-in slide-in-from-bottom-4 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
            <Coins className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Continue this mission step</h2>
          {toolName && (
            <p className="text-xs text-gray-400 mt-0.5">for {toolName}</p>
          )}
          <p className="text-sm text-gray-600 mt-2">
            You have <strong>{currentBalance}</strong> tokens · Need <strong>{requiredTokens}</strong> · Short <strong>{deficit}</strong>
          </p>
          <p className="text-xs text-blue-700 mt-1.5">
            Recommended now: <strong>{recommendedPack.name}</strong> covers this step and keeps your next action uninterrupted.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {CANONICAL_COPY.paywall.noSubscription}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {CANONICAL_COPY.paywall.tokenSafety}
          </p>
        </div>

        {/* What you'll unlock — tool-specific preview */}
        <div className="surface-soft border border-blue-100 rounded-xl px-4 py-3 mb-4">
          <p className="text-xs font-semibold text-blue-700 mb-1.5">What you&apos;ll unlock</p>
          <p className="text-sm text-gray-900">{toolDescription || toolName || "Premium AI analysis"}</p>
          {bullets && (
            <ul className="mt-2 space-y-1">
              {bullets.map((b, i) => (
                <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                  <span className="text-blue-600 mt-0.5">✓</span> {b}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Competitive anchoring */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 text-center">
          <p className="text-xs font-medium text-blue-700">
            Jobscan charges $599/year to count keywords. AISkillScore uses Gemini 2.5 Pro to analyze your actual resume — from $0.195/token.
          </p>
        </div>

        <div className="space-y-3 stagger-children">
          {PACKS.map((pack) => {
            const isRecommended = pack.id === recommendedPack.id;
            return (
              <button
                key={pack.id}
                onClick={() => handlePurchase(pack.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all min-h-[44px] ${
                  isRecommended
                    ? "border-blue-600 bg-blue-50 hover:bg-blue-100 ring-2 ring-blue-600/20"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{pack.name}</span>
                    {isRecommended && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                        BEST NEXT STEP
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{pack.tokens} tokens · {pack.rate}/token</p>
                  {isRecommended && (
                    <p className="text-[11px] text-blue-700 mt-1">
                      Covers current shortfall ({deficit}) and supports follow-up runs.
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">${pack.price}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-xs text-gray-400 text-center">
            Pro pack covers ~10 job applications + a full Entrepreneurship Assessment
          </p>
          {recentToolCount !== null && recentToolCount > 0 && (
            <div className="flex items-center justify-center text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" /> {recentToolCount} analyses run today
              </span>
            </div>
          )}
          <Link
            href="/lifetime"
            onClick={onClose}
            className="block w-full mt-3 p-3 surface-soft border border-blue-100 rounded-xl text-center hover:shadow-md transition-all hover:scale-[1.01]"
          >
            <p className="text-xs font-bold text-blue-700">Or get the Lifetime Deal</p>
            <p className="text-[11px] text-blue-600 mt-0.5">$119 once &rarr; 120 tokens/month forever</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
