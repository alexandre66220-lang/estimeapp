import type { SupabaseClient } from "@supabase/supabase-js";

export type RentabiliteChantierRow = {
  id: string;
  titre: string;
  created_at: string;
  montant: number | null;
  depenses: number | null;
  sous_traitance: number | null;
  frais_deplacement: number | null;
  autres_couts: number | null;
  heures_passees: number | null;
  taux_horaire_objectif: number | null;
};

export type RentabiliteStats = {
  margeMoyenne: number | null;
  meilleureChantier: { titre: string; marge: number } | null;
  moinsRentable: { titre: string; marge: number; id: string } | null;
};

export type RentabiliteAnnuelle = {
  chantiers: RentabiliteChantierRow[];
  margeBruteTotale: number;
  tauxMargeMoyen: number | null;
  tauxHoraireMoyen: number | null;
  totalFournitures: number;
  totalSousTraitance: number;
  totalDeplacements: number;
  totalAutres: number;
  caTotal: number;
  meilleureChantier: { id: string; titre: string; taux: number } | null;
  moinsRentable: { id: string; titre: string; taux: number } | null;
};

function computeMarge(row: RentabiliteChantierRow) {
  const m = row.montant ?? 0;
  const couts =
    (row.depenses ?? 0) +
    (row.sous_traitance ?? 0) +
    (row.frais_deplacement ?? 0) +
    (row.autres_couts ?? 0);
  return { m, couts, marge: m - couts, taux: m > 0 ? ((m - couts) / m) * 100 : 0 };
}

export async function getRentabiliteStats(
  supabase: SupabaseClient,
  userId: string
): Promise<RentabiliteStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data } = await supabase
    .from("chantiers")
    .select("id, titre, montant, depenses, sous_traitance, frais_deplacement, autres_couts")
    .eq("user_id", userId)
    .gte("created_at", startOfMonth)
    .not("montant", "is", null);

  const rows = (data ?? []).filter((r) => (r.montant ?? 0) > 0);
  if (rows.length === 0) return { margeMoyenne: null, meilleureChantier: null, moinsRentable: null };

  const withMarge = rows.map((r) => {
    const m = r.montant ?? 0;
    const dep =
      (r.depenses ?? 0) +
      (r.sous_traitance ?? 0) +
      (r.frais_deplacement ?? 0) +
      (r.autres_couts ?? 0);
    return { id: r.id, titre: r.titre ?? "Chantier", marge: m - dep, taux: m > 0 ? ((m - dep) / m) * 100 : 0 };
  });

  const totalMarge = withMarge.reduce((s, r) => s + r.marge, 0);
  const totalCA = rows.reduce((s, r) => s + (r.montant ?? 0), 0);
  const margeMoyenne = totalCA > 0 ? (totalMarge / totalCA) * 100 : null;
  const sorted = [...withMarge].sort((a, b) => b.taux - a.taux);

  return {
    margeMoyenne,
    meilleureChantier: sorted[0] ? { titre: sorted[0].titre, marge: sorted[0].marge } : null,
    moinsRentable: sorted[sorted.length - 1]
      ? { titre: sorted[sorted.length - 1].titre, marge: sorted[sorted.length - 1].marge, id: sorted[sorted.length - 1].id }
      : null,
  };
}

export async function getRentabiliteAnnuelle(
  supabase: SupabaseClient,
  userId: string
): Promise<RentabiliteAnnuelle> {
  const year = new Date().getFullYear();
  const startOfYear = new Date(year, 0, 1).toISOString();

  const { data } = await supabase
    .from("chantiers")
    .select("id, titre, created_at, montant, depenses, sous_traitance, frais_deplacement, autres_couts, heures_passees, taux_horaire_objectif")
    .eq("user_id", userId)
    .gte("created_at", startOfYear)
    .order("created_at", { ascending: false })
    .limit(100);

  const chantiers: RentabiliteChantierRow[] = data ?? [];
  const avecMontant = chantiers.filter((r) => (r.montant ?? 0) > 0);

  const caTotal = avecMontant.reduce((s, r) => s + (r.montant ?? 0), 0);
  const margeBruteTotale = avecMontant.reduce((s, r) => s + computeMarge(r).marge, 0);
  const tauxMargeMoyen = caTotal > 0 ? (margeBruteTotale / caTotal) * 100 : null;

  const totalFournitures = chantiers.reduce((s, r) => s + (r.depenses ?? 0), 0);
  const totalSousTraitance = chantiers.reduce((s, r) => s + (r.sous_traitance ?? 0), 0);
  const totalDeplacements = chantiers.reduce((s, r) => s + (r.frais_deplacement ?? 0), 0);
  const totalAutres = chantiers.reduce((s, r) => s + (r.autres_couts ?? 0), 0);

  // Taux horaire moyen (only chantiers with heures and montant)
  const avecHeures = avecMontant.filter((r) => (r.heures_passees ?? 0) > 0);
  const tauxHoraireMoyen =
    avecHeures.length > 0
      ? avecHeures.reduce((s, r) => {
          const { marge } = computeMarge(r);
          return s + marge / (r.heures_passees ?? 1);
        }, 0) / avecHeures.length
      : null;

  const sorted = [...avecMontant].sort((a, b) => computeMarge(b).taux - computeMarge(a).taux);
  const meilleureChantier = sorted[0]
    ? { id: sorted[0].id, titre: sorted[0].titre ?? "Chantier", taux: computeMarge(sorted[0]).taux }
    : null;
  const moinsRentable =
    sorted.length > 0
      ? {
          id: sorted[sorted.length - 1].id,
          titre: sorted[sorted.length - 1].titre ?? "Chantier",
          taux: computeMarge(sorted[sorted.length - 1]).taux,
        }
      : null;

  return {
    chantiers,
    margeBruteTotale,
    tauxMargeMoyen,
    tauxHoraireMoyen,
    totalFournitures,
    totalSousTraitance,
    totalDeplacements,
    totalAutres,
    caTotal,
    meilleureChantier,
    moinsRentable,
  };
}
