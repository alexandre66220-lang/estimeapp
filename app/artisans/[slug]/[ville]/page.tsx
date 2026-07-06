import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { METIERS_SEO, VILLES_SEO, findMetier, findVille } from "@/lib/localSeo/data";
import { getArtisansByMetierVille } from "@/lib/localSeo/queries";
import { ArtisansNav, ArtisansGrid, WhyEstime, JoinCta } from "../../ArtisansLayout";
import { buildFaqJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo/faq";
import { FaqAccordion } from "@/components/seo/FaqAccordion";

const BASE = "https://estime-app.com";

export const revalidate = 3600;

export async function generateStaticParams() {
  const params: { slug: string; ville: string }[] = [];
  for (const m of METIERS_SEO) {
    for (const v of VILLES_SEO) {
      params.push({ slug: m.slug, ville: v.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; ville: string }>;
}): Promise<Metadata> {
  const { slug, ville: villeSlug } = await params;
  const metier = findMetier(slug);
  const ville = findVille(villeSlug);
  if (!metier || !ville) return {};

  const ogImageUrl = `${BASE}/api/og?type=artisans&metier=${encodeURIComponent(metier.label)}&ville=${encodeURIComponent(ville.label)}`;
  return {
    title: `${metier.label} à ${ville.label} — Artisans certifiés Estime | Estime`,
    description: `Trouvez un ${metier.label.toLowerCase()} de confiance à ${ville.label}. Artisans évalués par leurs clients, avec score de réputation et avis Google vérifiés.`,
    alternates: {
      canonical: `${BASE}/artisans/${slug}/${villeSlug}`,
      languages: { fr: `${BASE}/artisans/${slug}/${villeSlug}` },
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${metier.label} à ${ville.label} — Artisans certifiés Estime`,
      description: `Trouvez un ${metier.label.toLowerCase()} de confiance à ${ville.label} (${ville.departement}).`,
      url: `${BASE}/artisans/${slug}/${villeSlug}`,
      type: "website",
      locale: "fr_FR",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${metier.label} à ${ville.label}` }],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImageUrl],
    },
  };
}

