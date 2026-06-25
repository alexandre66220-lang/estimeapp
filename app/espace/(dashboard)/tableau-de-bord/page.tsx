import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  HardHat,
  Plus,
  Star,
  Camera,
  Sparkle,
  PaperPlaneTilt,
  Megaphone,
} from "@phosphor-icons/react/dist/ssr";
import { getCurrentUser } from "@/lib/supabase/server";
import { getSignedChantierPhotoUrls } from "@/lib/supabase/storage";
import ChantierCard from "@/components/espace/ChantierCard";
import { EtoilesNote } from "@/components/espace/EtoilesNote";
import {
  getDashboardStats,
  getActiviteRecente,
} from "@/lib/supabase/dashboard-stats";
import {
  DashboardStatsCards,
  DashboardStatsSkeleton,
} from "@/components/espace/DashboardStats";
import { computeReputationScore, enregistrerHistoriqueScore } from "@/lib/score/reputation";
import { ReputationCard } from "@/components/espace/ReputationCard";

export const metadata: Metadata = {
  title: "Tableau de bord - Estime",
};

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

      <Suspense fallback={<ReputationCardSkeleton />}>
        <ReputationCardSection />
      </Suspense>

      <Suspense fallback={<DashboardStatsSkeleton />}>
        <DashboardStatsSection />
      </Suspense>

      <Suspense fallback={<ChantiersRecentsSkeleton />}>
        <ChantiersRecents />
      </Suspense>

      <Suspense fallback={<ActiviteRecenteSkeleton />}>
        <ActiviteRecente />
      </Suspense>
    </div>
  );
}

async function DashboardStatsSection() {
  const { supabase, user } = await getCurrentUser();

  const stats = await getDashboardStats(supabase, user!.id);

  return <DashboardStatsCards stats={stats} />;
}

async function ReputationCardSection() {
  const { supabase, user } = await getCurrentUser();

  const score = await computeReputationScore(supabase, user!.id);
  await enregistrerHistoriqueScore(supabase, user!.id, score.total);

  return <ReputationCard score={score} />;
}

function ReputationCardSkeleton() {
  return (
    <div className="bg-dusk rounded-2xl p-6 lg:p-7 mb-10 animate-pulse">
      <div className="h-4 w-40 bg-dust/10 rounded mb-4" />
      <div className="h-10 w-24 bg-dust/10 rounded mb-4" />
      <div className="h-2.5 w-full bg-dust/10 rounded-full mb-4" />
      <div className="h-4 w-3/4 bg-dust/10 rounded" />
    </div>
  );
}

async function ActiviteRecente() {
  const { supabase, user } = await getCurrentUser();

  const activite = await getActiviteRecente(supabase, user!.id, 5);

  if (activite.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="font-display text-lg font-bold text-dusk mb-4">
        Activité récente
      </h2>
      <div className="bg-white rounded-2xl border border-dusk/8 divide-y divide-dusk/8">
        {activite.map((chantier) => {
          const label = chantier.aPost && chantier.aEmail
            ? "Post généré · Email envoyé"
            : chantier.aPost
              ? "Post généré"
              : chantier.aEmail
                ? "Email envoyé"
                : "En attente";

          return (
            <Link
              key={chantier.id}
              href={`/espace/chantiers/${chantier.id}`}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-dust/40 transition-colors duration-200"
            >
              <div className="min-w-0">
                <p className="font-medium text-dusk truncate">{chantier.titre}</p>
                <p className="text-dusk/45 text-xs mt-0.5">
                  {new Date(chantier.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {Boolean(chantier.note) && <EtoilesNote note={chantier.note!} />}
                {(chantier.aPost || chantier.aEmail) && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-dusk/55">
                    {chantier.aPost && (
                      <Megaphone size={14} className="text-ambre" aria-hidden="true" />
                    )}
                    {chantier.aEmail && (
                      <PaperPlaneTilt size={14} className="text-ambre" aria-hidden="true" />
                    )}
                    {label}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function ActiviteRecenteSkeleton() {
  return (
    <div className="mt-10 animate-pulse">
      <div className="h-6 w-40 bg-dusk/8 rounded mb-4" />
      <div className="bg-white rounded-2xl border border-dusk/8 divide-y divide-dusk/8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 px-5 py-4" />
        ))}
      </div>
    </div>
  );
}

async function ChantiersRecents() {
  const { supabase, user } = await getCurrentUser();

  const { data: rawChantiers, count } = await supabase
    .from("chantiers")
    .select("id, titre, statut, photo_avant_url, photo_apres_url, created_at, note", {
      count: "exact",
    })
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(CHANTIERS_RECENTS_LIMIT);

  const chantiers = rawChantiers
    ? await getSignedChantierPhotoUrls(supabase, rawChantiers)
    : rawChantiers;

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
