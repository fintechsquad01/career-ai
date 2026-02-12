"use client";

import { useEffect } from "react";
import { initAnalytics, identify, resetAnalytics } from "@/lib/analytics";
import { createClient } from "@/lib/supabase/client";

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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
