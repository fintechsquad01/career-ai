"use client";

/**
 * Dual-track analytics: PostHog (product) + GA4 (acquisition/marketing).
 * Falls back to no-ops when either provider is not configured.
 */

type Properties = Record<string, string | number | boolean | null | undefined>;

const GA_MEASUREMENT_ID = "G-QH29WYDDEV";

/**
 * Maps PostHog event names to GA4 recommended event names where applicable.
 * Unmapped events pass through as custom events.
 */
const GA4_EVENT_MAP: Record<string, string> = {
  signup_complete: "sign_up",
  token_purchase: "purchase",
  paywall_shown: "view_promotion",
  landing_analyze: "generate_lead",
  share_created: "share",
  affiliate_click: "select_promotion",
};

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

function gtagEvent(eventName: string, params?: Properties) {
  if (typeof window === "undefined" || !window.gtag) return;
  const clean: Record<string, string | number | boolean> = {};
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v != null) clean[k] = v;
    }
  }
  window.gtag("event", eventName, clean);
}

/** Track a custom event — sends to both PostHog and GA4 */
export function track(event: string, properties?: Properties) {
  posthogInstance?.capture(event, properties);

  const ga4Event = GA4_EVENT_MAP[event] ?? event;
  gtagEvent(ga4Event, properties);
}

/** Identify a user after login/signup — sends to both PostHog and GA4 */
export function identify(userId: string, properties?: Properties) {
  posthogInstance?.identify(userId, properties);

  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_MEASUREMENT_ID, { user_id: userId });
  }
}

/** Set GA4 user properties (user-scoped custom dimensions) */
export function setUserProperties(properties: Properties) {
  if (typeof window !== "undefined" && window.gtag) {
    const clean: Record<string, string | number | boolean> = {};
    for (const [k, v] of Object.entries(properties)) {
      if (v != null) clean[k] = v;
    }
    window.gtag("set", "user_properties", clean);
  }
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
  RESUME_INPUT_SOURCE_SELECTED: "resume_input_source_selected",
  RESUME_INPUT_TARGET_SWITCHED: "resume_input_target_switched",
  RESUME_OPTIMIZE_SUBMITTED: "resume_optimize_submitted",
  DASHBOARD_NEXT_ACTION_VIEWED: "dashboard_next_action_viewed",
  DASHBOARD_NEXT_ACTION_CLICKED: "dashboard_next_action_clicked",
  DASHBOARD_RESUME_MISSION_CLICKED: "dashboard_resume_mission_clicked",
  TOOL_PRIMARY_ACTION_VIEWED: "tool_primary_action_viewed",
  TOOL_PRIMARY_ACTION_CLICKED: "tool_primary_action_clicked",
  TOOL_DETAIL_EXPANDED: "tool_detail_expanded",
  NAV_ITEM_CLICKED: "nav_item_clicked",
  NAV_HISTORY_QUICK_OPENED: "nav_history_quick_opened",
  NAV_TARGET_SWITCH_OPENED: "nav_target_switch_opened",
  W3_FLAG_EXPOSURE: "w3_flag_exposure",
  W3_VARIANT_ASSIGNED: "w3_variant_assigned",
  RUN_TOOL_RESULT_META_NORMALIZED: "run_tool_result_meta_normalized",
  RUN_TOOL_RESULT_META_MISSING_FALLBACK: "run_tool_result_meta_missing_fallback",
  RUN_TOOL_OUTPUT_COMPLETENESS_CHECKED: "run_tool_output_completeness_checked",
  SAFARI_STORAGE_FALLBACK: "safari_storage_fallback",
} as const;

/**
 * KPI governance mapping (docs/BRAND_QA_SCORECARD.md):
 * - Brand CTA CTR: landing_analyze / landing_variant_view
 * - Visitor-to-signup conversion: signup_complete / landing_variant_view
 * - Tool completion rate: tool_complete / tool_run
 */
