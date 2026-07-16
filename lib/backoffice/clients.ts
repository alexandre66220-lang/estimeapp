import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ClientStatut } from "./client-statut";

export type AdminClient = {
  id: string;
  nom: string;
  entreprise: string | null;
  email: string | null;
  telephone: string | null;
  statut: ClientStatut;
  notes: string | null;
  derniere_interaction: string | null;
  created_at: string;
  updated_at: string;
};

export async function getClients(
  supabase: SupabaseClient,
  statut?: ClientStatut
): Promise<AdminClient[]> {
  let query = supabase
    .from("admin_clients")
    .select("id, nom, entreprise, email, telephone, statut, notes, derniere_interaction, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (statut) query = query.eq("statut", statut);

  const { data } = await query;
  return data ?? [];
}

export async function getClient(supabase: SupabaseClient, id: string): Promise<AdminClient | null> {
  const { data } = await supabase
    .from("admin_clients")
    .select("id, nom, entreprise, email, telephone, statut, notes, derniere_interaction, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  return data;
}
