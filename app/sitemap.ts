import type { MetadataRoute } from "next";

const BASE = "https://estime-app.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "monthly", priority: 1.0 },
    { url: `${BASE}/fonctionnalites`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/annuaire`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/inscription`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/connexion`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/mentions-legales`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/cgu`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/cgv`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/politique-confidentialite`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  let vitrineRoutes: MetadataRoute.Sitemap = [];
  let conseilRoutes: MetadataRoute.Sitemap = [];

  // Artisans publics (Supabase)
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { data: profiles } = await admin
      .from("profiles")
      .select("slug, updated_at")
      .not("slug", "is", null);

    vitrineRoutes = (profiles ?? []).map((p) => ({
      url: `${BASE}/artisan/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch { /* env vars absentes au build */ }

  // Articles conseils (Sanity)
  try {
    const { sanityClient } = await import("@/lib/sanity/client");
    const articles = await sanityClient.fetch<{ slug: string; published_at: string | null }[]>(
      `*[_type == "article_conseil" && actif == true] { "slug": slug.current, published_at }`
    );
    conseilRoutes = (articles ?? []).map((a) => ({
      url: `${BASE}/espace/conseils/${a.slug}`,
      lastModified: a.published_at ? new Date(a.published_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch { /* Sanity indisponible */ }

  return [...staticRoutes, ...vitrineRoutes, ...conseilRoutes];
}
