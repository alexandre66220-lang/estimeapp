import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { getConseil, getConseillsSimilaires, getConseils } from "@/lib/sanity/queries";
import { TAG_COLORS } from "../page";

export const revalidate = 3600;

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

  return {
    title: `${article.titre} — Blog Estime`,
    description: article.resume,
    alternates: { canonical: `https://estime-app.com/blog/${slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: article.titre,
      description: article.resume,
      url: `https://estime-app.com/blog/${slug}`,
      type: "article",
      publishedTime: published,
      ...(article.image_principale?.url
        ? { images: [{ url: article.image_principale.url, alt: article.image_principale.alt ?? article.titre }] }
        : {}),
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

  const similaires = await getConseillsSimilaires(
    slug,
    article.metier,
    article.categorie
  );

  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.titre,
    description: article.resume,
    datePublished: article.published_at ?? undefined,
    publisher: {
      "@type": "Organization",
      name: "Estime",
      url: "https://estime-app.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://estime-app.com/blog/${slug}`,
    },
    ...(article.image_principale?.url
      ? { image: article.image_principale.url }
      : {}),
  };

  return (
    <div style={{ background: "#F8F5F2" }} className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Nav minimale */}
      <header className="border-b border-[#2B2521]/8 bg-[#F8F5F2]/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-landing-display text-lg font-semibold text-[#2B2521] hover:opacity-70 transition-opacity"
          >
            Estime
          </Link>
          <a
            href="/inscription"
            className="text-sm font-semibold text-white bg-[#C75D3B] px-4 py-2 rounded-full hover:bg-[#D4956B] transition-colors"
          >
            Commencer gratuitement
          </a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10 lg:py-14">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs text-[#2B2521]/40 mb-8">
          <Link href="/" className="hover:text-[#2B2521]/70 transition-colors">Accueil</Link>
          <span>›</span>
          <Link href="/blog" className="hover:text-[#2B2521]/70 transition-colors">Blog</Link>
          <span>›</span>
          <span className="text-[#2B2521]/60 line-clamp-1">{article.titre}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-[1fr_280px] gap-12">
          {/* Article principal */}
          <article>
            {/* Meta */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  TAG_COLORS[article.categorie] ?? "bg-[#2B2521]/8 text-[#2B2521]"
                }`}
              >
                {article.categorie}
              </span>
              <span className="text-xs text-[#2B2521]/40">{article.temps_lecture} min de lecture</span>
              {date && <span className="text-xs text-[#2B2521]/40">· {date}</span>}
            </div>

            <h1 className="font-landing-display text-3xl lg:text-4xl font-semibold text-[#2B2521] leading-tight mb-5">
              {article.titre}
            </h1>

            {article.resume && (
              <p className="text-[#2B2521]/60 text-lg leading-relaxed mb-8 border-l-2 border-[#C75D3B] pl-4">
                {article.resume}
              </p>
            )}

            {/* Contenu Portable Text */}
            {article.contenu && (
              <div className="prose-blog">
                <PortableText value={article.contenu} />
              </div>
            )}

            {/* Lien interne annuaire */}
            <div className="mt-10 p-5 bg-white rounded-2xl border border-[#2B2521]/8">
              <p className="text-sm text-[#2B2521]/60 mb-2">
                Vous cherchez un artisan qualifié près de chez vous ?
              </p>
              <Link
                href="/annuaire"
                className="text-sm font-semibold text-[#C75D3B] hover:underline"
              >
                Consulter l&apos;annuaire des artisans BTP →
              </Link>
            </div>

            {/* CTA inscription (bottom mobile) */}
            <div className="mt-8 p-6 bg-[#2B2521] rounded-2xl text-center lg:hidden">
              <p className="font-landing-display text-lg font-semibold text-[#F8F5F2] mb-1">
                Cet article vous a aidé ?
              </p>
              <p className="text-[#F8F5F2]/50 text-sm mb-4">
                Essayez Estime gratuitement pour valoriser vos chantiers sur Instagram.
              </p>
              <a
                href="/inscription"
                className="inline-flex items-center justify-center bg-[#C75D3B] text-white font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-[#D4956B] transition-colors"
              >
                Essayer gratuitement
              </a>
            </div>
          </article>

          {/* Sidebar desktop */}
          <aside className="hidden lg:block space-y-6">
            {/* CTA */}
            <div className="bg-[#2B2521] rounded-2xl p-6 text-center sticky top-20">
              <p className="font-landing-display text-lg font-semibold text-[#F8F5F2] mb-2 leading-snug">
                Cet article vous a aidé ?
              </p>
              <p className="text-[#F8F5F2]/50 text-sm mb-5">
                Essayez Estime gratuitement pour générer vos posts Instagram et avis Google.
              </p>
              <a
                href="/inscription"
                className="block w-full text-center bg-[#C75D3B] text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#D4956B] transition-colors mb-2"
              >
                Commencer gratuitement
              </a>
              <p className="text-[#F8F5F2]/30 text-xs">14 jours d&apos;essai · Sans carte</p>
            </div>
          </aside>
        </div>

        {/* Articles similaires */}
        {similaires.length > 0 && (
          <section className="mt-14">
            <h2 className="font-landing-display text-xl font-semibold text-[#2B2521] mb-5">
              Articles similaires
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {similaires.map((a) => (
                <Link
                  key={a._id}
                  href={`/blog/${a.slug.current}`}
                  className="group block bg-white border border-[#2B2521]/8 rounded-2xl p-5 hover:shadow-md hover:border-[#2B2521]/15 transition-all"
                >
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3 inline-block ${
                      TAG_COLORS[a.categorie] ?? "bg-[#2B2521]/8 text-[#2B2521]"
                    }`}
                  >
                    {a.categorie}
                  </span>
                  <h3 className="font-semibold text-[#2B2521] text-sm leading-snug group-hover:text-[#C75D3B] transition-colors line-clamp-2">
                    {a.titre}
                  </h3>
                  <p className="text-[#2B2521]/35 text-xs mt-2">{a.temps_lecture} min</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
