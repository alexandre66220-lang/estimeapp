import type { SupabaseClient } from "@supabase/supabase-js";

export type RentabiliteStats = {
  margeMoyenne: number | null;
  meilleureChantier: { titre: string; marge: number } | null;
  moinsRentable: { titre: string; marge: number; id: string } | null;
};

export async function getRentabiliteStats(
  supabase: SupabaseClient,
  userId: string
): Promise<RentabiliteStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data } = await supabase
    .from("chantiers")
    .select("id, titre, montant, depenses, sous_traitance, frais_deplacement")
    .eq("user_id", userId)
    .gte("created_at", startOfMonth)
    .not("montant", "is", null);

  const rows = (data ?? []).filter((r) => (r.montant ?? 0) > 0);
  if (rows.length === 0) return { margeMoyenne: null, meilleureChantier: null, moinsRentable: null };

  const withMarge = rows.map((r) => {
    const m = r.montant ?? 0;
    const dep = (r.depenses ?? 0) + (r.sous_traitance ?? 0) + (r.frais_deplacement ?? 0);
    return { id: r.id, titre: r.titre ?? "Chantier", marge: m - dep, taux: m > 0 ? ((m - dep) / m) * 100 : 0 };
  });

  const totalMarge = withMarge.reduce((s, r) => s + r.marge, 0);
  const totalCA = rows.reduce((s, r) => s + (r.montant ?? 0), 0);
  const margeMoyenne = totalCA > 0 ? (totalMarge / totalCA) * 100 : null;

  const sorted = [...withMarge].sort((a, b) => b.taux - a.taux);
  const meilleureChantier = sorted[0]
    ? { titre: sorted[0].titre, marge: sorted[0].marge }
    : null;
  const moinsRentable = sorted[sorted.length - 1]
    ? { titre: sorted[sorted.length - 1].titre, marge: sorted[sorted.length - 1].marge, id: sorted[sorted.length - 1].id }
    : null;

  return { margeMoyenne, meilleureChantier, moinsRentable };
}
