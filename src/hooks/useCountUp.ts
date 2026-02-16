"use client";

import { useEffect, useState } from "react";

/**
 * Animates a number from 0 to the target value.
 * Returns the current animated value.
 */
export function useCountUp(
  target: number,
  options?: {
    duration?: number;
    delay?: number;
    enabled?: boolean;
  }
): number {
  const { duration = 1200, delay = 0, enabled = true } = options || {};
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled || target <= 0) {
      setValue(target);
      return;
    }

    let animFrame: number;
    let startTime: number | null = null;

    const delayTimer = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic for a satisfying deceleration
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));

        if (progress < 1) {
          animFrame = requestAnimationFrame(animate);
        }
      };

      animFrame = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(delayTimer);
      cancelAnimationFrame(animFrame);
    };
  }, [target, duration, delay, enabled]);

  return value;
}
