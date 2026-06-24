"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { clientsCacheTag } from "@/lib/supabase/clients";

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

  updateTag(clientsCacheTag(user.id));
  revalidatePath("/espace/clients");
  redirect(`${redirectTo}?message=${encodeURIComponent("Client ajouté au carnet.")}`);
}

export async function addClientFromChantier(formData: FormData) {
  const chantierId = formData.get("chantierId") as string;
  const nomComplet = ((formData.get("nomComplet") as string) ?? "").trim();
  const email = (formData.get("email") as string)?.trim();

  if (!chantierId) {
    redirect("/espace/mes-chantiers");
  }

  if (!email) {
    redirect(`/espace/chantiers/${chantierId}`);
  }

  const [prenom, ...rest] = nomComplet.split(/\s+/).filter(Boolean);
  const nom = rest.join(" ");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const { error } = await supabase.from("clients").insert({
    user_id: user.id,
    prenom: prenom || nomComplet || email,
    nom: nom || "",
    email,
  });

  if (error) {
    redirect(
      `/espace/chantiers/${chantierId}?error=${encodeURIComponent(
        "Impossible d'ajouter ce client au carnet."
      )}`
    );
  }

  updateTag(clientsCacheTag(user.id));
  revalidatePath("/espace/clients");
  redirect(
    `/espace/chantiers/${chantierId}?message=${encodeURIComponent(
      "Client ajouté à votre carnet d'adresses."
    )}`
  );
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

  updateTag(clientsCacheTag(user.id));
  revalidatePath("/espace/clients");
  redirect("/espace/clients");
}
