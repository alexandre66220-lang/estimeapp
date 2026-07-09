import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Lightbulb } from "@phosphor-icons/react/dist/ssr";
import { getCurrentUser } from "@/lib/supabase/server";
import { computeReputationScore, NIVEAUX } from "@/lib/score/reputation";

export const metadata: Metadata = {
  title: "Score de réputation, Estime",
};

export default function Score() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 lg:py-16">
      <Link
        href="/espace/tableau-de-bord"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-dusk/60 hover:text-dusk transition-colors duration-200 mb-6"
      >
        <ArrowLeft size={16} weight="bold" aria-hidden="true" />
        Retour au tableau de bord
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-dusk">Score de réputation</h1>
        <p className="text-dusk/50 text-sm mt-1">
          Le détail de votre score et comment le faire progresser.
        </p>
      </div>

      <Suspense fallback={<ScoreSkeleton />}>
        <ScoreSection />
      </Suspense>
    </div>
  );
}

async function ScoreSection() {
  const { supabase, user } = await getCurrentUser();

  const [score, { data: historique }] = await Promise.all([
    computeReputationScore(supabase, user!.id),
    supabase
      .from("reputation_history")
      .select("score, recorded_on")
      .eq("user_id", user!.id)
      .order("recorded_on", { ascending: true })
      .limit(30),
  ]);

  const niveau = NIVEAUX[score.niveau];
  const conseils = score.criteres.filter((critere) => critere.points < critere.pointsMax);

  return (
    <>
      <div className="bg-dusk rounded-2xl p-6 lg:p-8 mb-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <p className="font-display text-4xl font-bold text-dust leading-none">
            {score.total}
            <span className="text-dust/40 text-xl font-normal">/100</span>
          </p>
          <span className="text-xs font-semibold text-dust bg-braise px-3 py-1 rounded-full">
            {niveau.label}
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-dust/10 overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-braise transition-all duration-300"
            style={{ width: `${score.total}%` }}
          />
        </div>
        <p className="text-dust/55 text-sm leading-relaxed">{niveau.message}</p>
      </div>

      <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 mb-8">
        <h2 className="font-display text-lg font-bold text-dusk mb-5">Détail du score</h2>
        <div className="flex flex-col gap-4">
          {score.criteres.map((critere) => (
            <div key={critere.cle}>
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <p className="text-sm font-medium text-dusk">{critere.label}</p>
                <p className="text-sm font-semibold text-dusk shrink-0">
                  {critere.points} <span className="text-dusk/40">/ {critere.pointsMax}</span>
                </p>
              </div>
              <div className="h-2 rounded-full bg-dusk/8 overflow-hidden">
                <div
                  className="h-full rounded-full bg-braise"
                  style={{
                    width: `${critere.pointsMax > 0 ? (critere.points / critere.pointsMax) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {conseils.length > 0 && (
        <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 mb-8">
          <h2 className="font-display text-lg font-bold text-dusk mb-5">
            Comment progresser
          </h2>
          <div className="flex flex-col gap-3">
            {conseils.map((critere) => (
              <div key={critere.cle} className="flex items-start gap-2.5 text-sm text-dusk/70">
                <Lightbulb size={16} weight="bold" className="text-ambre shrink-0 mt-0.5" aria-hidden="true" />
                <p>{critere.conseil}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {conseils.length === 0 && (
        <div className="flex items-center gap-2.5 text-braise text-sm font-medium mb-8">
          <CheckCircle size={18} weight="bold" aria-hidden="true" />
          Tous les critères sont au maximum, bravo !
        </div>
      )}

      {historique && historique.length > 1 && (
        <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8">
          <h2 className="font-display text-lg font-bold text-dusk mb-5">
            Évolution du score
          </h2>
          <div className="flex items-end gap-1.5 h-32">
            {historique.map((point) => (
              <div
                key={point.recorded_on}
                className="flex-1 rounded-t-sm bg-braise/70"
                style={{ height: `${Math.max(point.score, 4)}%` }}
                title={`${point.score}/100 le ${new Date(point.recorded_on).toLocaleDateString("fr-FR")}`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-dusk/40">
            <span>{new Date(historique[0].recorded_on).toLocaleDateString("fr-FR")}</span>
            <span>
              {new Date(historique[historique.length - 1].recorded_on).toLocaleDateString("fr-FR")}
            </span>
          </div>
        </div>
      )}
    </>
  );
}

function ScoreSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      <div className="h-40 bg-dusk/10 rounded-2xl" />
      <div className="h-64 bg-white border border-dusk/8 rounded-2xl" />
    </div>
  );
}
