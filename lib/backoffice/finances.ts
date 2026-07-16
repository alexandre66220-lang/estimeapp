import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { FactureStatut } from "./facture-statut";
import type { LigneDevis } from "./devis-statut";

export type AdminFactureAvecClient = {
  id: string;
  numero: string;
  client_nom: string;
  lignes: LigneDevis[];
  total_ht: number;
  total_ttc: number;
  statut: FactureStatut;
  date_emission: string;
  date_echeance: string | null;
  date_paiement: string | null;
};

function withClientNom(row: unknown): AdminFactureAvecClient {
  const r = row as Omit<AdminFactureAvecClient, "client_nom"> & { admin_clients: { nom: string } | null };
  return { ...r, client_nom: r.admin_clients?.nom ?? "Client supprimé" };
}

export async function getFacturesParPeriode(
  supabase: SupabaseClient,
  { debut, fin, statut }: { debut: string; fin: string; statut?: FactureStatut }
): Promise<AdminFactureAvecClient[]> {
  let query = supabase
    .from("admin_factures")
    .select(
      "id, numero, lignes, total_ht, total_ttc, statut, date_emission, date_echeance, date_paiement, admin_clients(nom)"
    )
    .gte("date_emission", debut)
    .lt("date_emission", fin)
    .order("date_emission", { ascending: false });

  if (statut) query = query.eq("statut", statut);

  const { data } = await query;
  return (data ?? []).map(withClientNom);
}

export async function getCaAlcalsparkParPeriode(
  supabase: SupabaseClient,
  { debut, fin }: { debut: string; fin: string }
): Promise<number> {
  const { data } = await supabase
    .from("admin_factures")
    .select("total_ttc")
    .eq("statut", "payee")
    .gte("date_paiement", debut)
    .lt("date_paiement", fin);

  return (data ?? []).reduce((s, r) => s + Number(r.total_ttc), 0);
}

export async function getEvolutionCaAlcalspark(
  supabase: SupabaseClient,
  mois = 6
): Promise<{ mois: string; montant: number }[]> {
  const now = new Date();
  const debut = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (mois - 1), 1));

  const { data } = await supabase
    .from("admin_factures")
    .select("total_ttc, date_paiement")
    .eq("statut", "payee")
    .gte("date_paiement", debut.toISOString().slice(0, 10));

  const buckets = new Map<string, number>();
  for (let i = 0; i < mois; i++) {
    const d = new Date(Date.UTC(debut.getUTCFullYear(), debut.getUTCMonth() + i, 1));
    buckets.set(d.toISOString().slice(0, 7), 0);
  }

  for (const row of data ?? []) {
    if (!row.date_paiement) continue;
    const key = row.date_paiement.slice(0, 7);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + Number(row.total_ttc));
  }

  return Array.from(buckets.entries()).map(([mois, montant]) => ({ mois, montant }));
}
