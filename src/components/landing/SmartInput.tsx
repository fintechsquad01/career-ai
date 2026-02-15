"use client";

import { useState, useRef } from "react";
import { Link as LinkIcon, Crosshair, FileText, ArrowRight } from "lucide-react";
import { useSmartInput } from "@/hooks/useSmartInput";
import { parseFile, isResumeFile } from "@/lib/file-parser";
import type { InputType } from "@/lib/detect-input";

const BADGE_CONFIG: Record<string, { color: string; icon: typeof LinkIcon; label: string }> = {
  url: { color: "bg-blue-100 text-blue-700", icon: LinkIcon, label: "Job URL detected" },
  jd: { color: "bg-blue-100 text-blue-700", icon: Crosshair, label: "Job description detected" },
  resume: { color: "bg-violet-100 text-violet-700", icon: FileText, label: "Resume detected" },
};

const CTA_CONFIG: Record<string, { text: string; color: string }> = {
  url: { text: "Analyze This Job", color: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20" },
  jd: { text: "See How You Match", color: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20" },
  resume: { text: "X-Ray My Resume", color: "bg-violet-600 hover:bg-violet-700 shadow-violet-600/20" },
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
        className="glass-card overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:shadow-lg transition-all duration-300"
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("ring-2", "ring-blue-400"); }}
        onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove("ring-2", "ring-blue-400"); }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("ring-2", "ring-blue-400");
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
      >
        {/* Textarea */}
        <div className="px-4 pt-4 pb-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"Paste anything here...\n\n• A job description you\u2019re considering\n• A LinkedIn/Greenhouse/Indeed job URL\n• Your resume text"}
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
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.color} animate-in fade-in duration-200`}>
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
              className={`w-full py-3 px-4 rounded-xl text-sm font-semibold text-white shadow-lg transition-all min-h-[48px] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${
                cta?.color || "bg-gray-400"
              }`}
            >
              {cta?.text || "Analyzing..."}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Privacy line */}
      <p className="mt-4 text-center text-xs text-gray-400">
        Encrypted · Never sold · 30 second analysis
      </p>
    </div>
  );
}
