import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminFeatureFlag = {
  id: string;
  nom: string;
  description: string | null;
  actif_pour_moi: boolean;
  actif_global: boolean;
  created_at: string;
  updated_at: string;
};

export async function getFeatureFlags(supabase: SupabaseClient): Promise<AdminFeatureFlag[]> {
  const { data } = await supabase
    .from("admin_feature_flags")
    .select("id, nom, description, actif_pour_moi, actif_global, created_at, updated_at")
    .order("created_at", { ascending: false });

  return data ?? [];
}