export default async function ArtisansMetierVillePage({
  params,
}: {
  params: Promise<{ slug: string; ville: string }>;
}) {
  const { slug, ville: villeSlug } = await params;
  const metier = findMetier(slug);
  const ville = findVille(villeSlug);

  if (!metier || !ville) notFound();

  const artisans = await getArtisansByMetierVille(metier.label, ville.label, 12);

  const faqItems = [
    {
      q: `Comment trouver un ${metier.label.toLowerCase()} de confiance à ${ville.label} ?`,
      a: `Cherchez un ${metier.label.toLowerCase()} certifié Estime à ${ville.label} : leurs scores de réputation et avis Google sont vérifiés et transparents.`,
    },
    {
      q: `Combien coûte un ${metier.label.toLowerCase()} à ${ville.label} ?`,
      a: `Les tarifs varient selon la prestation. Demandez plusieurs devis et comparez les avis Google pour choisir le meilleur rapport qualité/prix.`,
    },
    {
      q: `Comment vérifier la réputation d'un ${metier.label.toLowerCase()} à ${ville.label} ?`,
      a: `Consultez ses avis Google, son score de réputation Estime et ses photos de chantiers réalisés.`,
    },
  ];

  const jsonLdOrg = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${metier.labelPluriel} à ${ville.label}`,
    description: `Liste des ${metier.labelPluriel.toLowerCase()} certifiés Estime à ${ville.label}, ${ville.departement}`,
    url: `${BASE}/artisans/${slug}/${villeSlug}`,
  };

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Accueil", url: BASE },
    { name: "Artisans", url: `${BASE}/artisans` },
    { name: metier.labelPluriel, url: `${BASE}/artisans/${slug}` },
    { name: ville.label, url: `${BASE}/artisans/${slug}/${villeSlug}` },
  ]);

  const faqJsonLd = buildFaqJsonLd(faqItems);

  return (
    <div style={{ background: "#F8F5F2" }} className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <ArtisansNav />

      <main className="max-w-6xl mx-auto px-6 py-12 lg:py-16 space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs text-[#2B2521]/40 flex-wrap">
          <Link href="/" className="hover:text-[#2B2521]/70 transition-colors">Accueil</Link>
          <span>›</span>
          <Link href="/artisans" className="hover:text-[#2B2521]/70 transition-colors">Artisans</Link>
          <span>›</span>
          <Link href={`/artisans/${slug}`} className="hover:text-[#2B2521]/70 transition-colors">
            {metier.labelPluriel}
          </Link>
          <span>›</span>
          <span className="text-[#2B2521]/60">{ville.label}</span>
        </nav>

        {/* Header */}
        <div>
          <h1 className="font-landing-display text-4xl lg:text-5xl font-semibold text-[#2B2521] leading-tight mb-3">
            {metier.label} à {ville.label}<br className="hidden sm:block" /> — Trouvez un artisan certifié Estime
          </h1>
          <p className="text-[#2B2521]/55 text-lg max-w-[60ch]">
            Découvrez les {metier.labelPluriel.toLowerCase()} de {ville.label} présents sur Estime, évalués et recommandés par leurs clients.
          </p>
        </div>

        {/* Artisans */}
        {artisans.length > 0 ? (
          <section>
            <h2 className="font-landing-display text-xl font-semibold text-[#2B2521] mb-4">
              {metier.labelPluriel} certifiés à {ville.label}
            </h2>
            <ArtisansGrid artisans={artisans} />
            <div className="mt-4 text-center">
              <Link
                href={`/annuaire?metier=${encodeURIComponent(metier.label)}&ville=${encodeURIComponent(ville.label)}`}
                className="text-sm text-[#C75D3B] font-medium hover:underline"
              >
                Voir tous les {metier.labelPluriel.toLowerCase()} à {ville.label} →
              </Link>
            </div>
          </section>
        ) : (
          <div className="bg-white border border-[#2B2521]/8 rounded-2xl p-8 text-center">
            <p className="text-[#2B2521]/50 mb-2">
              Aucun {metier.label.toLowerCase()} certifié Estime à {ville.label} pour le moment.
            </p>
            <p className="text-sm text-[#2B2521]/40 mb-5">
              Vous êtes {metier.label.toLowerCase()} à {ville.label} ? Rejoignez Estime gratuitement et soyez visible par vos prospects locaux.
            </p>
            <a
              href="/inscription"
              className="inline-flex items-center justify-center bg-[#C75D3B] text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#D4956B] transition-colors"
            >
              Rejoindre Estime gratuitement
            </a>
          </div>
        )}

        {/* Autres villes pour ce métier */}
        <section>
          <h2 className="font-landing-display text-xl font-semibold text-[#2B2521] mb-4">
            {metier.labelPluriel} dans d&apos;autres villes
          </h2>
          <div className="flex flex-wrap gap-2">
            {VILLES_SEO.filter((v) => v.slug !== villeSlug).map((v) => (
              <Link
                key={v.slug}
                href={`/artisans/${slug}/${v.slug}`}
                className="text-sm px-3.5 py-1.5 rounded-full bg-white border border-[#2B2521]/8 text-[#2B2521]/65 hover:border-[#C75D3B]/40 hover:text-[#C75D3B] transition-all"
              >
                {metier.label} à {v.label}
              </Link>
            ))}
          </div>
        </section>

        <WhyEstime metierLabel={metier.label} villeLabel={ville.label} />

        {/* FAQ */}
        <div style={{ background: "#ffffff", border: "1px solid #E8E2DC" }} className="rounded-2xl p-6 lg:p-8">
          <FaqAccordion items={faqItems} title={`FAQ — ${metier.label} à ${ville.label}`} />
        </div>

        <JoinCta metierLabel={metier.label} villeLabel={ville.label} />
      </main>
    </div>
  );
}
