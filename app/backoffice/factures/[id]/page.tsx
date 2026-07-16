import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";
import { Header } from "@/components/backoffice/Header";
import { Card } from "@/components/backoffice/Card";
import { Table, TableHead, Th, Tr, Td } from "@/components/backoffice/Table";
import { StatusBadge } from "@/components/backoffice/StatusBadge";
import { FactureActions } from "@/components/backoffice/FactureActions";
import { getCurrentUser } from "@/lib/supabase/server";
import { getFacture } from "@/lib/backoffice/factures";
import { FACTURE_STATUT_TONE, factureStatutLabel } from "@/lib/backoffice/facture-statut";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default async function FactureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await getCurrentUser();
  const facture = await getFacture(supabase, id);

  if (!facture) notFound();

  return (
    <>
      <Header title={facture.numero} subtitle={facture.client_nom} />
      <div className="p-4 sm:p-8 max-w-2xl space-y-4">
        <Link
          href="/backoffice/factures"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8B8B8D] hover:text-[#EDEDED] transition-colors duration-150"
        >
          <ArrowLeft size={14} weight="bold" />
          Retour aux factures
        </Link>

        <Card>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <StatusBadge tone={FACTURE_STATUT_TONE[facture.statut]} label={factureStatutLabel(facture.statut)} />
              <p className="text-xs text-[#55555A]">
                Émise le {formatDate(facture.date_emission)} · Échéance {formatDate(facture.date_echeance)}
                {facture.date_paiement && ` · Payée le ${formatDate(facture.date_paiement)}`}
              </p>
            </div>
            <FactureActions factureId={facture.id} statut={facture.statut} />
          </div>
        </Card>

        <Card title="Prestations">
          <Table>
            <TableHead>
              <Th>Prestation</Th>
              <Th align="right">PU</Th>
              <Th align="right">Qté</Th>
              <Th align="right">Total</Th>
            </TableHead>
            <tbody>
              {facture.lignes.map((l, i) => (
                <Tr key={i}>
                  <Td>
                    <p>{l.nom}</p>
                    {l.description && <p className="text-xs text-[#55555A]">{l.description}</p>}
                  </Td>
                  <Td align="right">{l.prix_unitaire.toLocaleString("fr-FR")} €</Td>
                  <Td align="right">{l.quantite}</Td>
                  <Td align="right">{(l.prix_unitaire * l.quantite).toLocaleString("fr-FR")} €</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          <div className="px-5 py-3 border-t border-[#232326] flex justify-between items-center">
            <p className="text-xs text-[#55555A]">TVA non applicable, art. 293 B du CGI</p>
            <p className="text-sm font-semibold text-[#EDEDED]">
              Total TTC : {facture.total_ttc.toLocaleString("fr-FR")} €
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
