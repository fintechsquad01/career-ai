import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

  return {
    rules: [
      // Default: allow all crawlers
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/callback", "/dashboard", "/settings", "/history", "/referral", "/mission"],
      },
      // Explicitly allow AI search crawlers for GEO (Generative Engine Optimization)
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/api/", "/auth/callback", "/dashboard", "/settings", "/history", "/referral", "/mission"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/api/", "/auth/callback", "/dashboard", "/settings", "/history", "/referral", "/mission"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/api/", "/auth/callback", "/dashboard", "/settings", "/history", "/referral", "/mission"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/api/", "/auth/callback", "/dashboard", "/settings", "/history", "/referral", "/mission"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
      },
      // Block known training-only bots that don't drive search traffic
      {
        userAgent: "CCBot",
        disallow: ["/"],
      },
      {
        userAgent: "Bytespider",
        disallow: ["/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
