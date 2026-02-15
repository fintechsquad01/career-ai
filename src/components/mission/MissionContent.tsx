"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, Crosshair, MapPin, DollarSign, Users,
  CheckCircle, Lock, Loader2, Trophy, ArrowRight, Target,
  FileText, Mail, TrendingUp, MessageSquare, Rocket, Linkedin, Map
} from "lucide-react";
import { Ring } from "@/components/shared/Ring";
import { useMission } from "@/hooks/useMission";
import { MISSION_ACTIONS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

const ACTION_ICONS: Record<string, typeof FileText> = {
  optimize: FileText,
  cover: Mail,
  skills: TrendingUp,
  interview: MessageSquare,
  salary: DollarSign,
  entrepreneurship: Rocket,
  linkedin_brand: Linkedin,
  roadmap_income: Map,
};

const PRIORITY_COLORS: Record<string, string> = {
  Critical: "bg-red-50 text-red-700",
  High: "bg-amber-50 text-amber-700",
  Medium: "bg-blue-50 text-blue-700",
  Low: "bg-gray-100 text-gray-500",
};

export function MissionContent() {
  const [creatingFromPreAuth, setCreatingFromPreAuth] = useState(false);
  const {
    activeJobTarget,
    completed,
    total,
    progress,
    isComplete,
    getActionState,
  } = useMission();

  useEffect(() => {
    const preAuthJd = localStorage.getItem("aiskillscore_pre_auth_jd");
    if (preAuthJd && !activeJobTarget) {
      setCreatingFromPreAuth(true);
      const createTarget = async () => {
        try {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          let title = "Target Position";
          let company = "Target Company";

          if (supabaseUrl && !supabaseUrl.includes("placeholder")) {
            try {
              const res = await fetch(`${supabaseUrl}/functions/v1/parse-input`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
                body: JSON.stringify({ input_text: preAuthJd, detected_type: "jd" }),
              });
              if (res.ok) {
                const parsed = await res.json();
                if (parsed.data?.title) title = parsed.data.title;
                if (parsed.data?.company) company = parsed.data.company;
              }
            } catch { /* use defaults */ }
          }

          await supabase.from("job_targets").insert({
            user_id: session.user.id,
            title,
            company,
            jd_text: preAuthJd,
            source: "paste",
            is_active: true,
            mission_actions: {},
          });

          localStorage.removeItem("aiskillscore_pre_auth_jd");
          window.location.reload();
        } catch (error) {
          console.error("Failed to create job target from pre-auth JD:", error);
        } finally {
          setCreatingFromPreAuth(false);
        }
      };
      createTarget();
    }
  }, [activeJobTarget]);

  if (creatingFromPreAuth) {
    return (
      <div className="text-center py-16 space-y-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
        <p className="text-sm text-gray-500">Setting up your job mission...</p>
      </div>
    );
  }

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
        <div className="glass-card p-6 sm:p-8">
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
                  <p className="text-sm text-gray-500">
                    {action.description}
                    <span className="text-xs text-gray-400 ml-1">· ~30 sec</span>
                  </p>
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

      {/* Career Growth section — unlocked after 3+ actions completed */}
      {completed >= 3 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">Beyond the Job Search</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              Unlocked
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            You&apos;ve made strong progress. Explore tools to build income and grow your career beyond this role.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/tools/entrepreneurship"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors min-h-[36px]"
            >
              Entrepreneurship Assessment · 8 tok
            </Link>
            <Link
              href="/tools/roadmap"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors min-h-[36px]"
            >
              Career Roadmap · 8 tok
            </Link>
            <Link
              href="/tools/linkedin"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors min-h-[36px]"
            >
              LinkedIn Optimizer · 10 tok
            </Link>
          </div>
        </div>
      )}

      {/* Mission Complete */}
      {completed === 5 && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center space-y-4 relative overflow-hidden">
          {/* CSS confetti effect */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-bounce"
                style={{
                  left: `${5 + (i * 4.5)}%`,
                  top: `${-10 + (i % 3) * 5}%`,
                  backgroundColor: ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"][i % 5],
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: `${1.5 + (i % 3) * 0.5}s`,
                  opacity: 0.7,
                }}
              />
            ))}
          </div>
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto animate-in zoom-in duration-500">
            <Trophy className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Mission Complete!</h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            You have completed all steps for <strong>{activeJobTarget?.title}</strong> at <strong>{activeJobTarget?.company}</strong>.
            You are now fully prepared to apply.
          </p>
          {/* Before/After summary */}
          {activeJobTarget.fit_score && (
            <div className="flex justify-center gap-6 pt-2">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Readiness</p>
                <p className="text-2xl font-bold text-green-600">100%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Fit Score</p>
                <p className="text-2xl font-bold text-blue-600">{activeJobTarget.fit_score}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Actions</p>
                <p className="text-2xl font-bold text-violet-600">{completed}/{total}</p>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <a
              href={activeJobTarget?.job_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors min-h-[48px]"
            >
              Apply Now
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors min-h-[48px]"
            >
              Next Job Mission
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
