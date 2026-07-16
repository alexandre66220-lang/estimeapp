import { Header } from "@/components/backoffice/Header";
import { Card } from "@/components/backoffice/Card";
import { DevisForm } from "@/components/backoffice/DevisForm";
import { getCurrentUser } from "@/lib/supabase/server";
import { getClients } from "@/lib/backoffice/clients";

export default async function NouveauDevisPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const { supabase } = await getCurrentUser();
  const { client } = await searchParams;
  const clients = await getClients(supabase);

  return (
    <>
      <Header title="Nouveau devis" subtitle="ALCALSPARK" />
      <div className="p-4 sm:p-8 max-w-2xl">
        <Card>
          <div className="p-5">
            <DevisForm
              clients={clients.map((c) => ({ id: c.id, nom: c.nom }))}
              clientIdPreselectionne={client}
            />
          </div>
        </Card>
      </div>
    </>
  );
}
