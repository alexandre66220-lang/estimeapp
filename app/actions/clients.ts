"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addClient(formData: FormData) {
  const prenom = (formData.get("prenom") as string)?.trim();
  const nom = (formData.get("nom") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const telephone = (formData.get("telephone") as string)?.trim() || null;
  const redirectTo = (formData.get("redirectTo") as string) || "/espace/clients";

  if (!prenom || !nom || !email) {
    redirect(
      `${redirectTo}?error=${encodeURIComponent(
        "Le prénom, le nom et l'email sont obligatoires."
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

  const { error } = await supabase.from("clients").insert({
    user_id: user.id,
    prenom,
    nom,
    email,
    telephone,
  });

  if (error) {
    redirect(
      `${redirectTo}?error=${encodeURIComponent(
        "Impossible d'ajouter ce client. Réessayez."
      )}`
    );
  }

  revalidatePath("/espace/clients");
  redirect(`${redirectTo}?message=${encodeURIComponent("Client ajouté au carnet.")}`);
}

export async function deleteClient(formData: FormData) {
  const clientId = formData.get("clientId") as string;

  if (!clientId) {
    redirect("/espace/clients");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  await supabase.from("clients").delete().eq("id", clientId).eq("user_id", user.id);

  revalidatePath("/espace/clients");
  redirect("/espace/clients");
}
