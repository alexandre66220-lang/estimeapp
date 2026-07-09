import type { Metadata } from "next";
import { Suspense } from "react";
import { searchAnnuaire } from "@/app/actions/annuaire";
import { ArtisanCard } from "@/components/annuaire/ArtisanCard";
import { AnnuaireSearchBar, AnnuaireFilters, AnnuairePagination } from "@/components/annuaire/AnnuaireClient";
import Link from "next/link";
import { METIERS_SEO, VILLES_SEO } from "@/lib/localSeo/data";

const TOP_METIERS = METIERS_SEO.slice(0, 4);
const TOP_VILLES = VILLES_SEO.slice(0, 5);

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Annuaire artisans BTP, trouvez un artisan de confiance | Estime",
  description:
    "Trouvez un peintre, plombier, électricien ou maçon certifié près de chez vous. Tous les artisans Estime sont évalués par leurs clients.",
  openGraph: {
    title: "Annuaire artisans BTP, Estime",
    description: "Trouvez un artisan certifié Estime près de chez vous.",
    url: "https://estime-app.com/annuaire",
    siteName: "Estime",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Annuaire artisans BTP, Estime" }],
  },
  alternates: {
    canonical: "https://estime-app.com/annuaire",
  },
};

const PAGE_SIZE = 12;

export default async function AnnuairePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const metier = sp.metier ?? "";
  const ville = sp.ville ?? "";
  const disponible = sp.dispo === "true";
  const tri = (sp.tri as "note" | "anciennete") || "note";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));

  const { artisans, total } = await searchAnnuaire({ metier, ville, disponible, tri, page });

  const hasSearch = metier || ville || disponible;

  return (
    <div className="min-h-screen bg-[#F8F5F2]">
      {/* Header */}
      <header className="bg-[#1A1410] py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-landing-display text-xl font-semibold text-[#F2EDE4] hover:opacity-80 transition-opacity">
            Estime
          </Link>
          <Link href="/connexion" className="text-sm text-[#F2EDE4]/60 hover:text-[#F2EDE4] transition-colors">
            Se connecter
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#1A1410] pb-16 pt-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#C75D3B] text-sm font-semibold uppercase tracking-widest mb-3">Annuaire professionnel</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F2EDE4] leading-tight mb-4">
            Trouvez un artisan de confiance<br className="hidden sm:block" /> près de chez vous
          </h1>
          <p className="text-[#F2EDE4]/50 mb-8 max-w-lg mx-auto">
            Tous les artisans Estime sont vérifiés et évalués par leurs clients
          </p>
          <AnnuaireSearchBar defaultMetier={metier} defaultVille={ville} />
        </div>
      </section>

      {/* Contenu */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Filtres */}
        <div className="mb-6">
          <Suspense fallback={null}>
            <AnnuaireFilters
              defaultMetier={metier}
              defaultVille={ville}
              defaultDisponible={disponible}
              defaultTri={tri}
            />
          </Suspense>
        </div>

        {/* Compteur */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-[#2B3138]/50">
            {total === 0
              ? "Aucun artisan trouvé"
              : `${total} artisan${total > 1 ? "s" : ""}${hasSearch ? " correspond" + (total > 1 ? "ent" : "") : "s"}`}
          </p>
        </div>

        {/* Grille */}
        {artisans.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <h2 className="text-xl font-bold text-[#2B3138] mb-2">Aucun artisan trouvé</h2>
            <p className="text-[#2B3138]/50 mb-6 max-w-sm mx-auto">
              Essayez d&apos;élargir votre recherche en changeant la ville ou le métier.
            </p>
            <Link
              href="/annuaire"
              className="inline-flex px-5 py-2.5 rounded-full bg-[#C75D3B] text-white text-sm font-semibold hover:bg-[#B8552E] transition-colors"
            >
              Voir tous les artisans
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {artisans.map((a) => (
              <ArtisanCard key={a.id} artisan={a} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <Suspense fallback={null}>
          <AnnuairePagination total={total} page={page} perPage={PAGE_SIZE} />
        </Suspense>
      </main>

      {/* Maillage interne : combinaisons métier/ville */}
      <section className="mt-16 border-t border-[#2B2521]/8 pt-10">
        <h2 className="text-base font-semibold text-[#2B2521] mb-6">Recherches fréquentes</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TOP_METIERS.flatMap((m) =>
            TOP_VILLES.map((v) => (
              <Link
                key={`${m.slug}-${v.slug}`}
                href={`/artisans/${m.slug}/${v.slug}`}
                className="text-xs px-3 py-2 rounded-lg transition-all hover:text-[#C75D3B]"
                style={{ background: "#ffffff", border: "1px solid rgba(43,37,33,0.10)", color: "rgba(43,37,33,0.60)" }}
              >
                {m.label} à {v.label}
              </Link>
            ))
          )}
        </div>
        <div className="mt-4">
          <Link href="/artisans" className="text-sm text-[#2B3138]/50 hover:text-[#C75D3B] transition-colors">
            Parcourir tous les métiers et villes →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 bg-[#1A1410] py-8 px-6 text-center">
        <p className="text-[#F2EDE4]/25 text-xs">
          © 2026 Estime, <Link href="/" className="hover:text-[#F2EDE4]/50 transition-colors">estime-app.com</Link>
        </p>
      </footer>
    </div>
  );
}
