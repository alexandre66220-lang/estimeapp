import type { Metadata } from "next";
import Link from "next/link";
import {
  TrendUp,
  TrendDown,
  CurrencyEur,
  HardHat,
  ChartBar,
  Trophy,
  Download,
  Target,
} from "@phosphor-icons/react/dist/ssr";
import { getCurrentUser } from "@/lib/supabase/server";
import { getFinancesData } from "@/lib/supabase/finances";
import { getFinancesEtendues } from "@/lib/supabase/paiements";
import { ObjectifAnnuelForm } from "@/components/espace/ObjectifAnnuelForm";
import { MontantChantierForm } from "@/components/espace/MontantChantierForm";
import { FinancesChartWrapper } from "@/components/espace/FinancesChartWrapper";
import { FinancesTabs } from "@/components/espace/FinancesTabs";
import { getRentabiliteAnnuelle } from "@/components/espace/RentabiliteFinances";
import { SanteFinanciere } from "@/components/espace/SanteFinanciere";
import { AjouterDonneeFinanciereModal } from "@/components/espace/AjouterDonneeFinanciereModal";

export const metadata: Metadata = { title: "Finances, Estime" };

function fmt(n: number) {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 0 });
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-dusk/8 p-5 lg:p-6">
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-dusk/40">{icon}</span>
      </div>
      <p className="font-display text-2xl font-bold text-dusk">{value}</p>
      <p className="text-xs text-dusk/45 mt-0.5">{label}</p>
      {sub && <div className="mt-2">{sub}</div>}
    </div>
  );
}

function StatutBadge({ statut }: { statut: string | null }) {
  if (statut === "termine") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
        Terminé
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-ambre/10 text-braise">
      En cours
    </span>
  );
}

function encouragement(pct: number) {
  if (pct >= 100) return "🏆 Objectif atteint !";
  if (pct >= 75) return "🚀 Vous êtes sur la bonne voie !";
  if (pct >= 40) return "💪 Continuez sur cette lancée !";
  return "⚡ Accélérez !";
}

