"use client";

import { useState, useEffect } from "react";
import { getVariant } from "@/lib/ab-testing";
import { track } from "@/lib/analytics";

/**
 * Hook to get an A/B test variant and track exposure.
 *
 * Usage:
 * ```
 * const variant = useExperiment("hero-headline", "control");
 * if (variant === "displacement") { ... }
 * ```
 */
export function useExperiment(
  flagKey: string,
  fallback: string = "control"
): string {
  const [variant, setVariant] = useState(fallback);

  useEffect(() => {
    let mounted = true;

    async function resolve() {
      const v = await getVariant(flagKey, fallback);
      if (mounted) {
        setVariant(v);
        // Track experiment exposure
        track("ab_experiment_viewed", { experiment: flagKey, variant: v });
      }
    }

    resolve();

    return () => {
      mounted = false;
    };
  }, [flagKey, fallback]);

  return variant;
}
