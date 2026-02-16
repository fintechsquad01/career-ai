"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ScoreDeltaProps {
  delta: number;
  size?: "sm" | "md";
  showIcon?: boolean;
}

/**
 * Badge component showing score change: "+15" (green) or "-8" (red).
 */
export function ScoreDelta({ delta, size = "sm", showIcon = true }: ScoreDeltaProps) {
  if (delta === 0) {
    return (
      <span className={`inline-flex items-center gap-0.5 text-gray-400 font-medium ${
        size === "sm" ? "text-[10px]" : "text-xs"
      }`}>
        {showIcon && <Minus className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />}
        0
      </span>
    );
  }

  const isPositive = delta > 0;

  return (
    <span
      className={`inline-flex items-center gap-0.5 font-bold ${
        isPositive ? "text-green-600" : "text-red-500"
      } ${size === "sm" ? "text-[10px]" : "text-xs"}`}
    >
      {showIcon && (
        isPositive
          ? <TrendingUp className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
          : <TrendingDown className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      )}
      {isPositive ? "+" : ""}{delta}
    </span>
  );
}
