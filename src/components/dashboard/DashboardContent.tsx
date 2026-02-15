"use client";

import Link from "next/link";
import { Ring } from "@/components/shared/Ring";
import { useEffect, useState } from "react";
import { MissionCard } from "./MissionCard";
import { WelcomeModal } from "@/components/modals/WelcomeModal";
import { AnimateOnScroll } from "@/components/shared/AnimateOnScroll";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Sparkles,
  Check,
  ShieldAlert,
  Target,
  FileText,
  Mail,
  MessageSquare,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Trophy,
  Gift,
  Crown,
  AlertTriangle,
} from "lucide-react";
import { useTokens } from "@/hooks/useTokens";
import { useCareerHealth } from "@/hooks/useCareerHealth";
import type { Profile, CareerProfile, JobTarget, ToolResultRow } from "@/types";
import type { Json } from "@/types";

interface ProfileCompletenessItem {
  label: string;
  done: boolean;
  href: string;
}

interface ProfileCompleteness {
  score: number;
  items: ProfileCompletenessItem[];
}

/** Calculate how complete the user's profile is (0–100). */
function getProfileCompleteness(
  careerProfile: CareerProfile | null,
  activeJobTarget: JobTarget | null
): ProfileCompleteness {
  const skills: Json | undefined = careerProfile?.skills;
  const hasSkills = Array.isArray(skills) && skills.length > 0;

  const items: ProfileCompletenessItem[] = [
    {
      label: "Add your resume",
      done: !!careerProfile?.resume_text,
      href: "/settings",
    },
    {
      label: "Set a job target",
      done: !!activeJobTarget,
      href: "/mission",
    },
    {
      label: "Add title & industry",
      done: !!(careerProfile?.title && careerProfile?.industry),
      href: "/settings",
    },
    {
      label: "Specify target role",
      done: !!activeJobTarget?.title,
      href: "/mission",
    },
    {
      label: "Add your skills",
      done: hasSkills,
      href: "/settings",
    },
    {
      label: "Set years of experience",
      done: careerProfile?.years_experience != null,
      href: "/settings",
    },
  ];

  // Account created = +10 (always true on dashboard)
  let score = 10;
  if (careerProfile?.resume_text) score += 30;
  if (activeJobTarget) score += 20;
  if (careerProfile?.title && careerProfile?.industry) score += 15;
  if (activeJobTarget?.title) score += 10;
  if (hasSkills) score += 10;
  if (careerProfile?.years_experience != null) score += 5;

  return { score, items };
}

interface DashboardContentProps {
  profile: Profile | null;
  careerProfile: CareerProfile | null;
  activeJobTarget: JobTarget | null;
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
  const completedTools = new Set(recentResults.map((r) => r.tool_id));
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
  if (!completedTools.has("displacement")) {
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
  if (activeJobTarget && !completedTools.has("jd_match")) {
    recs.push({
      id: "jd_match",
      title: `Check your fit for ${activeJobTarget.title || "target role"}`,
      description: activeJobTarget.company
        ? `At ${activeJobTarget.company}`
        : "Evidence-based match analysis",
      href: "/tools/jd_match",
      tokens: 2,
      priority: 2,
      icon: Target,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      reason: "You have a target job saved",
    });
  }

  // Priority 4: Resume optimizer if JD match was run and score < 80
  const jdMatchResult = recentResults.find((r) => r.tool_id === "jd_match");
  const jdMatchScore = jdMatchResult?.result
    ? ((jdMatchResult.result as Record<string, unknown>)?.overall_score as number | undefined)
    : undefined;
  if (jdMatchResult && (!jdMatchScore || jdMatchScore < 80) && !completedTools.has("resume")) {
    recs.push({
      id: "resume",
      title: "Optimize your resume",
      description: jdMatchScore
        ? `Your match score is ${jdMatchScore}% — let's improve it`
        : "Enhance your resume for your target role",
      href: "/tools/resume",
      tokens: 10,
      priority: 3,
      icon: FileText,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      reason: jdMatchScore ? `Match score: ${jdMatchScore}%` : "Improve your match",
    });
  }

  // Priority 5: Interview prep if JD match done
  if (jdMatchResult && !completedTools.has("interview")) {
    recs.push({
      id: "interview",
      title: `Prep for ${activeJobTarget?.title || "your"} interview`,
      description: "AI-generated questions and winning answers",
      href: "/tools/interview",
      tokens: 3,
      priority: 4,
      icon: MessageSquare,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      reason: "Based on your target job",
    });
  }

  // Priority 6: Cover letter if resume + JD exist
  if (careerProfile?.resume_text && activeJobTarget && !completedTools.has("cover_letter")) {
    recs.push({
      id: "cover_letter",
      title: "Generate a cover letter",
      description: `Tailored for ${activeJobTarget.title || "your target role"}`,
      href: "/tools/cover_letter",
      tokens: 3,
      priority: 5,
      icon: Mail,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      reason: "Resume + JD available",
    });
  }

  // Priority 7: Skills gap
  if (!completedTools.has("skills_gap") && (activeJobTarget || careerProfile?.title)) {
    recs.push({
      id: "skills_gap",
      title: "Identify your skill gaps",
      description: "Know exactly what to learn next",
      href: "/tools/skills_gap",
      tokens: 5,
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
  recentResults,
}: DashboardContentProps) {
  const [showWelcome, setShowWelcome] = useState(profile?.onboarding_completed !== true);
  const { dailyCreditsAwarded, dailyBalance } = useTokens();
  const careerHealth = useCareerHealth(careerProfile, recentResults);

  // Auto-return to pending tool after Stripe purchase
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("purchase") === "success") {
      const pendingToolId = localStorage.getItem("pendingToolId");
      if (pendingToolId) {
        localStorage.removeItem("pendingToolId");
        // Small delay to let token balance refresh
        setTimeout(() => {
          window.location.href = `/tools/${pendingToolId}`;
        }, 1500);
      }
    }
  }, []);

