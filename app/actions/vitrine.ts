"use server";

import { createClient } from "@/lib/supabase/server";
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

  const { error } = await supabase
    .from("profiles")
    .update({ vitrine_config: config })
    .eq("id", user.id);

  if (error) {
    console.error("[saveVitrineConfig]", error.message, error.code);
    return { error: "Erreur de sauvegarde" };
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

  const { error } = await supabase
    .from("profiles")
    .update({ vitrine_config: {} })
    .eq("id", user.id);

  if (error) return { error: "Erreur de réinitialisation" };
  return {};
}
