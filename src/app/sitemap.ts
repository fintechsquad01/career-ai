import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://careerai.com", lastModified: new Date(), priority: 1.0 },
    { url: "https://careerai.com/pricing", lastModified: new Date(), priority: 0.8 },
    { url: "https://careerai.com/lifetime", lastModified: new Date(), priority: 0.7 },
    { url: "https://careerai.com/auth", lastModified: new Date(), priority: 0.6 },
    { url: "https://careerai.com/privacy", lastModified: new Date(), priority: 0.5 },
    { url: "https://careerai.com/terms", lastModified: new Date(), priority: 0.5 },
  ];
}
