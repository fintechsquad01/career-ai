"use client";

/**
 * Analytics utilities for PostHog integration.
 * Falls back to no-ops when PostHog is not configured.
 */

type Properties = Record<string, string | number | boolean | null | undefined>;

let posthogInstance: {
  capture: (event: string, properties?: Properties) => void;
  identify: (userId: string, properties?: Properties) => void;
  reset: () => void;
} | null = null;

/**
 * Initialize PostHog client. Call once in your app layout.
 * Safe to call without env vars — becomes a no-op.
 */
export async function initAnalytics() {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  if (!apiKey || typeof window === "undefined") return;

  try {
    const posthog = (await import("posthog-js")).default;
    posthog.init(apiKey, {
      api_host: apiHost,
      capture_pageview: true,
      capture_pageleave: true,
      persistence: "localStorage+cookie",
      loaded: (ph) => {
        posthogInstance = ph;
      },
    });
    posthogInstance = posthog;
  } catch {
    // PostHog not installed or failed to load
  }
}

/** Track a custom event */
export function track(event: string, properties?: Properties) {
  posthogInstance?.capture(event, properties);
}

/** Identify a user after login/signup */
export function identify(userId: string, properties?: Properties) {
  posthogInstance?.identify(userId, properties);
}

/** Reset analytics on logout */
export function resetAnalytics() {
  posthogInstance?.reset();
}

// Pre-defined event names for type safety
export const EVENTS = {
  TOOL_RUN: "tool_run",
  TOOL_COMPLETE: "tool_complete",
  TOKEN_PURCHASE: "token_purchase",
  PAYWALL_SHOWN: "paywall_shown",
  SHARE_CREATED: "share_created",
  LANDING_ANALYZE: "landing_analyze",
  SIGNUP_START: "signup_start",
  SIGNUP_COMPLETE: "signup_complete",
  MISSION_START: "mission_start",
  MISSION_STEP_COMPLETE: "mission_step_complete",
  AFFILIATE_CLICK: "affiliate_click",
  DAILY_CREDITS_AWARDED: "daily_credits_awarded",
  NPS_SUBMITTED: "nps_submitted",
  REFERRAL_PROMPTED: "referral_prompted",
  SHARE_SCORE: "share_score",
  EMAIL_SEQUENCE_SENT: "email_sequence_sent",
  AB_EXPERIMENT_VIEWED: "ab_experiment_viewed",
  LANDING_VARIANT_VIEW: "landing_variant_view",
} as const;

/**
 * KPI governance mapping (docs/BRAND_QA_SCORECARD.md):
 * - Brand CTA CTR: landing_analyze / landing_variant_view
 * - Visitor-to-signup conversion: signup_complete / landing_variant_view
 * - Tool completion rate: tool_complete / tool_run
 */
