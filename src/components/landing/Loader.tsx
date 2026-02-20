"use client";

import { useEffect, useState, useRef } from "react";
import { Check, Loader2 } from "lucide-react";

const STEP_DURATION_MS = 435;

interface LoaderProps {
  steps: string[];
  onComplete: () => void;
}

export function Loader({ steps, onComplete }: LoaderProps) {
  const [completedIndex, setCompletedIndex] = useState(-1);
  const [celebrating, setCelebrating] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const allDone = completedIndex >= steps.length - 1;
  const progress = steps.length > 0
    ? Math.max(0, ((completedIndex + 1) / steps.length) * 100)
    : 0;

  useEffect(() => {
    if (allDone) {
      setCelebrating(true);
      const t = setTimeout(() => onCompleteRef.current(), 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(
      () => setCompletedIndex((i) => Math.min(i + 1, steps.length - 1)),
      STEP_DURATION_MS
    );
    return () => clearTimeout(t);
  }, [completedIndex, steps.length, allDone]);

  return (
    <div className={`w-full max-w-md mx-auto py-12 px-4${celebrating ? " celebrate" : ""}`}>
      <div className="glass-card p-6 sm:p-8 space-y-5">
        {/* Shimmer progress bar */}
        <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 ease-out${!allDone ? " shimmer" : ""}`}
            style={{ width: `${progress}%` }}
          />
        </div>

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
    </div>
  );
}
