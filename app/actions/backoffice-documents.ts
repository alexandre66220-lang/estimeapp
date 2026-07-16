"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/backoffice/auth";
import { getDocument } from "@/lib/backoffice/documents";
import { getClient } from "@/lib/backoffice/clients";
import { personnaliserContenu } from "@/lib/backoffice/document-type";

export async function creerTemplate(formData: FormData) {
  const supabase = await requireAdmin();

  const titre = (formData.get("titre") as string)?.trim();
  const contenu = (formData.get("contenu") as string) ?? "";

  if (!titre) throw new Error("Le titre est obligatoire.");

  const { data, error } = await supabase
    .from("admin_documents")
    .insert({ type: "template", titre, contenu })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/backoffice/documents");
  redirect(`/backoffice/documents/${data.id}`);
}

export async function modifierTemplate(templateId: string, formData: FormData) {
  const supabase = await requireAdmin();

  const titre = (formData.get("titre") as string)?.trim();
  const contenu = (formData.get("contenu") as string) ?? "";

  if (!titre) throw new Error("Le titre est obligatoire.");

  const { error } = await supabase
    .from("admin_documents")
    .update({ titre, contenu })
    .eq("id", templateId)
    .eq("type", "template");

  if (error) throw new Error(error.message);

  revalidatePath("/backoffice/documents");
  revalidatePath(`/backoffice/documents/${templateId}`);
}

/**
 * Génère un document "envoyé" à partir d'un template : personnalise le
 * contenu avec les infos du client, l'associe au client, horodate
 * l'envoi. Le template d'origine n'est jamais modifié.
 */
export async function envoyerDocumentDepuisTemplate(clientId: string, formData: FormData) {
  const supabase = await requireAdmin();

  const templateId = formData.get("template_id") as string;
  if (!templateId) throw new Error("Sélectionnez un modèle.");

  const template = await getDocument(supabase, templateId);
  if (!template) throw new Error("Modèle introuvable.");

  const client = await getClient(supabase, clientId);
  if (!client) throw new Error("Client introuvable.");

  const titre = (formData.get("titre") as string)?.trim() || template.titre;
  const contenuBrut = (formData.get("contenu") as string) ?? template.contenu;
  const contenu = personnaliserContenu(contenuBrut, client);

  const { error } = await supabase.from("admin_documents").insert({
    type: "envoye",
    titre,
    contenu,
    client_id: clientId,
    template_source_id: templateId,
    date_envoi: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/backoffice/clients/${clientId}`);
}
