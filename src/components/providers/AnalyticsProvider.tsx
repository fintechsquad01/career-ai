"use client";

import { useEffect } from "react";
import { EVENTS, initAnalytics, identify, resetAnalytics, track } from "@/lib/analytics";
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
