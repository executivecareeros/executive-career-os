import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.orendalis.com",
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          en: "https://www.orendalis.com/?lang=en",
          tr: "https://www.orendalis.com/?lang=tr",
        },
      },
    },
  ];
}
