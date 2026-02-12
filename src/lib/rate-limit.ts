/**
 * Simple in-memory rate limiter for API routes.
 * Uses a sliding window approach.
 * In production, replace with Redis-backed rate limiting.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < 60000);
      if (entry.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, 300000);
}

interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  limit: number;
  /** Window size in seconds (default: 60) */
  windowSeconds?: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

/**
 * Check if a request is allowed under rate limits.
 * @param key - Unique identifier (e.g., userId, IP address)
 * @param config - Rate limit configuration
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const windowMs = (config.windowSeconds || 60) * 1000;
  const now = Date.now();

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= config.limit) {
    const oldestInWindow = entry.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      resetMs: oldestInWindow + windowMs - now,
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: config.limit - entry.timestamps.length,
    resetMs: windowMs,
  };
}

/** Pre-configured rate limits matching API.md spec */
export const RATE_LIMITS = {
  parseInput: { limit: 10, windowSeconds: 60 },
  runTool: { limit: 5, windowSeconds: 60 },
  parseUrl: { limit: 10, windowSeconds: 60 },
  captureEmail: { limit: 3, windowSeconds: 60 },
  createShare: { limit: 10, windowSeconds: 60 },
} as const;
