"use client";

import { useCallback, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/stores/app-store";
import { track, EVENTS } from "@/lib/analytics";
import { safeLocalStorage } from "@/lib/safe-storage";

export function useTokens() {
  const {
    tokenBalance,
    dailyCreditsBalance,
    dailyCreditsAwarded,
    setTokenBalance,
    setDailyCreditsBalance,
    setDailyCreditsAwarded,
    setTokenAnimating,
    tokenAnimating,
    tokensLoaded,
    setTokensLoaded,
  } = useAppStore();
  const supabase = createClient();
  const initChecked = useRef(false);

  // Total available balance (purchased + daily)
  const totalBalance = tokenBalance + dailyCreditsBalance;

  // Check daily credits and apply pending referral on mount (once per session)
  useEffect(() => {
    if (initChecked.current) return;
    initChecked.current = true;

    const runInitChecks = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Award daily credits and get real balance
        const res = await fetch("/api/daily-credits", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          if (data.awarded) {
            setDailyCreditsAwarded(true);
            setDailyCreditsBalance(data.daily_balance);
            setTokenBalance(data.purchased_balance);
            setTokenAnimating(true);
            setTimeout(() => setTokenAnimating(false), 600);
            track(EVENTS.DAILY_CREDITS_AWARDED, { amount: 2, daily_balance: data.daily_balance });
          } else {
            setDailyCreditsBalance(data.daily_balance);
            setTokenBalance(data.purchased_balance);
          }
          setTokensLoaded(true);
        } else {
          // Even on error, mark as loaded so we don't show shimmer forever
          setTokensLoaded(true);
        }

        // 2. Apply pending referral code from localStorage
        const pendingRef = safeLocalStorage.getItem("aiskillscore_referral_code");
        if (pendingRef) {
          try {
            const refRes = await fetch("/api/apply-referral", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ referral_code: pendingRef }),
            });
            if (refRes.ok) {
              const refData = await refRes.json();
              if (refData.applied || refData.reason === "already_referred") {
                // Remove from localStorage whether applied or already used
                safeLocalStorage.removeItem("aiskillscore_referral_code");
                // Refresh balance to pick up referral bonus tokens
                if (refData.bonuses_credited) {
                  const balRes = await supabase
                    .from("profiles")
                    .select("token_balance, daily_credits_balance")
                    .eq("id", user.id)
                    .single();
                  if (balRes.data) {
                    setTokenBalance(balRes.data.token_balance);
                    setDailyCreditsBalance(balRes.data.daily_credits_balance ?? 0);
                  }
                }
              }
              // If invalid_code or self_referral, also clear to prevent repeated calls
              if (refData.reason === "invalid_code" || refData.reason === "self_referral") {
                safeLocalStorage.removeItem("aiskillscore_referral_code");
              }
            }
          } catch {
            // Silently fail — will retry on next page load
          }
        }
      } catch {
        // Silently fail, but still mark as loaded
        setTokensLoaded(true);
      }
    };

    runInitChecks();
  }, [supabase, setDailyCreditsBalance, setDailyCreditsAwarded, setTokenBalance, setTokenAnimating, setTokensLoaded]);

  const spend = useCallback(
    async (amount: number, toolId: string, toolResultId?: string): Promise<boolean> => {
      if (totalBalance < amount) return false;

      // Optimistic update: spend daily first, then purchased
      let dailyToSpend = Math.min(dailyCreditsBalance, amount);
      let purchasedToSpend = amount - dailyToSpend;

      setDailyCreditsBalance(dailyCreditsBalance - dailyToSpend);
      setTokenBalance(tokenBalance - purchasedToSpend);
      setTokenAnimating(true);
      setTimeout(() => setTokenAnimating(false), 600);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          console.error("No authenticated user");
          // Rollback
          setDailyCreditsBalance(dailyCreditsBalance);
          setTokenBalance(tokenBalance);
          return false;
        }

        const { error } = await supabase.rpc("spend_tokens", {
          p_user_id: user.id,
          p_amount: amount,
          p_tool_id: toolId,
          p_tool_result_id: toolResultId || "",
        });

        if (error) {
          // Rollback
          setDailyCreditsBalance(dailyCreditsBalance);
          setTokenBalance(tokenBalance);
          return false;
        }
        return true;
      } catch {
        // Rollback
        setDailyCreditsBalance(dailyCreditsBalance);
        setTokenBalance(tokenBalance);
        return false;
      }
    },
    [totalBalance, dailyCreditsBalance, tokenBalance, setDailyCreditsBalance, setTokenBalance, setTokenAnimating, supabase]
  );

  const add = useCallback(
    async (amount: number) => {
      setTokenBalance(tokenBalance + amount);
      setTokenAnimating(true);
      setTimeout(() => setTokenAnimating(false), 600);
    },
    [tokenBalance, setTokenBalance, setTokenAnimating]
  );

  const refreshBalance = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("token_balance, daily_credits_balance")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setTokenBalance(data.token_balance);
        setDailyCreditsBalance(data.daily_credits_balance ?? 0);
        setTokenAnimating(true);
        setTimeout(() => setTokenAnimating(false), 600);
      }
    } catch {
      // Silently fail — balance will refresh on next page load
    }
  }, [supabase, setTokenBalance, setDailyCreditsBalance, setTokenAnimating]);

  return {
    balance: totalBalance,
    purchasedBalance: tokenBalance,
    dailyBalance: dailyCreditsBalance,
    dailyCreditsAwarded,
    tokensLoaded,
    spend,
    add,
    refreshBalance,
    animating: tokenAnimating,
  };
}
