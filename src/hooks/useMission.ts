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
  const completed = Object.values(missionActions).filter(Boolean).length;
  const total = MISSION_ACTIONS.length;
  const isComplete = completed >= total;
  const progress = Math.round((completed / total) * 100);

  const completeAction = useCallback(
    async (actionId: string) => {
      if (!activeJobTarget) return;

      const updated = { ...missionActions, [actionId]: true };

      const { data, error } = await supabase
        .from("job_targets")
        .update({ mission_actions: updated as unknown as Json })
        .eq("id", activeJobTarget.id)
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

  return {
    activeJobTarget,
    missionActions,
    completed,
    total,
    progress,
    isComplete,
    completeAction,
    getActionState,
  };
}
