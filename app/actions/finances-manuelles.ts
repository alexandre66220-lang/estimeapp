"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/supabase/server";

export async function ajouterEntreeFinanciere(formData: FormData) {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: "Non authentifié" };

  const type = formData.get("type") as string;
  const montant = parseFloat(formData.get("montant") as string);
  const categorie = formData.get("categorie") as string;
  const date = formData.get("date") as string;
  const chantier_id = (formData.get("chantier_id") as string) || null;
  const note = (formData.get("note") as string) || null;

  if (!type || !montant || !categorie || !date) {
    return { error: "Champs obligatoires manquants" };
  }
  if (isNaN(montant) || montant <= 0) {
    return { error: "Montant invalide" };
  }

  const { error } = await supabase.from("entrees_financieres").insert({
    user_id: user.id,
    type,
    montant,
    categorie,
    date,
    chantier_id: chantier_id || null,
    note,
  });

  if (error) return { error: error.message };

  revalidatePath("/espace/finances");
  return { success: true };
}

export async function supprimerEntreeFinanciere(id: string) {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: "Non authentifié" };

  const { error } = await supabase
    .from("entrees_financieres")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/espace/finances");
  return { success: true };
}
