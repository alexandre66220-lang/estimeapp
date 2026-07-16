import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminDepense = {
  id: string;
  categorie: string;
  montant: number;
  date: string;
  note: string | null;
  created_at: string;
};

export async function getDepenses(
  supabase: SupabaseClient,
  { debut, fin }: { debut: string; fin: string }
): Promise<AdminDepense[]> {
  const { data } = await supabase
    .from("admin_depenses")
    .select("id, categorie, montant, date, note, created_at")
    .gte("date", debut)
    .lt("date", fin)
    .order("date", { ascending: false });

  return data ?? [];
}

export async function getTotalDepenses(
  supabase: SupabaseClient,
  { debut, fin }: { debut: string; fin: string }
): Promise<number> {
  const { data } = await supabase
    .from("admin_depenses")
    .select("montant")
    .gte("date", debut)
    .lt("date", fin);

  return (data ?? []).reduce((s, r) => s + Number(r.montant), 0);
}
