import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DocumentType } from "./document-type";

export type AdminDocument = {
  id: string;
  type: DocumentType;
  titre: string;
  contenu: string;
  client_id: string | null;
  template_source_id: string | null;
  date_envoi: string | null;
  created_at: string;
  updated_at: string;
};

export async function getTemplates(supabase: SupabaseClient): Promise<AdminDocument[]> {
  const { data } = await supabase
    .from("admin_documents")
    .select("id, type, titre, contenu, client_id, template_source_id, date_envoi, created_at, updated_at")
    .eq("type", "template")
    .order("titre", { ascending: true });

  return data ?? [];
}

export async function getDocument(supabase: SupabaseClient, id: string): Promise<AdminDocument | null> {
  const { data } = await supabase
    .from("admin_documents")
    .select("id, type, titre, contenu, client_id, template_source_id, date_envoi, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  return data;
}

export async function getDocumentsEnvoyesParClient(
  supabase: SupabaseClient,
  clientId: string
): Promise<AdminDocument[]> {
  const { data } = await supabase
    .from("admin_documents")
    .select("id, type, titre, contenu, client_id, template_source_id, date_envoi, created_at, updated_at")
    .eq("client_id", clientId)
    .eq("type", "envoye")
    .order("date_envoi", { ascending: false });

  return data ?? [];
}
