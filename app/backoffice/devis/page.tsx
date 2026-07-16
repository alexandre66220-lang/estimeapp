import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { Header } from "@/components/backoffice/Header";
import { Table, TableHead, Th, Tr, Td } from "@/components/backoffice/Table";
import { StatusBadge } from "@/components/backoffice/StatusBadge";
import { getCurrentUser } from "@/lib/supabase/server";
import { getDevisListe } from "@/lib/backoffice/devis";
import { DEVIS_STATUT_TONE, devisStatutLabel } from "@/lib/backoffice/devis-statut";

export default async function DevisPage() {
  const { supabase } = await getCurrentUser();
  const devis = await getDevisListe(supabase);

  return (
    <>
      <Header title="Devis" subtitle="ALCALSPARK" />
      <div className="p-4 sm:p-8">
        <div className="flex justify-end mb-4">
          <Link
            href="/backoffice/devis/nouveau"
            className="flex items-center gap-1.5 text-xs font-medium bg-[#4ADE80]/10 text-[#4ADE80] px-3 py-1.5 rounded-md hover:bg-[#4ADE80]/20 transition-colors duration-150"
          >
            <Plus size={14} weight="bold" />
            Nouveau devis
          </Link>
        </div>

        <div className="bg-[#18181B] border border-[#232326] rounded-[10px] overflow-hidden">
          {devis.length === 0 ? (
            <p className="px-5 py-6 text-sm text-[#55555A]">Aucun devis pour l&apos;instant.</p>
          ) : (
            <Table>
              <TableHead>
                <Th>Numéro</Th>
                <Th>Client</Th>
                <Th align="right">Total HT</Th>
                <Th align="right">Statut</Th>
              </TableHead>
              <tbody>
                {devis.map((d) => (
                  <Tr key={d.id}>
                    <Td>
                      <Link href={`/backoffice/devis/${d.id}`} className="hover:text-[#4ADE80] transition-colors duration-150">
                        {d.numero}
                      </Link>
                    </Td>
                    <Td>{d.client_nom}</Td>
                    <Td align="right">{d.total_ht.toLocaleString("fr-FR")} €</Td>
                    <Td align="right">
                      <StatusBadge tone={DEVIS_STATUT_TONE[d.statut]} label={devisStatutLabel(d.statut)} />
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
