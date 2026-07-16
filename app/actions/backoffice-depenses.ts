"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/backoffice/auth";

export async function creerDepense(formData: FormData) {
  const supabase = await requireAdmin();

  const categorie = (formData.get("categorie") as string)?.trim();
  const montant = Number(formData.get("montant"));
  const date = (formData.get("date") as string)?.trim();
  const note = (formData.get("note") as string)?.trim() || null;

  if (!categorie || !date || !Number.isFinite(montant) || montant <= 0) {
    throw new Error("Catégorie, montant (> 0) et date sont obligatoires.");
  }

  const { error } = await supabase.from("admin_depenses").insert({ categorie, montant, date, note });

  if (error) throw new Error(error.message);

  revalidatePath("/backoffice/finances");
}
