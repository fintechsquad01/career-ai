"use client";

import Link from "next/link";
import { Ring } from "@/components/shared/Ring";
import { Insight } from "@/components/shared/Insight";
import { useState } from "react";
import { ProfileCard } from "./ProfileCard";
import { MissionCard } from "./MissionCard";
import { ToolsGrid } from "./ToolsGrid";
import { WelcomeModal } from "@/components/modals/WelcomeModal";
import { AlertTriangle, Gift, Gem, Clock, ArrowRight } from "lucide-react";
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 sm:py-8 space-y-6">
      {showWelcome && profile && (
        <WelcomeModal userId={profile.id} onClose={() => setShowWelcome(false)} />
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
            <h3 className="font-semibold text-red-900">Your ATS score is critically low</h3>
            <p className="text-sm text-red-700 mt-1">
              {atsScore}% of applicant tracking systems would auto-reject your resume.
              Fix this immediately.
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

      {/* Insights */}
      <div className="space-y-3">
        <Insight type="pain" text="75% of resumes are auto-rejected by ATS before a human sees them. Is yours one of them?" />
        <Insight type="competitive" text="Jobscan charges $49.95/mo. Teal costs $29/mo. CareerAI: pay per use, starting free." />
      </div>

      {/* Recent Activity */}
      {recentResults.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
            {recentResults.map((r) => (
              <div key={r.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.tool_id.replace("_", " ")}</p>
                  <p className="text-xs text-gray-500">{r.summary || "Analysis complete"}</p>
                </div>
                <div className="flex items-center gap-3">
                  {r.metric_value && <Ring score={r.metric_value} size="sm" showLabel={false} />}
                  <span className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Token upsell */}
      {(profile?.token_balance ?? 0) <= 10 && (
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-1">Running low on tokens</h3>
          <p className="text-sm text-blue-100 mb-4">
            Pro pack covers ~10 full job applications. Best value for active job seekers.
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
