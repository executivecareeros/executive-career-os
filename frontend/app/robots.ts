import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/about", "/executive-jobs", "/executive-career-intelligence", "/brand/"],
      disallow: [
        "/applications",
        "/archive",
        "/assistant",
        "/beta-workflow",
        "/blueprint",
        "/companies",
        "/company-control",
        "/import",
        "/onboarding",
        "/opportunities",
        "/productivity",
        "/settings",
        "/tasks",
        "/workspace",
      ],
    },
    sitemap: "https://www.orendalis.com/sitemap.xml",
    host: "https://www.orendalis.com",
  };
}
