"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/backoffice/auth";
import { STATUTS, type ClientStatut } from "@/lib/backoffice/client-statut";

function parseClientFields(formData: FormData) {
  const nom = (formData.get("nom") as string)?.trim();
  const entreprise = (formData.get("entreprise") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.trim() || null;
  const telephone = (formData.get("telephone") as string)?.trim() || null;
  const statut = formData.get("statut") as string;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!nom) throw new Error("Le nom est obligatoire.");
  if (!STATUTS.some((s) => s.value === statut)) throw new Error("Statut invalide.");

  return { nom, entreprise, email, telephone, statut: statut as ClientStatut, notes };
}

export async function creerClient(formData: FormData) {
  const supabase = await requireAdmin();
  const fields = parseClientFields(formData);

  const { data, error } = await supabase
    .from("admin_clients")
    .insert(fields)
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/backoffice/clients");
  redirect(`/backoffice/clients/${data.id}`);
}

export async function modifierClient(clientId: string, formData: FormData) {
  const supabase = await requireAdmin();
  const fields = parseClientFields(formData);

  const { error } = await supabase.from("admin_clients").update(fields).eq("id", clientId);

  if (error) throw new Error(error.message);

  revalidatePath("/backoffice/clients");
  revalidatePath(`/backoffice/clients/${clientId}`);
}

export async function marquerInteraction(clientId: string) {
  const supabase = await requireAdmin();

  const { error } = await supabase
    .from("admin_clients")
    .update({ derniere_interaction: new Date().toISOString() })
    .eq("id", clientId);

  if (error) throw new Error(error.message);

  revalidatePath(`/backoffice/clients/${clientId}`);
}
