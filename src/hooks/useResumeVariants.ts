"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ResumeVariant } from "@/types";

export function useResumeVariants() {
  const [variants, setVariants] = useState<ResumeVariant[]>([]);
  const [loading, setLoading] = useState(false);

  const listVariants = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from("resume_variants")
        .select("*")
        .eq("user_id", session.user.id)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch resume variants:", error);
        return;
      }

      setVariants((data || []) as ResumeVariant[]);
    } catch (err) {
      console.error("Error fetching resume variants:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveVariant = useCallback(
    async (
      name: string,
      resumeText: string,
      jobTargetId?: string | null,
      toolResultId?: string | null
    ): Promise<ResumeVariant | null> => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return null;

        const { data, error } = await supabase
          .from("resume_variants")
          .insert({
            user_id: session.user.id,
            name,
            resume_text: resumeText,
            job_target_id: jobTargetId || null,
            tool_result_id: toolResultId || null,
            source: toolResultId ? "optimizer" : "manual",
          })
          .select()
          .single();

        if (error) {
          console.error("Failed to save resume variant:", error);
          return null;
        }

        const newVariant = data as ResumeVariant;
        setVariants((prev) => [newVariant, ...prev]);
        return newVariant;
      } catch (err) {
        console.error("Error saving resume variant:", err);
        return null;
      }
    },
    []
  );

  const deleteVariant = useCallback(
    async (variantId: string) => {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("resume_variants")
          .delete()
          .eq("id", variantId);

        if (error) {
          console.error("Failed to delete resume variant:", error);
          return false;
        }

        setVariants((prev) => prev.filter((v) => v.id !== variantId));
        return true;
      } catch (err) {
        console.error("Error deleting resume variant:", err);
        return false;
      }
    },
    []
  );

  // Auto-fetch on mount
  useEffect(() => {
    listVariants();
  }, [listVariants]);

  return {
    variants,
    loading,
    listVariants,
    saveVariant,
    deleteVariant,
  };
}
