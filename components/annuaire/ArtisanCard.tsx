import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, ShieldCheck, Medal } from "@phosphor-icons/react/dist/ssr";
import type { ArtisanAnnuaire } from "@/app/actions/annuaire";

function initiales(prenom: string | null, nom: string | null): string {
  return [prenom?.[0], nom?.[0]].filter(Boolean).join("").toUpperCase() || "?";
}

const STATUT_INFO: Record<string, { label: string; color: string }> = {
  disponible: { label: "Disponible", color: "#22C55E" },
  en_chantier: { label: "Chantier en cours", color: "#F59E0B" },
  complet: { label: "Complet", color: "#EF4444" },
};

const NIVEAU_LABEL: Record<string, string> = {
  apprenti: "Apprenti",
  confirme: "Confirmé",
  expert: "Expert",
  maitre: "Maître",
  legende: "Légende",
};

export function ArtisanCard({ artisan }: { artisan: ArtisanAnnuaire }) {
  const nom = [artisan.prenom, artisan.nom].filter(Boolean).join(" ") || "Artisan";
  const theme = artisan.theme_couleur ?? "#C75D3B";
  const statut = STATUT_INFO[artisan.statut_disponibilite ?? "disponible"] ?? STATUT_INFO.disponible;
  const certifs = artisan.certifications?.slice(0, 3) ?? [];
  const niveauLabel = NIVEAU_LABEL[artisan.niveau ?? ""] ?? null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: nom,
    description: artisan.metier ?? "Artisan",
    address: artisan.ville ? { "@type": "PostalAddress", addressLocality: artisan.ville } : undefined,
    url: `https://estime-app.com/artisan/${artisan.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href={`/artisan/${artisan.slug}`}
        className="group relative flex flex-col bg-white rounded-2xl border border-[#2B3138]/8 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
      >
        {/* Accent color top bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl opacity-60" style={{ backgroundColor: theme }} />

        {/* Avatar + statut */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="relative shrink-0">
            {artisan.photoUrl ? (
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <Image
                  src={artisan.photoUrl}
                  alt={`Photo de ${nom}`}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              </div>
            ) : (
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm"
                style={{ backgroundColor: theme }}
              >
                {initiales(artisan.prenom, artisan.nom)}
              </div>
            )}
          </div>
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-white shrink-0"
            style={{ backgroundColor: statut.color }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
            {statut.label}
          </span>
        </div>

        {/* Nom + métier + ville */}
        <h2 className="font-semibold text-[#2B3138] text-base leading-tight mb-0.5 group-hover:text-[var(--theme)] transition-colors" style={{ ["--theme" as string]: theme }}>
          {nom}
        </h2>
        {artisan.metier && (
          <p className="text-sm text-[#2B3138]/65 mb-0.5">{artisan.metier}</p>
        )}
        {artisan.ville && (
          <p className="text-xs text-[#2B3138]/45 flex items-center gap-1 mb-3">
            <MapPin size={11} aria-hidden="true" />
            {artisan.ville}
          </p>
        )}

        {/* Score / niveau */}
        {niveauLabel && (
          <div className="flex items-center gap-1.5 mb-3">
            <Medal size={13} weight="fill" style={{ color: theme }} aria-hidden="true" />
            <span className="text-xs font-medium" style={{ color: theme }}>{niveauLabel} Estime</span>
            {artisan.score_actuel !== null && (
              <span className="text-xs text-[#2B3138]/35">· {artisan.score_actuel} pts</span>
            )}
          </div>
        )}

        {/* Certifications */}
        {certifs.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {certifs.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#2B3138]/5 text-[#2B3138]/60 border border-[#2B3138]/8"
              >
                <ShieldCheck size={9} aria-hidden="true" />
                {c}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-3 border-t border-[#2B3138]/6">
          <span
            className="text-sm font-semibold transition-opacity group-hover:opacity-80"
            style={{ color: theme }}
          >
            Voir le profil →
          </span>
        </div>
      </Link>
    </>
  );
}
