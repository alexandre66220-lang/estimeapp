"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateClientInfo(formData: FormData) {
  const chantierId = formData.get("chantierId") as string;
  const clientNom = (formData.get("clientNom") as string)?.trim();
  const clientEmail = (formData.get("clientEmail") as string)?.trim();

  if (!chantierId) {
    redirect("/espace/mes-chantiers");
  }

  if (!clientNom || !clientEmail) {
    redirect(
      `/espace/chantiers/${chantierId}?error=${encodeURIComponent(
        "Le nom et l'email du client sont obligatoires."
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
    .from("chantiers")
    .update({ client_nom: clientNom, client_email: clientEmail })
    .eq("id", chantierId)
    .eq("user_id", user.id);

  if (error) {
    redirect(
      `/espace/chantiers/${chantierId}?error=${encodeURIComponent(
        "Impossible d'enregistrer les informations du client."
      )}`
    );
  }

  redirect(
    `/espace/chantiers/${chantierId}?message=${encodeURIComponent(
      "Informations du client enregistrées."
    )}`
  );
}
