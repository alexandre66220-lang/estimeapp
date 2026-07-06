import "server-only";
import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AvisStats = {
  totalAvis: number;
  noteMoyenne: number | null;
  tauxConversion: number | null;
  avisCeMois: number;
  avisMoisDernier: number;
};

export type AvisItem = {
  id: string;
  client_prenom: string;
  note_google: number;
  date_avis: string;
  chantier: { id: string; titre: string } | null;
};

export type AvisParMois = {
  mois: string;
  total: number;
};

function startOfMonth(offset: number) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + offset, 1);
}

export function getAvisStats(
  supabase: SupabaseClient,
  userId: string
): Promise<AvisStats> {
  return unstable_cache(
    async () => {
      const debutCeMois = startOfMonth(0).toISOString().slice(0, 10);
      const debutMoisDernier = startOfMonth(-1).toISOString().slice(0, 10);

      const [{ data: avis }, { count: totalEmailsAvis }] = await Promise.all([
        supabase.from("avis").select("note_google, date_avis").eq("user_id", userId),
        supabase
          .from("relances")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("type", "avis")
          .eq("statut", "envoyee"),
      ]);

      const tousLesAvis = avis ?? [];
      const totalAvis = tousLesAvis.length;
      const noteMoyenne =
        totalAvis > 0
          ? tousLesAvis.reduce((sum, item) => sum + item.note_google, 0) / totalAvis
          : null;

      const tauxConversion =
        totalEmailsAvis && totalEmailsAvis > 0
          ? Math.round((totalAvis / totalEmailsAvis) * 1000) / 10
          : null;

      const avisCeMois = tousLesAvis.filter(
        (item) => item.date_avis >= debutCeMois
      ).length;
      const avisMoisDernier = tousLesAvis.filter(
        (item) => item.date_avis >= debutMoisDernier && item.date_avis < debutCeMois
      ).length;

      return { totalAvis, noteMoyenne, tauxConversion, avisCeMois, avisMoisDernier };
    },
    ["avis-stats", userId],
    { revalidate: 60, tags: [`avis-stats-${userId}`] }
  )();
}

export function getAvisListe(
  supabase: SupabaseClient,
  userId: string
): Promise<AvisItem[]> {
  return unstable_cache(
    async () => {
      const { data } = await supabase
        .from("avis")
        .select("id, client_prenom, note_google, date_avis, chantiers(id, titre)")
        .eq("user_id", userId)
        .order("date_avis", { ascending: false })
        .limit(20);

      return (data ?? []).map((item) => ({
        id: item.id,
        client_prenom: item.client_prenom,
        note_google: item.note_google,
        date_avis: item.date_avis,
        chantier: Array.isArray(item.chantiers)
          ? (item.chantiers[0] ?? null)
          : (item.chantiers as { id: string; titre: string } | null),
      }));
    },
    ["avis-liste", userId],
    { revalidate: 60, tags: [`avis-stats-${userId}`] }
  )();
}

export function getAvisParMois(
  supabase: SupabaseClient,
  userId: string,
  mois = 6
): Promise<AvisParMois[]> {
  return unstable_cache(
    async () => {
      const debut = startOfMonth(-(mois - 1));
      const { data } = await supabase
        .from("avis")
        .select("date_avis")
        .eq("user_id", userId)
        .gte("date_avis", debut.toISOString().slice(0, 10));

      const buckets = new Map<string, number>();
      for (let i = mois - 1; i >= 0; i -= 1) {
        const date = startOfMonth(-i);
        const cle = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        buckets.set(cle, 0);
      }

      for (const item of data ?? []) {
        const cle = item.date_avis.slice(0, 7);
        if (buckets.has(cle)) {
          buckets.set(cle, (buckets.get(cle) ?? 0) + 1);
        }
      }

      return Array.from(buckets.entries()).map(([mois, total]) => ({ mois, total }));
    },
    ["avis-par-mois", userId, String(mois)],
    { revalidate: 60, tags: [`avis-stats-${userId}`] }
  )();
}
