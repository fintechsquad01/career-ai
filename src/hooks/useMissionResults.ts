"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { MISSION_ACTIONS } from "@/lib/constants";

export type ToolResultSummary = {
  tool_id: string;
  summary: string;
  metric_value: number | null;
  created_at: string;
};

/**
 * Fetches tool_results for mission actions, scoped to a specific job target.
 * Returns a map from tool_id to the most recent result summary.
 */
export function useMissionResults(jobTargetId: string | null | undefined) {
  const [toolResults, setToolResults] = useState<Record<string, ToolResultSummary>>({});
  const [loading, setLoading] = useState(false);

  const fetchResults = useCallback(async () => {
    if (!jobTargetId) {
      setToolResults({});
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const missionToolIds = MISSION_ACTIONS.map((a) => a.toolId);
      const { data } = await supabase
        .from("tool_results")
        .select("tool_id, summary, metric_value, created_at")
        .eq("user_id", session.user.id)
        .eq("job_target_id", jobTargetId)
        .in("tool_id", missionToolIds)
        .order("created_at", { ascending: false });

      if (data) {
        const resultMap: Record<string, ToolResultSummary> = {};
        for (const row of data) {
          if (!resultMap[row.tool_id]) {
            resultMap[row.tool_id] = row as ToolResultSummary;
          }
        }
        setToolResults(resultMap);
      }
    } catch {
      // Non-critical — fall back to generic "Done"
    } finally {
      setLoading(false);
    }
  }, [jobTargetId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return { toolResults, loading, refetchResults: fetchResults };
}

/**
 * Batch-fetches tool_results for multiple job targets at once.
 * Returns a map from job_target_id to (tool_id -> ToolResultSummary).
 */
export function useBatchMissionResults(jobTargetIds: string[]) {
  const [resultsByTarget, setResultsByTarget] = useState<Record<string, Record<string, ToolResultSummary>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (jobTargetIds.length === 0) {
      setResultsByTarget({});
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;

        const missionToolIds = MISSION_ACTIONS.map((a) => a.toolId);
        const { data } = await supabase
          .from("tool_results")
          .select("tool_id, job_target_id, summary, metric_value, created_at")
          .eq("user_id", session.user.id)
          .in("job_target_id", jobTargetIds)
          .in("tool_id", missionToolIds)
          .order("created_at", { ascending: false });

        if (data) {
          const map: Record<string, Record<string, ToolResultSummary>> = {};
          for (const row of data) {
            const targetId = row.job_target_id as string;
            if (!map[targetId]) map[targetId] = {};
            if (!map[targetId][row.tool_id]) {
              map[targetId][row.tool_id] = {
                tool_id: row.tool_id,
                summary: row.summary as string,
                metric_value: row.metric_value as number | null,
                created_at: row.created_at as string,
              };
            }
          }
          setResultsByTarget(map);
        }
      } catch {
        // Non-critical
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [jobTargetIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return { resultsByTarget, loading };
}
