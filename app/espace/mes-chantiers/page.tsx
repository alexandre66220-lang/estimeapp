import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { HardHat, Plus } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import ChantierCard from "@/components/espace/ChantierCard";

export const metadata: Metadata = {
  title: "Mes chantiers - Estime",
};

export default function MesChantiers() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-dusk">Mes chantiers</h1>
          <p className="text-dusk/50 text-sm mt-1">
            Tous vos chantiers, du premier brief à la relance avis.
          </p>
        </div>
        <Link
          href="/espace/nouveau-chantier"
          className="hidden sm:inline-flex items-center gap-2 bg-braise text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200"
        >
          <Plus size={18} weight="bold" aria-hidden="true" />
          Nouveau chantier
        </Link>
      </div>

      <Suspense fallback={<ChantiersListSkeleton />}>
        <ChantiersList />
      </Suspense>
    </div>
  );
}

async function ChantiersList() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: chantiers } = await supabase
    .from("chantiers")
    .select("id, titre, statut, photo_avant_url, photo_apres_url, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return chantiers && chantiers.length > 0 ? (
    <div className="flex flex-col gap-3">
      {chantiers.map((chantier) => (
        <ChantierCard key={chantier.id} chantier={chantier} />
      ))}
    </div>
  ) : (
    <div className="bg-white rounded-2xl border border-dusk/8 py-20 px-6 flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-ambre/10 rounded-full flex items-center justify-center mb-5">
        <HardHat size={26} className="text-ambre" aria-hidden="true" />
      </div>
      <h2 className="font-display text-xl font-bold text-dusk mb-2">
        Aucun chantier pour l&apos;instant
      </h2>
      <p className="text-dusk/50 text-sm max-w-[40ch] mb-7">
        Vos chantiers apparaîtront ici, avec leurs photos, leur post généré
        et le statut des relances avis.
      </p>
      <Link
        href="/espace/nouveau-chantier"
        className="inline-flex items-center gap-2 bg-braise text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200"
      >
        <Plus size={18} weight="bold" aria-hidden="true" />
        Nouveau chantier
      </Link>
    </div>
  );
}

function ChantiersListSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 bg-white border border-dusk/8 rounded-2xl" />
      ))}
    </div>
  );
}
