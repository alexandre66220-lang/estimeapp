"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const MAX_BYTES = 10 * 1024 * 1024;

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function enregistrerNoteVocale(formData: FormData): Promise<{
  error?: string;
  noteId?: string;
}> {
  const { supabase, user } = await getUser();
  if (!user) return { error: "Non autorisé." };

  const file = formData.get("audio") as File | null;
  const chantierId = (formData.get("chantier_id") as string) || null;
  const dureeRaw = formData.get("duree_secondes") as string | null;
  const duree = dureeRaw ? parseInt(dureeRaw, 10) : null;

  if (!file || file.size === 0) return { error: "Aucun enregistrement fourni." };
  if (file.size > MAX_BYTES) return { error: "Enregistrement trop volumineux (max 10 Mo)." };

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = file.type.includes("mp4") ? "mp4" : file.type.includes("ogg") ? "ogg" : "webm";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("notes-vocales")
    .upload(path, buffer, { contentType: file.type || "audio/webm", upsert: false });

  if (uploadError) return { error: "Erreur lors du stockage de l'enregistrement." };

  const { data: inserted, error: insertError } = await supabase
    .from("notes_vocales")
    .insert({
      user_id: user.id,
      chantier_id: chantierId,
      audio_url: path,
      duree_secondes: duree,
    })
    .select("id")
    .single();

  if (insertError) return { error: "Enregistrement effectué mais la sauvegarde a échoué." };

  if (chantierId) revalidatePath(`/espace/chantiers/${chantierId}`);

  return { noteId: inserted.id };
}

export async function associerNoteVocale(
  noteId: string,
  chantierId: string | null
): Promise<{ error?: string }> {
  const { supabase, user } = await getUser();
  if (!user) return { error: "Non autorisé." };

  const { error } = await supabase
    .from("notes_vocales")
    .update({ chantier_id: chantierId })
    .eq("id", noteId)
    .eq("user_id", user.id);

  if (error) return { error: "Impossible d'associer cette note au chantier." };

  if (chantierId) revalidatePath(`/espace/chantiers/${chantierId}`);
  return {};
}

export async function supprimerNoteVocale(noteId: string): Promise<{ error?: string }> {
  const { supabase, user } = await getUser();
  if (!user) return { error: "Non autorisé." };

  const { data: note } = await supabase
    .from("notes_vocales")
    .select("audio_url, chantier_id")
    .eq("id", noteId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!note) return { error: "Note introuvable." };

  await supabase.storage.from("notes-vocales").remove([note.audio_url]);

  const { error } = await supabase
    .from("notes_vocales")
    .delete()
    .eq("id", noteId)
    .eq("user_id", user.id);

  if (error) return { error: "Impossible de supprimer cette note." };

  if (note.chantier_id) revalidatePath(`/espace/chantiers/${note.chantier_id}`);
  return {};
}
