"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { recalculerAlterEgo } from "@/lib/supabase/alter-ego";

const RATE_LIMIT_HEURES = 48;

export async function recalculerAlterEgoManuel(): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorisé." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("alter_ego_derniere_analyse")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.alter_ego_derniere_analyse) {
    const derniere = new Date(profile.alter_ego_derniere_analyse).getTime();
    const heuresEcoulees = (Date.now() - derniere) / (1000 * 60 * 60);
    if (heuresEcoulees < RATE_LIMIT_HEURES) {
      const heuresRestantes = Math.ceil(RATE_LIMIT_HEURES - heuresEcoulees);
      return { error: `Vous pourrez recalculer à nouveau dans ${heuresRestantes}h.` };
    }
  }

  const result = await recalculerAlterEgo(supabase, user.id);
  if (result.error) return { error: result.error };

  revalidatePath("/espace/alter-ego");
  return { success: true };
}
