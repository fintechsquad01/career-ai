"use client";

import Link from "next/link";
import { Check, X, Minus } from "lucide-react";
import { Ring } from "@/components/shared/Ring";
import { EmailCapture } from "./EmailCapture";
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
  return (
    <div className="w-full max-w-xl mx-auto space-y-8">
      {/* Company card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900">{data.title}</h2>
        <p className="text-sm text-gray-500 mt-1">{data.company}</p>
        {data.location && (
          <p className="text-xs text-gray-400 mt-0.5">{data.location}</p>
        )}
      </div>

      {/* Fit score */}
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

      {/* Requirements matrix */}
      {data.requirements.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Requirements
          </h3>
          <div className="space-y-2">
            {data.requirements.map((req) => (
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

      {/* Salary range */}
      {data.salary_range && (
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-sm text-gray-600">Salary range</p>
          <p className="text-base font-semibold text-gray-900 mt-1">
            {data.salary_range}
          </p>
        </div>
      )}

      {/* Email capture */}
      <div className="border-t border-gray-200 pt-6">
        <EmailCapture context="tool_result" />
      </div>

      {/* CTA */}
      <Link
        href="/auth"
        className="block w-full text-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 transition-opacity shadow-lg shadow-blue-600/20 min-h-[48px] flex items-center justify-center"
      >
        Start Your Mission
      </Link>
    </div>
  );
}
