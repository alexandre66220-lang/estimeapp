import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { PortableText } from "@portabletext/react";
import { getConseil, getConseillsSimilaires } from "@/lib/sanity/queries";
import type { ArticleConseil } from "@/lib/sanity/queries";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getConseil(slug);
  if (!article) return { title: "Article introuvable" };
  return {
    title: `${article.titre} | Conseils Estime`,
    description: article.resume ?? undefined,
    alternates: { canonical: `https://estime-app.com/espace/conseils/${slug}` },
  };
}

const TAG_COLORS: Record<string, string> = {
  Technique: "bg-blue-50 text-blue-700",
  Marketing: "bg-purple-50 text-purple-700",
  Gestion: "bg-green-50 text-green-700",
  Réputation: "bg-yellow-50 text-yellow-700",
  Sécurité: "bg-red-50 text-red-700",
};

export default async function ConseilDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getConseil(slug);
  if (!article) notFound();

  const similaires = await getConseillsSimilaires(
    article.slug.current,
    article.metier,
    article.categorie
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.titre,
    description: article.resume ?? undefined,
    datePublished: article.published_at ?? undefined,
    author: { "@type": "Organization", name: "Estime" },
    publisher: { "@type": "Organization", name: "Estime", url: "https://estime-app.com" },
    ...(article.image_principale?.url ? { image: article.image_principale.url } : {}),
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/espace/conseils"
        className="inline-flex items-center gap-1.5 text-sm text-dusk/50 hover:text-dusk mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        Retour aux conseils
      </Link>

      <article>
        {article.image_principale?.url && (
          <div className="relative w-full h-56 rounded-2xl overflow-hidden mb-8">
            <Image
              src={article.image_principale.url}
              alt={article.image_principale.alt ?? article.titre}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TAG_COLORS[article.categorie] ?? "bg-dust text-dusk"}`}>
            {article.categorie}
          </span>
          <span className="text-xs text-dusk/40">{article.temps_lecture} min de lecture</span>
          {article.published_at && (
            <span className="text-xs text-dusk/40">
              {new Date(article.published_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        <h1 className="font-display text-3xl font-bold text-dusk mb-4">{article.titre}</h1>

        {article.resume && (
          <p className="text-dusk/60 text-lg leading-relaxed mb-8 border-l-4 border-ambre pl-4">
            {article.resume}
          </p>
        )}

        <div className="[&_p]:mb-4 [&_p]:text-dusk/80 [&_p]:leading-relaxed [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-dusk [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:font-semibold [&_h3]:text-dusk [&_h3]:mt-6 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_ol]:mb-4 [&_li]:text-dusk/80 [&_strong]:font-semibold [&_strong]:text-dusk">
          {article.contenu && <PortableText value={article.contenu} />}
        </div>
      </article>

      {similaires.length > 0 && (
        <section className="mt-16 pt-8 border-t border-dusk/8">
          <p className="text-xs font-semibold uppercase tracking-wider text-dusk/40 mb-4">Articles similaires</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {similaires.map((a) => <SimilaireCard key={a._id} article={a} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function SimilaireCard({ article }: { article: ArticleConseil }) {
  const slug = article.slug.current;
  return (
    <Link
      href={`/espace/conseils/${slug}`}
      className="block bg-white border border-dusk/8 rounded-xl p-4 hover:border-dusk/20 hover:shadow-sm transition-all group"
    >
      <span className="text-xs text-dusk/40 mb-1.5 block">{article.categorie} · {article.temps_lecture} min</span>
      <p className="text-sm font-semibold text-dusk group-hover:text-ambre transition-colors line-clamp-2">{article.titre}</p>
    </Link>
  );
}
