"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, RotateCcw, Share2, ArrowRight } from "lucide-react";
import { Insight } from "@/components/shared/Insight";
import { ShareModal } from "@/components/shared/ShareModal";
import { Paywall } from "./Paywall";
import { useTokens } from "@/hooks/useTokens";
import { useAppStore } from "@/stores/app-store";
import { TOOLS_MAP } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { ToolState, ToolProgress, ToolResult } from "@/types";

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
  const [showShare, setShowShare] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const { balance, spend } = useTokens();
  const { careerProfile, activeJobTarget } = useAppStore();

  const handleRun = useCallback(
    async (inputs: Record<string, unknown>) => {
      if (!tool) return;

      // Check tokens
      if (tool.tokens > 0 && balance < tool.tokens) {
        setShowPaywall(true);
        return;
      }

      setState("loading");

      // Simulate progress steps
      const steps = [
        "Preparing your data...",
        "Analyzing with AI...",
        "Processing results...",
        "Formatting output...",
        "Finalizing...",
      ];

      for (let i = 0; i < steps.length; i++) {
        setProgress({ step: i + 1, total: steps.length, message: steps[i] });
        await new Promise((r) => setTimeout(r, 400 + Math.random() * 200));
      }

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

        const data = await response.json();
        setResult(data.result as ToolResult);

        // Deduct tokens after successful run
        if (tool.tokens > 0) {
          await spend(tool.tokens, toolId, data.result_id);
        }

        setState("result");
      } catch (error) {
        console.error("Tool execution error:", error);
        // For now, generate mock result for demonstration
        setState("result");
        setResult(null);
      }
    },
    [tool, balance, spend, toolId, activeJobTarget]
  );

  const handleReset = useCallback(() => {
    setState("input");
    setResult(null);
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
          }}
        />
      )}
    </div>
  );
}