export default async function FinancesPage() {
  const { supabase, user } = await getCurrentUser();
  const [data, rentabiliteAnnuelle, financesEtendues, { data: chantiersListe }, { data: profilFiscal }] = await Promise.all([
    getFinancesData(supabase, user!.id),
    getRentabiliteAnnuelle(supabase, user!.id),
    getFinancesEtendues(supabase, user!.id),
    supabase
      .from("chantiers")
      .select("id, titre")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("profiles")
      .select("taux_imposition_estime")
      .eq("id", user!.id)
      .maybeSingle(),
  ]);

  const chantiersPourSelect = (chantiersListe ?? []).map((c: { id: string; titre: string | null }) => ({
    id: c.id,
    titre: c.titre ?? "Chantier sans titre",
  }));

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthKey = `${currentYear}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const objectifPct =
    data.objectifAnnuel && data.objectifAnnuel > 0
      ? Math.min(100, Math.round((data.caAnnee / data.objectifAnnuel) * 100))
      : null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold text-dusk">Finances</h1>
          <p className="text-dusk/50 text-sm mt-1">
            Suivi de votre chiffre d&apos;affaires et de vos paiements.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <AjouterDonneeFinanciereModal chantiers={chantiersPourSelect} />
          <a
            href="/api/finances/export"
            download
            className="inline-flex items-center gap-2 text-dusk font-medium text-sm px-5 py-2.5 rounded-full border border-dusk/20 hover:bg-dusk/5 active:scale-[0.97] transition-all duration-200"
          >
            <Download size={16} weight="bold" />
            Exporter CSV {currentYear}
          </a>
        </div>
      </div>

      <FinancesTabs
        rentabiliteAnnuelle={rentabiliteAnnuelle}
        impayes={financesEtendues.impayes}
        previsionnel={financesEtendues.previsionnel}
        seuilAlerte={1000}
        tauxImposition={profilFiscal?.taux_imposition_estime ?? null}
      >
      {/* État vide */}
      {!data.hasAnyData && (
        <div className="bg-white rounded-2xl border border-dusk/8 py-20 px-6 flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-ambre/10 rounded-full flex items-center justify-center mb-5">
            <CurrencyEur size={30} className="text-ambre" />
          </div>
          <h2 className="font-display text-xl font-bold text-dusk mb-2">
            Aucun chantier avec montant
          </h2>
          <p className="text-dusk/50 text-sm max-w-[40ch] mb-6">
            Renseignez un montant sur vos chantiers pour voir apparaître vos données financières ici.
          </p>
          <Link
            href="/espace/mes-chantiers"
            className="inline-flex items-center gap-2 bg-braise text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-ambre transition-colors duration-200"
          >
            <HardHat size={16} weight="bold" />
            Mes chantiers
          </Link>
        </div>
      )}

      <div className="space-y-6">
        {/* SECTION 0 : Santé financière */}
        <SanteFinanciere
          tauxRecouvrement={financesEtendues.sante.tauxRecouvrement}
          delaiMoyenPaiement={financesEtendues.sante.delaiMoyenPaiement}
          nbFacturesEnRetard={financesEtendues.sante.nbFacturesEnRetard}
          montantTotalEnRetard={financesEtendues.sante.montantTotalEnRetard}
        />

        {/* SECTION 1 : Mois en cours */}
        <section>
          <h2 className="font-display text-lg font-bold text-dusk mb-4">
            {new Date(currentYear, now.getMonth(), 1).toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<CurrencyEur size={20} />}
              label="CA du mois"
              value={`${fmt(data.caMoisCourant)} €`}
            />
            <StatCard
              icon={<HardHat size={20} />}
              label="Chantiers ce mois"
              value={String(data.chantiersMoisCourant)}
            />
            <StatCard
              icon={<ChartBar size={20} />}
              label="Montant moyen"
              value={data.chantiersMoisCourant > 0 ? `${fmt(data.moyenneMoisCourant)} €` : "-"}
            />
            <StatCard
              icon={
                data.variationPct !== null && data.variationPct >= 0 ? (
                  <TrendUp size={20} className="text-green-500" />
                ) : (
                  <TrendDown size={20} className="text-red-500" />
                )
              }
              label="vs mois précédent"
              value={
                data.variationPct !== null
                  ? `${data.variationPct >= 0 ? "+" : ""}${Math.round(data.variationPct)} %`
                  : "-"
              }
              sub={
                data.variationPct !== null ? (
                  <span
                    className={`text-xs font-medium ${
                      data.variationPct >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {data.variationPct >= 0 ? "En hausse" : "En baisse"}
                  </span>
                ) : undefined
              }
            />
          </div>
        </section>

        {/* SECTION 2 : Graphique 12 mois */}
        <section className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8">
          <h2 className="font-display text-lg font-bold text-dusk mb-1">
            Évolution mensuelle
          </h2>
          <p className="text-dusk/45 text-xs mb-6">12 derniers mois · barre terracotta = mois en cours</p>
          <FinancesChartWrapper data={data.monthly} currentMonth={currentMonthKey} />
        </section>

        {/* SECTION 3 : Année */}
        <section>
          <h2 className="font-display text-lg font-bold text-dusk mb-4">
            Année {currentYear}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <StatCard
              icon={<CurrencyEur size={20} />}
              label={`CA ${currentYear}`}
              value={`${fmt(data.caAnnee)} €`}
            />
            <StatCard
              icon={<Trophy size={20} />}
              label="Meilleur mois"
              value={
                data.meilleurMois
                  ? `${data.meilleurMois.label} · ${fmt(data.meilleurMois.ca)} €`
                  : "-"
              }
            />
            <div className="bg-white rounded-2xl border border-dusk/8 p-5 lg:p-6">
              <div className="flex items-start gap-2 mb-3">
                <Target size={20} className="text-dusk/40 shrink-0" />
                <p className="text-xs text-dusk/45 leading-tight">Objectif annuel (€)</p>
              </div>
              {data.objectifAnnuel && data.objectifAnnuel > 0 ? (
                <>
                  <p className="font-display text-2xl font-bold text-dusk mb-1">
                    {objectifPct} %
                  </p>
                  <div className="w-full bg-dusk/8 rounded-full h-2 mb-2">
                    <div
                      className="h-2 rounded-full bg-braise transition-all duration-500"
                      style={{ width: `${objectifPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-dusk/50 mb-1">
                    {fmt(data.caAnnee)} € / {fmt(data.objectifAnnuel)} €
                  </p>
                  <p className="text-xs font-medium text-braise">
                    {encouragement(objectifPct!)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-dusk/40 mb-1">Pas encore défini</p>
              )}
              <ObjectifAnnuelForm objectif={data.objectifAnnuel} />
            </div>
          </div>
        </section>

        {/* SECTION 4 : Derniers chantiers */}
        {data.dernierChantiers.length > 0 && (
          <section className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8">
            <h2 className="font-display text-lg font-bold text-dusk mb-5">
              Derniers chantiers facturés
            </h2>
            <div className="divide-y divide-dusk/8">
              {data.dernierChantiers.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-4 py-3.5 flex-wrap"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/espace/chantiers/${c.id}`}
                      className="text-sm font-medium text-dusk hover:text-braise transition-colors"
                    >
                      {c.titre}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      {c.clientNom && (
                        <span className="text-xs text-dusk/40">{c.clientNom}</span>
                      )}
                      <span className="text-xs text-dusk/25">·</span>
                      <span className="text-xs text-dusk/40">
                        {new Date(c.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatutBadge statut={c.statut} />
                    <MontantChantierForm chantierId={c.id} montant={c.montant} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      </FinancesTabs>
    </div>
  );
}
