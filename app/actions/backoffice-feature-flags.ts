"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/backoffice/auth";

export async function creerFeatureFlag(formData: FormData) {
  const supabase = await requireAdmin();

  const nom = (formData.get("nom") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!nom) throw new Error("Le nom du flag est obligatoire.");

  const { error } = await supabase.from("admin_feature_flags").insert({ nom, description });

  if (error) throw new Error(error.message);

  revalidatePath("/backoffice/sandbox");
}

export async function toggleFeatureFlag(
  id: string,
  champ: "actif_pour_moi" | "actif_global",
  valeur: boolean
) {
  const supabase = await requireAdmin();

  const { error } = await supabase
    .from("admin_feature_flags")
    .update({ [champ]: valeur })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/backoffice/sandbox");
}
