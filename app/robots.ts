import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/artisan/", "/fonctionnalites", "/annuaire", "/faq", "/contact", "/inscription"],
        disallow: ["/espace/", "/api/", "/admin/"],
      },
    ],
    sitemap: "https://estime-app.com/sitemap.xml",
  };
}
