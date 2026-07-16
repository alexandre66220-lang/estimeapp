"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/backoffice/auth";

export async function upsertCaManuel(formData: FormData) {
  const supabase = await requireAdmin();

  const mois = formData.get("mois") as string;
  const montant = Number(formData.get("montant"));
  const note = (formData.get("note") as string)?.trim() || null;

  if (!mois || !Number.isFinite(montant) || montant < 0) {
    throw new Error("Champs invalides.");
  }

  const { error } = await supabase
    .from("admin_ca_manuel")
    .upsert({ mois, montant, note }, { onConflict: "mois" });

  if (error) throw new Error(error.message);

  revalidatePath("/backoffice");
}

export async function ajouterFacture(formData: FormData) {
  const supabase = await requireAdmin();

  const clientNom = (formData.get("client_nom") as string)?.trim();
  const montant = Number(formData.get("montant"));
  const statut = formData.get("statut") as string;
  const dateEmission = (formData.get("date_emission") as string) || undefined;

  if (!clientNom || !Number.isFinite(montant) || montant < 0) {
    throw new Error("Champs invalides.");
  }
  if (!["payee", "envoyee", "en_retard"].includes(statut)) {
    throw new Error("Statut invalide.");
  }

  const { error } = await supabase.from("admin_factures").insert({
    client_nom: clientNom,
    montant,
    statut,
    ...(dateEmission ? { date_emission: dateEmission } : {}),
  });

  if (error) throw new Error(error.message);

  revalidatePath("/backoffice");
}
