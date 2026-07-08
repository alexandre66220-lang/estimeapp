import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { getCachedProfile } from "@/lib/supabase/profile";
import { mergeVitrineConfig } from "@/lib/vitrine/defaults";
import { VitrineEditor } from "@/components/espace/VitrineEditor";

export const metadata: Metadata = { title: "Ma vitrine — Estime" };

export default async function MaVitrinePage() {
  const { supabase, user } = await getCurrentUser();

  if (!user) {
    redirect("/connexion");
  }

  const profile = await getCachedProfile<{
    prenom: string | null;
    nom: string | null;
    metier: string | null;
    ville: string | null;
    slug: string | null;
    vitrine_config: unknown;
  }>(supabase, user.id, "prenom, nom, metier, ville, slug, vitrine_config");

  const config = mergeVitrineConfig(profile?.vitrine_config ?? {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-10">
      <VitrineEditor
        initialConfig={config}
        profile={{
          prenom: profile?.prenom ?? null,
          nom: profile?.nom ?? null,
          metier: profile?.metier ?? null,
          ville: profile?.ville ?? null,
          slug: profile?.slug ?? null,
        }}
      />
    </div>
  );
}
