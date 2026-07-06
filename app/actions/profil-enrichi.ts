"use server";

import { updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { profileCacheTag } from "@/lib/supabase/profile";
import { devError } from "@/lib/log";
import Anthropic from "@anthropic-ai/sdk";

const VALID_THEMES = ["#C75D3B", "#385144", "#2D4A6B", "#7B2D3E", "#C8922A", "#3D3D3D"];
const VALID_CERTIFS = [
  "RGE", "Qualibat", "Qualipac", "Qualibois",
  "Handibat", "Label RAGE", "Assurance décennale", "Auto-entrepreneur certifié",
];
const VALID_STATUTS = ["disponible", "en_chantier", "complet"];
const VALID_LANGUES = ["fr", "en", "es"];
const SLUG_RE = /^[a-z0-9-]{3,30}$/;
const SIRET_RE = /^\d{14}$/;

function invalidSlug(slug: string) {
  return !SLUG_RE.test(slug);
}

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

async function invalidate(userId: string) {
  updateTag(profileCacheTag(userId));
}

// ─── Photo de profil ──────────────────────────────────────────────────────────

export async function deletePhotoProfil(): Promise<{ error?: string }> {
  const { supabase, user } = await getUser();
  if (!user) return { error: "Non autorisé" };

  const admin = createAdminClient();
  await admin.storage.from("profiles").remove([`photos/${user.id}.jpg`]);
  await supabase.from("profiles").update({ photo_profil: null }).eq("id", user.id);
  await invalidate(user.id);
  return {};
}

// ─── Présentation ─────────────────────────────────────────────────────────────

export async function savePresentation(
  presentation: string
): Promise<{ error?: string }> {
  const { supabase, user } = await getUser();
  if (!user) return { error: "Non autorisé" };

  const cleaned = presentation.slice(0, 500);
  const { error } = await supabase
    .from("profiles")
    .update({ presentation: cleaned || null })
    .eq("id", user.id);

  if (error) return { error: "Impossible d'enregistrer." };
  await invalidate(user.id);
  return {};
}

export async function genererPresentation(params: {
  metier: string | null;
  ville: string | null;
  anneeDebut: number | null;
}): Promise<{ presentation?: string; error?: string }> {
  const { user } = await getUser();
  if (!user) return { error: "Non autorisé" };

  try {
    const client = new Anthropic();
    const exp = params.anneeDebut
      ? `${new Date().getFullYear() - params.anneeDebut} ans d'expérience`
      : "";
    const prompt = [
      `Tu es un assistant qui rédige des présentations professionnelles pour des artisans.`,
      `Artisan : ${params.metier ?? "artisan du bâtiment"}`,
      params.ville ? `Ville : ${params.ville}` : "",
      exp ? `Expérience : ${exp}` : "",
      `Écris une présentation professionnelle, chaleureuse et concise en 2-3 phrases (max 400 caractères).`,
      `Utilise "je" et parle directement au client potentiel. Ne mets pas de titre.`,
    ]
      .filter(Boolean)
      .join("\n");

    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });

    const text = msg.content.find((b) => b.type === "text")?.text?.trim() ?? "";
    return { presentation: text.slice(0, 500) };
  } catch (e) {
    devError("genererPresentation error", e);
    return { error: "La génération a échoué. Réessayez." };
  }
}

// ─── Certifications ───────────────────────────────────────────────────────────

export async function saveCertifications(
  certifications: string[]
): Promise<{ error?: string }> {
  const { supabase, user } = await getUser();
  if (!user) return { error: "Non autorisé" };

  const valid = certifications.filter(
    (c) => typeof c === "string" && c.trim().length > 0 && c.length <= 100
  );

  const { error } = await supabase
    .from("profiles")
    .update({ certifications: valid })
    .eq("id", user.id);

  if (error) return { error: "Impossible d'enregistrer." };
  await invalidate(user.id);
  return {};
}

// ─── Expérience + statut ──────────────────────────────────────────────────────

export async function saveExperienceStatut(params: {
  anneeDebut: number | null;
  statut: string;
  jusqu_au: string | null;
}): Promise<{ error?: string }> {
  const { supabase, user } = await getUser();
  if (!user) return { error: "Non autorisé" };

  if (!VALID_STATUTS.includes(params.statut)) return { error: "Statut invalide." };

  const currentYear = new Date().getFullYear();
  if (params.anneeDebut && (params.anneeDebut < 1950 || params.anneeDebut > currentYear)) {
    return { error: "Année invalide." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      annees_experience: params.anneeDebut,
      statut_disponibilite: params.statut,
      statut_jusqu_au: params.jusqu_au ?? null,
    })
    .eq("id", user.id);

  if (error) return { error: "Impossible d'enregistrer." };
  await invalidate(user.id);
  return {};
}

