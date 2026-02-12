"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, RotateCcw, Share2, ArrowRight, AlertCircle } from "lucide-react";
import { Insight } from "@/components/shared/Insight";
import { ShareModal } from "@/components/shared/ShareModal";
import { Paywall } from "./Paywall";
import { useTokens } from "@/hooks/useTokens";
import { useAppStore } from "@/stores/app-store";
import { track } from "@/lib/analytics";
import { TOOLS_MAP } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { ToolState, ToolProgress, ToolResult } from "@/types";

function getRecommendedTools(currentToolId: string) {
  const recommendations: Record<string, string[]> = {
    displacement: ["jd_match", "skills_gap", "resume"],
    jd_match: ["resume", "cover_letter", "interview"],
    resume: ["cover_letter", "linkedin", "jd_match"],
    cover_letter: ["interview", "resume", "linkedin"],
    linkedin: ["resume", "headshots", "skills_gap"],
    headshots: ["linkedin", "resume", "cover_letter"],
    interview: ["salary", "skills_gap", "cover_letter"],
    skills_gap: ["roadmap", "resume", "interview"],
    roadmap: ["skills_gap", "entrepreneurship", "salary"],
    salary: ["interview", "jd_match", "cover_letter"],
    entrepreneurship: ["roadmap", "skills_gap", "salary"],
  };
  const ids = recommendations[currentToolId] || ["resume", "jd_match", "displacement"];
  return ids.map((id) => TOOLS_MAP[id]).filter(Boolean).slice(0, 3);
}

interface ToolShellProps {
  toolId: string;
  children: (props: {
    state: ToolState;
    result: ToolResult | null;
    progress: ToolProgress;
    onRun: (inputs: Record<string, unknown>) => void;
    onReset: () => void;
  }) => React.ReactNode;
}

