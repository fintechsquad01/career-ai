import { track } from "@/lib/analytics";

/**
 * Affiliate link configuration.
 * Maps platform names to affiliate base URLs and metadata.
 *
 * URL patterns use {query} as a placeholder for the search term.
 * When no affiliate program is active, links go to the platform's search.
 */

export interface AffiliateConfig {
  /** Base URL for affiliate link (with {query} placeholder for search) */
  url: string;
  /** Display name for the platform */
  displayName: string;
  /** Affiliate network or program name */
  network: string;
  /** Commission rate description */
  commission: string;
  /** Whether the affiliate link is active (vs just a direct link) */
  isAffiliate: boolean;
}

const AFFILIATE_TAG = process.env.NEXT_PUBLIC_AFFILIATE_TAG || "careerai";

/**
 * Platform affiliate configuration map.
 * To activate affiliate links, set the environment variable NEXT_PUBLIC_AFFILIATE_TAG
 * and configure each platform's affiliate program.
 */
export const AFFILIATE_PLATFORMS: Record<string, AffiliateConfig> = {
  // Course platforms
  coursera: {
    url: `https://www.coursera.org/search?query={query}&utm_source=${AFFILIATE_TAG}&utm_medium=referral`,
    displayName: "Coursera",
    network: "Impact",
    commission: "15-45%",
    isAffiliate: true,
  },
  udemy: {
    url: `https://www.udemy.com/courses/search/?q={query}&src=${AFFILIATE_TAG}`,
    displayName: "Udemy",
    network: "Rakuten",
    commission: "10-15%",
    isAffiliate: true,
  },
  linkedin_learning: {
    url: `https://www.linkedin.com/learning/search?keywords={query}&trk=${AFFILIATE_TAG}`,
    displayName: "LinkedIn Learning",
    network: "LinkedIn",
    commission: "10-35%",
    isAffiliate: true,
  },
  freecodecamp: {
    url: "https://www.freecodecamp.org/learn",
    displayName: "freeCodeCamp",
    network: "none",
    commission: "N/A",
    isAffiliate: false,
  },
  pluralsight: {
    url: `https://www.pluralsight.com/search?q={query}&utm_source=${AFFILIATE_TAG}`,
    displayName: "Pluralsight",
    network: "Impact",
    commission: "15-20%",
    isAffiliate: true,
  },
  edx: {
    url: `https://www.edx.org/search?q={query}&utm_source=${AFFILIATE_TAG}`,
    displayName: "edX",
    network: "Impact",
    commission: "10-15%",
    isAffiliate: true,
  },

  // Freelance platforms
  upwork: {
    url: `https://www.upwork.com/freelance-jobs/{query}/`,
    displayName: "Upwork",
    network: "direct",
    commission: "N/A",
    isAffiliate: false,
  },
  fiverr: {
    url: `https://www.fiverr.com/search/gigs?query={query}&source=${AFFILIATE_TAG}`,
    displayName: "Fiverr",
    network: "Fiverr Affiliates",
    commission: "$15-150 CPA",
    isAffiliate: true,
  },
  toptal: {
    url: `https://www.toptal.com/${AFFILIATE_TAG}`,
    displayName: "Toptal",
    network: "Direct",
    commission: "$2,000-5,000 CPA",
    isAffiliate: true,
  },

  // Tool platforms (entrepreneurship recommendations)
  stripe: {
    url: `https://stripe.com/?ref=${AFFILIATE_TAG}`,
    displayName: "Stripe",
    network: "Stripe Partner",
    commission: "varies",
    isAffiliate: true,
  },
  shopify: {
    url: `https://www.shopify.com/?ref=${AFFILIATE_TAG}`,
    displayName: "Shopify",
    network: "Shopify Affiliate",
    commission: "varies",
    isAffiliate: true,
  },
  notion: {
    url: `https://www.notion.so/?r=${AFFILIATE_TAG}`,
    displayName: "Notion",
    network: "Direct",
    commission: "50% first year",
    isAffiliate: true,
  },
  canva: {
    url: `https://partner.canva.com/${AFFILIATE_TAG}`,
    displayName: "Canva",
    network: "Impact",
    commission: "15-80%",
    isAffiliate: true,
  },

  // Salary data platforms
  levels_fyi: {
    url: "https://www.levels.fyi/",
    displayName: "Levels.fyi",
    network: "none",
    commission: "N/A",
    isAffiliate: false,
  },
  glassdoor: {
    url: `https://www.glassdoor.com/Salaries/index.htm?utm_source=${AFFILIATE_TAG}`,
    displayName: "Glassdoor",
    network: "none",
    commission: "N/A",
    isAffiliate: false,
  },
  payscale: {
    url: `https://www.payscale.com/?utm_source=${AFFILIATE_TAG}`,
    displayName: "Payscale",
    network: "none",
    commission: "N/A",
    isAffiliate: false,
  },
};

/**
 * Resolve an affiliate URL for a given platform and optional search query.
 * Falls back to a generic search URL if platform is not configured.
 */
export function getAffiliateUrl(platform: string, query?: string): string {
  // Normalize platform name
  const key = platform
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

  const config = AFFILIATE_PLATFORMS[key];
  if (!config) {
    // Fallback: Google search for the platform + query
    const searchQuery = query ? `${platform} ${query}` : platform;
    return `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
  }

  const url = query
    ? config.url.replace("{query}", encodeURIComponent(query))
    : config.url.replace("?query={query}", "").replace("?q={query}", "").replace("/{query}/", "/");

  return url;
}

/**
 * Resolve a course URL from provider name and course name/hint.
 * The url_hint field from AI output is used as a search query.
 */
export function getCourseUrl(provider: string, courseName: string, urlHint?: string): string {
  const searchQuery = urlHint || courseName;
  return getAffiliateUrl(provider, searchQuery);
}

/**
 * Track an affiliate link click for revenue attribution.
 */
export function trackAffiliateClick(platform: string, toolId: string, context?: string) {
  track("affiliate_click", {
    platform,
    tool_id: toolId,
    context: context ?? "",
    is_affiliate: AFFILIATE_PLATFORMS[platform.toLowerCase().replace(/\s+/g, "_")]?.isAffiliate ? "true" : "false",
  });
}
