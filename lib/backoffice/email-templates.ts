import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminEmailTemplate = {
  id: string;
  titre: string;
  sujet: string;
  corps: string;
  created_at: string;
  updated_at: string;
};

export async function getEmailTemplates(supabase: SupabaseClient): Promise<AdminEmailTemplate[]> {
  const { data } = await supabase
    .from("admin_email_templates")
    .select("id, titre, sujet, corps, created_at, updated_at")
    .order("titre", { ascending: true });

  return data ?? [];
}

export async function getEmailTemplate(supabase: SupabaseClient, id: string): Promise<AdminEmailTemplate | null> {
  const { data } = await supabase
    .from("admin_email_templates")
    .select("id, titre, sujet, corps, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  return data;
}
