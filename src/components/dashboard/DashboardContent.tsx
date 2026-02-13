"use client";

import Link from "next/link";
import { Ring } from "@/components/shared/Ring";
import { useState } from "react";
import { ProfileCard } from "./ProfileCard";
import { MissionCard } from "./MissionCard";
import { WelcomeModal } from "@/components/modals/WelcomeModal";
import { ArrowRight, Sparkles, Clock, AlertTriangle } from "lucide-react";
import { useTokens } from "@/hooks/useTokens";
import { TOOLS_MAP } from "@/lib/constants";
import type { Profile, CareerProfile, JobTarget, ToolResultRow } from "@/types";

interface DashboardContentProps {
  profile: Profile | null;
  careerProfile: CareerProfile | null;
  activeJobTarget: JobTarget | null;
  recentResults: ToolResultRow[];
}

export function DashboardContent({
  profile,
  careerProfile,
  activeJobTarget,
  recentResults,
}: DashboardContentProps) {
  const [showWelcome, setShowWelcome] = useState(profile?.onboarding_completed === false);
  const atsScore = careerProfile?.resume_score ?? null;
  const { dailyCreditsAwarded, dailyBalance } = useTokens();

  // Smart recommendation: one next step based on what they've done
  const nextStep = getNextStep(recentResults, atsScore);

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 sm:py-8 space-y-5">
      {showWelcome && profile && (
        <WelcomeModal userId={profile.id} onClose={() => setShowWelcome(false)} />
      )}

      {/* Daily credits — compact */}
      {dailyCreditsAwarded && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200/60 rounded-xl">
          <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <p className="text-sm text-emerald-800 flex-1">
            <strong>+2 tokens</strong> earned today. {dailyBalance} daily available.
          </p>
        </div>
      )}

      {/* Unclaimed daily tokens */}
      {!dailyCreditsAwarded && dailyBalance > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200/60 rounded-xl">
          <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 flex-1">
            <strong>{dailyBalance} daily tokens</strong> expire at midnight UTC.
          </p>
          <Link href="/tools/displacement" className="text-xs font-semibold text-amber-700 hover:text-amber-900 whitespace-nowrap">
            Use now →
          </Link>
        </div>
      )}

      {/* Profile Card */}
      <ProfileCard profile={profile} careerProfile={careerProfile} />

      {/* Active Mission */}
      <MissionCard activeJobTarget={activeJobTarget} />

      {/* ATS Alert — only when critical */}
      {atsScore !== null && atsScore < 40 && (
        <Link
          href="/tools/resume"
          className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200/60 rounded-xl hover:bg-red-100 transition-colors"
        >
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-900">Resume ATS score: {atsScore}/100</p>
            <p className="text-xs text-red-700">Fix formatting issues before applying.</p>
          </div>
          <ArrowRight className="w-4 h-4 text-red-400 flex-shrink-0" />
        </Link>
      )}

      {/* Next step recommendation — single card */}
      {nextStep && (
        <Link
          href={nextStep.href}
          className="block glass-card p-5 hover:shadow-md transition-shadow group"
        >
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Recommended next</p>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{nextStep.label}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{nextStep.reason}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                nextStep.tokens === 0 ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
              }`}>
                {nextStep.tokens === 0 ? "Free" : `${nextStep.tokens} tok`}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
            </div>
          </div>
        </Link>
      )}

      {/* Recent Activity */}
      {recentResults.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 text-sm mb-1">No analyses yet</h3>
          <p className="text-xs text-gray-500 mb-4">
            Try AI Displacement Score — it&apos;s free.
          </p>
          <Link
            href="/tools/displacement"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors min-h-[44px]"
          >
            Run free analysis
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">Recent</h2>
            <Link href="/history" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              View all
            </Link>
          </div>
          <div className="glass-card divide-y divide-gray-100">
            {recentResults.slice(0, 5).map((r) => (
              <Link
                key={r.id}
                href={`/history?expand=${r.id}`}
                className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors block"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 capitalize truncate">{r.tool_id.replace(/_/g, " ")}</p>
                  <p className="text-xs text-gray-400 truncate">{r.summary || "Complete"}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  {r.metric_value && <Ring score={r.metric_value} size="sm" showLabel={false} />}
                  <span className="text-[10px] text-gray-400">
                    {new Date(r.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick links — compact row */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/referral" className="glass-card p-4 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-gray-900">Refer a friend</h3>
          <p className="text-xs text-gray-500 mt-0.5">You get 10, they get 5.</p>
        </Link>
        <Link href="/lifetime" className="glass-card p-4 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-gray-900">Lifetime Deal</h3>
          <p className="text-xs text-gray-500 mt-0.5">$49 once. 100 tokens/mo forever.</p>
        </Link>
      </div>
    </div>
  );
}

/** Return the single best next action based on user state */
function getNextStep(
  results: ToolResultRow[],
  atsScore: number | null,
): { href: string; label: string; reason: string; tokens: number } | null {
  const ran = new Set(results.map((r) => r.tool_id));

  if (!ran.has("displacement")) {
    return { href: "/tools/displacement", label: "AI Displacement Score", reason: "Free — see how AI affects your role", tokens: 0 };
  }
  if (!ran.has("jd_match")) {
    return { href: "/tools/jd_match", label: "JD Match Score", reason: "Match yourself against a job posting", tokens: 2 };
  }
  if (ran.has("jd_match") && !ran.has("resume")) {
    return { href: "/tools/resume", label: "Resume Optimizer", reason: "Optimize for the job you matched", tokens: 10 };
  }
  if (ran.has("resume") && !ran.has("cover_letter")) {
    return { href: "/tools/cover_letter", label: "Cover Letter", reason: "Complete your application package", tokens: 3 };
  }
  if (ran.has("cover_letter") && !ran.has("interview")) {
    return { href: "/tools/interview", label: "Interview Prep", reason: "Prepare for the next step", tokens: 3 };
  }
  if (atsScore !== null && atsScore < 50 && ran.has("resume")) {
    const tool = TOOLS_MAP["resume"];
    return { href: "/tools/resume", label: "Re-run Resume Optimizer", reason: `ATS score is ${atsScore}/100`, tokens: tool?.tokens ?? 10 };
  }

  return null;
}
