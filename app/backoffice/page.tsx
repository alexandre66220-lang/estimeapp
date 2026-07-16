import { Header } from "@/components/backoffice/Header";
import { StatCard } from "@/components/backoffice/StatCard";
import { Card } from "@/components/backoffice/Card";
import { CaManuelCard } from "@/components/backoffice/CaManuelCard";
import { FacturesPanel } from "@/components/backoffice/FacturesPanel";
import { getCurrentUser } from "@/lib/supabase/server";
import { getCaManuelDuMois, getFactures, getMontantEnAttente } from "@/lib/backoffice/queries";
import { getMRREstime, getChurnEstimeDuMois, getNouveauxAbonnesEstime } from "@/lib/backoffice/estime-readonly";

export default async function BackofficePage() {
  const { supabase } = await getCurrentUser();

  const [caManuel, factures, enAttente, mrr, churn, abonnes] = await Promise.all([
    getCaManuelDuMois(supabase),
    getFactures(supabase),
    getMontantEnAttente(supabase),
    getMRREstime(),
    getChurnEstimeDuMois(),
    getNouveauxAbonnesEstime(),
  ]);

  return (
    <>
      <Header title="Vue d'ensemble" subtitle="ALCALSPARK & Estime" />

      <div className="p-4 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CaManuelCard montantActuel={caManuel} />
          <StatCard
            label="MRR Estime"
            value={`${mrr.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`}
            sublabel="Abonnements Stripe actifs"
            accent
          />
          <StatCard
            label="En attente de paiement"
            value={`${enAttente.montant.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`}
            sublabel={`${enAttente.nb} facture${enAttente.nb > 1 ? "s" : ""}`}
          />
          <StatCard
            label="Churn Estime"
            value={String(churn)}
            sublabel="Résiliations ce mois-ci"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <FacturesPanel factures={factures} />

          <Card title="Nouveaux abonnés Estime">
            {abonnes.length === 0 ? (
              <p className="px-5 py-6 text-sm text-[#55555A]">Aucun abonné pour l&apos;instant.</p>
            ) : (
              <ul className="divide-y divide-[#232326]">
                {abonnes.map((a) => (
                  <li key={a.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <span className="text-sm text-[#EDEDED] truncate">{a.nom}</span>
                    <span className="text-xs text-[#8B8B8D] shrink-0">
                      {[a.metier, a.ville].filter(Boolean).join(" · ") || "—"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
