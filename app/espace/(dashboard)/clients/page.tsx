import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ListBullets, Kanban } from "@phosphor-icons/react/dist/ssr";
import { getCurrentUser } from "@/lib/supabase/server";
import { getCachedClients } from "@/lib/supabase/clients";
import { ClientsManager } from "@/components/espace/ClientsManager";
import { PipelineClient } from "@/components/espace/PipelineClient";

export const metadata: Metadata = {
  title: "Mes clients, Estime",
};

export default async function Clients({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string; vue?: string }>;
}) {
  const { message, error, vue } = await searchParams;
  const activeVue = vue === "pipeline" ? "pipeline" : "liste";

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-dusk">Mes clients</h1>
        <p className="text-dusk/50 text-sm mt-1">
          {activeVue === "pipeline"
            ? "Suivez vos prospects et clients à travers chaque étape."
            : "Votre carnet d'adresses pour faciliter l'envoi des demandes d'avis."}
        </p>
      </div>

      {/* Onglets */}
      <div className="flex border-b border-dusk/10 mb-8 gap-0">
        <Link
          href="/espace/clients"
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors duration-200 border-b-2 -mb-px ${
            activeVue === "liste"
              ? "border-braise text-braise"
              : "border-transparent text-dusk/40 hover:text-dusk/70"
          }`}
        >
          <ListBullets size={16} weight={activeVue === "liste" ? "bold" : "regular"} aria-hidden="true" />
          Liste
        </Link>
        <Link
          href="/espace/clients?vue=pipeline"
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors duration-200 border-b-2 -mb-px ${
            activeVue === "pipeline"
              ? "border-braise text-braise"
              : "border-transparent text-dusk/40 hover:text-dusk/70"
          }`}
        >
          <Kanban size={16} weight={activeVue === "pipeline" ? "bold" : "regular"} aria-hidden="true" />
          Pipeline
        </Link>
      </div>

      <Suspense fallback={activeVue === "pipeline" ? <PipelineSkeleton /> : <ListeSkeleton />}>
        <ClientsSection message={message} error={error} vue={activeVue} />
      </Suspense>
    </div>
  );
}

async function ClientsSection({
  message,
  error,
  vue,
}: {
  message?: string;
  error?: string;
  vue: string;
}) {
  const { supabase, user } = await getCurrentUser();
  const clients = await getCachedClients(supabase, user!.id);

  if (vue === "pipeline") {
    return <PipelineClient clients={clients} message={message} error={error} />;
  }

  return <ClientsManager clients={clients} message={message} error={error} />;
}

function ListeSkeleton() {
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

function PipelineSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex-none w-72">
          <div className="h-9 bg-dust rounded-xl mb-3" />
          <div className="space-y-2.5">
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="h-28 bg-white rounded-xl border border-dusk/8" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
