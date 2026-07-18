import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    ["", 1],
    ["/executive-jobs", 0.9],
    ["/executive-career-intelligence", 0.9],
    ["/about", 0.7],
  ] as const;
  return pages.map(([path, priority]) => ({
    url: `https://www.orendalis.com${path}`,
    changeFrequency: "weekly" as const,
    priority,
  }));
}
