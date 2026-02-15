"use client";

import { useState, useRef, useCallback } from "react";
import { FileText, Upload, Check, X, ChevronDown } from "lucide-react";
import { parseFile, isResumeFile } from "@/lib/file-parser";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/stores/app-store";

interface ResumeUploadOrPasteProps {
  value: string;
  onChange: (text: string) => void;
  profileResumeText?: string | null;
  profileTitle?: string | null;
  profileCompany?: string | null;
  compact?: boolean;
  label?: string;
  autoSave?: boolean;
}

/**
 * Save (upsert) resume text to the career_profiles table and update Zustand.
 * Fire-and-forget — errors are logged but not thrown.
 */
export async function saveResumeToProfile(
  text: string,
  source: "paste" | "upload"
): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("career_profiles")
      .upsert(
        {
          user_id: user.id,
          resume_text: text,
          source,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Failed to save resume to profile:", error);
      return;
    }

    if (data) {
      const existing = useAppStore.getState().careerProfile;
      useAppStore.getState().setCareerProfile({ ...existing, ...data });
    }
  } catch (err) {
    console.error("saveResumeToProfile error:", err);
  }
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function ResumeUploadOrPaste({
  value,
  onChange,
  profileResumeText,
  profileTitle,
  profileCompany,
  compact = false,
  label = "Your Resume",
  autoSave = true,
}: ResumeUploadOrPasteProps) {
  const [mode, setMode] = useState<"prefilled" | "dropzone" | "textarea">(
    value || profileResumeText ? "prefilled" : "dropzone"
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine the effective text
  const effectiveText = value || profileResumeText || "";
  const hasPrefill = effectiveText.length > 0;

  // If value changes externally and we were in dropzone, switch to prefilled
  const currentMode =
    hasPrefill && mode === "dropzone" ? "prefilled" : mode;

  const handleFileProcess = useCallback(
    async (file: File) => {
      setError(null);

      if (!isResumeFile(file)) {
        setError("Please upload a PDF, DOCX, or TXT file.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File too large. Maximum size is 5MB.");
        return;
      }

      setParsing(true);
      try {
        const result = await parseFile(file);
        onChange(result.text);
        setMode("prefilled");

        if (autoSave) {
          void saveResumeToProfile(result.text, "upload");
        }
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to parse file. Try pasting the text instead.";
        setError(msg);
      } finally {
        setParsing(false);
      }
    },
    [onChange, autoSave]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) void handleFileProcess(file);
    },
    [handleFileProcess]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void handleFileProcess(file);
      // Reset so the same file can be re-selected
      e.target.value = "";
    },
    [handleFileProcess]
  );

  const handleSwitchToEdit = useCallback(() => {
    setMode("textarea");
    setError(null);
  }, []);

  const handleSwitchToDropzone = useCallback(() => {
    setMode("dropzone");
    setError(null);
  }, []);

  const handleClear = useCallback(() => {
    onChange("");
    setMode("dropzone");
    setError(null);
  }, [onChange]);

  // --- Prefilled badge ---
  if (currentMode === "prefilled" && hasPrefill) {
    const titleLine = [profileTitle, profileCompany]
      .filter(Boolean)
      .join(" at ");
    const words = wordCount(effectiveText);

    return (
      <div className="space-y-1">
        {!compact && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
          <Check className="h-4 w-4 text-green-600 shrink-0" />
          <span className="text-sm text-green-800 truncate flex-1">
            Using saved resume
            {titleLine ? ` — ${titleLine}` : ""}
            {words > 0 ? ` (${words} words)` : ""}
          </span>
          <button
            type="button"
            onClick={handleSwitchToEdit}
            className="text-sm font-medium text-green-700 hover:text-green-900 min-h-[44px] flex items-center"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  // --- Textarea mode ---
  if (currentMode === "textarea") {
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
          placeholder="Paste your resume text here..."
          rows={compact ? 4 : 8}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSwitchToDropzone}
            className="text-sm text-gray-500 hover:text-gray-700 min-h-[44px] flex items-center gap-1"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload file instead
          </button>
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-red-500 hover:text-red-700 min-h-[44px] flex items-center gap-1"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }

  // --- Dropzone mode (default empty state) ---
  return (
    <div className="space-y-2">
      {!compact && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`
          relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed
          px-6 py-8 cursor-pointer transition-colors min-h-[44px]
          ${isDragOver
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
          }
          ${parsing ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Upload resume file"
        />

        {parsing ? (
          <>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            <span className="text-sm text-gray-500">Extracting text…</span>
          </>
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              Drop your resume here
            </p>
            <p className="text-xs text-gray-500">PDF, DOCX, or TXT · Max 5MB</p>
          </>
        )}
      </div>

      {/* Toggle to paste */}
      <button
        type="button"
        onClick={() => setMode("textarea")}
        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 min-h-[44px]"
      >
        <ChevronDown className="h-3.5 w-3.5" />
        or paste text
      </button>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
