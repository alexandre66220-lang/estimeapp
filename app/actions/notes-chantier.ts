"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function addNoteChantier(
  chantierId: string,
  contenu: string
): Promise<{ error?: string }> {
  const { supabase, user } = await getUser();
  if (!user) return { error: "Non autorisé" };

  const cleaned = contenu.trim().slice(0, 2000);
  if (!cleaned) return { error: "La note ne peut pas être vide." };

  // Limite 30 notes par chantier
  const { count } = await supabase
    .from("notes_chantier")
    .select("id", { count: "exact", head: true })
    .eq("chantier_id", chantierId)
    .eq("user_id", user.id);

  if ((count ?? 0) >= 30) return { error: "Limite de 30 notes atteinte pour ce chantier." };

  const { error } = await supabase.from("notes_chantier").insert({
    chantier_id: chantierId,
    user_id: user.id,
    contenu: cleaned,
  });

  if (error) return { error: "Impossible d'ajouter la note." };
  revalidatePath(`/espace/chantiers/${chantierId}`);
  return {};
}

export async function deleteNoteChantier(
  noteId: string,
  chantierId: string
): Promise<{ error?: string }> {
  const { supabase, user } = await getUser();
  if (!user) return { error: "Non autorisé" };

  const { error } = await supabase
    .from("notes_chantier")
    .delete()
    .eq("id", noteId)
    .eq("user_id", user.id);

  if (error) return { error: "Impossible de supprimer la note." };
  revalidatePath(`/espace/chantiers/${chantierId}`);
  return {};
}
