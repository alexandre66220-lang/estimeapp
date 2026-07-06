import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/supabase/server";
import {
  ACTIONS_POINTS,
  NIVEAUX_FIDELITE,
  NIVEAUX_ORDER,
  type NiveauFidelite,
  type ActionFidelite,
} from "@/lib/fidelite/constants";

export const metadata: Metadata = { title: "Fidélité — Estime" };

const BADGE_STYLE: Record<NiveauFidelite, string> = {
  apprenti: "bg-gray-100 text-gray-500 border-gray-200",
  confirme: "bg-amber-50 text-amber-800 border-amber-200",
  expert:   "bg-gray-100 text-gray-600 border-gray-300",
  maitre:   "bg-yellow-50 text-yellow-800 border-yellow-300",
  legende:  "bg-braise/10 text-braise border-braise/30",
};

const RECOMPENSES_DESC: Partial<Record<NiveauFidelite, string>> = {
  confirme: "Accès prioritaire aux nouvelles fonctionnalités",
  expert:   "1 mois d'abonnement offert (crédit automatique)",
  maitre:   "Badge « Artisan Expert Estime » sur votre vitrine publique",
  legende:  "Mention sur la landing page Estime + 2 mois offerts",
};

function fmt(n: number) {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 0 });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function FidelitePage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>;
}) {
  const { action: filterAction } = await searchParams;

  const { supabase, user } = await getCurrentUser();

  const [
    { data: profile },
    { data: allHistory },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("points_total, niveau, streak_jours, recompenses")
      .eq("id", user!.id)
      .maybeSingle(),
    supabase
      .from("points_fidelite")
      .select("action, points, created_at, meta")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const totalPoints = profile?.points_total ?? 0;
  const niveau = (profile?.niveau ?? "apprenti") as NiveauFidelite;
  const streakJours = profile?.streak_jours ?? 0;
  const recompensesObtenues: Array<{ niveau: NiveauFidelite; obtenu_le: string }> =
    Array.isArray(profile?.recompenses) ? profile.recompenses : [];

  const niveauInfo = NIVEAUX_FIDELITE[niveau];
  const nextNiveauKey = NIVEAUX_ORDER[NIVEAUX_ORDER.indexOf(niveau) + 1] ?? null;
  const nextNiveauInfo = nextNiveauKey ? NIVEAUX_FIDELITE[nextNiveauKey] : null;
  const pointsManquants = nextNiveauInfo ? nextNiveauInfo.min - totalPoints : 0;
  const progressPct = nextNiveauInfo
    ? Math.min(100, Math.round(((totalPoints - niveauInfo.min) / (nextNiveauInfo.min - niveauInfo.min)) * 100))
    : 100;

  // Actions faites aujourd'hui
  const today = new Date().toISOString().slice(0, 10);
  const todayActions = new Set(
    (allHistory ?? [])
      .filter((h) => h.created_at >= `${today}T00:00:00Z`)
      .map((h) => h.action)
  );

  // Historique filtré + limité
  const history = (allHistory ?? []).filter(
    (h) => !filterAction || h.action === filterAction
  ).slice(0, 20);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 lg:py-16 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-dusk">Programme Fidélité</h1>
        <p className="text-dusk/50 text-sm mt-1">
          Gagnez des points en utilisant Estime et débloquez des récompenses.
        </p>
      </div>

      {/* SECTION 1 — Niveau actuel */}
      <section className="bg-dusk rounded-2xl p-6 lg:p-8">
        <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
          <div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-semibold mb-3 ${BADGE_STYLE[niveau]}`}
            >
              {niveauInfo.emoji} {niveauInfo.label}
            </span>
            <p className="font-display text-4xl font-bold text-dust">
              {fmt(totalPoints)} pts
            </p>
            {streakJours > 0 && (
              <p className="text-dust/60 text-sm mt-1">
                🔥 {streakJours} jour{streakJours > 1 ? "s" : ""} de suite
              </p>
            )}
          </div>
          {nextNiveauInfo && (
            <div className="text-right">
              <p className="text-dust/50 text-xs">Prochain niveau</p>
              <p className="text-dust font-semibold">{nextNiveauInfo.emoji} {nextNiveauInfo.label}</p>
              <p className="text-dust/40 text-xs">{fmt(pointsManquants)} pts manquants</p>
            </div>
          )}
        </div>

        <div className="w-full bg-dust/10 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-700 ${
              niveau === "legende" ? "bg-braise" : "bg-ambre"
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {nextNiveauInfo && (
          <p className="text-dust/40 text-xs mt-2">
            {fmt(totalPoints)} / {fmt(nextNiveauInfo.min)} pts vers {nextNiveauInfo.label}
          </p>
        )}
      </section>

      {/* SECTION 2 — Comment gagner des points */}
      <section>
        <h2 className="font-display text-lg font-bold text-dusk mb-4">Comment gagner des points</h2>
        <div className="bg-white rounded-2xl border border-dusk/8 divide-y divide-dusk/8">
          {(Object.entries(ACTIONS_POINTS) as [ActionFidelite, { label: string; points: number }][]).map(
            ([key, { label, points }]) => {
              const doneToday = todayActions.has(key);
              return (
                <div key={key} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    {doneToday ? (
                      <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0 text-white text-xs font-bold">✓</span>
                    ) : (
                      <span className="w-5 h-5 rounded-full border-2 border-dusk/20 shrink-0" />
                    )}
                    <span className={`text-sm ${doneToday ? "text-dusk/50 line-through" : "text-dusk"}`}>
                      {label}
                    </span>
                  </div>
                  <span className={`text-sm font-semibold shrink-0 ${doneToday ? "text-green-600" : "text-ambre"}`}>
                    +{points} pts
                  </span>
                </div>
              );
            }
          )}
        </div>
      </section>

      {/* SECTION 3 — Historique */}
      <section>
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <h2 className="font-display text-lg font-bold text-dusk">Historique</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="/espace/fidelite"
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                !filterAction
                  ? "bg-dusk text-dust border-dusk"
                  : "text-dusk/60 border-dusk/15 hover:border-dusk/30"
              }`}
            >
              Tout
            </a>
            {(Object.keys(ACTIONS_POINTS) as ActionFidelite[]).map((key) => (
              <a
                key={key}
                href={`/espace/fidelite?action=${key}`}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  filterAction === key
                    ? "bg-dusk text-dust border-dusk"
                    : "text-dusk/60 border-dusk/15 hover:border-dusk/30"
                }`}
              >
                {ACTIONS_POINTS[key].label}
              </a>
            ))}
          </div>
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dusk/8 py-12 text-center">
            <p className="text-dusk/40 text-sm">Aucune action enregistrée.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dusk/8 divide-y divide-dusk/8">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div>
                  <p className="text-sm text-dusk font-medium">
                    {ACTIONS_POINTS[h.action as ActionFidelite]?.label ?? h.action}
                  </p>
                  <p className="text-xs text-dusk/40 mt-0.5">{fmtDate(h.created_at)}</p>
                </div>
                <span className="text-sm font-semibold text-ambre shrink-0">+{h.points} pts</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 4 — Récompenses */}
      <section>
        <h2 className="font-display text-lg font-bold text-dusk mb-4">Récompenses</h2>
        <div className="space-y-3">
          {(NIVEAUX_ORDER.filter((n) => n !== "apprenti") as NiveauFidelite[]).map((n) => {
            const info = NIVEAUX_FIDELITE[n];
            const obtained = recompensesObtenues.find((r) => r.niveau === n);
            const unlocked = NIVEAUX_ORDER.indexOf(niveau) >= NIVEAUX_ORDER.indexOf(n);
            const desc = RECOMPENSES_DESC[n] ?? "";

            return (
              <div
                key={n}
                className={`rounded-2xl border p-5 flex items-start gap-4 transition-all ${
                  unlocked
                    ? "bg-white border-dusk/8"
                    : "bg-white/50 border-dusk/5 opacity-60"
                }`}
              >
                <span className="text-2xl shrink-0">{info.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-dusk text-sm">{info.label}</p>
                    {obtained ? (
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                        Débloqué {fmtDate(obtained.obtenu_le)}
                      </span>
                    ) : (
                      <span className="text-xs text-dusk/40">
                        Dès {fmt(info.min)} pts
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-dusk/55 mt-1">{desc}</p>
                </div>
                {!unlocked && (
                  <span className="text-dusk/20 text-xl shrink-0">🔒</span>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
