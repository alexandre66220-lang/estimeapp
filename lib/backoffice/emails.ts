import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type EmailStatut = "envoye" | "echec";

export type AdminEmail = {
  id: string;
  client_id: string;
  sujet: string;
  corps: string;
  statut: EmailStatut;
  erreur: string | null;
  date_envoi: string;
  created_at: string;
};

export async function getEmailsParClient(
  supabase: SupabaseClient,
  clientId: string
): Promise<AdminEmail[]> {
  const { data } = await supabase
    .from("admin_emails")
    .select("id, client_id, sujet, corps, statut, erreur, date_envoi, created_at")
    .eq("client_id", clientId)
    .order("date_envoi", { ascending: false });

  return data ?? [];
}
