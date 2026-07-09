"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { analyserMateriau, type AnalyseMateriau } from "@/lib/anthropic/analyze-materiau";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function analyserPhotoMateriau(formData: FormData): Promise<{
  error?: string;
  analyse?: AnalyseMateriau;
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

  const { data: analyse, error: analyseError } = await analyserMateriau(
    base64,
    file.type as "image/jpeg" | "image/png" | "image/webp"
  );

  if (analyseError || !analyse) {
    return { error: analyseError ?? "Analyse impossible." };
  }

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
      analyse_json: analyse,
    })
    .select("id")
    .single();

  if (insertError) {
    return { error: "Analyse effectuée mais l'enregistrement a échoué." };
  }

  if (chantierId) revalidatePath(`/espace/chantiers/${chantierId}`);
  revalidatePath("/espace/securite");

  return { analyse, scanId: inserted.id };
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
