"use client";

import { useEffect, useMemo, useState } from "react";
import { isEnabled, EXPERIMENTS } from "@/lib/ab-testing";
import { EVENTS, track } from "@/lib/analytics";

/**
 * Returns whether Wave 3 command center UX should be enabled.
 * - Controlled by PostHog feature flag when available.
 * - Falls back to env value for local/dev control.
 */
export function useWave3CommandCenter(): boolean {
  const envDefault = useMemo(() => {
    if (typeof process === "undefined") return false;
    return process.env.NEXT_PUBLIC_WAVE3_COMMAND_CENTER === "true";
  }, []);

  const [enabled, setEnabled] = useState<boolean>(envDefault);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const remoteEnabled = await isEnabled(EXPERIMENTS.WAVE3_COMMAND_CENTER);
      if (!mounted) return;

      // Remote flag controls rollout; env default allows local override.
      const resolved = remoteEnabled || envDefault;
      setEnabled(resolved);
      track(EVENTS.W3_FLAG_EXPOSURE, {
        flag_key: EXPERIMENTS.WAVE3_COMMAND_CENTER,
        enabled: resolved,
      });
      track(EVENTS.W3_VARIANT_ASSIGNED, {
        flag_key: EXPERIMENTS.WAVE3_COMMAND_CENTER,
        variant: resolved ? "enabled" : "disabled",
      });
    })();

    return () => {
      mounted = false;
    };
  }, [envDefault]);

  return enabled;
}
