"use client";

import { useEffect, useMemo, useState } from "react";
import { isEnabled, EXPERIMENTS } from "@/lib/ab-testing";

/**
 * Returns whether Wave 2 journey UX should be enabled.
 * - Controlled by PostHog feature flag when available.
 * - Falls back to env value for local/dev control.
 */
export function useWave2JourneyFlow(): boolean {
  const envDefault = useMemo(() => {
    if (typeof process === "undefined") return true;
    return process.env.NEXT_PUBLIC_WAVE2_JOURNEY_FLOW !== "false";
  }, []);

  const [enabled, setEnabled] = useState<boolean>(envDefault);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const remoteEnabled = await isEnabled(EXPERIMENTS.WAVE2_JOURNEY_FLOW);
      if (!mounted) return;
      // If PostHog is unavailable, keep env default behavior.
      setEnabled(remoteEnabled || envDefault);
    })();
    return () => {
      mounted = false;
    };
  }, [envDefault]);

  return enabled;
}
