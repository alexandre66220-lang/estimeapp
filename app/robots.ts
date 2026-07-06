import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/artisan/"],
        disallow: ["/espace/", "/api/"],
      },
    ],
    sitemap: "https://estime-app.com/sitemap.xml",
  };
}
