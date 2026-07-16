import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Facture = {
  id: string;
  client_nom: string;
  montant: number;
  statut: "payee" | "envoyee" | "en_retard";
  date_emission: string;
  created_at: string;
};

export async function getFactures(supabase: SupabaseClient, limite = 10): Promise<Facture[]> {
  const { data } = await supabase
    .from("admin_factures")
    .select("id, client_nom, montant, statut, date_emission, created_at")
    .order("date_emission", { ascending: false })
    .limit(limite);

  return data ?? [];
}

export async function getMontantEnAttente(supabase: SupabaseClient): Promise<{ montant: number; nb: number }> {
  const { data } = await supabase
    .from("admin_factures")
    .select("montant")
    .in("statut", ["envoyee", "en_retard"]);

  const rows = data ?? [];
  return {
    montant: rows.reduce((s, r) => s + Number(r.montant), 0),
    nb: rows.length,
  };
}

function moisCourantKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function getCaManuelDuMois(supabase: SupabaseClient): Promise<number | null> {
  const { data } = await supabase
    .from("admin_ca_manuel")
    .select("montant")
    .eq("mois", moisCourantKey())
    .maybeSingle();

  return data ? Number(data.montant) : null;
}
