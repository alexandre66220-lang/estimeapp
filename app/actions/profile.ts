"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { profileCacheTag } from "@/lib/supabase/profile";
import { buildSlugBase, ensureUniqueSlug } from "@/lib/slug";

export type UploadLogoResult = { error?: string; success?: true };

export async function uploadLogo(formData: FormData): Promise<UploadLogoResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Aucun fichier sélectionné." };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { error: "Le logo ne doit pas dépasser 2 Mo." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "Format de fichier non supporté." };
  }

  const admin = createAdminClient();
  const path = `logos/${user.id}.png`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await admin.storage
    .from("chantiers")
    .upload(path, Buffer.from(bytes), { contentType: file.type, upsert: true });

  if (uploadError) {
    return { error: "Erreur lors de l'upload du logo." };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ logo_url: path })
    .eq("id", user.id);

  if (updateError) {
    return { error: "Erreur lors de la mise à jour du profil." };
  }

  updateTag(profileCacheTag(user.id));
  return { success: true };
}

export async function updateLienAvisGoogle(formData: FormData) {
  const lienAvisGoogle = (formData.get("lienAvisGoogle") as string)?.trim();

  if (lienAvisGoogle && !/^https?:\/\//i.test(lienAvisGoogle)) {
    redirect(
      `/espace/parametres?error=${encodeURIComponent(
        "Le lien doit commencer par http:// ou https://."
      )}`
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ lien_avis_google: lienAvisGoogle || null })
    .eq("id", user.id);

  if (error) {
    redirect(
      `/espace/parametres?error=${encodeURIComponent(
        "Impossible d'enregistrer le lien. Réessayez."
      )}`
    );
  }

  updateTag(profileCacheTag(user.id));

  redirect(
    `/espace/parametres?message=${encodeURIComponent("Lien Google enregistré.")}`
  );
}

const METIERS = [
  "Peintre",
  "Plombier",
  "Électricien",
  "Maçon",
  "Carreleur",
  "Menuisier",
  "Autre",
];

const TONS = ["professionnel", "decontracte", "technique"];

export async function updateProfil(formData: FormData) {
  const prenom = (formData.get("prenom") as string)?.trim() || null;
  const nom = (formData.get("nom") as string)?.trim() || null;
  const metier = (formData.get("metier") as string)?.trim() || null;
  const ville = (formData.get("ville") as string)?.trim() || null;
  const tonPost = (formData.get("tonPost") as string)?.trim() || null;
  const lienAvisGoogle = (formData.get("lienAvisGoogle") as string)?.trim() || null;

  if (metier && !METIERS.includes(metier)) {
    redirect(
      `/espace/profil?error=${encodeURIComponent("Métier invalide.")}`
    );
  }

  if (tonPost && !TONS.includes(tonPost)) {
    redirect(
      `/espace/profil?error=${encodeURIComponent("Ton de post invalide.")}`
    );
  }

  if (lienAvisGoogle && !/^https?:\/\//i.test(lienAvisGoogle)) {
    redirect(
      `/espace/profil?error=${encodeURIComponent(
        "Le lien Google doit commencer par http:// ou https://."
      )}`
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  // Générer le slug si ce profil n'en a pas encore un
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("profiles")
    .select("slug")
    .eq("id", user.id)
    .maybeSingle();

  let slug: string | undefined;
  if (!existing?.slug && (prenom || nom)) {
    const base = buildSlugBase(prenom, nom, metier);
    slug = await ensureUniqueSlug(admin, base);
  }

  const { error } = await supabase.from("profiles").update({
    prenom,
    nom,
    metier,
    ville,
    ton_post: tonPost,
    lien_avis_google: lienAvisGoogle,
    ...(slug ? { slug } : {}),
  }).eq("id", user.id);

  if (error) {
    console.error("[updateProfil] Supabase error:", error.message, error.code, error.details);
    redirect(
      `/espace/profil?error=${encodeURIComponent(
        "Impossible d'enregistrer votre profil. Réessayez."
      )}`
    );
  }

  updateTag(profileCacheTag(user.id));

  redirect(
    `/espace/profil?message=${encodeURIComponent("Profil enregistré.")}`
  );
}

export async function updateTemplateEmail(formData: FormData) {
  const templateEmail = (formData.get("templateEmail") as string)?.trim() || null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ template_email: templateEmail })
    .eq("id", user.id);

  if (error) {
    redirect(
      `/espace/parametres?error=${encodeURIComponent(
        "Impossible d'enregistrer le template d'email. Réessayez."
      )}`
    );
  }

  updateTag(profileCacheTag(user.id));

  redirect(
    `/espace/parametres?message=${encodeURIComponent("Template d'email enregistré.")}`
  );
}

export async function reinitialiserTemplateEmail() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ template_email: null })
    .eq("id", user.id);

  if (error) {
    redirect(
      `/espace/parametres?error=${encodeURIComponent(
        "Impossible de réinitialiser le template d'email. Réessayez."
      )}`
    );
  }

  updateTag(profileCacheTag(user.id));

  redirect(
    `/espace/parametres?message=${encodeURIComponent("Template d'email réinitialisé.")}`
  );
}
