import type { Metadata } from "next";
import Link from "next/link";
import { getConseilSemaine, getConseils } from "@/lib/sanity/queries";
import type { ArticleConseil } from "@/lib/sanity/queries";
import { BlogFilters } from "./BlogFilters";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog Estime, conseils pour artisans BTP",
  description:
    "Conseils pratiques pour artisans BTP : gestion de chantiers, réputation, marketing sur les réseaux sociaux, rentabilité. Rédigés par des experts du bâtiment.",
  alternates: { canonical: "https://estime-app.com/blog" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Blog Estime, conseils pour artisans BTP",
    description:
      "Conseils pratiques pour artisans BTP : gestion de chantiers, réputation, marketing, rentabilité.",
    url: "https://estime-app.com/blog",
    type: "website",
  },
};

// Badge colors for similar articles card in FeaturedCard (dark bg, keep light)
export const BADGE_COLORS_LIGHT: Record<string, { bg: string; text: string }> = {
  Technique:  { bg: "#2D6A8F", text: "#ffffff" },
  Marketing:  { bg: "#2D7A4F", text: "#ffffff" },
  Gestion:    { bg: "#6B4F9E", text: "#ffffff" },
  Réputation: { bg: "#C75D3B", text: "#ffffff" },
  Sécurité:   { bg: "#B03A2E", text: "#ffffff" },
};

export default async function BlogPage() {
  const [conseilSemaine, articles] = await Promise.all([
    getConseilSemaine(null),
    getConseils(null),
  ]);

  return (
    <div style={{ background: "#F8F5F2" }} className="min-h-screen">
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

      <main className="max-w-6xl mx-auto px-6 py-12 lg:py-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-landing-display text-4xl lg:text-5xl font-semibold text-[#2B2521] leading-tight mb-3">
            Blog Estime
          </h1>
          <p className="text-[#2B2521]/55 text-lg max-w-[55ch]">
            Conseils pratiques pour artisans BTP : gestion, réputation, marketing et rentabilité.
          </p>
        </div>

        {/* Conseil de la semaine */}
        {conseilSemaine && <FeaturedCard article={conseilSemaine} />}

        {/* Filtres + grille (client component) */}
        <BlogFilters articles={articles} />
      </main>

      {/* Footer CTA */}
      <section className="bg-[#2B2521] py-16 mt-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="font-landing-display text-3xl font-semibold text-[#F8F5F2] mb-3">
            Prêt à valoriser vos chantiers ?
          </p>
          <p className="text-[#F8F5F2]/55 mb-7">
            Rejoignez les artisans qui génèrent leurs posts Instagram et demandes d&apos;avis Google en quelques secondes.
          </p>
          <a
            href="/inscription"
            className="inline-flex items-center justify-center bg-[#C75D3B] text-white font-semibold px-7 py-3.5 rounded-full hover:bg-[#D4956B] transition-colors"
          >
            Essayer gratuitement 14 jours
          </a>
          <p className="text-[#F8F5F2]/35 text-sm mt-3">Sans carte bancaire. Sans engagement.</p>
        </div>
      </section>
    </div>
  );
}

function FeaturedCard({ article }: { article: ArticleConseil }) {
  const slug = article.slug.current;
  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <section className="mb-10">
      <Link
        href={`/blog/${slug}`}
        className="group block bg-[#2B2521] rounded-3xl overflow-hidden hover:opacity-95 transition-opacity"
      >
        <div className="p-8 lg:p-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-white bg-[#C75D3B] px-3 py-1 rounded-full">
              À la une
            </span>
            <span className="text-xs font-semibold text-[#C75D3B] bg-[#C75D3B]/15 px-2.5 py-0.5 rounded-full">
              {article.categorie}
            </span>
          </div>
          <h2 className="font-landing-display text-2xl lg:text-3xl font-semibold text-[#F8F5F2] leading-snug mb-3 group-hover:text-[#F8F5F2]/85 transition-colors max-w-[60ch]">
            {article.titre}
          </h2>
          {article.resume && (
            <p className="text-[#F8F5F2]/55 leading-relaxed max-w-[65ch] mb-5 line-clamp-2">
              {article.resume}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-[#F8F5F2]/40">
            <span>{article.temps_lecture} min de lecture</span>
            {date && <span>· {date}</span>}
          </div>
        </div>
      </Link>
    </section>
  );
}
