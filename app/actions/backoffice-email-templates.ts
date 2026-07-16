"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/backoffice/auth";

export async function creerEmailTemplate(formData: FormData) {
  const supabase = await requireAdmin();

  const titre = (formData.get("titre") as string)?.trim();
  const sujet = (formData.get("sujet") as string)?.trim();
  const corps = (formData.get("corps") as string) ?? "";

  if (!titre || !sujet) throw new Error("Le titre et le sujet sont obligatoires.");

  const { error } = await supabase.from("admin_email_templates").insert({ titre, sujet, corps });

  if (error) throw new Error(error.message);

  revalidatePath("/backoffice/emails");
}

export async function modifierEmailTemplate(templateId: string, formData: FormData) {
  const supabase = await requireAdmin();

  const titre = (formData.get("titre") as string)?.trim();
  const sujet = (formData.get("sujet") as string)?.trim();
  const corps = (formData.get("corps") as string) ?? "";

  if (!titre || !sujet) throw new Error("Le titre et le sujet sont obligatoires.");

  const { error } = await supabase
    .from("admin_email_templates")
    .update({ titre, sujet, corps })
    .eq("id", templateId);

  if (error) throw new Error(error.message);

  revalidatePath("/backoffice/emails");
}
