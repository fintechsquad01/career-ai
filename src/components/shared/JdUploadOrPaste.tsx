"use client";

import { useState, useCallback } from "react";
import { Briefcase, Check, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/stores/app-store";
import type { JobTarget } from "@/types";

interface JdUploadOrPasteProps {
  value: string;
  onChange: (text: string) => void;
  activeJobTarget?: {
    title?: string | null;
    company?: string | null;
    jd_text?: string | null;
  } | null;
  compact?: boolean;
  label?: string;
  autoSave?: boolean;
}

/**
 * Save JD text to job_targets table and update Zustand.
 * Inserts a new row (not upsert — users may have multiple targets).
 */
export async function saveJdToJobTarget(
  text: string,
  title: string,
  company: string
): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Deactivate current active targets
    await supabase
      .from("job_targets")
      .update({ is_active: false })
      .eq("user_id", user.id)
      .eq("is_active", true);

    // Insert new target as active
    const { data, error } = await supabase
      .from("job_targets")
      .insert({
        user_id: user.id,
        jd_text: text,
        title: title || "Untitled Position",
        company: company || "Unknown Company",
        is_active: true,
        source: "paste",
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to save JD to job_targets:", error);
      return;
    }

    if (data) {
      useAppStore.getState().setActiveJobTarget(data as JobTarget);
    }
  } catch (err) {
    console.error("saveJdToJobTarget error:", err);
  }
}

export function JdUploadOrPaste({
  value,
  onChange,
  activeJobTarget,
  compact = false,
  label = "Job Description",
  autoSave = false,
}: JdUploadOrPasteProps) {
  const [mode, setMode] = useState<"prefilled" | "input">(
    value || activeJobTarget?.jd_text ? "prefilled" : "input"
  );
  const [saving, setSaving] = useState(false);

  // Determine effective text
  const effectiveText = value || activeJobTarget?.jd_text || "";
  const hasPrefill = effectiveText.length > 0;

  const currentMode =
    hasPrefill && mode !== "input" ? "prefilled" : mode;

  const handleSwitchToEdit = useCallback(() => {
    setMode("input");
  }, []);

  const handleSave = useCallback(async () => {
    if (!value.trim() || !autoSave) return;
    setSaving(true);
    try {
      await saveJdToJobTarget(value, "", "");
    } finally {
      setSaving(false);
    }
  }, [value, autoSave]);

  // --- Prefilled badge ---
  if (currentMode === "prefilled" && hasPrefill) {
    const titleLine = [activeJobTarget?.title, activeJobTarget?.company]
      .filter(Boolean)
      .join(" at ");

    return (
      <div className="space-y-1">
        {!compact && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
          <Check className="h-4 w-4 text-blue-600 shrink-0" />
          <span className="text-sm text-blue-800 truncate flex-1">
            Targeting{titleLine ? `: ${titleLine}` : " saved job description"}
          </span>
          <button
            type="button"
            onClick={handleSwitchToEdit}
            className="text-sm font-medium text-blue-700 hover:text-blue-900 min-h-[44px] flex items-center"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  // --- Input mode ---
  return (
    <div className="space-y-2">
      {!compact && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the job description or job URL here..."
        rows={compact ? 4 : 8}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
      />

      <div className="flex items-center gap-3">
        {hasPrefill && currentMode === "input" && (
          <button
            type="button"
            onClick={() => {
              // Restore the prefill value if user cancels editing
              if (activeJobTarget?.jd_text && !value) {
                onChange(activeJobTarget.jd_text);
              }
              setMode("prefilled");
            }}
            className="text-sm text-gray-500 hover:text-gray-700 min-h-[44px] flex items-center gap-1"
          >
            <ChevronDown className="h-3.5 w-3.5 rotate-90" />
            Back to saved
          </button>
        )}
        {autoSave && value.trim() && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="text-sm text-blue-600 hover:text-blue-800 min-h-[44px] flex items-center gap-1 disabled:opacity-50"
          >
            <Briefcase className="h-3.5 w-3.5" />
            {saving ? "Saving…" : "Save as job target"}
          </button>
        )}
      </div>
    </div>
  );
}