  const completeness = getProfileCompleteness(careerProfile, activeJobTarget);

  const recommendations = getSmartRecommendations(careerProfile, activeJobTarget, recentResults);

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 sm:py-8 space-y-5 pb-24 sm:pb-8">
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

      {/* Daily credits toast — subtle */}
      {dailyCreditsAwarded && (
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200/60 rounded-xl">
          <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <p className="text-sm text-emerald-800">
            <strong>+2 tokens</strong> earned today.{" "}
            {dailyBalance > 0 && `${dailyBalance} daily available.`}
          </p>
        </div>
      )}

      {/* Career Health Score Card */}
      <div className="glass-card p-6">
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
              <Link
                href="/tools/displacement"
                className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-100 rounded-xl hover:shadow-md transition-shadow group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">AI Risk Score</p>
                  <p className="text-xs text-gray-500">How safe is your role?</p>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full flex-shrink-0">Free</span>
              </Link>
              <Link
                href="/tools/jd_match"
                className="flex items-center gap-3 p-3.5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow group"
              >
                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-violet-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-violet-700">JD Match</p>
                  <p className="text-xs text-gray-500">Match against a job posting</p>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full flex-shrink-0">2 tok</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Milestones — show achieved ones */}
      {careerHealth.milestones.some((m) => m.achieved) && (
        <div className="flex flex-wrap items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          {careerHealth.milestones
            .filter((m) => m.achieved)
            .map((m) => (
              <span
                key={m.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200/60 rounded-full text-xs font-medium text-amber-700"
              >
                <Check className="w-3 h-3" />
                {m.label}
              </span>
            ))}
        </div>
      )}

