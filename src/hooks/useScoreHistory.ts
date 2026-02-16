"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface ScoreEntry {
  metric_value: number | null;
  created_at: string;
}

/**
 * Fetches the last N metric_values for a given tool_id + job_target_id.
 * Useful for showing trend arrows and score deltas on mission cards.
 */
export function useScoreHistory(
  toolId: string,
  jobTargetId: string | null | undefined,
  limit = 2
) {
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!jobTargetId || !toolId) {
      setEntries([]);
      return;
    }

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;

        const { data } = await supabase
          .from("tool_results")
          .select("metric_value, created_at")
          .eq("user_id", session.user.id)
          .eq("tool_id", toolId)
          .eq("job_target_id", jobTargetId)
          .not("metric_value", "is", null)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (data) {
          setEntries(data as ScoreEntry[]);
        }
      } catch {
        // Non-critical
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [toolId, jobTargetId, limit]);

  const latest = entries[0]?.metric_value ?? null;
  const previous = entries[1]?.metric_value ?? null;
  const delta = latest != null && previous != null ? latest - previous : null;

  return { entries, latest, previous, delta, loading };
}

/**
 * Batch-fetches the latest two results per tool for a given job target.
 * Returns a map from tool_id to { latest, previous, delta }.
 */
export function useBatchScoreDeltas(
  toolIds: string[],
  jobTargetId: string | null | undefined
) {
  const [deltas, setDeltas] = useState<Record<string, { latest: number; previous: number; delta: number }>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!jobTargetId || toolIds.length === 0) {
      setDeltas({});
      return;
    }

    const fetchDeltas = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;

        const { data } = await supabase
          .from("tool_results")
          .select("tool_id, metric_value, created_at")
          .eq("user_id", session.user.id)
          .eq("job_target_id", jobTargetId)
          .in("tool_id", toolIds)
          .not("metric_value", "is", null)
          .order("created_at", { ascending: false });

        if (data) {
          const grouped: Record<string, number[]> = {};
          for (const row of data) {
            if (row.metric_value == null) continue;
            if (!grouped[row.tool_id]) grouped[row.tool_id] = [];
            if (grouped[row.tool_id].length < 2) {
              grouped[row.tool_id].push(row.metric_value);
            }
          }

          const result: Record<string, { latest: number; previous: number; delta: number }> = {};
          for (const [tid, values] of Object.entries(grouped)) {
            if (values.length >= 2) {
              result[tid] = {
                latest: values[0],
                previous: values[1],
                delta: values[0] - values[1],
              };
            }
          }
          setDeltas(result);
        }
      } catch {
        // Non-critical
      } finally {
        setLoading(false);
      }
    };

    fetchDeltas();
  }, [toolIds.join(","), jobTargetId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { deltas, loading };
}
