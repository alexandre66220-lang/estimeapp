import "server-only";
import { createClient } from "@/lib/supabase/server";

export const ADMIN_USER_ID = "dece2cb2-9f6e-4cba-89b1-7c5a35989ae2"; // spark@alcalspark.com

/**
 * Défense en profondeur en plus de la policy RLS déjà verrouillée sur cet
 * UUID : toute Server Action du backoffice doit passer par ici avant
 * d'écrire quoi que ce soit.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== ADMIN_USER_ID) {
    throw new Error("Non autorisé.");
  }

  return supabase;
}
