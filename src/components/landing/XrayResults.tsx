"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import { Ring } from "@/components/shared/Ring";
import { InlineSignup } from "./InlineSignup";
import { AnimateOnScroll } from "@/components/shared/AnimateOnScroll";
import type { ResumeAnalysisData } from "@/types/landing";

interface XrayResultsProps {
  data: ResumeAnalysisData;
}

export function XrayResults({ data }: XrayResultsProps) {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
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

      {/* Score rings — visible */}
      <div className="flex flex-wrap justify-center gap-8 sm:gap-12 celebrate stagger-children">
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

      {/* Top skills — visible (up to 3) */}
      {data.skills.length > 0 && (
        <AnimateOnScroll>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Top skills</h3>
          <div className="flex flex-wrap gap-2">
            {data.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
              >
                {skill}
              </span>
            ))}
            {data.skills.length > 3 && (
              <span className="px-3 py-1.5 bg-gray-100 text-gray-400 rounded-full text-xs font-medium">
                +{data.skills.length - 3} more
              </span>
            )}
          </div>
        </AnimateOnScroll>
      )}

      {/* Blurred/locked content */}
      <div className="relative">
        {/* Blurred preview of gated content */}
        <div className="select-none pointer-events-none" aria-hidden="true">
          <div className="blur-[6px] opacity-60 space-y-4">
            {/* Salary benchmark */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-sm text-gray-700 font-medium">
                Sign up to see salary data for your role
              </p>
            </div>

            {/* Skill gaps */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Skills to develop</h3>
              <div className="flex flex-wrap gap-2">
                {(data.skill_gaps ?? ["AI/ML Knowledge", "Product Marketing", "Data Analysis"]).slice(0, 3).map((gap) => (
                  <span
                    key={gap}
                    className="px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-medium"
                  >
                    {gap}
                  </span>
                ))}
              </div>
            </div>

            {/* Action items preview */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Personalized action plan</h3>
              <ul className="space-y-1.5">
                <li className="text-xs text-gray-600">1. Fix 3 ATS formatting issues blocking your applications</li>
                <li className="text-xs text-gray-600">2. Add missing keywords for target roles</li>
                <li className="text-xs text-gray-600">3. Strengthen positioning against AI displacement</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Gate overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="glass-card shadow-xl p-6 sm:p-8 max-w-sm w-full mx-4 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              See exactly what&apos;s holding you back — and how to fix it
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              ATS fixes, keyword gaps, salary data, and your personalized action plan — free.
            </p>

            {showSignup ? (
              <InlineSignup />
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => setShowSignup(true)}
                  className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 transition-opacity shadow-lg shadow-blue-600/20 min-h-[48px] flex items-center justify-center gap-2"
                >
                  Create Account — 15 Free Tokens
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
