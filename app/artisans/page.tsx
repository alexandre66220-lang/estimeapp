import type { Metadata } from "next";
import Link from "next/link";
import { METIERS_SEO, VILLES_SEO } from "@/lib/localSeo/data";
import { ArtisansNav, JoinCta } from "./ArtisansLayout";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Trouvez un artisan BTP certifié près de chez vous | Estime",
  description:
    "Annuaire des artisans BTP certifiés Estime par ville et par métier. Peintres, plombiers, électriciens, maçons évalués par leurs clients.",
  alternates: { canonical: "https://estime-app.com/artisans" },
  robots: { index: true, follow: true },
};

export default function ArtisansIndexPage() {
  return (
    <div style={{ background: "#F8F5F2" }} className="min-h-screen">
      <ArtisansNav />

      <main className="max-w-6xl mx-auto px-6 py-12 lg:py-16">
        {/* Header */}
        <div className="mb-10">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs text-[#2B2521]/40 mb-4">
            <Link href="/" className="hover:text-[#2B2521]/70 transition-colors">Accueil</Link>
            <span>›</span>
            <span className="text-[#2B2521]/60">Artisans</span>
          </nav>
          <h1 className="font-landing-display text-4xl lg:text-5xl font-semibold text-[#2B2521] leading-tight mb-3">
            Trouvez un artisan BTP certifié<br className="hidden sm:block" /> près de chez vous
          </h1>
          <p className="text-[#2B2521]/55 text-lg max-w-[55ch]">
            Tous les artisans Estime sont évalués par leurs clients, avec un score de réputation basé sur leurs avis Google.
          </p>
        </div>

        {/* Grille des métiers */}
        <section className="mb-12">
          <h2 className="font-landing-display text-2xl font-semibold text-[#2B2521] mb-5">
            Parcourir par métier
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {METIERS_SEO.map((m) => (
              <Link
                key={m.slug}
                href={`/artisans/${m.slug}`}
                className="group rounded-2xl p-4 hover:shadow-md transition-all text-center"
                style={{ background: "#ffffff", border: "1px solid #E8E2DC" }}
              >
                <p className="font-semibold text-[#2B2521] text-sm group-hover:text-[#C75D3B] transition-colors">
                  {m.labelPluriel}
                </p>
                <p className="text-xs text-[#2B2521]/40 mt-1 leading-snug">{m.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Grille des villes */}
        <section className="mb-12">
          <h2 className="font-landing-display text-2xl font-semibold text-[#2B2521] mb-5">
            Parcourir par ville
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {VILLES_SEO.map((v) => (
              <Link
                key={v.slug}
                href={`/artisans/${v.slug}`}
                className="group rounded-2xl p-4 hover:shadow-md transition-all"
                style={{ background: "#ffffff", border: "1px solid #E8E2DC" }}
              >
                <p className="font-semibold text-[#2B2521] text-sm group-hover:text-[#C75D3B] transition-colors">
                  {v.label}
                </p>
                <p className="text-xs text-[#2B2521]/40 mt-0.5">{v.departement}</p>
              </Link>
            ))}
          </div>
        </section>

        <JoinCta />
      </main>
    </div>
  );
}
