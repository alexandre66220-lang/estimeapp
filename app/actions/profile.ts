"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileCacheTag } from "@/lib/supabase/profile";

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

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    prenom,
    nom,
    metier,
    ville,
    ton_post: tonPost,
    lien_avis_google: lienAvisGoogle,
  });

  if (error) {
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
