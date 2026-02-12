"use client";

import { useState, useRef } from "react";
import { Link as LinkIcon, Crosshair, FileText, Sparkles, ArrowRight, X, Upload } from "lucide-react";
import { useSmartInput } from "@/hooks/useSmartInput";
import { parseFile, isResumeFile } from "@/lib/file-parser";
import type { InputType } from "@/lib/detect-input";

const DEMO_CHIPS = [
  { label: "Sample job posting", emoji: "📋", type: "jd" as const },
  { label: "LinkedIn URL", emoji: "🔗", type: "url" as const },
  { label: "Sample resume", emoji: "📄", type: "resume" as const },
];

const DEMO_DATA: Record<string, string> = {
  jd: `Product Marketing Manager — Anthropic (San Francisco, CA)\n\nAbout the Role:\nWe're looking for a Product Marketing Manager to lead go-to-market strategy for our AI products.\n\nResponsibilities:\n• Develop and execute product launch strategies\n• Create compelling product narratives and positioning\n• Conduct competitive analysis and market research\n• Collaborate with product, sales, and engineering teams\n\nRequirements:\n• 5+ years in product marketing, preferably in AI/ML or enterprise SaaS\n• Experience with B2B go-to-market strategies\n• Strong analytical skills and data-driven mindset\n• Excellent written and verbal communication\n\nPreferred Qualifications:\n• Experience in the AI industry\n• Technical background or understanding of ML concepts\n• MBA or equivalent experience\n\nSalary Range: $140,000–$180,000 + equity`,
  url: "https://www.linkedin.com/jobs/view/product-marketing-manager-at-anthropic-3847291054",
  resume: `SARAH CHEN\nsarah.chen@email.com | (415) 555-0123 | San Francisco, CA | linkedin.com/in/sarahchen\n\nPROFESSIONAL SUMMARY\nSenior Marketing Manager with 8 years of experience in B2B technology marketing.\n\nEXPERIENCE\nSenior Marketing Manager | TechCorp Inc. | 2020 – Present\n• Led marketing campaigns generating $2.5M in pipeline\n• Managed team of 4 marketing coordinators\n• Increased brand awareness by 45% through content strategy\n\nMarketing Manager | StartupXYZ | 2017 – 2020\n• Developed go-to-market strategy for 3 product launches\n• Built and managed $500K annual marketing budget\n\nEDUCATION\nB.S. Marketing, UC Berkeley, 2016\n\nSKILLS\nSEO, Content Strategy, Google Analytics, HubSpot, Salesforce, Social Media Marketing`,
};

const BADGE_CONFIG: Record<string, { color: string; icon: typeof LinkIcon; label: string }> = {
  url: { color: "bg-blue-100 text-blue-700", icon: LinkIcon, label: "Job URL detected" },
  jd: { color: "bg-blue-100 text-blue-700", icon: Crosshair, label: "Job description detected" },
  resume: { color: "bg-violet-100 text-violet-700", icon: FileText, label: "Resume detected" },
};

const CTA_CONFIG: Record<string, { text: string; color: string }> = {
  url: { text: "Analyze Job Posting", color: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20" },
  jd: { text: "Match Against Job", color: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20" },
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
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("ring-2", "ring-blue-400"); }}
        onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove("ring-2", "ring-blue-400"); }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("ring-2", "ring-blue-400");
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
      >
        {/* Demo chips */}
        {!text && (
          <div className="px-4 pt-4 flex flex-wrap gap-2">
            {DEMO_CHIPS.map((chip) => (
              <button
                key={chip.type}
                onClick={() => setText(DEMO_DATA[chip.type] || "")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <span>{chip.emoji}</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Textarea */}
        <div className="px-4 pt-3 pb-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Paste anything here...\n\n- A job description you're considering\n- A LinkedIn/Greenhouse/Indeed job URL\n- Your resume text\n\nWe auto-detect the type and analyze in 30 seconds.`}
            rows={text ? 6 : 4}
            className="w-full resize-none text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
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
              <button onClick={clear} className="text-xs text-gray-400 hover:text-gray-600">
                Clear
              </button>
            )}
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-gray-400 hover:text-blue-600 hidden sm:inline transition-colors"
              >
                or upload a file
              </button>
            </>
          </div>
        </div>

        {fileError && (
          <div className="px-4 pb-3">
            <p className="text-xs text-red-500">{fileError}</p>
          </div>
        )}

        {/* CTA */}
        {text && (
          <div className="px-4 pb-4">
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

      {/* Supported platforms + privacy */}
      <div className="mt-4 text-center space-y-2">
        <div className="flex flex-wrap justify-center gap-2">
          {["LinkedIn", "Greenhouse", "Lever", "Indeed", "Workday"].map((p) => (
            <span key={p} className="px-2 py-1 bg-white border border-gray-200 rounded-md text-[10px] text-gray-400 font-medium">
              {p}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-400">Encrypted · Never stored permanently · Your data, your control</p>
      </div>
    </div>
  );
}
