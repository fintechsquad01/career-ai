"use client";

import { useCallback, useState } from "react";
import { useTokens } from "./useTokens";
import { useAppStore } from "@/stores/app-store";
import { createClient } from "@/lib/supabase/client";
import { TOOLS_MAP } from "@/lib/constants";
import type { ToolState, ToolProgress, ToolResult } from "@/types";

export function useTool(toolId: string) {
  const tool = TOOLS_MAP[toolId];
  const [state, setState] = useState<ToolState>("input");
  const [result, setResult] = useState<ToolResult | null>(null);
  const [progress, setProgress] = useState<ToolProgress>({
    step: 0,
    total: 5,
    message: "",
  });
  const [error, setError] = useState<string | null>(null);
  const { balance, spend } = useTokens();
  const { activeJobTarget } = useAppStore();

  const run = useCallback(
    async (inputs: Record<string, unknown>): Promise<boolean> => {
      if (!tool) return false;
      setError(null);

      // Check tokens
      if (tool.tokens > 0 && balance < tool.tokens) {
        return false; // Caller should show paywall
      }

      setState("loading");

      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

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

        // Check if SSE or JSON
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("text/event-stream") && response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const blocks = buffer.split("\n\n");
            buffer = blocks.pop() || "";

            for (const block of blocks) {
              const eventMatch = block.match(/^event: (.+)$/m);
              const dataMatch = block.match(/^data: (.+)$/m);
              if (!eventMatch || !dataMatch) continue;

              const event = eventMatch[1];
              const data = JSON.parse(dataMatch[1]);

              if (event === "progress") {
                setProgress({
                  step: data.step,
                  total: data.total,
                  message: data.message,
                });
              } else if (event === "complete") {
                setResult(data.result as ToolResult);
                if (tool.tokens > 0) {
                  await spend(tool.tokens, toolId, data.result_id);
                }
              } else if (event === "error") {
                throw new Error(data.error);
              }
            }
          }
        } else {
          // Fallback: JSON response
          const data = await response.json();
          setResult(data.result as ToolResult);
          if (tool.tokens > 0) {
            await spend(tool.tokens, toolId, data.result_id);
          }
        }

        setState("result");
        return true;
      } catch (err) {
        console.error("Tool execution error:", err);
        setError(err instanceof Error ? err.message : "Tool execution failed");
        setState("result");
        setResult(null);
        return false;
      }
    },
    [tool, balance, spend, toolId, activeJobTarget]
  );

  const reset = useCallback(() => {
    setState("input");
    setResult(null);
    setError(null);
    setProgress({ step: 0, total: 5, message: "" });
  }, []);

  return {
    tool,
    state,
    result,
    progress,
    error,
    run,
    reset,
    needsTokens: tool ? tool.tokens > 0 && balance < tool.tokens : false,
  };
}