      {/* Profile Completeness — hide once mostly done */}
      {completeness.score < 60 && (
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="flex-shrink-0">
            <Ring score={completeness.score} size="sm" label="" showLabel={false} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">Profile {completeness.score}% complete</p>
            <p className="text-xs text-gray-500 mt-0.5">
              More context = more accurate AI results.
            </p>
            {completeness.score < 100 && (
              <div className="mt-3 space-y-1.5">
                {completeness.items.filter((i) => !i.done).slice(0, 3).map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Smart Recommendations — single next step */}
      {recommendations.length > 0 && (
        <Link href={recommendations[0].href} className="block glass-card p-5 hover:shadow-lg transition-all group">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Your next move</p>
          <p className="text-base font-bold text-gray-900 group-hover:text-blue-700 mb-1">{recommendations[0].title}</p>
          <p className="text-sm text-gray-500 mb-3">{recommendations[0].description}</p>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${recommendations[0].tokens === "Free" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>
              {recommendations[0].tokens === "Free" ? "Free" : `${recommendations[0].tokens} tokens`}
            </span>
            <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
              Start <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>
      )}

      {/* Career Metrics */}
      {(careerProfile?.displacement_score != null || careerProfile?.resume_score != null) && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Your Numbers</h2>
          <div className="grid grid-cols-2 gap-3 stagger-children">
            {careerProfile.displacement_score != null && (
              <Link href="/tools/displacement" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-200 transition-colors">
                <p className="text-xs text-gray-500 mb-1">AI Displacement Risk</p>
                <p className={`text-2xl font-bold celebrate ${
                  careerProfile.displacement_score >= 70 ? "text-red-600" : careerProfile.displacement_score >= 40 ? "text-amber-600" : "text-green-600"
                }`}>{careerProfile.displacement_score}%</p>
              </Link>
            )}
            {careerProfile.resume_score != null && (
              <Link href="/tools/resume" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-200 transition-colors">
                <p className="text-xs text-gray-500 mb-1">Resume ATS Score</p>
                <p className={`text-2xl font-bold celebrate ${
                  careerProfile.resume_score >= 70 ? "text-green-600" : careerProfile.resume_score >= 40 ? "text-amber-600" : "text-red-600"
                }`}>{careerProfile.resume_score}%</p>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Active Mission — only show if exists */}
      {activeJobTarget && <MissionCard activeJobTarget={activeJobTarget} />}

      {/* Re-check nudge — show if last result is 30+ days old */}
      {recentResults.length > 0 && (() => {
        const latestDate = new Date(recentResults[0].created_at);
        const daysSince = Math.floor((Date.now() - latestDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince < 14) return null;
        return (
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200/60 rounded-xl">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900">
                {daysSince >= 30
                  ? "It's been over a month. Your industry may have shifted."
                  : "Time for a career health check-up."
                }
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                Re-run your analysis to keep your Career Health Score current.
              </p>
            </div>
            <Link
              href="/tools/displacement"
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 whitespace-nowrap"
            >
              Re-check →
            </Link>
          </div>
        );
      })()}

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3 stagger-children">
        <Link
          href="/tools/displacement"
          className="glass-card p-4 text-center hover:shadow-md transition-shadow"
        >
          <Zap className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
          <p className="text-xs font-medium text-gray-700">Free Analysis</p>
        </Link>
        <Link
          href="/tools"
          className="glass-card p-4 text-center hover:shadow-md transition-shadow"
        >
          <Sparkles className="w-5 h-5 text-violet-600 mx-auto mb-1.5" />
          <p className="text-xs font-medium text-gray-700">All Tools</p>
        </Link>
        <Link
          href="/pricing"
          className="glass-card p-4 text-center hover:shadow-md transition-shadow"
        >
          <Target className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
          <p className="text-xs font-medium text-gray-700">Get Tokens</p>
        </Link>
      </div>

      {/* Value comparison — only for new users */}
      {recentResults.length === 0 && (
        <AnimateOnScroll>
          <div className="glass-card p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">What this costs elsewhere</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Resume + JD Match + Interview Prep</p>
                <p className="text-sm font-bold text-gray-300 line-through">$1,048+/year</p>
                <p className="text-[10px] text-gray-400">Jobscan + Resume Genius + FinalRound</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Same tools at AISkillScore</p>
                <p className="text-sm font-bold text-green-600">~$1.15 in tokens</p>
                <p className="text-[10px] text-green-600/70">Pay per use, no subscriptions</p>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      )}

      {/* Getting Started — only for brand new users with 0 results */}
      {recentResults.length === 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 p-5 sm:p-6 text-white celebrate">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold">Start with a free analysis</h3>
              <p className="text-sm text-blue-100 mt-0.5">Discover your AI displacement risk in 30 seconds — completely free.</p>
            </div>
          </div>
          <Link
            href="/tools/displacement"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors min-h-[44px]"
          >
            Run Free Analysis
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Insight cards */}
      {recentResults.length === 0 && (
        <AnimateOnScroll>
          <div className="space-y-2">
            <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">
                <span className="font-semibold">1 in 4 workers</span> globally have roles exposed to generative AI. Understanding your risk is the first step.
              </p>
            </div>
            <div className="flex items-start gap-3 px-4 py-3 bg-green-50 border border-green-100 rounded-xl">
              <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-green-700">
                <span className="font-semibold">Jobscan charges $49.95/mo</span> for resume scanning. AISkillScore gives you 11 tools for tokens starting at $0.065 each.
              </p>
            </div>
          </div>
        </AnimateOnScroll>
      )}

      {/* Recent Activity — compact */}
      {recentResults.length > 0 && (
        <AnimateOnScroll>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
              <Link href="/history" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                View all
              </Link>
            </div>
            <div className="glass-card divide-y divide-gray-100">
              {recentResults.slice(0, 3).map((r) => (
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
        </AnimateOnScroll>
      )}

      {/* Referral + Lifetime nudge cards */}
      <AnimateOnScroll>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger-children">
        <Link href="/referral" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Gift className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700">Refer & Earn</p>
              <p className="text-xs text-gray-500">Give 5, get 5 tokens</p>
            </div>
          </div>
        </Link>
        {!profile?.lifetime_deal && (
          <Link href="/lifetime" className="bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-xl border border-amber-200 p-4 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <Crown className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 group-hover:text-amber-700">Lifetime Deal</p>
                <p className="text-xs text-gray-500">100 tokens/mo forever — $79</p>
              </div>
            </div>
          </Link>
        )}
        </div>
      </AnimateOnScroll>
    </div>
  );
}
