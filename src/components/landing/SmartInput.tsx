"use client";

import { useState, useRef } from "react";
import { Link as LinkIcon, Crosshair, FileText, ArrowRight } from "lucide-react";
import { useSmartInput } from "@/hooks/useSmartInput";
import { parseFile, isResumeFile } from "@/lib/file-parser";
import { CANONICAL_COPY } from "@/lib/constants";
import type { InputType } from "@/lib/detect-input";

const BADGE_CONFIG: Record<string, { color: string; icon: typeof LinkIcon; label: string }> = {
  url: { color: "ui-badge ui-badge-blue", icon: LinkIcon, label: "Job URL detected" },
  jd: { color: "ui-badge ui-badge-blue", icon: Crosshair, label: "Job description detected" },
  resume: { color: "ui-badge ui-badge-amber", icon: FileText, label: "Resume detected" },
};

const CTA_CONFIG: Record<string, { text: string }> = {
  url: { text: "Run Job Match Score" },
  jd: { text: "Run Job Match Score" },
  resume: { text: "Optimize Resume First" },
};

interface SmartInputProps {
  onAnalyze?: (text: string, type: InputType) => void;
}

export function SmartInput({ onAnalyze }: SmartInputProps) {
  const { text, setText, detectedType, clear } = useSmartInput();
  const [fileError, setFileError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setFileError("");
    try {
      if (!isResumeFile(file)) {
        setFileError("Please upload a PDF, DOCX, or TXT file.");
        return;
      }
      const result = await parseFile(file);
      setText(result.text);
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "Failed to read file");
    }
  };

  const badge = detectedType ? BADGE_CONFIG[detectedType] : null;
  const cta = detectedType ? CTA_CONFIG[detectedType] : null;

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className="surface-card overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:shadow-lg transition-all duration-300"
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("ring-2", "ring-blue-400"); }}
        onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove("ring-2", "ring-blue-400"); }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("ring-2", "ring-blue-400");
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
      >
        {/* Label */}
        <div className="px-4 pt-4 pb-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Paste Job Description or Job URL</p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"Paste a job description or job URL (LinkedIn, Greenhouse, Indeed)"}
            rows={text ? 6 : 3}
            aria-label="Paste a job description, job URL, or resume text"
            className="w-full resize-none text-sm text-gray-900 placeholder-gray-400 focus:outline-none min-h-[80px]"
          />
        </div>

        {/* Bottom bar */}
        <div className="px-4 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Detection badge */}
            {badge && (
              <div className={`inline-flex items-center gap-2 ${badge.color} animate-in fade-in duration-200`}>
                <badge.icon className="w-3 h-3" />
                {badge.label}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {text && (
              <button onClick={clear} className="text-xs text-gray-400 hover:text-gray-600 min-h-[44px] px-2 flex items-center">
                Clear
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              aria-label="Upload resume file"
              className="hidden"
            />
            {!text && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-gray-400 hover:text-blue-600 transition-colors min-h-[44px] px-2 flex items-center"
              >
                or upload a file
              </button>
            )}
          </div>
        </div>

        {fileError && (
          <div className="px-4 pb-3">
            <p className="text-xs text-red-500">{fileError}</p>
          </div>
        )}

        {/* CTA */}
        {text && (
          <div className="px-4 pb-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <button
              onClick={() => onAnalyze?.(text, detectedType)}
              disabled={!detectedType}
              className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {cta?.text || "Analyzing..."}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <p className="mt-3 text-center text-xs text-gray-500 sm:hidden leading-relaxed">
        On mobile LinkedIn and can&apos;t copy the posting? Paste the job URL — we&apos;ll extract requirements.
      </p>

      <p className="mt-3 text-center text-xs text-gray-500 max-w-lg mx-auto leading-relaxed">
        No job post yet? Upload resume and start with Resume Optimizer.
      </p>

      {/* Privacy line */}
      <p className="mt-4 text-center text-xs text-gray-400">
        {CANONICAL_COPY.privacy.trustLine}
      </p>
    </div>
  );
}
