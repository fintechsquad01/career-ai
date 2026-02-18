"use client";

import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/stores/app-store";
import { MISSION_ACTIONS } from "@/lib/constants";
import type { Json } from "@/types";

export function useMission() {
  const { activeJobTarget, setActiveJobTarget } = useAppStore();
  const supabase = createClient();

  const missionActions = (activeJobTarget?.mission_actions as Record<string, boolean>) || {};
  const completed = MISSION_ACTIONS.reduce(
    (count, action) => (missionActions[action.id] ? count + 1 : count),
    0
  );
  const total = MISSION_ACTIONS.length;
  const isComplete = completed >= total;
  const progress = Math.round((completed / total) * 100);

  const completeAction = useCallback(
    async (actionId: string, jobTargetId?: string) => {
      const targetId = jobTargetId || activeJobTarget?.id;
      if (!targetId) return;
      let baseActions = missionActions;
      if (!activeJobTarget || activeJobTarget.id !== targetId) {
        const { data: targetData } = await supabase
          .from("job_targets")
          .select("mission_actions")
          .eq("id", targetId)
          .single();
        baseActions = (targetData?.mission_actions as Record<string, boolean>) || {};
      }
      const updated = { ...baseActions, [actionId]: true };

      const { data, error } = await supabase
        .from("job_targets")
        .update({ mission_actions: updated as unknown as Json })
        .eq("id", targetId)
        .select()
        .single();

      if (!error && data) {
        setActiveJobTarget(data);
      }
    },
    [activeJobTarget, missionActions, supabase, setActiveJobTarget]
  );

  const getActionState = useCallback(
    (actionId: string, index: number) => {
      if (missionActions[actionId]) return "completed" as const;
      // First uncompleted action is available, rest are locked
      const prevCompleted = MISSION_ACTIONS.slice(0, index).every(
        (a) => missionActions[a.id]
      );
      return prevCompleted ? ("available" as const) : ("locked" as const);
    },
    [missionActions]
  );

  const reconcileActionsFromResults = useCallback(
    async (jobTargetId?: string) => {
      const targetId = jobTargetId || activeJobTarget?.id;
      if (!targetId) return;

      try {
        const { data: targetData } = await supabase
          .from("job_targets")
          .select("mission_actions")
          .eq("id", targetId)
          .single();

        const currentActions = (targetData?.mission_actions as Record<string, boolean>) || {};
        const actionByTool = Object.fromEntries(MISSION_ACTIONS.map((a) => [a.toolId, a.id])) as Record<string, string>;
        const missionToolIds = Object.keys(actionByTool);

        const { data: results } = await supabase
          .from("tool_results")
          .select("tool_id")
          .eq("job_target_id", targetId)
          .in("tool_id", missionToolIds);

        const updatedActions = { ...currentActions };
        for (const row of results || []) {
          const actionId = actionByTool[row.tool_id];
          if (actionId) updatedActions[actionId] = true;
        }

        const changed = MISSION_ACTIONS.some((a) => Boolean(currentActions[a.id]) !== Boolean(updatedActions[a.id]));
        if (!changed) return;

        const { data: updatedTarget, error } = await supabase
          .from("job_targets")
          .update({ mission_actions: updatedActions as unknown as Json })
          .eq("id", targetId)
          .select()
          .single();

        if (!error && updatedTarget) {
          setActiveJobTarget(updatedTarget);
        }
      } catch (err) {
        console.error("Failed to reconcile mission actions:", err);
      }
    },
    [activeJobTarget, supabase, setActiveJobTarget]
  );

  return {
    activeJobTarget,
    missionActions,
    completed,
    total,
    progress,
    isComplete,
    completeAction,
    reconcileActionsFromResults,
    getActionState,
  };
}
