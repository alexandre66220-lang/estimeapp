import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type MonthlyData = {
  month: string;
  label: string;
  ca: number;
  count: number;
};

export type ChantierFinance = {
  id: string;
  titre: string;
  clientNom: string | null;
  created_at: string;
  montant: number;
  statut: string | null;
};

export type FinancesData = {
  caMoisCourant: number;
  chantiersMoisCourant: number;
  moyenneMoisCourant: number;
  caMoisPrecedent: number;
  variationPct: number | null;
  monthly: MonthlyData[];
  caAnnee: number;
  meilleurMois: MonthlyData | null;
  objectifAnnuel: number | null;
  dernierChantiers: ChantierFinance[];
  hasAnyData: boolean;
};

const MOIS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];

export async function getFinancesData(
  supabase: SupabaseClient,
  userId: string
): Promise<FinancesData> {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const start12 = new Date(currentYear, currentMonth - 11, 1).toISOString();

  const [{ data: chantiers12 }, { data: chantiersRecents }, { data: profile }] =
    await Promise.all([
      supabase
        .from("chantiers")
        .select("id, montant, statut, created_at")
        .eq("user_id", userId)
        .not("montant", "is", null)
        .gte("created_at", start12)
        .order("created_at", { ascending: false }),
      supabase
        .from("chantiers")
        .select("id, titre, montant, statut, created_at, client_id, clients(prenom, nom)")
        .eq("user_id", userId)
        .not("montant", "is", null)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("profiles")
        .select("objectif_annuel")
        .eq("id", userId)
        .maybeSingle(),
    ]);

  // Build 12-month rolling data
  const monthly: MonthlyData[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const monthKey = `${y}-${String(m + 1).padStart(2, "0")}`;
    const label = `${MOIS_FR[m]} ${String(y).slice(2)}`;

    const items = (chantiers12 ?? []).filter((c) => {
      const cd = new Date(c.created_at);
      return cd.getFullYear() === y && cd.getMonth() === m;
    });

    monthly.push({
      month: monthKey,
      label,
      ca: items.reduce((s, c) => s + (c.montant ?? 0), 0),
      count: items.length,
    });
  }

  const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevMonthKey = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}`;

  const currentMonthData = monthly.find((m) => m.month === currentMonthKey);
  const prevMonthData = monthly.find((m) => m.month === prevMonthKey);

  const caMoisCourant = currentMonthData?.ca ?? 0;
  const chantiersMoisCourant = currentMonthData?.count ?? 0;
  const moyenneMoisCourant =
    chantiersMoisCourant > 0 ? caMoisCourant / chantiersMoisCourant : 0;
  const caMoisPrecedent = prevMonthData?.ca ?? 0;

  let variationPct: number | null = null;
  if (caMoisPrecedent > 0) {
    variationPct = ((caMoisCourant - caMoisPrecedent) / caMoisPrecedent) * 100;
  } else if (caMoisCourant > 0) {
    variationPct = 100;
  }

  // Year aggregations
  const yearMonthly = monthly.filter((m) => m.month.startsWith(String(currentYear)));
  const caAnnee = yearMonthly.reduce((s, m) => s + m.ca, 0);
  const meilleurMois = yearMonthly.reduce<MonthlyData | null>((best, m) => {
    if (m.ca === 0) return best;
    if (!best || m.ca > best.ca) return m;
    return best;
  }, null);

  // Recent chantiers with client name
  const dernierChantiers: ChantierFinance[] = (chantiersRecents ?? []).map((c: any) => ({
    id: c.id,
    titre: c.titre,
    clientNom: c.clients ? `${c.clients.prenom} ${c.clients.nom}` : null,
    created_at: c.created_at,
    montant: c.montant ?? 0,
    statut: c.statut,
  }));

  const hasAnyData = (chantiers12 ?? []).length > 0 || dernierChantiers.length > 0;

  return {
    caMoisCourant,
    chantiersMoisCourant,
    moyenneMoisCourant,
    caMoisPrecedent,
    variationPct,
    monthly,
    caAnnee,
    meilleurMois,
    objectifAnnuel: profile?.objectif_annuel ?? null,
    dernierChantiers,
    hasAnyData,
  };
}
