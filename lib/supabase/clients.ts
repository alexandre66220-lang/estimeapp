import "server-only";
import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ClientStatut =
  | "prospect"
  | "devis_envoye"
  | "chantier_en_cours"
  | "termine"
  | "perdu";

export type Client = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  statut: ClientStatut;
  source: string | null;
  est_vip: boolean;
  derniere_interaction: string | null;
  montant_estime: number | null;
  created_at: string;
};

export function clientsCacheTag(userId: string) {
  return `clients-${userId}`;
}

export function getCachedClients(
  supabase: SupabaseClient,
  userId: string
): Promise<Client[]> {
  return unstable_cache(
    async () => {
      const { data } = await supabase
        .from("clients")
        .select(
          "id, prenom, nom, email, telephone, statut, source, est_vip, derniere_interaction, montant_estime, created_at"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(200);
      return (data ?? []) as Client[];
    },
    ["clients", userId],
    { revalidate: 30, tags: [clientsCacheTag(userId)] }
  )();
}
