import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type RangLocal = {
  rang: number;
  nb_total: number;
  percentile: number;
  score_moyen: number;
  scope: "local" | "national" | "pioneer";
};

export async function getRangLocal(
  supabase: SupabaseClient,
  userId: string
): Promise<RangLocal | null> {
  const { data, error } = await supabase.rpc("get_rang_local", {
    p_user_id: userId,
  });

  if (error || !data) return null;

  return {
    rang: data.rang,
    nb_total: data.nb_total,
    percentile: data.percentile,
    score_moyen: data.score_moyen,
    scope: data.scope,
  };
}
