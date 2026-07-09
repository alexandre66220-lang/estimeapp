"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileCacheTag } from "@/lib/supabase/profile";
import type { VitrineConfig } from "@/lib/vitrine/defaults";

function isVitrineComplete(config: VitrineConfig): boolean {
  return Boolean(
    config.hero.slogan.trim() &&
      config.hero.couleur_principale &&
      config.sections.a_propos.texte.trim() &&
      config.sections.a_propos.zone_intervention.trim() &&
      config.sections.contact.visible
  );
}

export async function saveVitrineConfig(
  config: VitrineConfig
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const { data: updated, error } = await supabase
    .from("profiles")
    .update({ vitrine_config: config })
    .eq("id", user.id)
    .select("slug")
    .maybeSingle();

  if (error) {
    console.error("[saveVitrineConfig]", error.message, error.code);
    return { error: "Erreur de sauvegarde" };
  }

  updateTag(profileCacheTag(user.id));
  revalidatePath("/espace/ma-vitrine");
  if (updated?.slug) {
    revalidatePath(`/artisan/${updated.slug}`);
  }

  if (isVitrineComplete(config)) {
    try {
      const { addPointsFidelite } = await import("./fidelite");
      await addPointsFidelite("vitrine_complete");
    } catch {
      // Points non critiques
    }
  }

  return {};
}

export async function resetVitrineConfig(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const { data: updated, error } = await supabase
    .from("profiles")
    .update({ vitrine_config: {} })
    .eq("id", user.id)
    .select("slug")
    .maybeSingle();

  if (error) return { error: "Erreur de réinitialisation" };

  updateTag(profileCacheTag(user.id));
  revalidatePath("/espace/ma-vitrine");
  if (updated?.slug) {
    revalidatePath(`/artisan/${updated.slug}`);
  }

  return {};
}
