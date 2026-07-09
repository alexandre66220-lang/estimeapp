import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { METIERS_SEO, VILLES_SEO, findMetier, findVille } from "@/lib/localSeo/data";
import { getArtisansByVille, getArtisansByMetier } from "@/lib/localSeo/queries";
import { ArtisansNav, ArtisansGrid, WhyEstime, JoinCta } from "../ArtisansLayout";

export const revalidate = 3600;

export async function generateStaticParams() {
  const metierParams = METIERS_SEO.map((m) => ({ slug: m.slug }));
  const villeParams = VILLES_SEO.map((v) => ({ slug: v.slug }));
  return [...metierParams, ...villeParams];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const metier = findMetier(slug);
  const ville = findVille(slug);

  if (metier) {
    return {
      title: `${metier.labelPluriel} certifiés Estime, artisans BTP en France | Estime`,
      description: `Trouvez un ${metier.label.toLowerCase()} certifié Estime près de chez vous. ${metier.labelPluriel} évalués par leurs clients avec score de réputation et avis Google vérifiés.`,
      alternates: { canonical: `https://estime-app.com/artisans/${slug}` },
      robots: { index: true, follow: true },
    };
  }
  if (ville) {
    return {
      title: `Artisans BTP à ${ville.label}, professionnels certifiés | Estime`,
      description: `Peintres, plombiers, électriciens, maçons à ${ville.label} (${ville.departement}). Artisans évalués et certifiés par Estime.`,
      alternates: { canonical: `https://estime-app.com/artisans/${slug}` },
      robots: { index: true, follow: true },
    };
  }
  return {};
}

export default async function ArtisansSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const metier = findMetier(slug);
  const ville = findVille(slug);

  if (!metier && !ville) notFound();

  if (metier) {
    return <MetierPage metier={metier} />;
  }
  return <VillePage ville={ville!} />;
}

// ── Page par métier ──────────────────────────────────────────────────────────

