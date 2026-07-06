"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/supabase/server";

export async function saveObjectifAnnuel(objectif: number) {
  const { supabase, user } = await getCurrentUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({ objectif_annuel: objectif > 0 ? objectif : null })
    .eq("id", user.id);

  revalidatePath("/espace/finances");
}

export async function updateMontantChantier(chantierId: string, montant: number) {
  const { supabase, user } = await getCurrentUser();
  if (!user) return;

  await supabase
    .from("chantiers")
    .update({ montant: montant > 0 ? montant : null })
    .eq("id", chantierId)
    .eq("user_id", user.id);

  revalidatePath("/espace/finances");
}
