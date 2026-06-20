"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  redirect(
    `/espace/parametres?message=${encodeURIComponent("Lien Google enregistré.")}`
  );
}
