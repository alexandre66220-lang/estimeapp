import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { RangLocal } from "@/lib/score/rang-local";

const MOIS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];
const MOIS_COURT = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];

export type RapportData = {
  artisan: {
    prenom: string;
    nom: string;
    metier: string | null;
    ville: string | null;
    email: string;
  };
  moisLabel: string;
  moisKey: string;
  annee: number;
  stats: {
    chantiers: number;
    posts: number;
    emails: number;
    avis: number;
    score: number;
    scoreEvolutionPct: number | null;
  };
  chantiers: Array<{
    titre: string;
    created_at: string;
    statut: string | null;
    montant: number | null;
  }>;
  avisData: {
    noteMoyenne: number | null;
    avisRecusMois: number;
    historique: Array<{ mois: string; count: number }>;
    dernierAvis: Array<{ note: number | null; contenu: string | null; created_at: string }>;
  };
  rangLocal: RangLocal | null;
};

export type RapportLog = {
  id: string;
  mois: string;
  pdf_url: string | null;
  email_envoye: boolean;
  statut: string;
  created_at: string;
};

function startOf(year: number, month: number) {
  return new Date(year, month, 1).toISOString();
}

export async function getRapportData(
  supabase: SupabaseClient,
  userId: string,
  targetDate?: Date
): Promise<RapportData | null> {
  const ref = targetDate ?? new Date();
  // Mois écoulé = mois précédent par défaut pour le rapport automatique
  const reportDate = new Date(ref.getFullYear(), ref.getMonth() - 1, 1);
  const year = reportDate.getFullYear();
  const month = reportDate.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  const monthStart = startOf(year, month);
  const monthEnd = startOf(year, month + 1);
  const prevMonthStart = startOf(year, month - 1);

  const [
    { data: profile },
    { data: chantiersMonth },
    { count: postsMonth },
    { count: emailsMonth },
    { data: avisDonnees },
    { data: avisMonth },
    { data: scoreData },
    { data: scorePrevData },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("prenom, nom, metier, ville, email")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("chantiers")
      .select("titre, created_at, statut, montant")
      .eq("user_id", userId)
      .gte("created_at", monthStart)
      .lt("created_at", monthEnd)
      .order("created_at", { ascending: false }),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", monthStart)
      .lt("created_at", monthEnd),
    supabase
      .from("relances")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("statut", "envoyee")
      .gte("created_at", monthStart)
      .lt("created_at", monthEnd),
    // Historique 6 derniers mois
    supabase
      .from("avis")
      .select("note_google, created_at, commentaire_google")
      .eq("user_id", userId)
      .gte("created_at", startOf(year, month - 5))
      .order("created_at", { ascending: false }),
    // Avis du mois
    supabase
      .from("avis")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", monthStart)
      .lt("created_at", monthEnd),
    // Score du mois
    supabase
      .from("scores")
      .select("score")
      .eq("user_id", userId)
      .gte("created_at", monthStart)
      .lt("created_at", monthEnd)
      .order("created_at", { ascending: false })
      .limit(1),
    // Score mois précédent
    supabase
      .from("scores")
      .select("score")
      .eq("user_id", userId)
      .gte("created_at", prevMonthStart)
      .lt("created_at", monthStart)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  if (!profile) return null;

  // Build 6-month history
  const historique: Array<{ mois: string; count: number }> = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, month - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const mStart = startOf(y, m);
    const mEnd = startOf(y, m + 1);
    const cnt = (avisDonnees ?? []).filter((a) => {
      const cd = a.created_at;
      return cd >= mStart && cd < mEnd;
    }).length;
    historique.push({ mois: MOIS_COURT[m], count: cnt });
  }

  const allNotes = (avisDonnees ?? [])
    .map((a) => a.note_google)
    .filter((n): n is number => n !== null);
  const noteMoyenne =
    allNotes.length > 0
      ? Math.round((allNotes.reduce((s, n) => s + n, 0) / allNotes.length) * 10) / 10
      : null;

  const dernierAvis = (avisDonnees ?? []).slice(0, 3).map((a) => ({
    note: a.note_google,
    contenu: a.commentaire_google,
    created_at: a.created_at,
  }));

  const score = scoreData?.[0]?.score ?? 0;
  const scorePrev = scorePrevData?.[0]?.score ?? null;
  const scoreEvolutionPct =
    scorePrev && scorePrev > 0
      ? Math.round(((score - scorePrev) / scorePrev) * 100)
      : null;

  return {
    artisan: {
      prenom: profile.prenom ?? "",
      nom: profile.nom ?? "",
      metier: profile.metier ?? null,
      ville: profile.ville ?? null,
      email: profile.email ?? "",
    },
    moisLabel: `${MOIS_FR[month]} ${year}`,
    moisKey: monthKey,
    annee: year,
    stats: {
      chantiers: (chantiersMonth ?? []).length,
      posts: typeof postsMonth === "number" ? postsMonth : 0,
      emails: typeof emailsMonth === "number" ? emailsMonth : 0,
      avis: typeof avisMonth === "number" ? avisMonth : 0,
      score,
      scoreEvolutionPct,
    },
    chantiers: chantiersMonth ?? [],
    avisData: {
      noteMoyenne,
      avisRecusMois: typeof avisMonth === "number" ? avisMonth : 0,
      historique,
      dernierAvis,
    },
    rangLocal: null,
  };
}

export async function getRapportLogs(
  supabase: SupabaseClient,
  userId: string
): Promise<RapportLog[]> {
  const { data } = await supabase
    .from("rapport_logs")
    .select("id, mois, pdf_url, email_envoye, statut, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(24);
  return data ?? [];
}
