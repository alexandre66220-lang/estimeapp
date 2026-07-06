"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function saveRentabilite(
  chantierId: string,
  data: {
    montant: number | null;
    depenses: number | null;
    heures_passees: number | null;
    sous_traitance: number | null;
    frais_deplacement: number | null;
  }
): Promise<{ error?: string }> {
  const { supabase, user } = await getUser();
  if (!user) return { error: "Non autorisé" };

  const { error } = await supabase
    .from("chantiers")
    .update({
      montant: data.montant,
      depenses: data.depenses,
      heures_passees: data.heures_passees,
      sous_traitance: data.sous_traitance,
      frais_deplacement: data.frais_deplacement,
    })
    .eq("id", chantierId)
    .eq("user_id", user.id);

  if (error) return { error: "Impossible d'enregistrer." };
  revalidatePath(`/espace/chantiers/${chantierId}`);
  revalidatePath("/espace/finances");
  return {};
}
