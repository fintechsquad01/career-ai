/**
 * Resolves related content links for detail pages.
 * Creates cross-type links (industry -> roles, role -> blog, compare -> alternatives)
 * to build an interconnected content web for both user navigation and SEO crawlability.
 */

import { ARTICLES, COMPARISONS, ALTERNATIVES } from "./content";
import { ROLES } from "./roles";
import { INDUSTRY_PAGES } from "./industries";

interface RelatedItem {
  title: string;
  description: string;
  href: string;
  badge?: string;
}

export function getRelatedContent(
  type: "industry" | "role" | "compare" | "alternative",
  slug: string,
): RelatedItem[] {
  switch (type) {
    case "industry": {
      const industry = INDUSTRY_PAGES.find((i) => i.slug === slug);
      if (!industry) return [];

      const roleItems = ROLES
        .filter((r) => r.industry === industry.name)
        .slice(0, 2)
        .map((r) => ({
          title: r.title,
          description: r.description.slice(0, 120) + "...",
          href: `/roles/${r.slug}`,
          badge: "Role Guide",
        }));

      const blogItem = ARTICLES
        .filter((a) => a.tags.some((t) => t.toLowerCase().includes(industry.name.toLowerCase().split(" ")[0])))
        .slice(0, 1)
        .map((a) => ({
          title: a.title,
          description: a.description.slice(0, 120) + "...",
          href: `/blog/${a.slug}`,
          badge: "Guide",
        }));

      if (blogItem.length === 0 && ARTICLES.length > 0) {
        blogItem.push({
          title: ARTICLES[0].title,
          description: ARTICLES[0].description.slice(0, 120) + "...",
          href: `/blog/${ARTICLES[0].slug}`,
          badge: "Guide",
        });
      }

      return [...roleItems, ...blogItem].slice(0, 3);
    }

    case "role": {
      const role = ROLES.find((r) => r.slug === slug);
      if (!role) return [];

      const industryItem = INDUSTRY_PAGES
        .filter((i) => i.name === role.industry || i.name.includes(role.industry.split(" ")[0]))
        .slice(0, 1)
        .map((i) => ({
          title: `${i.name} Career Guide`,
          description: `AI displacement analysis and career strategies for ${i.name}.`,
          href: `/industries/${i.slug}`,
          badge: "Industry",
        }));

      const blogItem = ARTICLES
        .filter((a) => a.tags.some((t) =>
          t.toLowerCase().includes("resume") ||
          t.toLowerCase().includes("interview") ||
          t.toLowerCase().includes(role.persona.toLowerCase().split(" ")[0]),
        ))
        .slice(0, 1)
        .map((a) => ({
          title: a.title,
          description: a.description.slice(0, 120) + "...",
          href: `/blog/${a.slug}`,
          badge: "Guide",
        }));

      const compareItem = COMPARISONS.slice(0, 1).map((c) => ({
        title: `AISkillScore vs ${c.competitor}`,
        description: c.description.slice(0, 120) + "...",
        href: `/compare/${c.slug}`,
        badge: "Compare",
      }));

      return [...industryItem, ...blogItem, ...compareItem].slice(0, 3);
    }

    case "compare": {
      const comp = COMPARISONS.find((c) => c.slug === slug);
      if (!comp) return [];

      const altSlug = `${comp.competitor.toLowerCase().replace(/[\s.]/g, "")}-alternatives`;
      const alt = ALTERNATIVES.find((a) => a.slug === altSlug || a.slug.includes(comp.competitor.toLowerCase().replace(/[\s.]/g, "")));

      const altItem = alt
        ? [{ title: alt.title, description: alt.description.slice(0, 120) + "...", href: `/alternatives/${alt.slug}`, badge: "Alternatives" }]
        : [];

      const roleItem = ROLES.slice(0, 1).map((r) => ({
        title: `${r.title} Career Guide`,
        description: r.description.slice(0, 120) + "...",
        href: `/roles/${r.slug}`,
        badge: "Role Guide",
      }));

      const blogItem = ARTICLES
        .filter((a) => a.tags.some((t) => t.toLowerCase().includes("resume") || t.toLowerCase().includes("ats")))
        .slice(0, 1)
        .map((a) => ({
          title: a.title,
          description: a.description.slice(0, 120) + "...",
          href: `/blog/${a.slug}`,
          badge: "Guide",
        }));

      return [...altItem, ...roleItem, ...blogItem].slice(0, 3);
    }

    case "alternative": {
      const alt = ALTERNATIVES.find((a) => a.slug === slug);
      if (!alt) return [];

      const compItem = COMPARISONS
        .filter((c) => c.slug === alt.comparisonSlug)
        .slice(0, 1)
        .map((c) => ({
          title: c.title,
          description: c.description.slice(0, 120) + "...",
          href: `/compare/${c.slug}`,
          badge: "Full Comparison",
        }));

      const roleItem = ROLES.slice(0, 1).map((r) => ({
        title: `${r.title} Career Guide`,
        description: r.description.slice(0, 120) + "...",
        href: `/roles/${r.slug}`,
        badge: "Role Guide",
      }));

      const pricingItem = [{
        title: "Token Pricing",
        description: "Pay per use from $14. No subscriptions. See all token packs and the Lifetime Deal.",
        href: "/pricing",
        badge: "Pricing",
      }];

      return [...compItem, ...roleItem, ...pricingItem].slice(0, 3);
    }

    default:
      return [];
  }
}
