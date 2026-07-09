import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Star, TrendUp, TrendDown, ChatCircleText } from "@phosphor-icons/react/dist/ssr";
import { getCurrentUser } from "@/lib/supabase/server";
import { getAvisStats, getAvisListe, getAvisParMois } from "@/lib/supabase/avis-stats";
import { EtoilesNote } from "@/components/espace/EtoilesNote";

export const metadata: Metadata = {
  title: "Mes avis, Estime",
};

const MOIS_LABELS = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

export default function Avis() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-dusk">Mes avis</h1>
        <p className="text-dusk/50 text-sm mt-1">
          Le suivi de vos avis Google et de votre taux de conversion.
        </p>
      </div>

      <Suspense fallback={<AvisSkeleton />}>
        <AvisSection />
      </Suspense>
    </div>
  );
}

async function AvisSection() {
  const { supabase, user } = await getCurrentUser();

  const [stats, liste, parMois] = await Promise.all([
    getAvisStats(supabase, user!.id),
    getAvisListe(supabase, user!.id),
    getAvisParMois(supabase, user!.id),
  ]);

  const evolution = stats.avisCeMois - stats.avisMoisDernier;
  const maxParMois = Math.max(...parMois.map((m) => m.total), 1);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-2xl border border-dusk/8 p-5 lg:p-6">
          <Star size={20} weight="fill" className="text-ambre" aria-hidden="true" />
          <p className="font-display text-3xl font-bold text-dusk leading-none mt-3">
            {stats.totalAvis}
          </p>
          <p className="text-dusk/45 text-xs mt-1.5">Avis reçus</p>
        </div>
        <div className="bg-white rounded-2xl border border-dusk/8 p-5 lg:p-6">
          <Star size={20} weight="fill" className="text-ambre" aria-hidden="true" />
          <p className="font-display text-3xl font-bold text-dusk leading-none mt-3">
            {stats.noteMoyenne !== null ? stats.noteMoyenne.toFixed(1) : "-"}
          </p>
          <p className="text-dusk/45 text-xs mt-1.5">Note moyenne Google</p>
        </div>
        <div className="bg-white rounded-2xl border border-dusk/8 p-5 lg:p-6">
          <ChatCircleText size={20} className="text-ambre" aria-hidden="true" />
          <p className="font-display text-3xl font-bold text-dusk leading-none mt-3">
            {stats.tauxConversion !== null ? `${stats.tauxConversion}%` : "-"}
          </p>
          <p className="text-dusk/45 text-xs mt-1.5">Taux de conversion</p>
        </div>
        <div className="bg-white rounded-2xl border border-dusk/8 p-5 lg:p-6">
          {evolution >= 0 ? (
            <TrendUp size={20} className="text-braise" aria-hidden="true" />
          ) : (
            <TrendDown size={20} className="text-dusk/40" aria-hidden="true" />
          )}
          <p className="font-display text-3xl font-bold text-dusk leading-none mt-3">
            {stats.avisCeMois}
            <span className="text-dusk/40 text-base font-normal"> vs {stats.avisMoisDernier}</span>
          </p>
          <p className="text-dusk/45 text-xs mt-1.5">Ce mois vs mois dernier</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 mb-10">
        <h2 className="font-display text-lg font-bold text-dusk mb-5">
          Évolution mensuelle des avis reçus
        </h2>
        <div className="flex items-end gap-3 h-32">
          {parMois.map((point) => {
            const [annee, mois] = point.mois.split("-");
            const label = MOIS_LABELS[Number(mois) - 1];
            return (
              <div key={point.mois} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-sm bg-braise/70"
                  style={{ height: `${Math.max((point.total / maxParMois) * 100, point.total > 0 ? 6 : 2)}%` }}
                  title={`${point.total} avis en ${label} ${annee}`}
                />
                <span className="text-xs text-dusk/40">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-dusk/8">
        <h2 className="font-display text-lg font-bold text-dusk px-6 lg:px-8 pt-6 lg:pt-8 mb-4">
          Tous les avis
        </h2>
        {liste.length === 0 ? (
          <p className="text-dusk/45 text-sm px-6 lg:px-8 pb-6 lg:pb-8">
            Aucun avis enregistré pour l&apos;instant. Marquez un avis reçu depuis la
            fiche d&apos;un chantier.
          </p>
        ) : (
          <ul className="divide-y divide-dusk/8">
            {liste.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 px-6 lg:px-8 py-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-dusk truncate">{item.client_prenom}</p>
                  {item.chantier && (
                    <Link
                      href={`/espace/chantiers/${item.chantier.id}`}
                      className="text-dusk/45 text-xs mt-0.5 hover:text-ambre hover:underline"
                    >
                      {item.chantier.titre}
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <EtoilesNote note={item.note_google} />
                  <span className="text-dusk/45 text-xs">
                    {new Date(item.date_avis).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function AvisSkeleton() {
  return (
    <div className="flex flex-col gap-10 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-white border border-dusk/8 rounded-2xl" />
        ))}
      </div>
      <div className="h-48 bg-white border border-dusk/8 rounded-2xl" />
      <div className="h-64 bg-white border border-dusk/8 rounded-2xl" />
    </div>
  );
}
