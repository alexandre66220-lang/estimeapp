import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { analyserPatternsComportementaux } from "@/lib/anthropic/analyze-alter-ego";

export async function recalculerAlterEgo(
  supabase: SupabaseClient,
  userId: string
): Promise<{ error?: string; nbPatterns?: number }> {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const startIso = oneYearAgo.toISOString();

  const [{ data: chantiers }, { data: paiementsRetard }, { data: notes }] = await Promise.all([
    supabase
      .from("chantiers")
      .select("titre, montant, statut, created_at, heures_passees, depenses")
      .eq("user_id", userId)
      .gte("created_at", startIso)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("paiements_chantier")
      .select("montant, date_prevue")
      .eq("user_id", userId)
      .eq("statut", "en_retard"),
    supabase
      .from("notes_chantier")
      .select("contenu")
      .eq("user_id", userId)
      .gte("created_at", startIso)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const today = new Date();
  const impayes = (paiementsRetard ?? []).map((p) => ({
    montant: p.montant ?? 0,
    joursRetard: p.date_prevue
      ? Math.max(0, Math.floor((today.getTime() - new Date(p.date_prevue).getTime()) / (1000 * 60 * 60 * 24)))
      : 0,
  }));

  const result = await analyserPatternsComportementaux({
    chantiers: chantiers ?? [],
    impayes,
    notes: (notes ?? []).map((n) => n.contenu),
  });

  if (result.error || !result.patterns) {
    return { error: result.error ?? "Analyse impossible." };
  }

  // Upsert patterns: delete previous, insert fresh set
  await supabase.from("alter_ego_insights").delete().eq("artisan_id", userId);

  if (result.patterns.length > 0) {
    await supabase.from("alter_ego_insights").insert(
      result.patterns.map((p) => ({
        artisan_id: userId,
        type_pattern: p.type_pattern,
        description: p.description,
        frequence: p.frequence,
        score_confiance: p.score_confiance,
        derniere_detection: new Date().toISOString(),
      }))
    );
  }

  await supabase
    .from("profiles")
    .update({
      alter_ego_portrait: result.portrait ?? null,
      alter_ego_derniere_analyse: new Date().toISOString(),
    })
    .eq("id", userId);

  return { nbPatterns: result.patterns.length };
}

export async function getPremiereActiviteDate(
  supabase: SupabaseClient,
  userId: string
): Promise<Date | null> {
  const { data } = await supabase
    .from("chantiers")
    .select("created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data?.created_at ? new Date(data.created_at) : null;
}
