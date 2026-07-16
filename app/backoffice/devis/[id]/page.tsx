import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";
import { Header } from "@/components/backoffice/Header";
import { Card } from "@/components/backoffice/Card";
import { Table, TableHead, Th, Tr, Td } from "@/components/backoffice/Table";
import { StatusBadge } from "@/components/backoffice/StatusBadge";
import { DevisActions } from "@/components/backoffice/DevisActions";
import { ConvertirDevisButton } from "@/components/backoffice/ConvertirDevisButton";
import { getCurrentUser } from "@/lib/supabase/server";
import { getDevis } from "@/lib/backoffice/devis";
import { DEVIS_STATUT_TONE, devisStatutLabel } from "@/lib/backoffice/devis-statut";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default async function DevisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await getCurrentUser();
  const devis = await getDevis(supabase, id);

  if (!devis) notFound();

  return (
    <>
      <Header title={devis.numero} subtitle={devis.client_nom} />
      <div className="p-4 sm:p-8 max-w-2xl space-y-4">
        <Link
          href="/backoffice/devis"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8B8B8D] hover:text-[#EDEDED] transition-colors duration-150"
        >
          <ArrowLeft size={14} weight="bold" />
          Retour aux devis
        </Link>

        <Card>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <StatusBadge tone={DEVIS_STATUT_TONE[devis.statut]} label={devisStatutLabel(devis.statut)} />
              <p className="text-xs text-[#55555A]">Valide jusqu&apos;au {formatDate(devis.date_validite)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <DevisActions devisId={devis.id} statut={devis.statut} />
              {devis.statut === "accepte" && <ConvertirDevisButton devisId={devis.id} />}
            </div>
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
              {devis.lignes.map((l, i) => (
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
              Total HT : {devis.total_ht.toLocaleString("fr-FR")} €
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
