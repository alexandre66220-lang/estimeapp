"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/**
 * Démarre un scan matériau en tâche de fond.
 *
 * L'image est uploadée et une ligne materiau_scans est créée immédiatement
 * avec analyse_status = "pending", puis l'id est retourné au client. La
 * Netlify Background Function analyze-material-background prend ensuite le
 * relais pour appeler Anthropic Vision sans contrainte de timeout (jusqu'à
 * 15 minutes), et met à jour la ligne (analyse_status, analyse_json) une
 * fois terminée. Le client poll /api/scan-status/[id] pour connaître le
 * résultat.
 */
export async function demarrerScanMateriau(formData: FormData): Promise<{
  error?: string;
  scanId?: string;
}> {
  const { supabase, user } = await getUser();
  if (!user) return { error: "Non autorisé." };

  const file = formData.get("image") as File | null;
  const chantierIdRaw = (formData.get("chantier_id") as string) || null;
  const chantierId = chantierIdRaw || null;

  if (!file || file.size === 0) return { error: "Aucune image fournie." };
  if (file.size > MAX_BYTES) return { error: "Image trop volumineuse (max 10 Mo)." };
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return { error: "Format non pris en charge (jpg, png, webp uniquement)." };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");

  // Upload image to private bucket
  const ext = file.type.split("/")[1] ?? "jpg";
  const path = `${user.id}/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("materiau-scans")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return { error: "Erreur lors du stockage de l'image." };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("materiau_scans")
    .insert({
      artisan_id: user.id,
      chantier_id: chantierId,
      image_url: path,
      analyse_status: "pending",
      analyse_json: null,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return { error: "Impossible de démarrer l'analyse." };
  }

  const scanId = inserted.id as string;
  const appUrl = process.env.APP_URL ?? process.env.URL ?? "https://estime-app.com";

  try {
    await fetch(`${appUrl}/.netlify/functions/analyze-material-background`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scanId,
        imageBase64: base64,
        mediaType: file.type,
      }),
    });
  } catch {
    await supabase
      .from("materiau_scans")
      .update({ analyse_status: "error" })
      .eq("id", scanId);
    return { error: "Impossible de démarrer l'analyse." };
  }

  if (chantierId) revalidatePath(`/espace/chantiers/${chantierId}`);
  revalidatePath("/espace/securite");

  return { scanId };
}

export async function associerScanMateriau(
  scanId: string,
  chantierId: string | null
): Promise<{ error?: string }> {
  const { supabase, user } = await getUser();
  if (!user) return { error: "Non autorisé." };

  const { error } = await supabase
    .from("materiau_scans")
    .update({ chantier_id: chantierId })
    .eq("id", scanId)
    .eq("artisan_id", user.id);

  if (error) return { error: "Impossible d'associer ce scan au chantier." };

  if (chantierId) revalidatePath(`/espace/chantiers/${chantierId}`);
  revalidatePath("/espace/securite");
  return {};
}

export async function getScanMateriauSignedUrl(imagePath: string): Promise<string | null> {
  const { supabase, user } = await getUser();
  if (!user) return null;

  const { data, error } = await supabase.storage
    .from("materiau-scans")
    .createSignedUrl(imagePath, 3600);

  if (error) return null;
  return data.signedUrl;
}
