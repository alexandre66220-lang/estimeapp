import { Header } from "@/components/backoffice/Header";
import { ClientsListPanel } from "@/components/backoffice/ClientsListPanel";
import { getCurrentUser } from "@/lib/supabase/server";
import { getClients } from "@/lib/backoffice/clients";
import type { ClientStatut } from "@/lib/backoffice/client-statut";

const VALID_STATUTS: ClientStatut[] = ["prospect", "devis_envoye", "signe", "en_cours", "livre"];

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  const { supabase } = await getCurrentUser();
  const { statut: statutParam } = await searchParams;
  const statut = VALID_STATUTS.includes(statutParam as ClientStatut)
    ? (statutParam as ClientStatut)
    : undefined;

  const clients = await getClients(supabase, statut);

  return (
    <>
      <Header title="Clients" subtitle="CRM ALCALSPARK" />
      <div className="p-4 sm:p-8">
        <ClientsListPanel clients={clients} activeStatut={statut} />
      </div>
    </>
  );
}
