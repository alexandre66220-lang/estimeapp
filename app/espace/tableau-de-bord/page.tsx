import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  HardHat,
  Plus,
  Star,
  Megaphone,
  PaperPlaneTilt,
  Camera,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import ChantierCard from "@/components/espace/ChantierCard";

export const metadata: Metadata = {
  title: "Tableau de bord - Estime",
};

const STATS = [
  { label: "Chantiers ce mois", value: 0, icon: HardHat },
  { label: "Avis reçus", value: 0, icon: Star },
  { label: "Posts générés", value: 0, icon: Megaphone },
  { label: "Recommandations envoyées", value: 0, icon: PaperPlaneTilt },
];

const ONBOARDING_STEPS = [
  { icon: Camera, label: "Photo du chantier" },
  { icon: Sparkle, label: "L'IA génère le post" },
  { icon: Star, label: "Relance pour l'avis" },
];

const CHANTIERS_RECENTS_LIMIT = 5;

export default function TableauDeBord() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-dusk">
            Tableau de bord
          </h1>
          <p className="text-dusk/50 text-sm mt-1">
            Vue d&apos;ensemble de votre activité.
          </p>
        </div>
        <Link
          href="/espace/nouveau-chantier"
          className="hidden sm:inline-flex items-center gap-2 bg-braise text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200"
        >
          <Plus size={18} weight="bold" aria-hidden="true" />
          Nouveau chantier
        </Link>
      </div>

      <div className="flex flex-wrap items-stretch gap-x-10 gap-y-6 py-7 border-y border-dusk/10 mb-10">
        {STATS.map(({ label, value, icon: Icon }, i) => (
          <div
            key={label}
            className={`flex items-center gap-3.5 pr-10 ${
              i < STATS.length - 1 ? "sm:border-r border-dusk/10" : ""
            }`}
          >
            <Icon size={22} className="text-ambre shrink-0" aria-hidden="true" />
            <div>
              <p className="font-display text-2xl font-bold text-dusk leading-none">{value}</p>
              <p className="text-dusk/45 text-xs mt-1.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <Suspense fallback={<ChantiersRecentsSkeleton />}>
        <ChantiersRecents />
      </Suspense>
    </div>
  );
}

async function ChantiersRecents() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: chantiers, count } = await supabase
    .from("chantiers")
    .select("id, titre, statut, photo_avant_url, photo_apres_url, created_at", {
      count: "exact",
    })
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(CHANTIERS_RECENTS_LIMIT);

  const hasChantiers = Boolean(chantiers && chantiers.length > 0);

  return (
    <>
      {!hasChantiers && (
        <div className="relative overflow-hidden bg-dusk rounded-2xl p-8 lg:p-10 mb-10">
          <div
            className="lumiere-fin-chantier absolute -top-10 -right-10 w-56 h-56 rounded-full blur-3xl opacity-50 pointer-events-none"
            aria-hidden="true"
          />
          <h2 className="font-display text-2xl lg:text-3xl font-bold text-dust mb-2 relative">
            Bienvenue sur Estime
          </h2>
          <p className="text-dust/55 text-sm lg:text-base max-w-[52ch] mb-8 relative">
            Trois étapes séparent votre prochain chantier d&apos;un post Instagram
            prêt à publier et d&apos;un nouvel avis Google.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 relative">
            {ONBOARDING_STEPS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-ambre/20 flex items-center justify-center shrink-0">
                  <Icon size={20} weight="fill" className="text-ambre" aria-hidden="true" />
                </div>
                <p className="text-dust/85 text-sm font-medium leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="font-display text-lg font-bold text-dusk">Vos chantiers</h2>
        {hasChantiers && count && count > CHANTIERS_RECENTS_LIMIT && (
          <Link
            href="/espace/mes-chantiers"
            className="text-sm font-medium text-ambre hover:underline"
          >
            Voir tous mes chantiers
          </Link>
        )}
      </div>

      {hasChantiers ? (
        <div className="flex flex-col gap-3">
          {chantiers!.map((chantier) => (
            <ChantierCard key={chantier.id} chantier={chantier} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dusk/8 py-20 px-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-ambre/10 rounded-full flex items-center justify-center mb-5">
            <HardHat size={26} className="text-ambre" aria-hidden="true" />
          </div>
          <h3 className="font-display text-xl font-bold text-dusk mb-2">
            Aucun chantier pour l&apos;instant
          </h3>
          <p className="text-dusk/50 text-sm max-w-[40ch] mb-7">
            Ajoutez votre premier chantier pour générer vos photos avant/après et
            vos posts réseaux en quelques secondes.
          </p>
          <Link
            href="/espace/nouveau-chantier"
            className="inline-flex items-center gap-2 bg-braise text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200"
          >
            <Plus size={18} weight="bold" aria-hidden="true" />
            Nouveau chantier
          </Link>
        </div>
      )}
    </>
  );
}

function ChantiersRecentsSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="h-6 w-40 bg-dusk/8 rounded mb-4" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-20 bg-white border border-dusk/8 rounded-2xl" />
      ))}
    </div>
  );
}
