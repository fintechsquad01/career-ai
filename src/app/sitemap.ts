import type { MetadataRoute } from "next";
import { TOOLS } from "@/lib/constants";
import { ARTICLES, COMPARISONS } from "@/lib/content";
import { ROLES } from "@/lib/roles";
import { INDUSTRY_PAGES } from "@/lib/industries";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";
  const now = new Date();

  return [
    // High priority pages
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/lifetime`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Tool pages — high value for SEO and AI citability
    ...TOOLS.map((tool) => ({
      url: `${baseUrl}/tools/${tool.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    // Blog — pillar content for topical authority
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...ARTICLES.map((article) => ({
      url: `${baseUrl}/blog/${article.slug}`,
      lastModified: new Date(article.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    // Comparison pages — high commercial intent
    {
      url: `${baseUrl}/compare`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...COMPARISONS.map((comp) => ({
      url: `${baseUrl}/compare/${comp.slug}`,
      lastModified: new Date(comp.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    // Role guides — programmatic long-tail pages
    {
      url: `${baseUrl}/roles`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...ROLES.map((role) => ({
      url: `${baseUrl}/roles/${role.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    // Industry guides — programmatic long-tail pages
    {
      url: `${baseUrl}/industries`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...INDUSTRY_PAGES.map((ind) => ({
      url: `${baseUrl}/industries/${ind.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    // Content hub pages
    {
      url: `${baseUrl}/resources`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Legal / informational
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
