"use client";

import Link from "next/link";
import { Ring } from "@/components/shared/Ring";
import { EmailCapture } from "./EmailCapture";
import type { ResumeAnalysisData } from "@/types/landing";

interface XrayResultsProps {
  data: ResumeAnalysisData;
}

export function XrayResults({ data }: XrayResultsProps) {
  const salaryText =
    data.salary_benchmark ??
    `Estimated range: $90,000–$120,000 for ${data.title} in ${data.industry ?? "your industry"}`;

  return (
    <div className="w-full max-w-xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
          Your Resume X-Ray
        </h2>
        <p className="text-sm text-gray-500">
          {data.name} · {data.title}
          {data.company && ` at ${data.company}`}
        </p>
      </div>

      {/* Score rings */}
      <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
        <div className="flex flex-col items-center gap-2">
          <Ring
            score={data.resume_score}
            size="md"
            label="ATS Score"
            showLabel
          />
          <span className="text-xs text-gray-500">Pass ATS filters</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Ring
            score={data.displacement_score}
            size="md"
            label="AI Risk"
            showLabel
          />
          <span className="text-xs text-gray-500">Displacement risk</span>
        </div>
      </div>

      {/* Salary benchmark */}
      <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-center">
        <p className="text-sm text-gray-700 font-medium">{salaryText}</p>
      </div>

      {/* Top skills */}
      {data.skills.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Top skills</h3>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skill gaps */}
      {data.skill_gaps && data.skill_gaps.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Skills to develop
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.skill_gaps.map((gap) => (
              <span
                key={gap}
                className="px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-medium"
              >
                {gap}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Email capture */}
      <div className="border-t border-gray-200 pt-6">
        <EmailCapture context="resume_xray" />
      </div>

      {/* Signup CTA */}
      <Link
        href="/auth"
        className="block w-full text-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 transition-opacity shadow-lg shadow-blue-600/20 min-h-[48px] flex items-center justify-center"
      >
        Create Account — 5 Free Tokens
      </Link>
    </div>
  );
}
