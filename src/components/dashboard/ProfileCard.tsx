"use client";

import { Ring } from "@/components/shared/Ring";
import { TokBadge } from "@/components/shared/TokBadge";
import type { Profile, CareerProfile } from "@/types";

interface ProfileCardProps {
  profile: Profile | null;
  careerProfile: CareerProfile | null;
}

export function ProfileCard({ profile, careerProfile }: ProfileCardProps) {
  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const completeness = calculateCompleteness(profile, careerProfile);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.full_name ? `${profile.full_name}'s avatar` : "User avatar"} className="w-full h-full rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900 truncate">
            {profile?.full_name || "Set up your profile"}
          </h2>
          <p className="text-sm text-gray-500 truncate">
            {careerProfile?.title
              ? `${careerProfile.title}${careerProfile.company ? ` at ${careerProfile.company}` : ""}`
              : "Paste your resume to get started"}
          </p>

          {/* Score badges */}
          <div className="flex items-center gap-4 mt-3">
            {careerProfile?.resume_score != null && (
              <Ring score={careerProfile.resume_score} size="sm" label="ATS" />
            )}
            {careerProfile?.displacement_score != null && (
              <Ring score={careerProfile.displacement_score} size="sm" label="AI Risk" />
            )}
            <TokBadge />
          </div>
        </div>
      </div>

      {/* Completeness bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-500">Profile {completeness}% complete</span>
          <span className="text-xs text-gray-400">
            {completeness < 100 ? "Upload resume to continue" : "Ready to go!"}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-600 to-violet-600 h-2 rounded-full transition-all duration-700"
            style={{ width: `${completeness}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function calculateCompleteness(profile: Profile | null, cp: CareerProfile | null): number {
  let score = 0;
  if (profile?.full_name) score += 20;
  if (profile?.email) score += 10;
  if (cp?.title) score += 20;
  if (cp?.resume_text) score += 30;
  if (cp?.resume_score != null) score += 10;
  if (cp?.displacement_score != null) score += 10;
  return score;
}
