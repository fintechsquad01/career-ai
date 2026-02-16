"use client";

import { useCallback, useEffect } from "react";
import { useAppStore } from "@/stores/app-store";
import { createClient } from "@/lib/supabase/client";
import type { JobTarget, JobTargetStatus } from "@/types";

/** Hook to manage all job targets for the current user */
export function useJobTargets() {
  const jobTargets = useAppStore((s) => s.jobTargets);
  const jobTargetsLoaded = useAppStore((s) => s.jobTargetsLoaded);
  const activeJobTarget = useAppStore((s) => s.activeJobTarget);
  const setJobTargets = useAppStore((s) => s.setJobTargets);
  const setActiveJobTarget = useAppStore((s) => s.setActiveJobTarget);

  /** Fetch all job targets for the current user */
  const refreshTargets = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from("job_targets")
        .select("*")
        .eq("user_id", session.user.id)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch job targets:", error);
        return;
      }

      const targets = (data || []) as JobTarget[];
      setJobTargets(targets);

      // Sync active target from the list
      const active = targets.find((t) => t.is_active);
      if (active) {
        setActiveJobTarget(active);
      }
    } catch (err) {
      console.error("Error fetching job targets:", err);
    }
  }, [setJobTargets, setActiveJobTarget]);

  /** Switch which target is active using the set_active_job_target RPC */
  const switchTarget = useCallback(
    async (targetId: string) => {
      try {
        const supabase = createClient();

        // Optimistic update
        const newActive = jobTargets.find((t) => t.id === targetId);
        if (newActive) {
          setActiveJobTarget(newActive);
          setJobTargets(
            jobTargets.map((t) => ({
              ...t,
              is_active: t.id === targetId,
            }))
          );
        }

        const { error } = await supabase.rpc("set_active_job_target", {
          target_id: targetId,
        });

        if (error) {
          console.error("Failed to switch job target:", error);
          // Rollback — refetch from server
          await refreshTargets();
          return false;
        }

        return true;
      } catch (err) {
        console.error("Error switching job target:", err);
        await refreshTargets();
        return false;
      }
    },
    [jobTargets, setActiveJobTarget, setJobTargets, refreshTargets]
  );

  /** Add a new job target and optionally set it as active */
  const addTarget = useCallback(
    async (jdText: string, title?: string, company?: string, setActive = true): Promise<JobTarget | null> => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user?.id) return null;

        // If setting as active, deactivate current
        if (setActive) {
          await supabase
            .from("job_targets")
            .update({ is_active: false })
            .eq("user_id", session.user.id)
            .eq("is_active", true);
        }

        // Extract title from first line if not provided
        const lines = jdText.trim().split("\n").filter((l: string) => l.trim());
        const derivedTitle = title || lines[0]?.trim().slice(0, 100) || "Untitled Position";

        const { data, error } = await supabase
          .from("job_targets")
          .insert({
            user_id: session.user.id,
            jd_text: jdText.trim(),
            title: derivedTitle,
            company: company || "",
            is_active: setActive,
            source: "paste",
          })
          .select()
          .single();

        if (error) {
          console.error("Failed to add job target:", error);
          return null;
        }

        const newTarget = data as JobTarget;

        // Update store
        if (setActive) {
          setActiveJobTarget(newTarget);
          setJobTargets([
            newTarget,
            ...jobTargets.map((t) => ({ ...t, is_active: false })),
          ]);
        } else {
          setJobTargets([newTarget, ...jobTargets]);
        }

        return newTarget;
      } catch (err) {
        console.error("Error adding job target:", err);
        return null;
      }
    },
    [jobTargets, setActiveJobTarget, setJobTargets]
  );

  /** Rename a job target */
  const renameTarget = useCallback(
    async (targetId: string, title: string, company?: string) => {
      try {
        const supabase = createClient();
        const updates: { title: string; company?: string; updated_at: string } = {
          title,
          updated_at: new Date().toISOString(),
        };
        if (company !== undefined) updates.company = company;

        const { error } = await supabase
          .from("job_targets")
          .update(updates)
          .eq("id", targetId);

        if (error) {
          console.error("Failed to rename job target:", error);
          return false;
        }

        // Update store
        setJobTargets(
          jobTargets.map((t) =>
            t.id === targetId
              ? { ...t, title, ...(company !== undefined ? { company } : {}) }
              : t
          )
        );

        // Update active target if it was renamed
        if (activeJobTarget?.id === targetId) {
          setActiveJobTarget({
            ...activeJobTarget,
            title,
            ...(company !== undefined ? { company } : {}),
          });
        }

        return true;
      } catch (err) {
        console.error("Error renaming job target:", err);
        return false;
      }
    },
    [jobTargets, activeJobTarget, setJobTargets, setActiveJobTarget]
  );

  /** Update a job target's application status */
  const updateStatus = useCallback(
    async (targetId: string, status: JobTargetStatus) => {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("job_targets")
          .update({
            status,
            status_updated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", targetId);

        if (error) {
          console.error("Failed to update job target status:", error);
          return false;
        }

        // Update store
        setJobTargets(
          jobTargets.map((t) =>
            t.id === targetId ? { ...t, status, status_updated_at: new Date().toISOString() } : t
          )
        );

        if (activeJobTarget?.id === targetId) {
          setActiveJobTarget({
            ...activeJobTarget,
            status,
            status_updated_at: new Date().toISOString(),
          });
        }

        return true;
      } catch (err) {
        console.error("Error updating job target status:", err);
        return false;
      }
    },
    [jobTargets, activeJobTarget, setJobTargets, setActiveJobTarget]
  );

  /** Delete a job target */
  const deleteTarget = useCallback(
    async (targetId: string) => {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("job_targets")
          .delete()
          .eq("id", targetId);

        if (error) {
          console.error("Failed to delete job target:", error);
          return false;
        }

        const remaining = jobTargets.filter((t) => t.id !== targetId);
        setJobTargets(remaining);

        // If we deleted the active target, activate the most recent remaining
        if (activeJobTarget?.id === targetId) {
          if (remaining.length > 0) {
            await switchTarget(remaining[0].id);
          } else {
            setActiveJobTarget(null);
          }
        }

        return true;
      } catch (err) {
        console.error("Error deleting job target:", err);
        return false;
      }
    },
    [jobTargets, activeJobTarget, setJobTargets, setActiveJobTarget, switchTarget]
  );

  // Auto-fetch on mount if not loaded
  useEffect(() => {
    if (!jobTargetsLoaded) {
      refreshTargets();
    }
  }, [jobTargetsLoaded, refreshTargets]);

  return {
    jobTargets,
    activeJobTarget,
    jobTargetsLoaded,
    refreshTargets,
    switchTarget,
    addTarget,
    renameTarget,
    updateStatus,
    deleteTarget,
  };
}