export function ToolShell({ toolId, children }: ToolShellProps) {
  const tool = TOOLS_MAP[toolId];
  const [state, setState] = useState<ToolState>("input");
  const [result, setResult] = useState<ToolResult | null>(null);
  const [progress, setProgress] = useState<ToolProgress>({ step: 0, total: 5, message: "" });
  const [showPaywall, setShowPaywall] = useState(false);
  const [pendingInputs, setPendingInputs] = useState<Record<string, unknown> | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { balance, spend } = useTokens();
  const { careerProfile, activeJobTarget } = useAppStore();

  const handleRun = useCallback(
    async (inputs: Record<string, unknown>) => {
      if (!tool) return;

      setError(null);

      track("tool_started", { tool_id: toolId });

      // Check tokens
      if (tool.tokens > 0 && balance < tool.tokens) {
        setPendingInputs(inputs);
        setShowPaywall(true);
        return;
      }

      setState("loading");

      // Fallback simulation (runs in parallel; SSE progress overrides when available)
      const steps = [
        "Preparing your data...",
        "Analyzing with AI...",
        "Processing results...",
        "Formatting output...",
        "Finalizing...",
      ];
      let stepIdx = 0;
      const simInterval = setInterval(() => {
        if (stepIdx < steps.length) {
          setProgress({ step: stepIdx + 1, total: steps.length, message: steps[stepIdx] });
          stepIdx++;
        }
      }, 450);

      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const response = await fetch(`${supabaseUrl}/functions/v1/run-tool`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            tool_id: toolId,
            inputs,
            job_target_id: activeJobTarget?.id || null,
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Tool execution failed");
        }

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
              const eventMatch = block.match(/^event: (.+)$/m);
              const dataMatch = block.match(/^data: (.+)$/m);
              if (!eventMatch || !dataMatch) continue;

              const event = eventMatch[1];
              const data = JSON.parse(dataMatch[1]);

              if (event === "progress") {
                setProgress({ step: data.step, total: data.total, message: data.message });
              } else if (event === "complete") {
                setResult(data.result as ToolResult);
                if (tool.tokens > 0) {
                  await spend(tool.tokens, toolId, data.result_id);
                }
                track("tool_completed", { tool_id: toolId });
                setState("result");
              } else if (event === "error") {
                throw new Error(data.error);
              }
            }
          }
        } else {
          // Fallback: plain JSON response (when Edge Function isn't deployed with SSE yet)
          const data = await response.json();
          setResult(data.result as ToolResult);
          if (tool.tokens > 0) {
            await spend(tool.tokens, toolId, data.result_id);
          }
          track("tool_completed", { tool_id: toolId });
          setState("result");
        }
      } catch (err) {
        console.error("Tool execution error:", err);
        const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
        track("tool_error", { tool_id: toolId, error: message });
        setError(message);
        setState("result");
      } finally {
        clearInterval(simInterval);
      }
    },
    [tool, balance, spend, toolId, activeJobTarget]
  );

  const handleReset = useCallback(() => {
    setState("input");
    setResult(null);
    setError(null);
    setProgress({ step: 0, total: 5, message: "" });
  }, []);

  const handleShare = useCallback(async () => {
    if (!result || !tool) return;
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/create-share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          score_type: toolId,
          score_value: (result as unknown as Record<string, unknown>).score ?? (result as unknown as Record<string, unknown>).fit_score ?? null,
          title: careerProfile?.title || "Career Professional",
          industry: careerProfile?.industry || "",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setShareUrl(data.url || `${window.location.origin}/share/${data.hash}`);
        setShowShare(true);
      }
    } catch {
      // Fallback: share current page
      setShareUrl(window.location.href);
      setShowShare(true);
    }
  }, [result, tool, toolId, careerProfile]);

  if (!tool) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Tool not found.</p>
        <Link href="/tools" className="text-blue-600 text-sm mt-2 inline-block">
          Browse all tools
        </Link>
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

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">{tool.title}</h1>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            tool.tokens === 0 ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"
          }`}>
            {tool.tokens === 0 ? "Free" : `${tool.tokens} tokens`}
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
            {tool.category}
          </span>
        </div>
        <p className="text-gray-500 text-sm">{tool.description}</p>
      </div>

      {/* Insights */}
      <div className="space-y-2">
        <Insight type="pain" text={tool.painPoint} />
        {tool.vsCompetitor && <Insight type="competitive" text={tool.vsCompetitor} />}
      </div>

      {/* Context */}
      {careerProfile?.title && (
        <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2.5 rounded-xl">
          Pre-loaded from your resume: <strong className="text-gray-700">{careerProfile.title}</strong>
          {careerProfile.company && ` at ${careerProfile.company}`}
        </div>
      )}
      {activeJobTarget && (
        <div className="text-sm text-gray-500 bg-blue-50 px-4 py-2.5 rounded-xl">
          Targeting: <strong className="text-blue-700">{activeJobTarget.title}</strong> at {activeJobTarget.company}
        </div>
      )}

      {/* Loading state */}
      {state === "loading" && (
        <div className="text-center py-12 space-y-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <div>
            <p className="text-sm font-medium text-gray-900">{progress.message}</p>
            <p className="text-xs text-gray-400 mt-1">
              Step {progress.step} of {progress.total} · Usually 5-15 seconds
            </p>
          </div>
          <div className="w-48 bg-gray-200 rounded-full h-1.5 mx-auto">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${(progress.step / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Error display */}
      {state === "result" && error && !result && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Something went wrong</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => { setError(null); setState("input"); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Children render prop */}
      {state !== "loading" && children({ state, result, progress, onRun: handleRun, onReset: handleReset })}

      {/* Result actions */}
      {state === "result" && (
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
            Run Again
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors min-h-[44px]"
          >
            <Share2 className="w-4 h-4" />
            Share Results
          </button>
          {activeJobTarget && (
            <Link
              href="/mission"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors min-h-[44px]"
            >
              Mission Control
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}

      {/* Recommended next */}
      {state === "result" && tool && (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Recommended next</h3>
          <div className="flex flex-wrap gap-2">
            {getRecommendedTools(toolId).map((rec) => (
              <Link
                key={rec.id}
                href={`/tools/${rec.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors min-h-[36px]"
              >
                {rec.title}
                <span className="text-gray-400">{rec.tokens === 0 ? "Free" : `${rec.tokens} tok`}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShare && (
        <ShareModal
          url={shareUrl}
          title={`My ${tool.title} results on CareerAI`}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* Paywall */}
      {showPaywall && (
        <Paywall
          requiredTokens={tool.tokens}
          onClose={() => setShowPaywall(false)}
          onPurchaseComplete={() => {
            setShowPaywall(false);
            // Auto-retry with pending inputs after purchase
            if (pendingInputs) {
              setTimeout(() => {
                handleRun(pendingInputs);
                setPendingInputs(null);
              }, 1000);
            }
          }}
        />
      )}
    </div>
  );
}
