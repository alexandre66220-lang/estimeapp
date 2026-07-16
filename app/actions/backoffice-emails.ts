"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/backoffice/auth";
import { getClient } from "@/lib/backoffice/clients";
import { sendBackofficeEmail } from "@/lib/resend/send-backoffice-email";

/**
 * Envoie un email au client et journalise le résultat dans admin_emails,
 * y compris en cas d'échec : jamais d'exception silencieuse, l'historique
 * reste la source de vérité de ce qui a réellement été envoyé.
 */
export async function envoyerEmail(clientId: string, formData: FormData) {
  const supabase = await requireAdmin();

  const sujet = (formData.get("sujet") as string)?.trim();
  const corps = (formData.get("corps") as string) ?? "";

  if (!sujet || !corps.trim()) throw new Error("Sujet et corps du message obligatoires.");

  const client = await getClient(supabase, clientId);
  if (!client) throw new Error("Client introuvable.");
  if (!client.email) throw new Error("Ce client n'a pas d'adresse email renseignée.");

  let statut: "envoye" | "echec" = "envoye";
  let erreur: string | null = null;

  try {
    await sendBackofficeEmail({ to: client.email, sujet, corps });
  } catch (err) {
    statut = "echec";
    erreur = err instanceof Error ? err.message : "Erreur inconnue lors de l'envoi.";
  }

  const { error: dbError } = await supabase.from("admin_emails").insert({
    client_id: clientId,
    sujet,
    corps,
    statut,
    erreur,
  });

  if (dbError) throw new Error(dbError.message);

  revalidatePath(`/backoffice/clients/${clientId}`);

  if (statut === "echec") {
    throw new Error(erreur ?? "Échec de l'envoi de l'email.");
  }
}
