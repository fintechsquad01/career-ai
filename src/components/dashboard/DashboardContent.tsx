"use client";

import Link from "next/link";
import { Ring } from "@/components/shared/Ring";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MissionCard } from "./MissionCard";
import { DashboardQuickAccess } from "./DashboardQuickAccess";
import { WelcomeModal } from "@/components/modals/WelcomeModal";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Target,
  FileText,
  Mail,
  MessageSquare,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { useCareerHealth } from "@/hooks/useCareerHealth";
import { useWave2JourneyFlow } from "@/hooks/useWave2JourneyFlow";
import { calculateProfileCompleteness, MISSION_ACTIONS, TOOLS_MAP } from "@/lib/constants";
import type { Profile, CareerProfile, JobTarget, ToolResultRow } from "@/types";
import { EVENTS, track } from "@/lib/analytics";

interface DashboardContentProps {
  profile: Profile | null;
  careerProfile: CareerProfile | null;
  activeJobTarget: JobTarget | null;
  allJobTargets?: JobTarget[];
  recentResults: ToolResultRow[];
}

interface SmartRec {
  id: string;
  title: string;
  description: string;
  href: string;
  tokens: number | "Free";
  priority: number; // lower = higher priority
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  reason: string; // why this is recommended
}

/** Build context-aware, prioritized recommendations based on user state. */
function getSmartRecommendations(
  careerProfile: CareerProfile | null,
  activeJobTarget: JobTarget | null,
  recentResults: ToolResultRow[],
): SmartRec[] {
  const activeTargetId = activeJobTarget?.id || null;
  const completedGlobalTools = new Set(recentResults.map((r) => r.tool_id));
  const targetScopedResults = activeTargetId
    ? recentResults.filter((r) => r.job_target_id === activeTargetId)
    : [];
  const completedTargetTools = new Set(targetScopedResults.map((r) => r.tool_id));
  const hasSavedDisplacementScore = careerProfile?.displacement_score != null;
  const recs: SmartRec[] = [];

  // Priority 1: Missing resume — everything is better with a resume
  if (!careerProfile?.resume_text) {
    recs.push({
      id: "add_resume",
      title: "Upload your resume",
      description: "Unlock personalized insights across all tools",
      href: "/settings",
      tokens: "Free",
      priority: 0,
      icon: FileText,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      reason: "Unlocks personalized analysis",
    });
  }

  // Priority 2: Free displacement score
  if (!completedGlobalTools.has("displacement") && !hasSavedDisplacementScore) {
    recs.push({
      id: "displacement",
      title: "Check your AI displacement risk",
      description: careerProfile?.title
        ? `See how AI affects ${careerProfile.title} roles`
        : "Find out which of your tasks AI can automate",
      href: "/tools/displacement",
      tokens: "Free",
      priority: 1,
      icon: ShieldAlert,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      reason: "Always free",
    });
  }

  // Priority 3: JD Match if they have a job target
  if (activeJobTarget && !completedTargetTools.has("jd_match")) {
    recs.push({
      id: "jd_match",
      title: `Check your fit for ${activeJobTarget.title || "target role"}`,
      description: activeJobTarget.company
        ? `For ${activeJobTarget.title || "target role"} at ${activeJobTarget.company}`
        : `For ${activeJobTarget.title || "your target role"}`,
      href: "/tools/jd_match",
      tokens: TOOLS_MAP.jd_match?.tokens ?? 5,
      priority: 2,
      icon: Target,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      reason: "You have a target job saved",
    });
  }

  // Priority 4: Resume optimizer if JD match was run and score < 80
  const jdMatchResult = targetScopedResults.find((r) => r.tool_id === "jd_match");
  const jdMatchScore = jdMatchResult?.result
    ? ((jdMatchResult.result as Record<string, unknown>)?.overall_score as number | undefined)
    : undefined;
  if (jdMatchResult && (!jdMatchScore || jdMatchScore < 80) && !completedTargetTools.has("resume")) {
    recs.push({
      id: "resume",
      title: "Optimize your resume",
      description: jdMatchScore
        ? `Your match score is ${jdMatchScore}% — let's improve it`
        : `Enhance your resume for ${activeJobTarget?.title || "your target role"}${activeJobTarget?.company ? ` at ${activeJobTarget.company}` : ""}`,
      href: "/tools/resume",
      tokens: TOOLS_MAP.resume?.tokens ?? 15,
      priority: 3,
      icon: FileText,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      reason: jdMatchScore ? `Match score: ${jdMatchScore}%` : "Improve your match",
    });
  }

  // Priority 5: Interview prep if JD match done
  if (jdMatchResult && !completedTargetTools.has("interview")) {
    recs.push({
      id: "interview",
      title: `Prep for ${activeJobTarget?.title || "your"} interview`,
      description: "AI-generated questions and winning answers",
      href: "/tools/interview",
      tokens: TOOLS_MAP.interview?.tokens ?? 8,
      priority: 4,
      icon: MessageSquare,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      reason: "Based on your target job",
    });
  }

  // Priority 6: Cover letter if resume + JD exist
  if (careerProfile?.resume_text && activeJobTarget && !completedTargetTools.has("cover_letter")) {
    recs.push({
      id: "cover_letter",
      title: "Generate a cover letter",
      description: `Tailored for ${activeJobTarget.title || "your target role"}${activeJobTarget.company ? ` at ${activeJobTarget.company}` : ""}`,
      href: "/tools/cover_letter",
      tokens: TOOLS_MAP.cover_letter?.tokens ?? 8,
      priority: 5,
      icon: Mail,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      reason: "Resume + JD available",
    });
  }

  // Priority 7: Skills gap
  if (!completedTargetTools.has("skills_gap") && (activeJobTarget || careerProfile?.title)) {
    recs.push({
      id: "skills_gap",
      title: "Identify your skill gaps",
      description: "Know exactly what to learn next",
      href: "/tools/skills_gap",
      tokens: TOOLS_MAP.skills_gap?.tokens ?? 8,
      priority: 6,
      icon: TrendingUp,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      reason: "Plan your growth",
    });
  }

  return recs.sort((a, b) => a.priority - b.priority).slice(0, 4); // Show top 4
}

