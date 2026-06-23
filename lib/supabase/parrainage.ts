import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

function slugifyBase(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 6);
}

function randomSuffix() {
  return Math.floor(10 + Math.random() * 90).toString();
}

export async function generateUniqueCodeParrainage(
  supabase: SupabaseClient,
  seed: string
): Promise<string> {
  const base = slugifyBase(seed) || "ARTISAN";

  for (let attempt = 0; attempt < 10; attempt++) {
    const code = `ESTIME-${base}${randomSuffix()}`;
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("code_parrainage", code)
      .maybeSingle();

    if (!data) return code;
  }

  return `ESTIME-${base}${Date.now().toString().slice(-6)}`;
}

export async function ensureCodeParrainage(
  supabase: SupabaseClient,
  userId: string,
  seed: string
): Promise<string> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("code_parrainage")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.code_parrainage) return profile.code_parrainage;

  const code = await generateUniqueCodeParrainage(supabase, seed);

  await supabase.from("profiles").update({ code_parrainage: code }).eq("id", userId);

  await supabase.from("parrainages").insert({
    parrain_id: userId,
    code_parrainage: code,
    statut: "en_attente",
  });

  return code;
}
