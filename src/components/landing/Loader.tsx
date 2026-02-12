"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

const STEP_DURATION_MS = 435;

interface LoaderProps {
  steps: string[];
  onComplete: () => void;
}

export function Loader({ steps, onComplete }: LoaderProps) {
  const [completedIndex, setCompletedIndex] = useState(-1);

  useEffect(() => {
    if (completedIndex >= steps.length - 1) {
      const t = setTimeout(onComplete, 50);
      return () => clearTimeout(t);
    }
    const t = setTimeout(
      () => setCompletedIndex((i) => Math.min(i + 1, steps.length - 1)),
      STEP_DURATION_MS
    );
    return () => clearTimeout(t);
  }, [completedIndex, steps.length, onComplete]);

  return (
    <div className="w-full max-w-md mx-auto py-12 px-4">
      <div className="space-y-4">
        {steps.map((step, i) => (
          <div
            key={step}
            className="flex items-center gap-3 text-sm text-gray-700 animate-in fade-in slide-in-from-left-2 duration-200"
          >
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              {i <= completedIndex ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              )}
            </div>
            <span className={i <= completedIndex ? "text-gray-500" : ""}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
