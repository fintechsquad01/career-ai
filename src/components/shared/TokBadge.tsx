"use client";

import { Coins } from "lucide-react";
import { useAppStore } from "@/stores/app-store";

export function TokBadge() {
  const tokenBalance = useAppStore((s) => s.tokenBalance);
  const dailyCreditsBalance = useAppStore((s) => s.dailyCreditsBalance);
  const tokenAnimating = useAppStore((s) => s.tokenAnimating);
  const tokensLoaded = useAppStore((s) => s.tokensLoaded);

  const totalBalance = tokenBalance + dailyCreditsBalance;
  const color =
    totalBalance > 10
      ? "text-green-700 bg-green-50 border border-green-200"
      : totalBalance > 4
        ? "text-amber-700 bg-amber-50 border border-amber-200"
        : "text-red-700 bg-red-50 border border-red-200";

  const showSplit = tokensLoaded && dailyCreditsBalance > 0 && tokenBalance > 0;
  const showDailyOnly = tokensLoaded && dailyCreditsBalance > 0 && tokenBalance === 0;
  const showTokenOnly = tokensLoaded && (dailyCreditsBalance === 0 || tokenBalance > 0);

  return (
    <div
      className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-2.5 sm:py-1 rounded-full text-[13px] sm:text-sm font-semibold tabular-nums leading-none transition-transform duration-600 ${color} ${
        tokenAnimating ? "scale-110" : "scale-100"
      }`}
    >
      <Coins className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
      {!tokensLoaded && <span>0 tokens</span>}
      {showSplit && (
        <span>
          <span style={{ transition: "all 300ms ease" }}>{tokenBalance}</span>
          <span className="text-[11px] sm:text-[10px] opacity-70 mx-0.5">+</span>
          <span className="text-[11px] sm:text-[10px] opacity-80">{dailyCreditsBalance}d</span>
        </span>
      )}
      {showDailyOnly && <span className="text-[12px] sm:text-[11px]">{dailyCreditsBalance} daily</span>}
      {showTokenOnly && !showSplit && !showDailyOnly && (
        <span style={{ transition: "all 300ms ease" }}>{tokenBalance} tokens</span>
      )}
    </div>
  );
}
