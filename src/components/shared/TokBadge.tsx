"use client";

import { Coins } from "lucide-react";
import { useAppStore } from "@/stores/app-store";

export function TokBadge() {
  const { tokenBalance, dailyCreditsBalance, tokenAnimating, tokensLoaded } = useAppStore();

  const totalBalance = tokenBalance + dailyCreditsBalance;
  const color =
    totalBalance > 10
      ? "text-green-600 bg-green-50"
      : totalBalance > 4
        ? "text-amber-600 bg-amber-50"
        : "text-red-600 bg-red-50";

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium transition-transform duration-600 ${color} ${
        tokenAnimating ? "scale-110" : "scale-100"
      }`}
    >
      <Coins className="w-4 h-4" />
      {!tokensLoaded ? (
        <span className="inline-block w-8 h-4 bg-current opacity-10 rounded animate-pulse" />
      ) : dailyCreditsBalance > 0 && tokenBalance > 0 ? (
        <span className="tabular-nums">
          <span style={{ transition: "all 300ms ease" }}>{tokenBalance}</span>
          <span className="text-xs opacity-60 mx-0.5">+</span>
          <span className="text-xs opacity-70">{dailyCreditsBalance}</span>
        </span>
      ) : dailyCreditsBalance > 0 ? (
        <span className="tabular-nums">
          <span className="text-xs opacity-70">{dailyCreditsBalance} daily</span>
        </span>
      ) : (
        <span className="tabular-nums" style={{ transition: "all 300ms ease" }}>{tokenBalance}</span>
      )}
    </div>
  );
}
