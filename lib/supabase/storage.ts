import type { SupabaseClient } from "@supabase/supabase-js";

const SIGNED_URL_EXPIRES_IN = 60 * 60;

export async function getSignedChantierPhotoUrl(
  supabase: SupabaseClient,
  path: string | null
): Promise<string | null> {
  if (!path) return null;

  const { data, error } = await supabase.storage
    .from("chantiers")
    .createSignedUrl(path, SIGNED_URL_EXPIRES_IN);

  if (error || !data) return null;
  return data.signedUrl;
}

export async function getSignedChantierPhotoUrls<
  T extends { photo_avant_url: string | null; photo_apres_url: string | null },
>(supabase: SupabaseClient, chantiers: T[]): Promise<T[]> {
  return Promise.all(
    chantiers.map(async (chantier) => ({
      ...chantier,
      photo_avant_url: await getSignedChantierPhotoUrl(supabase, chantier.photo_avant_url),
      photo_apres_url: await getSignedChantierPhotoUrl(supabase, chantier.photo_apres_url),
    }))
  );
}
