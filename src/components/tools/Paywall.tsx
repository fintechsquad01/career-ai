"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Coins, ArrowRight, Users } from "lucide-react";
import { PACKS } from "@/lib/constants";

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
        localStorage.setItem("pendingToolId", toolId);
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

      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 animate-in slide-in-from-bottom-4 duration-300">
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
          <h2 className="text-lg font-bold text-gray-900">
            {deficit > 0
              ? `You need ${deficit} more token${deficit !== 1 ? "s" : ""}`
              : `This tool costs ${requiredTokens} tokens`}
          </h2>
          {toolName && (
            <p className="text-xs text-gray-400 mt-0.5">for {toolName}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {currentBalance > 0
              ? `You have ${currentBalance} token${currentBalance !== 1 ? "s" : ""}. ${deficit > 0 ? `Need ${deficit} more.` : ""}`
              : "Come back tomorrow for free daily tokens, or grab a pack to continue now."}
          </p>
        </div>

        {/* What you'll unlock — tool-specific preview */}
        <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 mb-4">
          <p className="text-xs font-semibold text-violet-700 mb-1.5">What you&apos;ll unlock</p>
          <p className="text-sm text-violet-900">{toolDescription || toolName || "Premium AI analysis"}</p>
          {bullets && (
            <ul className="mt-2 space-y-1">
              {bullets.map((b, i) => (
                <li key={i} className="text-xs text-violet-800 flex items-start gap-1.5">
                  <span className="text-violet-500 mt-0.5">✓</span> {b}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Competitive anchoring */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 text-center">
          <p className="text-xs font-medium text-blue-700">
            Jobscan charges $599/year to count keywords. AISkillScore analyzes your actual resume — from $0.18/use.
          </p>
        </div>

        <div className="space-y-3">
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
                        COVERS THIS TOOL
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{pack.tokens} tokens · {pack.rate}/token</p>
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
            className="block w-full mt-3 p-3 bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 rounded-xl text-center hover:shadow-sm transition-shadow"
          >
            <p className="text-xs font-bold text-violet-700">Or get the Lifetime Deal</p>
            <p className="text-[11px] text-violet-600 mt-0.5">$79 once &rarr; 100 tokens/month forever</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
