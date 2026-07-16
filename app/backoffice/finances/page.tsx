import { Header } from "@/components/backoffice/Header";
import { StatCard } from "@/components/backoffice/StatCard";
import { Card } from "@/components/backoffice/Card";
import { Table, TableHead, Th, Tr, Td } from "@/components/backoffice/Table";
import { StatusBadge } from "@/components/backoffice/StatusBadge";
import { PeriodeSelector } from "@/components/backoffice/PeriodeSelector";
import { EvolutionChart } from "@/components/backoffice/EvolutionChart";
import { DepenseForm } from "@/components/backoffice/DepenseForm";
import { getCurrentUser } from "@/lib/supabase/server";
import { resolvePeriode, type PeriodeCle } from "@/lib/backoffice/periode";
import {
  getFacturesParPeriode,
  getCaAlcalsparkParPeriode,
  getEvolutionCaAlcalspark,
} from "@/lib/backoffice/finances";
import { getCaEstimeParPeriode, getMRREvolution } from "@/lib/backoffice/estime-readonly";
import { getDepenses, getTotalDepenses } from "@/lib/backoffice/depenses";
import { FACTURE_STATUT_TONE, factureStatutLabel, type FactureStatut } from "@/lib/backoffice/facture-statut";

export default async function FinancesPage({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string; debut?: string; fin?: string; statut?: string }>;
}) {
  const sp = await searchParams;
  const periodeCle = (sp.periode as PeriodeCle) ?? "mois";
  const { debut, fin, label } = resolvePeriode(periodeCle, sp.debut, sp.fin);
  const statut = (sp.statut as FactureStatut | undefined) || undefined;

  const { supabase } = await getCurrentUser();

  const [factures, caAlcalspark, evolutionAlcalspark, caEstime, evolutionEstime, depenses, totalDepenses] =
    await Promise.all([
      getFacturesParPeriode(supabase, { debut, fin, statut }),
      getCaAlcalsparkParPeriode(supabase, { debut, fin }),
      getEvolutionCaAlcalspark(supabase, 6),
      getCaEstimeParPeriode({ debut, fin }),
      getMRREvolution(6),
      getDepenses(supabase, { debut, fin }),
      getTotalDepenses(supabase, { debut, fin }),
    ]);

  const caCumule = caAlcalspark + caEstime;
  const resultatNet = caCumule - totalDepenses;

  const evolutionCumulee = evolutionAlcalspark.map((a, i) => ({
    mois: a.mois,
    alcalspark: a.montant,
    estime: evolutionEstime[i]?.montant ?? 0,
  }));

  return (
    <>
      <Header title="Finances" subtitle="Vue détaillée ALCALSPARK & Estime" />

      <div className="p-4 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PeriodeSelector periodeActuelle={periodeCle} />
          <a
            href={`/api/backoffice/finances/export-csv?periode=${periodeCle}&debut=${debut}&fin=${fin}${statut ? `&statut=${statut}` : ""}`}
            className="text-xs font-medium text-[#8B8B8D] hover:text-[#EDEDED] transition-colors duration-150 border border-[#232326] rounded-md px-3 py-1.5"
          >
            Export CSV ({label})
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="CA ALCALSPARK"
            value={`${caAlcalspark.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`}
            sublabel={label}
          />
          <StatCard
            label="CA Estime"
            value={`${caEstime.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`}
            sublabel="Factures Stripe payées"
            accent
          />
          <StatCard
            label="CA cumulé"
            value={`${caCumule.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`}
            sublabel={label}
          />
          <StatCard
            label="Résultat net"
            value={`${resultatNet.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`}
            sublabel={`- ${totalDepenses.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} € de dépenses`}
          />
        </div>

        <Card title="Évolution du CA (6 derniers mois)">
          <div className="p-5">
            <EvolutionChart
              data={evolutionCumulee}
              series={[
                { key: "alcalspark", label: "ALCALSPARK", color: "#C9A84C" },
                { key: "estime", label: "Estime", color: "#4ADE80" },
              ]}
            />
          </div>
        </Card>

        <Card title={`Factures (${label})`}>
          <div className="px-5 py-3 flex gap-1.5 border-b border-[#232326] flex-wrap">
            <a
              href={`?periode=${periodeCle}&debut=${debut}&fin=${fin}`}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors duration-150 ${!statut ? "bg-[#4ADE80]/10 text-[#4ADE80]" : "text-[#8B8B8D] hover:text-[#EDEDED]"}`}
            >
              Toutes
            </a>
            {(["payee", "envoyee", "en_retard"] as FactureStatut[]).map((s) => (
              <a
                key={s}
                href={`?periode=${periodeCle}&debut=${debut}&fin=${fin}&statut=${s}`}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors duration-150 ${statut === s ? "bg-[#4ADE80]/10 text-[#4ADE80]" : "text-[#8B8B8D] hover:text-[#EDEDED]"}`}
              >
                {factureStatutLabel(s)}
              </a>
            ))}
          </div>

          {factures.length === 0 ? (
            <p className="px-5 py-6 text-sm text-[#55555A]">Aucune facture sur cette période.</p>
          ) : (
            <Table>
              <TableHead>
                <Th>Numéro</Th>
                <Th>Client</Th>
                <Th align="right">Total TTC</Th>
                <Th align="right">Statut</Th>
              </TableHead>
              <tbody>
                {factures.map((f) => (
                  <Tr key={f.id}>
                    <Td>{f.numero}</Td>
                    <Td>{f.client_nom}</Td>
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

        <Card title="Dépenses">
          <div className="p-5 border-b border-[#232326]">
            <DepenseForm />
          </div>
          {depenses.length === 0 ? (
            <p className="px-5 py-6 text-sm text-[#55555A]">Aucune dépense sur cette période.</p>
          ) : (
            <Table>
              <TableHead>
                <Th>Catégorie</Th>
                <Th>Note</Th>
                <Th align="right">Montant</Th>
                <Th align="right">Date</Th>
              </TableHead>
              <tbody>
                {depenses.map((d) => (
                  <Tr key={d.id}>
                    <Td>{d.categorie}</Td>
                    <Td>{d.note ?? "—"}</Td>
                    <Td align="right">{d.montant.toLocaleString("fr-FR")} €</Td>
                    <Td align="right">{new Date(d.date).toLocaleDateString("fr-FR")}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>
    </>
  );
}