async function MetierPage({ metier }: { metier: (typeof METIERS_SEO)[number] }) {
  const artisans = await getArtisansByMetier(metier.label, 12);

  return (
    <div style={{ background: "#F8F5F2" }} className="min-h-screen">
      <ArtisansNav />
      <main className="max-w-6xl mx-auto px-6 py-12 lg:py-16 space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs text-[#2B2521]/40">
          <Link href="/" className="hover:text-[#2B2521]/70 transition-colors">Accueil</Link>
          <span>›</span>
          <Link href="/artisans" className="hover:text-[#2B2521]/70 transition-colors">Artisans</Link>
          <span>›</span>
          <span className="text-[#2B2521]/60">{metier.labelPluriel}</span>
        </nav>

        {/* Header */}
        <div>
          <h1 className="font-landing-display text-4xl lg:text-5xl font-semibold text-[#2B2521] leading-tight mb-3">
            Trouver un {metier.label} certifié<br className="hidden sm:block" />, artisans Estime en France
          </h1>
          <p className="text-[#2B2521]/55 text-lg max-w-[60ch]">
            {metier.labelPluriel} présents sur Estime, évalués et recommandés par leurs clients en {metier.description}.
          </p>
        </div>

        {/* Grille des villes pour ce métier */}
        <section>
          <h2 className="font-landing-display text-xl font-semibold text-[#2B2521] mb-4">
            {metier.labelPluriel} par ville
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {VILLES_SEO.map((v) => (
              <Link
                key={v.slug}
                href={`/artisans/${metier.slug}/${v.slug}`}
                className="group rounded-xl p-3.5 hover:shadow-md transition-all"
                style={{ background: "#ffffff", border: "1px solid #E8E2DC" }}
              >
                <p className="font-medium text-[#2B2521] text-sm group-hover:text-[#C75D3B] transition-colors">
                  {metier.labelPluriel} à {v.label}
                </p>
                <p className="text-xs text-[#2B2521]/35 mt-0.5">{v.departement}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Artisans du métier */}
        {artisans.length > 0 && (
          <section>
            <h2 className="font-landing-display text-xl font-semibold text-[#2B2521] mb-4">
              {metier.labelPluriel} certifiés Estime
            </h2>
            <ArtisansGrid artisans={artisans} />
            <div className="mt-4 text-center">
              <Link
                href={`/annuaire?metier=${encodeURIComponent(metier.label)}`}
                className="text-sm text-[#C75D3B] font-medium hover:underline"
              >
                Voir tous les {metier.labelPluriel.toLowerCase()} →
              </Link>
            </div>
          </section>
        )}

        <WhyEstime metierLabel={metier.label} />
        <JoinCta metierLabel={metier.label} />
      </main>
    </div>
  );
}

// ── Page par ville ───────────────────────────────────────────────────────────

async function VillePage({ ville }: { ville: (typeof VILLES_SEO)[number] }) {
  const artisans = await getArtisansByVille(ville.label, 12);

  return (
    <div style={{ background: "#F8F5F2" }} className="min-h-screen">
      <ArtisansNav />
      <main className="max-w-6xl mx-auto px-6 py-12 lg:py-16 space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs text-[#2B2521]/40">
          <Link href="/" className="hover:text-[#2B2521]/70 transition-colors">Accueil</Link>
          <span>›</span>
          <Link href="/artisans" className="hover:text-[#2B2521]/70 transition-colors">Artisans</Link>
          <span>›</span>
          <span className="text-[#2B2521]/60">{ville.label}</span>
        </nav>

        {/* Header */}
        <div>
          <h1 className="font-landing-display text-4xl lg:text-5xl font-semibold text-[#2B2521] leading-tight mb-3">
            Artisans BTP à {ville.label}
          </h1>
          <p className="text-[#2B2521]/55 text-lg max-w-[60ch]">
            Peintres, plombiers, électriciens, maçons et autres artisans du bâtiment à {ville.label} ({ville.departement}), évalués par leurs clients.
          </p>
        </div>

        {/* Liens vers les pages métier × ville */}
        <section>
          <h2 className="font-landing-display text-xl font-semibold text-[#2B2521] mb-4">
            Artisans par métier à {ville.label}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {METIERS_SEO.map((m) => (
              <Link
                key={m.slug}
                href={`/artisans/${m.slug}/${ville.slug}`}
                className="group rounded-xl p-3.5 hover:shadow-md transition-all text-center"
                style={{ background: "#ffffff", border: "1px solid #E8E2DC" }}
              >
                <p className="font-medium text-[#2B2521] text-sm group-hover:text-[#C75D3B] transition-colors">
                  {m.labelPluriel}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Artisans tous métiers */}
        {artisans.length > 0 ? (
          <section>
            <h2 className="font-landing-display text-xl font-semibold text-[#2B2521] mb-4">
              Artisans certifiés Estime à {ville.label}
            </h2>
            <ArtisansGrid artisans={artisans} />
            <div className="mt-4 text-center">
              <Link
                href={`/annuaire?ville=${encodeURIComponent(ville.label)}`}
                className="text-sm text-[#C75D3B] font-medium hover:underline"
              >
                Voir tous les artisans à {ville.label} →
              </Link>
            </div>
          </section>
        ) : (
          <div className="rounded-2xl p-8 text-center" style={{ background: "#ffffff", border: "1px solid #E8E2DC" }}>
            <p className="text-[#2B2521]/50 mb-4">
              Aucun artisan certifié Estime à {ville.label} pour le moment.
            </p>
            <a
              href="/inscription"
              className="inline-flex items-center justify-center bg-[#C75D3B] text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#D4956B] transition-colors"
            >
              Vous êtes artisan à {ville.label} ? Rejoignez Estime →
            </a>
          </div>
        )}

        <WhyEstime metierLabel="artisan BTP" villeLabel={ville.label} />
        <JoinCta villeLabel={ville.label} />
      </main>
    </div>
  );
}
