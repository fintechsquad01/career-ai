"use client";

import Link from "next/link";
import { Crosshair, ArrowRight, Search, CheckCircle2 } from "lucide-react";
import { MISSION_ACTIONS } from "@/lib/constants";
import type { JobTarget } from "@/types";

interface MissionCardProps {
  activeJobTarget: JobTarget | null;
}

export function MissionCard({ activeJobTarget }: MissionCardProps) {
  if (!activeJobTarget) {
    return (
      <div className="glass-card p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Start a job mission</h3>
            <p className="text-sm text-gray-500 mt-1">
              Paste a job description to get a step-by-step application plan.
            </p>
            <Link
              href="/tools/jd_match"
              className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Analyze a job posting <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const missionActions = (activeJobTarget.mission_actions as Record<string, boolean>) || {};
  const completed = MISSION_ACTIONS.reduce((count, action) => (missionActions[action.id] ? count + 1 : count), 0);
  const total = MISSION_ACTIONS.length;
  const progress = Math.round((completed / total) * 100);
  const isCompleted = completed >= total;
  const normalizedTitle = (activeJobTarget.title || "").replace(/\s+/g, " ").trim();
  const safeTitle =
    !normalizedTitle || normalizedTitle.length > 70
      ? "Target role"
      : normalizedTitle;
  const safeCompany = (activeJobTarget.company || "").replace(/\s+/g, " ").trim();

  return (
    <Link href="/mission" className="block">
      <div
        className={`rounded-2xl p-6 text-white hover:opacity-95 transition-opacity celebrate ${
          isCompleted
            ? "bg-gradient-to-r from-emerald-600 to-green-600"
            : "bg-gradient-to-r from-blue-600 to-violet-600"
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Crosshair className="w-4 h-4" />}
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  isCompleted ? "text-emerald-100" : "text-blue-100"
                }`}
              >
                {isCompleted ? "Mission Completed" : "Active Mission"}
              </span>
            </div>
            <h3 className="font-bold text-lg">
              {safeTitle}
              {safeCompany ? ` at ${safeCompany}` : ""}
            </h3>
            {activeJobTarget.fit_score && (
              <p className={`text-sm mt-1 ${isCompleted ? "text-emerald-100" : "text-blue-100"}`}>
                {activeJobTarget.fit_score}% fit score
              </p>
            )}
          </div>
          <ArrowRight className={`w-5 h-5 ${isCompleted ? "text-emerald-200" : "text-blue-200"}`} />
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs ${isCompleted ? "text-emerald-200" : "text-blue-200"}`}>
              {completed}/{total} actions completed
            </span>
            <span className={`text-xs ${isCompleted ? "text-emerald-200" : "text-blue-200"}`}>{progress}%</span>
          </div>
          <div className={`w-full rounded-full h-2 ${isCompleted ? "bg-emerald-800/25" : "bg-white/20"}`}>
            <div
              className="bg-white h-2 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
