"use client";

import { Download, AlertCircle } from "lucide-react";
import { ReportFlow } from "@/components/shared/ReportStructure";
import type { THeadshotsResult, ToolResult } from "@/types";

interface HeadshotsResultsProps {
  result: ToolResult | null;
}

export function HeadshotsResults({ result }: HeadshotsResultsProps) {
  const data = result as THeadshotsResult | null;

  if (!data) {
    return (
      <div className="text-center py-12 space-y-3">
        <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
        <p className="text-gray-500 text-sm">We couldn&apos;t generate results this time. This is usually temporary — try again in a moment.</p>
      </div>
    );
  }

  const images = data.images ?? [];

  return (
    <ReportFlow
      summary={
        <div className="surface-card-hero p-4">
          <p className="text-sm font-medium text-gray-900">
            Generated headshots optimized for professional profile use.
          </p>
        </div>
      }
      evidence={
        <div className="report-section">
        <h3 className="font-semibold text-gray-900 mb-4">Your AI Headshots</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {images.length > 0 ? (
          images.map((img, i) => (
            <div key={img.id ?? i} className="space-y-2">
              <div className="aspect-square rounded-xl bg-gray-100 overflow-hidden">
                <img
                  src={img.url}
                  alt={`Headshot ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{img.style}</span>
                <a
                  href={img.url}
                  download={`headshot-${i + 1}.jpg`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 min-h-[44px]"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          ))
        ) : (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center">
                <span className="text-4xl text-gray-300">?</span>
              </div>
              <button
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 min-h-[44px]"
                disabled
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          ))
        )}
        </div>
        </div>
      }
      nextStep={
        <div className="surface-card-soft p-4 text-sm text-gray-700">
          Next Step: update your LinkedIn profile and resume with one consistent photo.
        </div>
      }
    />
  );
}
