"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Zap, Target, FileText, Mail, ArrowRight, ArrowLeft,
  CheckCircle, Loader2, AlertCircle, RotateCcw,
} from "lucide-react";
import { useJobTargets } from "@/hooks/useJobTargets";
import { useTokens } from "@/hooks/useTokens";
import { useAppStore } from "@/stores/app-store";
import { createClient } from "@/lib/supabase/client";

const QUICK_TOOLS = [
  { id: "jd_match", title: "JD Match Score", tokens: 5, icon: Target, color: "blue" },
  { id: "resume", title: "Resume Optimizer", tokens: 15, icon: FileText, color: "violet" },
  { id: "cover_letter", title: "Cover Letter", tokens: 8, icon: Mail, color: "emerald" },
] as const;

const TOTAL_TOKENS = QUICK_TOOLS.reduce((sum, t) => sum + t.tokens, 0);

const COLOR_CLASSES: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600" },
  violet: { bg: "bg-violet-50", text: "text-violet-600" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
};

type StepStatus = "pending" | "running" | "completed" | "failed" | "skipped";

interface StepState {
  status: StepStatus;
  error?: string;
}

interface QuickApplyFlowProps {
  hasResume: boolean;
}

export function QuickApplyFlow({ hasResume }: QuickApplyFlowProps) {
  const [phase, setPhase] = useState<"input" | "running" | "done">("input");
  const [jdText, setJdText] = useState("");
  const [steps, setSteps] = useState<StepState[]>(
    QUICK_TOOLS.map(() => ({ status: "pending" }))
  );
  const [currentStep, setCurrentStep] = useState(0);
  const abortRef = useRef(false);

  const { addTarget } = useJobTargets();
  const { balance, refreshBalance } = useTokens();
  const careerProfile = useAppStore((s) => s.careerProfile);
  const activeJobTarget = useAppStore((s) => s.activeJobTarget);

  const totalBalance = balance;
  const canAfford = totalBalance >= TOTAL_TOKENS;

  const runTool = useCallback(
    async (toolId: string, jobTargetId: string, resumeText: string, jd: string): Promise<boolean> => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const inputs: Record<string, unknown> = { jd_text: jd };
        if (resumeText) inputs.resume_text = resumeText;

        const response = await fetch(`${supabaseUrl}/functions/v1/run-tool`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            tool_id: toolId,
            job_target_id: jobTargetId,
            inputs,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || `Tool ${toolId} failed`);
        }

        // Read response (SSE or JSON)
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("text/event-stream") && response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split("\n\n");
            buffer = lines.pop() || "";

            for (const block of lines) {
              const eventMatch = block.match(/event:\s*(\w+)/);
              const dataMatch = block.match(/data:\s*({[\s\S]*})/);
              if (!eventMatch || !dataMatch) continue;

              const event = eventMatch[1];
              if (event === "error") {
                const data = JSON.parse(dataMatch[1]);
                throw new Error(data.error);
              }
            }
          }
        }

        return true;
      } catch (err) {
        console.error(`Quick apply tool ${toolId} failed:`, err);
        return false;
      }
    },
    []
  );

  const handleRun = useCallback(async () => {
    if (!jdText.trim() || !canAfford) return;

    setPhase("running");
    abortRef.current = false;

    // Create job target
    const target = await addTarget(jdText);
    if (!target) {
      setSteps(QUICK_TOOLS.map(() => ({ status: "failed", error: "Failed to create job target" })));
      setPhase("done");
      return;
    }

    const resumeText = careerProfile?.resume_text || "";

    for (let i = 0; i < QUICK_TOOLS.length; i++) {
      if (abortRef.current) break;

      setCurrentStep(i);
      setSteps((prev) =>
        prev.map((s, idx) => (idx === i ? { status: "running" } : s))
      );

      // Skip resume optimizer if no resume
      if (QUICK_TOOLS[i].id === "resume" && !resumeText) {
        setSteps((prev) =>
          prev.map((s, idx) =>
            idx === i ? { status: "skipped", error: "No resume uploaded" } : s
          )
        );
        continue;
      }

      const success = await runTool(QUICK_TOOLS[i].id, target.id, resumeText, jdText);

      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === i
            ? { status: success ? "completed" : "failed", error: success ? undefined : "Tool execution failed" }
            : s
        )
      );

      if (success) {
        await refreshBalance();
      }
    }

    setPhase("done");
  }, [jdText, canAfford, addTarget, careerProfile, runTool, refreshBalance]);

  const handleRetryStep = useCallback(
    async (stepIdx: number) => {
      if (!activeJobTarget) return;

      setSteps((prev) =>
        prev.map((s, idx) => (idx === stepIdx ? { status: "running" } : s))
      );

      const resumeText = careerProfile?.resume_text || "";
      const success = await runTool(QUICK_TOOLS[stepIdx].id, activeJobTarget.id, resumeText, jdText);

      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === stepIdx
            ? { status: success ? "completed" : "failed", error: success ? undefined : "Retry failed" }
            : s
        )
      );

      if (success) {
        await refreshBalance();
      }
    },
    [activeJobTarget, careerProfile, jdText, runTool, refreshBalance]
  );

  const completedCount = steps.filter((s) => s.status === "completed").length;
  const allDone = phase === "done";
  const hasFailures = steps.some((s) => s.status === "failed");

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/mission" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          Missions
        </Link>
      </div>

      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-violet-50 rounded-full">
          <Zap className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-blue-700">Quick Apply</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Run 3 Tools in One Go</h1>
        <p className="text-sm text-gray-500">
          Paste a job description and we&apos;ll run JD Match, Resume Optimizer, and Cover Letter sequentially.
        </p>
      </div>

      {/* Input phase */}
      {phase === "input" && (
        <div className="space-y-4">
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={8}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
          />

          {/* Tools preview */}
          <div className="glass-card p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">What we&apos;ll run</p>
            {QUICK_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <div key={tool.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${COLOR_CLASSES[tool.color].bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${COLOR_CLASSES[tool.color].text}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{tool.title}</p>
                  </div>
                  <span className="text-xs font-bold text-gray-400">{tool.tokens} tok</span>
                </div>
              );
            })}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs font-semibold text-gray-700">Total</span>
              <span className="text-sm font-bold text-gray-900">{TOTAL_TOKENS} tokens</span>
            </div>
          </div>

          {!hasResume && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-800">
                <strong>No resume on file.</strong> Resume Optimizer will be skipped. Upload a resume in any tool first for best results.
              </p>
            </div>
          )}

          {!canAfford && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
              <p className="text-xs text-red-800">
                You need {TOTAL_TOKENS} tokens but have {totalBalance}. 
              </p>
              <Link
                href="/pricing"
                className="text-xs font-semibold text-red-700 hover:text-red-900"
              >
                Get tokens →
              </Link>
            </div>
          )}

          <button
            onClick={handleRun}
            disabled={!jdText.trim() || !canAfford}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity min-h-[48px]"
          >
            <Zap className="w-4 h-4" />
            Run All — {TOTAL_TOKENS} tokens
          </button>
        </div>
      )}

      {/* Running / Done phase */}
      {(phase === "running" || phase === "done") && (
        <div className="space-y-4">
          {/* Progress steps */}
          <div className="glass-card p-5 space-y-4">
            {QUICK_TOOLS.map((tool, idx) => {
              const step = steps[idx];
              const Icon = tool.icon;
              const isActive = idx === currentStep && phase === "running";

              return (
                <div
                  key={tool.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    isActive ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
                  }`}
                >
                  {/* Status icon */}
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                    {step.status === "running" && (
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    )}
                    {step.status === "completed" && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {step.status === "failed" && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    {step.status === "skipped" && (
                      <span className="text-xs font-bold text-gray-400">—</span>
                    )}
                    {step.status === "pending" && (
                      <Icon className="w-5 h-5 text-gray-300" />
                    )}
                  </div>

                  {/* Tool info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                      step.status === "completed" ? "text-green-800" :
                      step.status === "failed" ? "text-red-800" :
                      step.status === "running" ? "text-blue-800" :
                      "text-gray-500"
                    }`}>
                      {tool.title}
                    </p>
                    {step.status === "running" && (
                      <p className="text-xs text-blue-500 animate-pulse">Analyzing...</p>
                    )}
                    {step.status === "failed" && step.error && (
                      <p className="text-xs text-red-500">{step.error}</p>
                    )}
                    {step.status === "skipped" && (
                      <p className="text-xs text-gray-400">{step.error || "Skipped"}</p>
                    )}
                  </div>

                  {/* Step number / retry */}
                  <div className="flex-shrink-0">
                    {step.status === "failed" && allDone && (
                      <button
                        onClick={() => handleRetryStep(idx)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Retry
                      </button>
                    )}
                    {step.status !== "failed" && (
                      <span className="text-xs font-bold text-gray-300">{idx + 1}/3</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overall progress bar */}
          {phase === "running" && (
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-blue-600 to-violet-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / QUICK_TOOLS.length) * 100}%` }}
              />
            </div>
          )}

          {/* Done state */}
          {allDone && (
            <div className="space-y-4">
              {!hasFailures ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                  <p className="text-sm font-semibold text-green-800">
                    All tools completed! {completedCount}/{QUICK_TOOLS.length} successful
                  </p>
                  <p className="text-xs text-green-600">Your application materials are ready in Mission Control.</p>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center space-y-2">
                  <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
                  <p className="text-sm font-semibold text-amber-800">
                    {completedCount}/{QUICK_TOOLS.length} tools completed. Use the Retry buttons above for failed steps.
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Link
                  href="/mission"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity min-h-[48px]"
                >
                  View in Mission Control
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => {
                    setPhase("input");
                    setJdText("");
                    setSteps(QUICK_TOOLS.map(() => ({ status: "pending" })));
                    setCurrentStep(0);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors min-h-[48px]"
                >
                  <RotateCcw className="w-4 h-4" />
                  New Job
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
