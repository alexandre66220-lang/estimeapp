import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Convertit une chaîne en slug kebab-case ASCII. */
export function toSlug(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Construit la base du slug depuis prenom, nom, metier. */
export function buildSlugBase(
  prenom: string | null,
  nom: string | null,
  metier: string | null
): string {
  const parts = [prenom, nom, metier].filter(Boolean) as string[];
  if (parts.length === 0) return "artisan";
  return toSlug(parts.join(" "));
}

/**
 * Génère un slug unique en vérifiant les collisions via Supabase.
 * Ajoute un suffixe numérique si nécessaire : jean-dupont-peintre-2, …
 */
export async function ensureUniqueSlug(
  supabase: SupabaseClient,
  base: string
): Promise<string> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("slug")
    .like("slug", `${base}%`);

  const taken = new Set((existing ?? []).map((r) => r.slug));

  if (!taken.has(base)) return base;

  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}
