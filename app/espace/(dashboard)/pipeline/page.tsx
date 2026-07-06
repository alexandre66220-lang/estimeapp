import type { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/supabase/server";
import { getCachedClients } from "@/lib/supabase/clients";
import { PipelineClient } from "@/components/espace/PipelineClient";

export const metadata: Metadata = {
  title: "Pipeline — Estime",
};

export default async function Pipeline({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { message, error } = await searchParams;

  return (
    <div className="px-6 py-12 lg:py-16">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-dusk">Pipeline</h1>
        <p className="text-dusk/50 text-sm mt-1">
          Suivez vos prospects et clients à travers chaque étape.
        </p>
      </div>

      <Suspense fallback={<PipelineSkeleton />}>
        <PipelineSection message={message} error={error} />
      </Suspense>
    </div>
  );
}

async function PipelineSection({
  message,
  error,
}: {
  message?: string;
  error?: string;
}) {
  const { supabase, user } = await getCurrentUser();
  const clients = await getCachedClients(supabase, user!.id);
  return <PipelineClient clients={clients} message={message} error={error} />;
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
