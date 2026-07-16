import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { FactureStatut } from "./facture-statut";
import type { LigneDevis } from "./devis-statut";

export type AdminFacture = {
  id: string;
  numero: string;
  client_id: string;
  devis_id: string | null;
  lignes: LigneDevis[];
  total_ht: number;
  total_ttc: number;
  statut: FactureStatut;
  date_emission: string;
  date_echeance: string | null;
  date_paiement: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminFactureAvecClient = AdminFacture & { client_nom: string };

const SELECT_AVEC_CLIENT =
  "id, numero, client_id, devis_id, lignes, total_ht, total_ttc, statut, date_emission, date_echeance, date_paiement, created_at, updated_at, admin_clients(nom)";

function withClientNom(row: unknown): AdminFactureAvecClient {
  const r = row as AdminFacture & { admin_clients: { nom: string } | null };
  return { ...r, client_nom: r.admin_clients?.nom ?? "Client supprimé" };
}

export async function getFacturesListe(
  supabase: SupabaseClient,
  limite = 50
): Promise<AdminFactureAvecClient[]> {
  const { data } = await supabase
    .from("admin_factures")
    .select(SELECT_AVEC_CLIENT)
    .order("date_emission", { ascending: false })
    .limit(limite);

  return (data ?? []).map(withClientNom);
}

export async function getFacture(supabase: SupabaseClient, id: string): Promise<AdminFactureAvecClient | null> {
  const { data } = await supabase
    .from("admin_factures")
    .select(
      "id, numero, client_id, devis_id, lignes, total_ht, total_ttc, statut, date_emission, date_echeance, date_paiement, created_at, updated_at, admin_clients(nom, entreprise, email)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) return null;
  return withClientNom(data);
}

export async function getMontantEnAttente(
  supabase: SupabaseClient
): Promise<{ montant: number; nb: number }> {
  const { data } = await supabase
    .from("admin_factures")
    .select("total_ttc")
    .in("statut", ["envoyee", "en_retard"]);

  const rows = data ?? [];
  return {
    montant: rows.reduce((s, r) => s + Number(r.total_ttc), 0),
    nb: rows.length,
  };
}

export async function getCaDuMois(supabase: SupabaseClient): Promise<number> {
  const now = new Date();
  const debut = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
  const fin = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString().slice(0, 10);

  const { data } = await supabase
    .from("admin_factures")
    .select("total_ttc")
    .eq("statut", "payee")
    .gte("date_paiement", debut)
    .lt("date_paiement", fin);

  return (data ?? []).reduce((s, r) => s + Number(r.total_ttc), 0);
}
