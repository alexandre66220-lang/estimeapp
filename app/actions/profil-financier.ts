"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/supabase/server";

export async function saveTresorerie(formData: FormData) {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: "Non authentifié" };

  const valeur = formData.get("tresorerie_actuelle") as string;
  const montant = valeur === "" ? null : parseFloat(valeur);

  if (montant !== null && isNaN(montant)) {
    return { error: "Montant invalide" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      tresorerie_actuelle: montant,
      tresorerie_maj_le: montant !== null ? new Date().toISOString().slice(0, 10) : null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/espace/profil");
  revalidatePath("/espace/finances");
  return { success: true };
}

export async function saveStatutJuridique(formData: FormData) {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: "Non authentifié" };

  const statut_juridique = formData.get("statut_juridique") as string;
  const regime_imposition = formData.get("regime_imposition") as string;
  const tauxRaw = formData.get("taux_imposition_estime") as string;
  const taux_imposition_estime = tauxRaw !== "" ? parseFloat(tauxRaw) : null;

  const { error } = await supabase
    .from("profiles")
    .update({ statut_juridique, regime_imposition, taux_imposition_estime })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/espace/profil");
  revalidatePath("/espace/finances");
  return { success: true };
}
