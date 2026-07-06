import type { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/supabase/server";
import { getCachedProfile } from "@/lib/supabase/profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { ConseilsView } from "@/components/espace/ConseilsClient";
import type { ConseilsContenu } from "@/app/api/conseils/generer/route";

export const metadata: Metadata = {
  title: "Conseils et astuces - Estime",
};

export default async function ConseilsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16">
      <Suspense fallback={<ConseilsSkeleton />}>
        <ConseilsContent />
      </Suspense>
    </div>
  );
}

async function ConseilsContent() {
  const { supabase, user } = await getCurrentUser();

  const profile = await getCachedProfile<{ metier: string | null; ville: string | null }>(
    supabase,
    user!.id,
    "metier, ville"
  );

  const admin = createAdminClient();
  const { data: cache } = await admin
    .from("conseils_cache")
    .select("contenu, generated_at")
    .eq("user_id", user!.id)
    .maybeSingle();

  const metier = profile?.metier ?? null;
  const ville = profile?.ville ?? null;
  const contenu = (cache?.contenu ?? null) as ConseilsContenu | null;

  const title = metier
    ? `Conseils pour ${metier}${ville ? ` à ${ville}` : ""}`
    : "Conseils et astuces";

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-dusk">{title}</h1>
        <p className="text-dusk/50 text-sm mt-1">
          Des astuces pratiques pour développer votre activité.
        </p>
      </div>
      <ConseilsView initialContenu={contenu} metier={metier} ville={ville} />
    </>
  );
}

function ConseilsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-64 bg-dust rounded mb-2" />
        <div className="h-4 w-48 bg-dust rounded" />
      </div>
      <div className="h-48 bg-dusk/8 rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-36 bg-white rounded-2xl border border-dusk/8" />)}
      </div>
    </div>
  );
}
