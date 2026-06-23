import "server-only";
import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

export type DashboardStats = {
  totalChantiers: number;
  totalPosts: number;
  totalEmails: number;
  chantiersCeMois: number;
  noteMoyenne: number | null;
};

export type ActiviteChantier = {
  id: string;
  titre: string;
  created_at: string;
  aPost: boolean;
  aEmail: boolean;
  note: number | null;
};

function startOfMonthISO() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export function getDashboardStats(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardStats> {
  return unstable_cache(
    async () => {
      const [
        { count: totalChantiers },
        { count: totalPosts },
        { count: totalEmails },
        { count: chantiersCeMois },
        { data: chantiersNotes },
      ] = await Promise.all([
        supabase
          .from("chantiers")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase
          .from("posts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase
          .from("relances")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("statut", "envoyee"),
        supabase
          .from("chantiers")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("created_at", startOfMonthISO()),
        supabase
          .from("chantiers")
          .select("note")
          .eq("user_id", userId)
          .not("note", "is", null),
      ]);

      const notes = (chantiersNotes ?? []).map((chantier) => chantier.note as number);
      const noteMoyenne =
        notes.length > 0
          ? notes.reduce((sum, note) => sum + note, 0) / notes.length
          : null;

      return {
        totalChantiers: totalChantiers ?? 0,
        totalPosts: totalPosts ?? 0,
        totalEmails: totalEmails ?? 0,
        chantiersCeMois: chantiersCeMois ?? 0,
        noteMoyenne,
      };
    },
    ["dashboard-stats", userId],
    { revalidate: 60, tags: [`dashboard-stats-${userId}`] }
  )();
}

export function getActiviteRecente(
  supabase: SupabaseClient,
  userId: string,
  limit = 5
): Promise<ActiviteChantier[]> {
  return unstable_cache(
    async () => {
      const { data: chantiers } = await supabase
        .from("chantiers")
        .select("id, titre, created_at, note")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!chantiers || chantiers.length === 0) return [];

      const chantierIds = chantiers.map((chantier) => chantier.id);

      const [{ data: posts }, { data: relances }] = await Promise.all([
        supabase.from("posts").select("chantier_id").in("chantier_id", chantierIds),
        supabase
          .from("relances")
          .select("chantier_id")
          .eq("statut", "envoyee")
          .in("chantier_id", chantierIds),
      ]);

      const chantiersAvecPost = new Set((posts ?? []).map((post) => post.chantier_id));
      const chantiersAvecEmail = new Set(
        (relances ?? []).map((relance) => relance.chantier_id)
      );

      return chantiers.map((chantier) => ({
        id: chantier.id,
        titre: chantier.titre,
        created_at: chantier.created_at,
        aPost: chantiersAvecPost.has(chantier.id),
        aEmail: chantiersAvecEmail.has(chantier.id),
        note: chantier.note,
      }));
    },
    ["dashboard-activite", userId, String(limit)],
    { revalidate: 60, tags: [`dashboard-stats-${userId}`] }
  )();
}
