"use client";

import Link from "next/link";
import { Ring } from "@/components/shared/Ring";
import { Insight } from "@/components/shared/Insight";
import { useState } from "react";
import { ProfileCard } from "./ProfileCard";
import { MissionCard } from "./MissionCard";
import { ToolsGrid } from "./ToolsGrid";
import { WelcomeModal } from "@/components/modals/WelcomeModal";
import { AlertTriangle, Gift, Gem, Clock, ArrowRight, Rocket, Sparkles, DollarSign } from "lucide-react";
import { useTokens } from "@/hooks/useTokens";
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
  const displacementScore = careerProfile?.displacement_score ?? null;
  const { dailyCreditsAwarded, dailyBalance } = useTokens();

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 sm:py-8 space-y-6">
      {showWelcome && profile && (
        <WelcomeModal userId={profile.id} onClose={() => setShowWelcome(false)} />
      )}

      {/* Daily Credits Notification */}
      {dailyCreditsAwarded && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-900">You earned 2 tokens today!</p>
            <p className="text-xs text-green-700">
              {dailyBalance} daily credits available. Come back tomorrow for 2 more.
            </p>
          </div>
          <div className="text-xs text-green-600 font-medium flex items-center gap-1 flex-shrink-0">
            <Clock className="w-3.5 h-3.5" />
            Resets at midnight UTC
          </div>
        </div>
      )}

      {/* Profile Card */}
      <ProfileCard profile={profile} careerProfile={careerProfile} />

      {/* Active Mission or Prompt */}
      <MissionCard activeJobTarget={activeJobTarget} />

      {/* ATS Alert */}
      {atsScore !== null && atsScore < 50 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">Your resume has formatting issues that cause ATS rejection</h3>
            <p className="text-sm text-red-700 mt-1">
              43% of resumes are rejected for formatting, not qualifications. Fix this before applying anywhere.
            </p>
          </div>
          <Link
            href="/tools/resume"
            className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors min-h-[44px] flex items-center"
          >
            Fix Now
          </Link>
        </div>
      )}

      {/* Tools Grid */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">All Tools</h2>
        <ToolsGrid />
      </div>

      {/* Track B Insight */}
      {(() => {
        const incomeEstimate = extractIncomeEstimate(recentResults);
        return (
          <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
              <Rocket className="w-5 h-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-violet-900">Earn while you search</h3>
              <p className="text-sm text-violet-700 mt-1">
                {incomeEstimate
                  ? `Based on your completed assessments, you could earn ${incomeEstimate} freelancing or consulting.`
                  : "Based on your skills, you could earn extra income freelancing. Run the Entrepreneurship Assessment to find out."}
              </p>
            </div>
            <Link
              href="/tools/entrepreneurship"
              className="px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors min-h-[44px] flex items-center"
            >
              {incomeEstimate ? "Details" : "Explore"}
            </Link>
          </div>
        );
      })()}

      {/* Income Track Card */}
      {recentResults.some(r => ["entrepreneurship", "roadmap", "salary", "skills_gap"].includes(r.tool_id)) && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-900">Income Track</h3>
              <p className="text-sm text-emerald-700 mt-1">
                You&apos;ve started exploring income-building tools. Keep the momentum going.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {!recentResults.some(r => r.tool_id === "entrepreneurship") && (
                  <Link
                    href="/tools/entrepreneurship"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors min-h-[36px]"
                  >
                    Run Entrepreneurship Assessment
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                {!recentResults.some(r => r.tool_id === "roadmap") && (
                  <Link
                    href="/tools/roadmap"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-emerald-300 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-50 transition-colors min-h-[36px]"
                  >
                    Create a Dual-Track Roadmap
                  </Link>
                )}
                {!recentResults.some(r => r.tool_id === "linkedin") && (
                  <Link
                    href="/tools/linkedin"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-emerald-300 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-50 transition-colors min-h-[36px]"
                  >
                    LinkedIn Monetization Plan
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="space-y-3">
        <Insight type="pain" text="75% of resumes are auto-rejected by ATS before a human sees them. Is yours one of them?" />
        <Insight type="competitive" text="Jobscan charges $49.95/mo. Teal costs $29/mo. CareerAI: pay per use, starting free." />
      </div>

      {/* Recent Activity */}
      {recentResults.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
            <Link href="/history" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
            {recentResults.map((r) => (
              <Link
                key={r.id}
                href={`/history?expand=${r.id}`}
                className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer block"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 capitalize">{r.tool_id.replace(/_/g, " ")}</p>
                  <p className="text-xs text-gray-500">{r.summary || "Analysis complete"}</p>
                </div>
                <div className="flex items-center gap-3">
                  {r.metric_value && <Ring score={r.metric_value} size="sm" showLabel={false} />}
                  <span className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Token upsell */}
      {((profile?.token_balance ?? 0) + dailyBalance) <= 10 && (
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-1">Running low? Log in tomorrow for 2 free credits.</h3>
          <p className="text-sm text-blue-100 mb-4">
            Or grab the Pro pack — covers ~10 full job applications + a full Entrepreneurship Assessment.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors min-h-[44px]"
          >
            Get Tokens
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Referral + Lifetime */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/referral" className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <Gift className="w-6 h-6 text-blue-600 mb-2" />
          <h3 className="font-semibold text-gray-900">Refer & Earn</h3>
          <p className="text-sm text-gray-500 mt-1">Give 5 tokens, get 10. Share your referral link.</p>
        </Link>
        <Link href="/lifetime" className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <Gem className="w-6 h-6 text-violet-600 mb-2" />
          <h3 className="font-semibold text-gray-900">Lifetime Deal</h3>
          <p className="text-sm text-gray-500 mt-1">$49 one-time. 100 tokens/month forever. Limited spots.</p>
        </Link>
      </div>
    </div>
  );
}

/**
 * Extracts an income estimate string from completed entrepreneurship or roadmap results.
 * Returns null if no relevant results contain income data.
 */
function extractIncomeEstimate(results: ToolResultRow[]): string | null {
  // Check entrepreneurship results first (most specific)
  const entrepreneurshipResult = results.find((r) => r.tool_id === "entrepreneurship");
  if (entrepreneurshipResult?.result) {
    const data = entrepreneurshipResult.result as Record<string, unknown>;
    const models = data.business_models as Array<Record<string, unknown>> | undefined;
    if (models && models.length > 0) {
      // Find the highest month_6_income from business models
      const incomes = models
        .map((m) => m.month_6_income as string | undefined)
        .filter(Boolean) as string[];
      if (incomes.length > 0) {
        return incomes[0]; // First model is typically highest match
      }
    }
  }

  // Check roadmap results for income building plan
  const roadmapResult = results.find((r) => r.tool_id === "roadmap");
  if (roadmapResult?.result) {
    const data = roadmapResult.result as Record<string, unknown>;
    const plan = data.income_building_plan as Record<string, Record<string, unknown>> | undefined;
    if (plan) {
      const month3_6 = plan.month_3_6;
      if (month3_6?.expected_income && typeof month3_6.expected_income === "string") {
        return month3_6.expected_income;
      }
      const month1_2 = plan.month_1_2;
      if (month1_2?.expected_income && typeof month1_2.expected_income === "string") {
        return month1_2.expected_income;
      }
    }
  }

  // Check salary freelance rate guidance
  const salaryResult = results.find((r) => r.tool_id === "salary");
  if (salaryResult?.result) {
    const data = salaryResult.result as Record<string, unknown>;
    const freelance = data.freelance_rate_guidance as Record<string, unknown> | undefined;
    if (freelance?.hourly_rate && typeof freelance.hourly_rate === "string") {
      return `${freelance.hourly_rate}/hour freelancing`;
    }
  }

  return null;
}
