"use client";

import { useState } from "react";
import { Check, X, Minus, Lock, ArrowRight } from "lucide-react";
import { Ring } from "@/components/shared/Ring";
import { InlineSignup } from "./InlineSignup";
import type { JobAnalysisData } from "@/types/landing";

interface JobResultsProps {
  data: JobAnalysisData;
  fitScore?: number | null;
}

function ReqIcon({
  match,
  priority,
}: {
  match: boolean;
  priority: "req" | "pref";
}) {
  if (match) return <Check className="w-4 h-4 text-green-500" />;
  if (priority === "req") return <X className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-amber-500" />;
}

export function JobResults({ data, fitScore }: JobResultsProps) {
  const [showSignup, setShowSignup] = useState(false);

  // Show only first 2 requirements, blur the rest
  const visibleReqs = data.requirements.slice(0, 2);
  const hiddenReqs = data.requirements.slice(2);

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Company card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900">{data.title}</h2>
        <p className="text-sm text-gray-500 mt-1">{data.company}</p>
        {data.location && (
          <p className="text-xs text-gray-400 mt-0.5">{data.location}</p>
        )}
      </div>

      {/* Fit score — visible */}
      <div className="flex flex-col items-center gap-2">
        {fitScore != null ? (
          <>
            <Ring score={fitScore} size="md" label="Fit Score" showLabel />
            <span className="text-xs text-gray-500">Match vs your resume</span>
          </>
        ) : (
          <div className="text-center">
            <p className="text-sm text-gray-500 font-medium">Fit Score</p>
            <p className="text-lg font-bold text-gray-400 mt-1">N/A</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Sign up and add your resume to get your fit score
            </p>
          </div>
        )}
      </div>

      {/* Visible requirements (first 2) */}
      {visibleReqs.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Requirements
          </h3>
          <div className="space-y-2">
            {visibleReqs.map((req) => (
              <div
                key={req.skill}
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100"
              >
                <ReqIcon match={req.match} priority={req.priority} />
                <span className="text-sm text-gray-900 flex-1">{req.skill}</span>
                <span className="text-xs text-gray-400 uppercase">
                  {req.priority === "req" ? "Required" : "Preferred"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blurred/locked content */}
      <div className="relative">
        <div className="select-none pointer-events-none" aria-hidden="true">
          <div className="blur-[6px] opacity-60 space-y-4">
            {/* Hidden requirements */}
            {hiddenReqs.length > 0 && (
              <div className="space-y-2">
                {hiddenReqs.map((req) => (
                  <div
                    key={req.skill}
                    className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <ReqIcon match={req.match} priority={req.priority} />
                    <span className="text-sm text-gray-900 flex-1">{req.skill}</span>
                    <span className="text-xs text-gray-400 uppercase">
                      {req.priority === "req" ? "Required" : "Preferred"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Salary range */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-sm text-gray-600">Salary range</p>
              <p className="text-base font-semibold text-gray-900 mt-1">
                {data.salary_range ?? "$120,000–$160,000"}
              </p>
            </div>

            {/* Application strategy preview */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Application strategy</h3>
              <ul className="space-y-1.5">
                <li className="text-xs text-gray-600">1. Tailor your resume for these specific requirements</li>
                <li className="text-xs text-gray-600">2. Highlight transferable skills from your background</li>
                <li className="text-xs text-gray-600">3. Prepare for interview questions about gaps</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Gate overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-xl p-6 sm:p-8 max-w-sm w-full mx-4 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Unlock full job analysis
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Complete requirements breakdown, salary data, and your personalized application strategy.
            </p>

            {showSignup ? (
              <InlineSignup />
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => setShowSignup(true)}
                  className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 transition-opacity shadow-lg shadow-blue-600/20 min-h-[48px] flex items-center justify-center gap-2"
                >
                  Sign Up Free — Unlock Results
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-xs text-gray-400">No credit card required</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
