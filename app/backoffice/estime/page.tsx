import { Header } from "@/components/backoffice/Header";
import { StatCard } from "@/components/backoffice/StatCard";
import { Card } from "@/components/backoffice/Card";
import { EvolutionChart } from "@/components/backoffice/EvolutionChart";
import { AbonnesEstimeList } from "@/components/backoffice/AbonnesEstimeList";
import {
  getMRREstime,
  getChurnEstimeDuMois,
  getTousLesAbonnesEstime,
  getRepartitionMetierVille,
  getChurnDetail,
  getMRREvolution,
} from "@/lib/backoffice/estime-readonly";

export default async function EstimePage() {
  const [mrr, churn, abonnes, repartition, churnDetail, evolution] = await Promise.all([
    getMRREstime(),
    getChurnEstimeDuMois(),
    getTousLesAbonnesEstime(),
    getRepartitionMetierVille(),
    getChurnDetail(15),
    getMRREvolution(6),
  ]);

  return (
    <>
      <Header title="Estime" subtitle="Monitoring détaillé — lecture seule" />

      <div className="p-4 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="MRR actuel"
            value={`${mrr.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`}
            sublabel="Abonnements Stripe actifs"
            accent
          />
          <StatCard label="Abonnés actifs" value={String(abonnes.length)} sublabel="is_subscribed = true" />
          <StatCard label="Churn ce mois-ci" value={String(churn)} sublabel="Résiliations" />
        </div>

        <Card title="CA encaissé (6 derniers mois)">
          <div className="p-5">
            <EvolutionChart data={evolution} series={[{ key: "montant", label: "CA Estime", color: "#4ADE80" }]} />
          </div>
          <p className="px-5 pb-4 text-xs text-[#55555A]">
            Stripe ne conserve pas d&apos;historique du MRR : cette courbe reflète le montant réellement encaissé
            (factures payées) mois par mois, une proxy fiable de la tendance.
          </p>
        </Card>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card title="Répartition par métier">
            {repartition.parMetier.length === 0 ? (
              <p className="px-5 py-6 text-sm text-[#55555A]">Aucune donnée.</p>
            ) : (
              <ul className="divide-y divide-[#232326]">
                {repartition.parMetier.map((r) => (
                  <li key={r.cle} className="px-5 py-2.5 flex items-center justify-between gap-3">
                    <span className="text-sm text-[#EDEDED]">{r.cle}</span>
                    <span className="text-xs text-[#8B8B8D]">{r.nb}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Répartition par ville">
            {repartition.parVille.length === 0 ? (
              <p className="px-5 py-6 text-sm text-[#55555A]">Aucune donnée.</p>
            ) : (
              <ul className="divide-y divide-[#232326]">
                {repartition.parVille.map((r) => (
                  <li key={r.cle} className="px-5 py-2.5 flex items-center justify-between gap-3">
                    <span className="text-sm text-[#EDEDED]">{r.cle}</span>
                    <span className="text-xs text-[#8B8B8D]">{r.nb}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card title="Abonnés actifs">
          <AbonnesEstimeList abonnes={abonnes} />
        </Card>

        <Card title="Détail du churn">
          {churnDetail.length === 0 ? (
            <p className="px-5 py-6 text-sm text-[#55555A]">Aucune résiliation récente.</p>
          ) : (
            <ul className="divide-y divide-[#232326]">
              {churnDetail.map((c) => (
                <li key={c.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <span className="text-sm text-[#EDEDED] truncate">{c.clientEmail ?? "Client inconnu"}</span>
                  <span className="text-xs text-[#8B8B8D] shrink-0">
                    {new Date(c.date).toLocaleDateString("fr-FR")} · {c.raison ?? "raison non trackée"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
