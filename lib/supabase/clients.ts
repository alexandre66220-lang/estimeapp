import "server-only";
import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Client = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
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
        .select("id, prenom, nom, email, telephone, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
    ["clients", userId],
    { revalidate: 30, tags: [clientsCacheTag(userId)] }
  )();
}
