"use client";

import { useEffect } from "react";
import { EVENTS, initAnalytics, identify, resetAnalytics, track, setUserProperties } from "@/lib/analytics";
import { createClient } from "@/lib/supabase/client";
import {
  STORAGE_FALLBACK_EVENT,
  type StorageFallbackDetail,
} from "@/lib/safe-storage";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void initAnalytics();

    const supabase = createClient();

    // Identify user if logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        identify(session.user.id, {
          email: session.user.email,
          created_at: session.user.created_at,
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        identify(session.user.id, {
          email: session.user.email,
        });

        const createdAt = new Date(session.user.created_at).getTime();
        const isNewUser = Date.now() - createdAt < 60_000;
        if (isNewUser) {
          const method = session.user.app_metadata?.provider === "google" ? "google" : "email";
          track(EVENTS.SIGNUP_COMPLETE, { method });
        }

        supabase
          .from("profiles")
          .select("token_balance, lifetime_deal, total_tokens_purchased")
          .eq("id", session.user.id)
          .maybeSingle()
          .then(({ data: profile }) => {
            if (!profile) return;
            const tier = profile.lifetime_deal
              ? "lifetime"
              : (profile.total_tokens_purchased ?? 0) >= 200 ? "power"
              : (profile.total_tokens_purchased ?? 0) >= 50 ? "pro"
              : (profile.total_tokens_purchased ?? 0) > 0 ? "starter"
              : "free";
            const bal = profile.token_balance ?? 0;
            const bucket = bal === 0 ? "0" : bal <= 10 ? "1-10" : bal <= 50 ? "11-50" : "51+";
            setUserProperties({ user_tier: tier, token_balance_bucket: bucket });
          });
      } else if (event === "SIGNED_OUT") {
        resetAnalytics();
      }
    });

    const handleStorageFallback = (event: Event) => {
      const customEvent = event as CustomEvent<StorageFallbackDetail>;
      const detail = customEvent.detail;
      if (!detail) return;

      track(EVENTS.SAFARI_STORAGE_FALLBACK, {
        browser: detail.browser,
        storage_kind: detail.kind,
        operation: detail.operation,
        key: detail.key,
        reason: detail.reason,
      });
    };

    window.addEventListener(STORAGE_FALLBACK_EVENT, handleStorageFallback);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener(STORAGE_FALLBACK_EVENT, handleStorageFallback);
    };
  }, []);

  return <>{children}</>;
}
