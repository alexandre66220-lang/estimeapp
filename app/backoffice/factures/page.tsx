import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { Header } from "@/components/backoffice/Header";
import { Table, TableHead, Th, Tr, Td } from "@/components/backoffice/Table";
import { StatusBadge } from "@/components/backoffice/StatusBadge";
import { getCurrentUser } from "@/lib/supabase/server";
import { getFacturesListe } from "@/lib/backoffice/factures";
import { FACTURE_STATUT_TONE, factureStatutLabel } from "@/lib/backoffice/facture-statut";

export default async function FacturesPage() {
  const { supabase } = await getCurrentUser();
  const factures = await getFacturesListe(supabase);

  return (
    <>
      <Header title="Factures" subtitle="ALCALSPARK" />
      <div className="p-4 sm:p-8">
        <div className="flex justify-end mb-4">
          <Link
            href="/backoffice/factures/nouveau"
            className="flex items-center gap-1.5 text-xs font-medium bg-[#4ADE80]/10 text-[#4ADE80] px-3 py-1.5 rounded-md hover:bg-[#4ADE80]/20 transition-colors duration-150"
          >
            <Plus size={14} weight="bold" />
            Nouvelle facture
          </Link>
        </div>

        <div className="bg-[#18181B] border border-[#232326] rounded-[10px] overflow-hidden">
          {factures.length === 0 ? (
            <p className="px-5 py-6 text-sm text-[#55555A]">Aucune facture pour l&apos;instant.</p>
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
                    <Td>
                      <Link href={`/backoffice/factures/${f.id}`} className="hover:text-[#4ADE80] transition-colors duration-150">
                        {f.numero}
                      </Link>
                    </Td>
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
        </div>
      </div>
    </>
  );
}
