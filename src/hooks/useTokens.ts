"use client";

import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/stores/app-store";

export function useTokens() {
  const { tokenBalance, setTokenBalance, setTokenAnimating } = useAppStore();
  const supabase = createClient();

  const spend = useCallback(
    async (amount: number, toolId: string, toolResultId?: string): Promise<boolean> => {
      if (tokenBalance < amount) return false;

      // Optimistic update
      setTokenBalance(tokenBalance - amount);
      setTokenAnimating(true);
      setTimeout(() => setTokenAnimating(false), 600);

      try {
        const { error } = await supabase.rpc("spend_tokens", {
          p_user_id: (await supabase.auth.getUser()).data.user!.id,
          p_amount: amount,
          p_tool_id: toolId,
          p_tool_result_id: toolResultId || "",
        });

        if (error) {
          // Rollback
          setTokenBalance(tokenBalance);
          return false;
        }
        return true;
      } catch {
        setTokenBalance(tokenBalance);
        return false;
      }
    },
    [tokenBalance, setTokenBalance, setTokenAnimating, supabase]
  );

  const add = useCallback(
    async (amount: number) => {
      setTokenBalance(tokenBalance + amount);
      setTokenAnimating(true);
      setTimeout(() => setTokenAnimating(false), 600);
    },
    [tokenBalance, setTokenBalance, setTokenAnimating]
  );

  return { balance: tokenBalance, spend, add, animating: useAppStore((s) => s.tokenAnimating) };
}
