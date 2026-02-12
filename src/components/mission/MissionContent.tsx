"use client";

import Link from "next/link";
import {
  ArrowLeft, Crosshair, MapPin, DollarSign, Users,
  CheckCircle, Lock, Loader2, Trophy, ArrowRight, Target,
  FileText, Mail, TrendingUp, MessageSquare
} from "lucide-react";
import { Ring } from "@/components/shared/Ring";
import { useMission } from "@/hooks/useMission";
import { MISSION_ACTIONS } from "@/lib/constants";

const ACTION_ICONS: Record<string, typeof FileText> = {
  optimize: FileText,
  cover: Mail,
  skills: TrendingUp,
  interview: MessageSquare,
  salary: DollarSign,
};

const PRIORITY_COLORS: Record<string, string> = {
  Critical: "bg-red-50 text-red-700",
  High: "bg-amber-50 text-amber-700",
  Medium: "bg-blue-50 text-blue-700",
  Low: "bg-gray-100 text-gray-500",
};

export function MissionContent() {
  const {
    activeJobTarget,
    completed,
    total,
    progress,
    isComplete,
    getActionState,
  } = useMission();

  if (!activeJobTarget) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center space-y-4">
        <Crosshair className="w-12 h-12 text-gray-300 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">No Active Mission</h2>
        <p className="text-gray-500">
          Analyze a job posting to start your Mission Control workflow.
        </p>
        <Link
          href="/tools/jd_match"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors min-h-[48px]"
        >
          <Target className="w-4 h-4" />
          Analyze a Job Posting
        </Link>
      </div>
    );
  }

  const requirements = (activeJobTarget.requirements as Array<{ skill: string; match: boolean | "partial" }>) || [];
  const matched = requirements.filter((r) => r.match === true).length;

  // Mission Complete
  if (isComplete) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-8 text-center">
          <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Mission Complete!</h2>
          <p className="text-gray-600">
            You&apos;ve completed all actions for {activeJobTarget.title} at {activeJobTarget.company}.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            {activeJobTarget.fit_score && (
              <Ring score={activeJobTarget.fit_score} size="md" label="Fit Score" />
            )}
          </div>
          <div className="flex gap-3 justify-center mt-6">
            <a
              href={activeJobTarget.job_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors min-h-[48px] inline-flex items-center gap-2"
            >
              Apply Now <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/tools/jd_match"
              className="px-6 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors min-h-[48px] inline-flex items-center"
            >
              Analyze Another Job
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 sm:py-8 space-y-6">
      {/* Back */}
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Link>

      {/* Mission Header */}
      <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Crosshair className="w-4 h-4" />
          <span className="text-xs font-semibold text-blue-100 uppercase tracking-wider">
            Job Mission Control
          </span>
        </div>

        <h1 className="text-xl font-bold mb-1">{activeJobTarget.title}</h1>
        <p className="text-blue-100 text-sm">{activeJobTarget.company}</p>

        <div className="flex flex-wrap gap-4 mt-4 text-sm text-blue-100">
          {activeJobTarget.location && (
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {activeJobTarget.location}</span>
          )}
          {activeJobTarget.salary_range && (
            <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {activeJobTarget.salary_range}</span>
          )}
          {activeJobTarget.applicant_count && (
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {activeJobTarget.applicant_count} applicants</span>
          )}
        </div>

        <div className="flex items-center gap-4 mt-4">
          {activeJobTarget.fit_score && (
            <div className="bg-white/10 rounded-xl px-3 py-1.5 text-sm font-semibold">
              {activeJobTarget.fit_score}% fit
            </div>
          )}
          <div className="bg-white/10 rounded-xl px-3 py-1.5 text-sm">
            {matched}/{requirements.length} requirements matched
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between mb-1 text-xs text-blue-200">
            <span>{completed}/{total} actions</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="bg-white h-2 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Skill Matrix */}
      {requirements.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Requirements Match</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {requirements.map((req, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {req.match === true ? (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : req.match === "partial" ? (
                  <div className="w-4 h-4 rounded-full border-2 border-amber-400 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-red-400 flex-shrink-0" />
                )}
                <span className="text-gray-700">{req.skill}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Cards */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Mission Actions</h3>
        {MISSION_ACTIONS.map((action, index) => {
          const state = getActionState(action.id, index);
          const Icon = ACTION_ICONS[action.id] || FileText;

          return (
            <div
              key={action.id}
              className={`rounded-2xl border p-5 transition-all ${
                state === "locked"
                  ? "border-gray-100 bg-gray-50 opacity-60"
                  : state === "completed"
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-white hover:shadow-md"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  state === "completed" ? "bg-green-100" : state === "locked" ? "bg-gray-100" : "bg-blue-50"
                }`}>
                  {state === "completed" ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : state === "locked" ? (
                    <Lock className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Icon className="w-5 h-5 text-blue-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{action.title}</h4>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${PRIORITY_COLORS[action.priority]}`}>
                      {action.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>

                {state === "available" && (
                  <Link
                    href={`/tools/${action.toolId}`}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors min-h-[44px] flex items-center gap-1.5 flex-shrink-0"
                  >
                    Run — {action.tokens} tok
                  </Link>
                )}

                {state === "completed" && (
                  <span className="text-xs font-medium text-green-600 flex items-center gap-1 flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5" /> Done
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