export function DashboardContent({
  profile,
  careerProfile,
  activeJobTarget,
  allJobTargets = [],
  recentResults,
}: DashboardContentProps) {
  const wave2JourneyFlowEnabled = useWave2JourneyFlow();
  const [showWelcome, setShowWelcome] = useState(profile?.onboarding_completed !== true);
  const careerHealth = useCareerHealth(careerProfile, recentResults);

  // Auto-return to pending tool after Stripe purchase
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("purchase") === "success") {
      const pendingToolId = localStorage.getItem("pendingToolId");
      if (pendingToolId) {
        localStorage.removeItem("pendingToolId");
        localStorage.removeItem("pendingInputs");
        // Small delay to let token balance refresh
        setTimeout(() => {
          window.location.href = `/tools/${pendingToolId}`;
        }, 1500);
      }
    }
  }, []);

  const completeness = calculateProfileCompleteness(careerProfile, activeJobTarget);

  const getMissionProgress = useCallback((target: JobTarget): number => {
    const actions = (target.mission_actions as Record<string, boolean>) || {};
    const done = MISSION_ACTIONS.reduce((count, action) => (actions[action.id] ? count + 1 : count), 0);
    return Math.round((done / Math.max(1, MISSION_ACTIONS.length)) * 100);
  }, []);

  const missionCardTarget = useMemo(() => {
    if (!allJobTargets.length) return activeJobTarget;
    const incomplete = allJobTargets.filter((t) => getMissionProgress(t) < 100);
    if (incomplete.length === 0) return activeJobTarget || allJobTargets[0];
    const activeIncomplete = incomplete.find((t) => t.is_active);
    if (activeIncomplete) return activeIncomplete;
    return incomplete.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];
  }, [allJobTargets, activeJobTarget, getMissionProgress]);

  const recommendationTarget = useMemo(() => {
    if (activeJobTarget) return activeJobTarget;
    if (!allJobTargets.length) return null;
    return [...allJobTargets].sort((a, b) => {
      const progressDiff = getMissionProgress(b) - getMissionProgress(a);
      if (progressDiff !== 0) return progressDiff;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    })[0];
  }, [activeJobTarget, allJobTargets, getMissionProgress]);

  const recommendations = getSmartRecommendations(careerProfile, recommendationTarget, recentResults);
  const primaryRecommendation = recommendations[0] ?? null;
  const missionProgress = missionCardTarget ? getMissionProgress(missionCardTarget) : null;
  const latestResult = recentResults[0] || null;

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = profile?.full_name?.split(" ")[0];

  useEffect(() => {
    if (!wave2JourneyFlowEnabled || !primaryRecommendation) return;
    track(EVENTS.DASHBOARD_NEXT_ACTION_VIEWED, {
      route: "/dashboard",
      tool_id: primaryRecommendation.id,
    });
  }, [wave2JourneyFlowEnabled, primaryRecommendation]);

  return (
    <div
      data-wave2-journey={wave2JourneyFlowEnabled ? "enabled" : "disabled"}
      className="max-w-2xl mx-auto px-4 py-5 sm:py-8 space-y-5 pb-24 sm:pb-8"
    >
      {showWelcome && profile && (
        <WelcomeModal userId={profile.id} onClose={() => setShowWelcome(false)} />
      )}

      {/* Greeting + Avatar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {greeting}{firstName ? `, ${firstName}` : ""}.
          </h1>
          {careerProfile?.title && (
            <p className="text-sm text-gray-500 mt-0.5">
              {careerProfile.title}
              {careerProfile.company ? ` at ${careerProfile.company}` : ""}
            </p>
          )}
        </div>
        <Link
          href="/settings"
          className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold flex-shrink-0 ring-2 ring-white shadow-md hover:opacity-90 transition-opacity"
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.full_name ? `${profile.full_name}'s avatar` : "User avatar"} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-sm">{initials}</span>
          )}
        </Link>
      </div>

      {/* Command Center focus */}
      {primaryRecommendation && wave2JourneyFlowEnabled && (
        <div className="space-y-2">
          <p className="text-overline">Today</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="surface-card-soft p-3">
              <p className="text-xs text-gray-500">Today</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{primaryRecommendation.title}</p>
            </div>
            <div className="surface-card-soft p-3">
              <p className="text-xs text-gray-500">Next best action</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{primaryRecommendation.reason}</p>
            </div>
            <div className="surface-card-soft p-3">
              <p className="text-xs text-gray-500">Progress this week</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{missionProgress ?? 0}% mission progress</p>
              {recommendationTarget?.title && (
                <p className="text-[11px] text-gray-500 mt-1 truncate">Target: {recommendationTarget.title}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {primaryRecommendation && (
        <div className="space-y-2">
          <p className="text-overline">Job Mission Control</p>
          <Link
            href={primaryRecommendation.href}
            onClick={() =>
              track(EVENTS.DASHBOARD_NEXT_ACTION_CLICKED, {
                route: "/dashboard",
                tool_id: primaryRecommendation.id,
              })
            }
            className="block surface-card-hero p-4 group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Next mission action</p>
                <p className="text-sm sm:text-base font-bold text-gray-900 mt-0.5 group-hover:text-blue-700">
                  {primaryRecommendation.title}
                </p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{primaryRecommendation.description}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className={`ui-badge ${primaryRecommendation.tokens === "Free" ? "ui-badge-green" : "ui-badge-blue"}`}>
                    {primaryRecommendation.tokens === "Free" ? "Free" : `${primaryRecommendation.tokens} tokens`}
                  </span>
                  {missionProgress !== null && (
                    <span className="ui-badge ui-badge-gray">Mission {missionProgress}%</span>
                  )}
                  <span className="ui-badge ui-badge-gray">Profile {completeness.score}%</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 group-hover:text-blue-800 whitespace-nowrap">
                Run now <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        </div>
      )}

      {wave2JourneyFlowEnabled && latestResult && (
        <Link
          href={`/history?expand=${latestResult.id}`}
          onClick={() =>
            track(EVENTS.DASHBOARD_RESUME_MISSION_CLICKED, {
              route: "/dashboard",
              result_id: latestResult.id,
              tool_id: latestResult.tool_id,
            })
          }
          className="surface-card p-4 block hover:shadow-sm transition-shadow"
        >
          <p className="text-overline mb-1">Continue where you left off</p>
          <p className="text-sm font-semibold text-gray-900">
            {TOOLS_MAP[latestResult.tool_id]?.title || latestResult.tool_id.replace(/_/g, " ")}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">
            {new Date(latestResult.created_at).toLocaleDateString()} · {latestResult.metric_value != null ? `${latestResult.metric_value}/100` : "No score"}
          </p>
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
            {latestResult.summary || "Open your latest result and continue your mission."}
          </p>
        </Link>
      )}

      {/* Status & evidence */}
      <div className="space-y-3">
        <p className="text-overline">Current Status</p>

      {/* Career Health Score Card */}
      <div className="surface-card p-6">
        {careerHealth.score !== null ? (
          <div className="flex items-center gap-6">
            <div className="celebrate">
              <Ring score={careerHealth.score} size="lg" label="Career Health" showLabel />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-sm font-semibold text-gray-900">Career Health Score</h2>
                {careerHealth.trend === "up" && (
                  <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-green-600">
                    <TrendingUp className="w-3 h-3" /> Improving
                  </span>
                )}
                {careerHealth.trend === "down" && (
                  <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-red-500">
                    <TrendingDown className="w-3 h-3" /> Needs attention
                  </span>
                )}
                {careerHealth.trend === "stable" && (
                  <span className="inline-flex items-center gap-0.5 text-xs font-medium text-gray-400">
                    <Minus className="w-3 h-3" /> Stable
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mb-3">
                {careerHealth.components.ats != null && (
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{careerHealth.components.ats}</p>
                    <p className="text-[10px] text-gray-400 uppercase">ATS</p>
                  </div>
                )}
                {careerHealth.components.aiRisk != null && (
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{careerHealth.components.aiRisk}</p>
                    <p className="text-[10px] text-gray-400 uppercase">AI Risk</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">{careerHealth.insight}</p>
              {careerHealth.suggestedAction && (
                <Link
                  href={careerHealth.suggestedAction.href}
                  className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  {careerHealth.suggestedAction.label} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
              {recentResults.length > 0 && (
                <Link
                  href={`/history?expand=${recentResults[0].id}`}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                >
                  Latest result: {recentResults[0].tool_id.replace(/_/g, " ")}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {/* Grayed-out sample ring */}
              <div className="flex-shrink-0 opacity-30">
                <Ring score={72} size="lg" label="" showLabel={false} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-gray-900 mb-1">Get your Career Health Score</h2>
                <p className="text-xs text-gray-500 leading-relaxed mb-2">
                  Combines ATS optimization, AI displacement risk, and skills gap analysis into one score.
                </p>
                <p className="text-[10px] text-gray-400">Takes 30 seconds · Completely free</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/tools/displacement" className="surface-card-hero flex items-center gap-3 p-3.5 hover:shadow-md transition-shadow group">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">AI Risk Score</p>
                  <p className="text-xs text-gray-500">How safe is your role?</p>
                </div>
                <span className="ui-badge ui-badge-green flex-shrink-0">Free</span>
              </Link>
              <Link
                href="/tools/jd_match"
                className="surface-card surface-card-hover flex items-center gap-3 p-3.5 group"
              >
                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-violet-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-violet-700">JD Match</p>
                  <p className="text-xs text-gray-500">Match against a job posting</p>
                </div>
                <span className="ui-badge ui-badge-blue flex-shrink-0">5 tokens</span>
              </Link>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Active Mission — only show if exists */}
      {missionCardTarget && <MissionCard activeJobTarget={missionCardTarget} />}

      <DashboardQuickAccess />
    </div>
  );
}
