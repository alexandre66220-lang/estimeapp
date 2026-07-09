import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Gift, Users, CalendarCheck, Check, Clock } from "@phosphor-icons/react/dist/ssr";
import { getCurrentUser } from "@/lib/supabase/server";
import { getParrainageStats } from "@/lib/supabase/parrainage";

const CopierParrainage = dynamic(() =>
  import("@/components/espace/CopierParrainage").then((mod) => mod.CopierParrainage)
);

export const metadata: Metadata = {
  title: "Parrainage, Estime",
};

const STATUT_LABELS: Record<string, string> = {
  en_attente: "En attente",
  converti: "Converti",
};

export default function Parrainage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-dusk">Parrainage</h1>
        <p className="text-dusk/50 text-sm mt-1">
          Invitez d&apos;autres artisans et gagnez 1 mois gratuit pour chaque
          filleul qui s&apos;abonne.
        </p>
      </div>

      <Suspense fallback={<ParrainageSkeleton />}>
        <ParrainageSection />
      </Suspense>
    </div>
  );
}

async function ParrainageSection() {
  const { supabase, user } = await getCurrentUser();
  const stats = await getParrainageStats(supabase, user!.id);

  const code = stats.code ?? "-";
  const lien = stats.code
    ? `https://estime-app.com/inscription?ref=${stats.code}`
    : null;

  return (
    <>
      <div className="relative overflow-hidden bg-dusk rounded-2xl p-8 lg:p-10 mb-8">
        <div
          className="lumiere-fin-chantier absolute -top-10 -right-10 w-56 h-56 rounded-full blur-3xl opacity-50 pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative w-12 h-12 rounded-xl bg-ambre/20 flex items-center justify-center mb-5">
          <Gift size={24} weight="fill" className="text-ambre" aria-hidden="true" />
        </div>
        <p className="relative text-dust/55 text-sm font-medium mb-2">
          Votre code de parrainage
        </p>
        <div className="relative flex flex-wrap items-center gap-4 mb-6">
          <span className="font-display text-3xl lg:text-4xl font-bold text-dust tracking-tight">
            {code}
          </span>
          {stats.code && <CopierParrainage value={stats.code} label="Copier le code" />}
        </div>

        {lien && (
          <div className="relative flex flex-wrap items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
            <p className="text-dust/70 text-sm flex-1 min-w-0 truncate">{lien}</p>
            <CopierParrainage value={lien} label="Copier le lien" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-dusk/8 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-ambre/10 flex items-center justify-center shrink-0">
            <Users size={22} className="text-ambre" aria-hidden="true" />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-dusk">
              {stats.totalFilleuls}
            </p>
            <p className="text-dusk/50 text-sm">
              {stats.totalFilleuls === 1 ? "Filleul parrainé" : "Filleuls parrainés"}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-dusk/8 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-ambre/10 flex items-center justify-center shrink-0">
            <CalendarCheck size={22} className="text-ambre" aria-hidden="true" />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-dusk">
              {stats.moisGagnes}
            </p>
            <p className="text-dusk/50 text-sm">
              {stats.moisGagnes === 1 ? "Mois gratuit gagné" : "Mois gratuits gagnés"}
            </p>
          </div>
        </div>
      </div>

      <h2 className="font-display text-lg font-bold text-dusk mb-4">Vos parrainages</h2>

      {stats.parrainages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dusk/8 py-16 px-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-ambre/10 rounded-full flex items-center justify-center mb-5">
            <Gift size={26} className="text-ambre" aria-hidden="true" />
          </div>
          <h3 className="font-display text-xl font-bold text-dusk mb-2">
            Aucun filleul pour l&apos;instant
          </h3>
          <p className="text-dusk/50 text-sm max-w-[40ch]">
            Partagez votre code ou votre lien pour commencer à gagner des mois
            gratuits.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dusk/8 divide-y divide-dusk/8">
          {stats.parrainages.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-dusk truncate">
                  {entry.filleul_email ?? "Email inconnu"}
                </p>
                <p className="text-dusk/45 text-xs mt-0.5">
                  {new Date(entry.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <span
                className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
                  entry.statut === "converti"
                    ? "bg-ambre/10 text-braise"
                    : "bg-dusk/5 text-dusk/60"
                }`}
              >
                {entry.statut === "converti" ? (
                  <Check size={14} weight="bold" aria-hidden="true" />
                ) : (
                  <Clock size={14} weight="bold" aria-hidden="true" />
                )}
                {STATUT_LABELS[entry.statut] ?? entry.statut}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function ParrainageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-44 bg-dusk/10 rounded-2xl mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="h-24 bg-white border border-dusk/8 rounded-2xl" />
        <div className="h-24 bg-white border border-dusk/8 rounded-2xl" />
      </div>
      <div className="h-6 w-40 bg-dusk/8 rounded mb-4" />
      <div className="bg-white rounded-2xl border border-dusk/8 divide-y divide-dusk/8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 px-5 py-4" />
        ))}
      </div>
    </div>
  );
}
