import Link from "next/link";
import { Header } from "@/components/backoffice/Header";
import { StatCard } from "@/components/backoffice/StatCard";
import { Card } from "@/components/backoffice/Card";
import { Table, TableHead, Th, Tr, Td } from "@/components/backoffice/Table";
import { StatusBadge } from "@/components/backoffice/StatusBadge";
import { getCurrentUser } from "@/lib/supabase/server";
import { getFacturesListe, getMontantEnAttente, getCaDuMois } from "@/lib/backoffice/factures";
import { FACTURE_STATUT_TONE, factureStatutLabel } from "@/lib/backoffice/facture-statut";
import { getMRREstime, getChurnEstimeDuMois, getNouveauxAbonnesEstime } from "@/lib/backoffice/estime-readonly";

export default async function BackofficePage() {
  const { supabase } = await getCurrentUser();

  const [dernieresFactures, enAttente, caDuMois, mrr, churn, abonnes] = await Promise.all([
    getFacturesListe(supabase, 5),
    getMontantEnAttente(supabase),
    getCaDuMois(supabase),
    getMRREstime(),
    getChurnEstimeDuMois(),
    getNouveauxAbonnesEstime(),
  ]);

  return (
    <>
      <Header title="Vue d'ensemble" subtitle="ALCALSPARK & Estime" />

      <div className="p-4 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="CA du mois"
            value={`${caDuMois.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`}
            sublabel="Factures payées ce mois-ci"
          />
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
          <Card title="Dernières factures" action={<Link href="/backoffice/factures" className="text-xs text-[#8B8B8D] hover:text-[#EDEDED] transition-colors duration-150">Voir tout</Link>}>
            {dernieresFactures.length === 0 ? (
              <p className="px-5 py-6 text-sm text-[#55555A]">Aucune facture pour l&apos;instant.</p>
            ) : (
              <Table>
                <TableHead>
                  <Th>Client</Th>
                  <Th align="right">Montant</Th>
                  <Th align="right">Statut</Th>
                </TableHead>
                <tbody>
                  {dernieresFactures.map((f) => (
                    <Tr key={f.id}>
                      <Td>
                        <Link href={`/backoffice/factures/${f.id}`} className="hover:text-[#4ADE80] transition-colors duration-150">
                          {f.client_nom}
                        </Link>
                      </Td>
                      <Td align="right">{f.total_ttc.toLocaleString("fr-FR")} €</Td>
                      <Td align="right">
                        <StatusBadge tone={FACTURE_STATUT_TONE[f.statut]} label={factureStatutLabel(f.statut)} />
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>

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
