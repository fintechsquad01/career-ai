import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/stores/app-store";
import { safeLocalStorage } from "@/lib/safe-storage";
import type { CareerProfile, JobTarget } from "@/types";

const PRE_AUTH_RESUME_KEY = "aiskillscore_pre_auth_resume";
const PRE_AUTH_JD_KEY = "aiskillscore_pre_auth_jd";

/**
 * Syncs pre-auth localStorage data (resume text, JD text) to the database
 * immediately after authentication. Runs once on mount.
 */
export function usePostAuthSync() {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    void syncPreAuthData();
  }, []);
}

async function syncPreAuthData() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const resumeText = safeLocalStorage.getItem(PRE_AUTH_RESUME_KEY);
  const jdText = safeLocalStorage.getItem(PRE_AUTH_JD_KEY);

  if (resumeText) {
    await syncResume(supabase, user.id, resumeText);
  }

  if (jdText) {
    await syncJobDescription(supabase, user.id, jdText);
  }
}

async function syncResume(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  resumeText: string,
) {
  try {
    const { data, error } = await supabase
      .from("career_profiles")
      .upsert(
        {
          user_id: userId,
          resume_text: resumeText,
          source: "paste",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select()
      .single();

    if (error) {
      console.error("[usePostAuthSync] Failed to upsert career profile:", error.message);
      return;
    }

    const existing = useAppStore.getState().careerProfile;
    const merged: CareerProfile = existing ? { ...existing, ...data } : data;
    useAppStore.getState().setCareerProfile(merged);

    safeLocalStorage.removeItem(PRE_AUTH_RESUME_KEY);
  } catch (err) {
    console.error("[usePostAuthSync] Resume sync error:", err);
  }
}

async function syncJobDescription(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  jdText: string,
) {
  try {
    let title = "Untitled Position";
    let company = "Unknown Company";

    // Try to extract title/company via parse-input Edge Function
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl) {
        const res = await fetch(`${supabaseUrl}/functions/v1/parse-input`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input_text: jdText, detected_type: "jd" }),
        });

        if (res.ok) {
          const parsed: { title?: string; company?: string } = await res.json() as {
            title?: string;
            company?: string;
          };
          if (parsed.title) title = parsed.title;
          if (parsed.company) company = parsed.company;
        }
      }
    } catch {
      // Parse failed — proceed with defaults
    }

    const { data, error } = await supabase
      .from("job_targets")
      .insert({
        user_id: userId,
        jd_text: jdText,
        title,
        company,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("[usePostAuthSync] Failed to insert job target:", error.message);
      return;
    }

    useAppStore.getState().setActiveJobTarget(data as JobTarget);

    safeLocalStorage.removeItem(PRE_AUTH_JD_KEY);
  } catch (err) {
    console.error("[usePostAuthSync] JD sync error:", err);
  }
}