// ─── Réseaux sociaux ──────────────────────────────────────────────────────────

export async function saveReseaux(liens: {
  instagram: string;
  facebook: string;
  tiktok: string;
}): Promise<{ error?: string }> {
  const { supabase, user } = await getUser();
  if (!user) return { error: "Non autorisé" };

  const cleaned: Record<string, string> = {};
  for (const [key, val] of Object.entries(liens)) {
    const v = val.trim();
    if (!v) continue;
    if (!/^https?:\/\//i.test(v)) return { error: `URL ${key} invalide (doit commencer par https://).` };
    cleaned[key] = v;
  }

  const { error } = await supabase
    .from("profiles")
    .update({ liens_sociaux: cleaned })
    .eq("id", user.id);

  if (error) return { error: "Impossible d'enregistrer." };
  await invalidate(user.id);
  return {};
}

// ─── SIRET ────────────────────────────────────────────────────────────────────

export async function saveSiret(siret: string): Promise<{ error?: string }> {
  const { supabase, user } = await getUser();
  if (!user) return { error: "Non autorisé" };

  const cleaned = siret.replace(/\s/g, "");
  if (cleaned && !SIRET_RE.test(cleaned)) return { error: "SIRET invalide (14 chiffres)." };

  const { error } = await supabase
    .from("profiles")
    .update({ numero_siret: cleaned || null })
    .eq("id", user.id);

  if (error) return { error: "Impossible d'enregistrer." };
  await invalidate(user.id);
  return {};
}

// ─── Slug personnalisé ────────────────────────────────────────────────────────

export async function checkSlugDisponible(slug: string): Promise<{
  disponible?: boolean;
  error?: string;
}> {
  if (invalidSlug(slug)) return { error: "Format invalide." };

  const { supabase, user } = await getUser();
  if (!user) return { error: "Non autorisé" };

  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("slug", slug)
    .neq("id", user.id)
    .maybeSingle();

  const { data: data2 } = await admin
    .from("profiles")
    .select("id")
    .eq("slug_personnalise", slug)
    .neq("id", user.id)
    .maybeSingle();

  return { disponible: !data && !data2 };
}

export async function saveSlugPersonnalise(slug: string): Promise<{ error?: string }> {
  if (invalidSlug(slug)) return { error: "Format invalide." };

  const { supabase, user } = await getUser();
  if (!user) return { error: "Non autorisé" };

  const admin = createAdminClient();
  const { data: conflict } = await admin
    .from("profiles")
    .select("id")
    .eq("slug", slug)
    .neq("id", user.id)
    .maybeSingle();

  const { data: conflict2 } = await admin
    .from("profiles")
    .select("id")
    .eq("slug_personnalise", slug)
    .neq("id", user.id)
    .maybeSingle();

  if (conflict || conflict2) return { error: "Ce slug est déjà utilisé." };

  const { error } = await supabase
    .from("profiles")
    .update({ slug: slug, slug_personnalise: slug })
    .eq("id", user.id);

  if (error) return { error: "Impossible d'enregistrer." };
  await invalidate(user.id);
  return {};
}

// ─── Thème ────────────────────────────────────────────────────────────────────

export async function saveTheme(couleur: string): Promise<{ error?: string }> {
  if (!VALID_THEMES.includes(couleur)) return { error: "Couleur invalide." };

  const { supabase, user } = await getUser();
  if (!user) return { error: "Non autorisé" };

  const { error } = await supabase
    .from("profiles")
    .update({ theme_couleur: couleur })
    .eq("id", user.id);

  if (error) return { error: "Impossible d'enregistrer." };
  await invalidate(user.id);
  return {};
}

// ─── Langue ───────────────────────────────────────────────────────────────────

// ─── Mode sombre ──────────────────────────────────────────────────────────────

export async function saveThemeMode(mode: string): Promise<{ error?: string }> {
  const VALID = ["light", "dark", "system"];
  if (!VALID.includes(mode)) return { error: "Mode invalide." };

  const { supabase, user } = await getUser();
  if (!user) return { error: "Non autorisé" };

  const { error } = await supabase
    .from("profiles")
    .update({ theme_mode: mode })
    .eq("id", user.id);

  if (error) return { error: "Impossible d'enregistrer." };
  await invalidate(user.id);
  return {};
}

// ─── Langue ───────────────────────────────────────────────────────────────────

export async function saveLangue(langue: string): Promise<{ error?: string }> {
  if (!VALID_LANGUES.includes(langue)) return { error: "Langue invalide." };

  const { supabase, user } = await getUser();
  if (!user) return { error: "Non autorisé" };

  const { error } = await supabase
    .from("profiles")
    .update({ langue_interface: langue })
    .eq("id", user.id);

  if (error) return { error: "Impossible d'enregistrer." };
  await invalidate(user.id);
  return {};
}
