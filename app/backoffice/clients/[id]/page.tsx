import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";
import { Header } from "@/components/backoffice/Header";
import { ClientDetailPanel } from "@/components/backoffice/ClientDetailPanel";
import { getCurrentUser } from "@/lib/supabase/server";
import { getClient } from "@/lib/backoffice/clients";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await getCurrentUser();
  const client = await getClient(supabase, id);

  if (!client) notFound();

  return (
    <>
      <Header title={client.nom} subtitle="Fiche client" />
      <div className="p-4 sm:p-8 max-w-2xl">
        <Link
          href="/backoffice/clients"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8B8B8D] hover:text-[#EDEDED] transition-colors duration-150 mb-4"
        >
          <ArrowLeft size={14} weight="bold" />
          Retour aux clients
        </Link>
        <ClientDetailPanel client={client} />
      </div>
    </>
  );
}
