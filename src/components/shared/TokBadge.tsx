"use client";

import { Coins } from "lucide-react";
import { useAppStore } from "@/stores/app-store";

export function TokBadge() {
  const { tokenBalance, tokenAnimating } = useAppStore();

  const color =
    tokenBalance > 10
      ? "text-green-600 bg-green-50"
      : tokenBalance > 4
        ? "text-amber-600 bg-amber-50"
        : "text-red-600 bg-red-50";

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium transition-transform duration-600 ${color} ${
        tokenAnimating ? "scale-110" : "scale-100"
      }`}
    >
      <Coins className="w-4 h-4" />
      <span>{tokenBalance}</span>
    </div>
  );
}
