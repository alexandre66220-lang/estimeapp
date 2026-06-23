import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ClientsManager } from "@/components/espace/ClientsManager";

export const metadata: Metadata = {
  title: "Mes clients - Estime",
};

export default async function Clients({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { message, error } = await searchParams;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-dusk">Mes clients</h1>
        <p className="text-dusk/50 text-sm mt-1">
          Votre carnet d&apos;adresses pour faciliter l&apos;envoi des demandes d&apos;avis.
        </p>
      </div>

      <Suspense fallback={<ClientsListSkeleton />}>
        <ClientsSection message={message} error={error} />
      </Suspense>
    </div>
  );
}

async function ClientsSection({
  message,
  error,
}: {
  message?: string;
  error?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, prenom, nom, email, telephone, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return <ClientsManager clients={clients ?? []} message={message} error={error} />;
}

function ClientsListSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-12 w-full bg-dust rounded-xl mb-6" />
      <div className="bg-white rounded-2xl border border-dusk/8 divide-y divide-dusk/8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 px-5 py-4" />
        ))}
      </div>
    </div>
  );
}
