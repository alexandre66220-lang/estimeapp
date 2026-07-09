import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { getConseil, getConseillsSimilaires, getConseils } from "@/lib/sanity/queries";
import { FAQ_BY_CATEGORY, buildFaqJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo/faq";
import { FaqAccordion } from "@/components/seo/FaqAccordion";

export const revalidate = 3600;

const BASE = "https://estime-app.com";

const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  Technique:  { bg: "#2D6A8F", text: "#ffffff" },
  Marketing:  { bg: "#2D7A4F", text: "#ffffff" },
  Gestion:    { bg: "#6B4F9E", text: "#ffffff" },
  Réputation: { bg: "#C75D3B", text: "#ffffff" },
  Sécurité:   { bg: "#B03A2E", text: "#ffffff" },
};

export async function generateStaticParams() {
  try {
    const articles = await getConseils(null);
    return articles.map((a) => ({ slug: a.slug.current }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getConseil(slug);
  if (!article) return {};

  const published = article.published_at ? new Date(article.published_at).toISOString() : undefined;
  const ogImageUrl = `${BASE}/api/og?type=blog&slug=${encodeURIComponent(slug)}&titre=${encodeURIComponent(article.titre)}&categorie=${encodeURIComponent(article.categorie)}`;

  return {
    title: `${article.titre}, Blog Estime`,
    description: article.resume,
    alternates: {
      canonical: `${BASE}/blog/${slug}`,
      languages: { fr: `${BASE}/blog/${slug}` },
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: article.titre,
      description: article.resume,
      url: `${BASE}/blog/${slug}`,
      type: "article",
      publishedTime: published,
      locale: "fr_FR",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: article.titre }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.titre,
      description: article.resume,
      images: [ogImageUrl],
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getConseil(slug);
  if (!article) notFound();

  const similaires = await getConseillsSimilaires(slug, article.metier, article.categorie);

  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const badge = BADGE_COLORS[article.categorie];
  const faqItems = FAQ_BY_CATEGORY[article.categorie] ?? [];

  // Lien vers la page artisan local (premier métier de l'article)
  const metierSlug = article.metier?.[0] && article.metier[0] !== "general" ? article.metier[0] : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.titre,
    description: article.resume,
    datePublished: article.published_at ?? undefined,
    publisher: {
      "@type": "Organization",
      name: "Estime",
      url: BASE,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE}/blog/${slug}`,
    },
    ...(article.image_principale?.url ? { image: article.image_principale.url } : {}),
  };

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Accueil", url: BASE },
    { name: "Blog", url: `${BASE}/blog` },
    { name: article.titre, url: `${BASE}/blog/${slug}` },
  ]);

  const faqJsonLd = faqItems.length > 0 ? buildFaqJsonLd(faqItems) : null;

  return (
    <div style={{ background: "#F8F5F2" }} className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      {/* Nav */}
      <header
        className="border-b backdrop-blur-sm sticky top-0 z-20"
        style={{ background: "rgba(248,245,242,0.92)", borderColor: "rgba(43,37,33,0.08)" }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-landing-display text-lg font-semibold hover:opacity-70 transition-opacity" style={{ color: "#2B2521" }}>
            Estime
          </Link>
          <a href="/inscription" className="text-sm font-semibold text-white px-4 py-2 rounded-full transition-colors" style={{ background: "#C75D3B" }}>
            Commencer gratuitement
          </a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10 lg:py-14">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs mb-8 flex-wrap" style={{ color: "#8A7E76" }}>
          <Link href="/" className="hover:opacity-80 transition-opacity" style={{ color: "#8A7E76" }}>Accueil</Link>
          <span>›</span>
          <Link href="/blog" className="hover:opacity-80 transition-opacity" style={{ color: "#8A7E76" }}>Blog</Link>
          <span>›</span>
          <span style={{ color: "#5C5248" }} className="line-clamp-1">{article.titre}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-[1fr_280px] gap-12">
          <article>
            {/* Meta */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {badge ? (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.text }}>
                  {article.categorie}
                </span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "#E8E2DC", color: "#2B2521" }}>
                  {article.categorie}
                </span>
              )}
              <span className="text-xs" style={{ color: "#8A7E76" }}>{article.temps_lecture} min de lecture</span>
              {date && <span className="text-xs" style={{ color: "#8A7E76" }}>· {date}</span>}
            </div>

            <h1 className="font-landing-display text-3xl lg:text-4xl font-semibold leading-tight mb-5" style={{ color: "#2B2521" }}>
              {article.titre}
            </h1>

            {article.resume && (
              <p className="text-lg leading-relaxed mb-8 border-l-2 pl-4" style={{ color: "#5C5248", borderColor: "#C75D3B" }}>
                {article.resume}
              </p>
            )}

            {/* Contenu */}
            {article.contenu && (
              <div className="prose-blog">
                <PortableText value={article.contenu} />
              </div>
            )}

            {/* Lien artisans locaux (si métier défini) */}
            {metierSlug && (
              <div className="mt-8 p-4 rounded-xl flex items-center justify-between gap-4 flex-wrap" style={{ background: "#FFF5F0", border: "1px solid #FDDDD5" }}>
                <p className="text-sm font-medium" style={{ color: "#2B2521" }}>
                  Vous cherchez un artisan qualifié ?
                </p>
                <Link
                  href={`/artisans/${metierSlug}`}
                  className="text-sm font-semibold shrink-0 hover:underline"
                  style={{ color: "#C75D3B" }}
                >
                  Trouver un {metierSlug} certifié →
                </Link>
              </div>
            )}

            {/* Lien annuaire */}
            <div className="mt-4 p-5 rounded-2xl" style={{ background: "#ffffff", border: "1px solid #E8E2DC" }}>
              <p className="text-sm mb-2" style={{ color: "#5C5248" }}>
                Vous cherchez un artisan qualifié près de chez vous ?
              </p>
              <Link href="/annuaire" className="text-sm font-semibold hover:underline" style={{ color: "#C75D3B" }}>
                Consulter l&apos;annuaire des artisans BTP →
              </Link>
            </div>

            {/* FAQ */}
            {faqItems.length > 0 && <FaqAccordion items={faqItems} title="Questions fréquentes" />}

            {/* CTA mobile */}
            <div className="mt-8 p-6 rounded-2xl text-center lg:hidden" style={{ background: "#2B2521" }}>
              <p className="font-landing-display text-lg font-semibold mb-1" style={{ color: "#F8F5F2" }}>
                Cet article vous a aidé ?
              </p>
              <p className="text-sm mb-4" style={{ color: "rgba(248,245,242,0.5)" }}>
                Essayez Estime gratuitement pour valoriser vos chantiers sur Instagram.
              </p>
              <a href="/inscription" className="inline-flex items-center justify-center text-white font-semibold text-sm px-6 py-2.5 rounded-full" style={{ background: "#C75D3B" }}>
                Essayer gratuitement
              </a>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block space-y-6">
            <div className="rounded-2xl p-6 text-center sticky top-20" style={{ background: "#2B2521" }}>
              <p className="font-landing-display text-lg font-semibold mb-2 leading-snug" style={{ color: "#F8F5F2" }}>
                Cet article vous a aidé ?
              </p>
              <p className="text-sm mb-5" style={{ color: "rgba(248,245,242,0.5)" }}>
                Essayez Estime gratuitement pour générer vos posts Instagram et avis Google.
              </p>
              <a href="/inscription" className="block w-full text-center text-white font-semibold text-sm px-5 py-2.5 rounded-full mb-2" style={{ background: "#C75D3B" }}>
                Commencer gratuitement
              </a>
              <p className="text-xs" style={{ color: "rgba(248,245,242,0.3)" }}>14 jours d&apos;essai · Sans carte</p>
            </div>

            {/* Artisans locaux sidebar */}
            {metierSlug && (
              <div className="rounded-xl p-4" style={{ background: "#ffffff", border: "1px solid #E8E2DC" }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#8A7E76" }}>
                  Trouver un artisan
                </p>
                <Link href={`/artisans/${metierSlug}`} className="text-sm font-medium hover:underline" style={{ color: "#C75D3B" }}>
                  Voir les {metierSlug}s certifiés Estime →
                </Link>
              </div>
            )}
          </aside>
        </div>

        {/* Articles similaires */}
        {similaires.length > 0 && (
          <section className="mt-14">
            <h2 className="font-landing-display text-xl font-semibold mb-5" style={{ color: "#2B2521" }}>
              Articles similaires
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {similaires.map((a) => {
                const simBadge = BADGE_COLORS[a.categorie];
                return (
                  <Link
                    key={a._id}
                    href={`/blog/${a.slug.current}`}
                    className="group flex flex-col rounded-2xl p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
                    style={{ background: "#ffffff", border: "1px solid #E8E2DC" }}
                  >
                    <span
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3 inline-block self-start"
                      style={simBadge ? { background: simBadge.bg, color: simBadge.text } : { background: "#E8E2DC", color: "#2B2521" }}
                    >
                      {a.categorie}
                    </span>
                    <h3 className="font-semibold text-sm leading-snug group-hover:text-[#C75D3B] transition-colors line-clamp-2" style={{ color: "#2B2521" }}>
                      {a.titre}
                    </h3>
                    <p className="text-xs mt-2" style={{ color: "#8A7E76" }}>{a.temps_lecture} min</p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
