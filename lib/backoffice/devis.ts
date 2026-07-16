import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DevisStatut, LigneDevis } from "./devis-statut";

export type AdminDevis = {
  id: string;
  numero: string;
  client_id: string;
  lignes: LigneDevis[];
  total_ht: number;
  statut: DevisStatut;
  date_validite: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminDevisAvecClient = AdminDevis & {
  client_nom: string;
};

export async function getDevisListe(supabase: SupabaseClient): Promise<AdminDevisAvecClient[]> {
  const { data } = await supabase
    .from("admin_devis")
    .select("id, numero, client_id, lignes, total_ht, statut, date_validite, created_at, updated_at, admin_clients(nom)")
    .order("created_at", { ascending: false });

  return (data ?? []).map((d) => ({
    ...d,
    client_nom: (d as unknown as { admin_clients: { nom: string } | null }).admin_clients?.nom ?? "Client supprimé",
  })) as AdminDevisAvecClient[];
}

export async function getDevisByClient(
  supabase: SupabaseClient,
  clientId: string
): Promise<AdminDevis[]> {
  const { data } = await supabase
    .from("admin_devis")
    .select("id, numero, client_id, lignes, total_ht, statut, date_validite, created_at, updated_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getDevis(supabase: SupabaseClient, id: string): Promise<AdminDevisAvecClient | null> {
  const { data } = await supabase
    .from("admin_devis")
    .select("id, numero, client_id, lignes, total_ht, statut, date_validite, created_at, updated_at, admin_clients(nom, entreprise, email)")
    .eq("id", id)
    .maybeSingle();

  if (!data) return null;

  const client = (data as unknown as { admin_clients: { nom: string; entreprise: string | null; email: string | null } | null }).admin_clients;

  return {
    ...(data as unknown as AdminDevis),
    client_nom: client?.nom ?? "Client supprimé",
  };
}
