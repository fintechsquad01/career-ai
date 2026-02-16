"use client";

import type { LucideIcon } from "lucide-react";

interface ProcessStep {
  icon: LucideIcon;
  label: string;
  detail: string;
}

interface ProcessStepsProps {
  steps: ProcessStep[];
}

/** Visual 3-step "How it works" indicator for tool input screens */
export function ProcessSteps({ steps }: ProcessStepsProps) {
  return (
    <div className="flex items-start gap-2 py-1">
      {steps.map((step, i) => (
        <div key={i} className="flex-1 flex flex-col items-center text-center gap-1.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              <step.icon className="w-4 h-4 text-gray-500" />
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
              {i + 1}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700 leading-tight">{step.label}</p>
            <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{step.detail}</p>
          </div>
          {i < steps.length - 1 && (
            <div className="hidden" aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  );
}

interface SocialProofProps {
  stat: string;
  context: string;
}

/** A compact social proof banner for tool input screens */
export function SocialProof({ stat, context }: SocialProofProps) {
  return (
    <div className="flex items-center gap-2.5 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl px-3.5 py-2.5 border border-gray-100">
      <span className="text-lg font-bold text-blue-600 tabular-nums flex-shrink-0">{stat}</span>
      <span className="text-xs text-gray-500 leading-snug">{context}</span>
    </div>
  );
}

interface ResultPreviewProps {
  items: { label: string; value: string; color?: string }[];
  title?: string;
}

/** A compact preview card showing what the output looks like */
export function ResultPreview({ items, title }: ResultPreviewProps) {
  return (
    <div className="bg-gray-50/80 rounded-xl border border-dashed border-gray-200 p-3 space-y-2">
      {title && (
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
      )}
      <div className="grid grid-cols-3 gap-2">
        {items.map((item, i) => (
          <div key={i} className="text-center">
            <p className={`text-sm font-bold ${item.color || "text-gray-900"}`}>{item.value}</p>
            <p className="text-[10px] text-gray-400 leading-tight">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
