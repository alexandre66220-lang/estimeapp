"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { clientsCacheTag, type ClientStatut } from "@/lib/supabase/clients";

// ── Statut pipeline ───────────────────────────────────────────────────────────

export async function updateClientStatut(
  clientId: string,
  statut: ClientStatut
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorisé" };

  const VALID: ClientStatut[] = [
    "prospect",
    "devis_envoye",
    "chantier_en_cours",
    "termine",
    "perdu",
  ];
  if (!VALID.includes(statut)) return { error: "Statut invalide" };

  const { error } = await supabase
    .from("clients")
    .update({ statut, derniere_interaction: new Date().toISOString() })
    .eq("id", clientId)
    .eq("user_id", user.id);

  if (error) return { error: "Impossible de mettre à jour le statut." };

  updateTag(clientsCacheTag(user.id));
  revalidatePath("/espace/pipeline");
  return {};
}

// ── Détails client ────────────────────────────────────────────────────────────

export async function updateClientDetails(formData: FormData) {
  const clientId = formData.get("clientId") as string;
  const source = (formData.get("source") as string)?.trim() || null;
  const estVip = formData.get("estVip") === "true";
  const montantEstime = formData.get("montantEstime")
    ? Number(formData.get("montantEstime"))
    : null;

  if (!clientId) redirect("/espace/clients");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { error } = await supabase
    .from("clients")
    .update({ source, est_vip: estVip, montant_estime: montantEstime })
    .eq("id", clientId)
    .eq("user_id", user.id);

  if (error) {
    redirect(
      `/espace/clients/${clientId}?error=${encodeURIComponent(
        "Impossible de mettre à jour le client."
      )}`
    );
  }

  updateTag(clientsCacheTag(user.id));
  revalidatePath(`/espace/clients/${clientId}`);
  redirect(
    `/espace/clients/${clientId}?message=${encodeURIComponent("Client mis à jour.")}`
  );
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export async function addNote(formData: FormData) {
  const clientId = formData.get("clientId") as string;
  const contenu = (formData.get("contenu") as string)?.trim();

  if (!clientId || !contenu) {
    redirect(`/espace/clients/${clientId}?error=${encodeURIComponent("Le contenu de la note est obligatoire.")}`);
  }
  if (contenu.length > 2000) {
    redirect(`/espace/clients/${clientId}?error=${encodeURIComponent("La note est trop longue (max 2000 caractères).")}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  // Vérifier le client appartient à l'utilisateur
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!client) redirect("/espace/clients");

  // Vérifier la limite de 50 notes
  const { count } = await supabase
    .from("notes_client")
    .select("id", { count: "exact", head: true })
    .eq("client_id", clientId);

  if ((count ?? 0) >= 50) {
    redirect(
      `/espace/clients/${clientId}?error=${encodeURIComponent("Limite de 50 notes atteinte.")}`
    );
  }

  await supabase.from("notes_client").insert({
    client_id: clientId,
    user_id: user.id,
    contenu,
  });

  // Mettre à jour derniere_interaction
  await supabase
    .from("clients")
    .update({ derniere_interaction: new Date().toISOString() })
    .eq("id", clientId)
    .eq("user_id", user.id);

  revalidatePath(`/espace/clients/${clientId}`);
  redirect(`/espace/clients/${clientId}#notes`);
}

export async function deleteNote(formData: FormData) {
  const noteId = formData.get("noteId") as string;
  const clientId = formData.get("clientId") as string;

  if (!noteId || !clientId) redirect("/espace/clients");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  await supabase
    .from("notes_client")
    .delete()
    .eq("id", noteId)
    .eq("user_id", user.id);

  revalidatePath(`/espace/clients/${clientId}`);
  redirect(`/espace/clients/${clientId}#notes`);
}

// ── Prospect rapide depuis pipeline ──────────────────────────────────────────

export async function addProspect(formData: FormData) {
  const prenom = (formData.get("prenom") as string)?.trim();
  const nom = (formData.get("nom") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const telephone = (formData.get("telephone") as string)?.trim() || null;

  if (!prenom || !nom) {
    redirect(
      `/espace/pipeline?error=${encodeURIComponent("Le prénom et le nom sont obligatoires.")}`
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  await supabase.from("clients").insert({
    user_id: user.id,
    prenom,
    nom,
    email: email || `prospect-${Date.now()}@estime.local`,
    telephone,
    statut: "prospect",
  });

  updateTag(clientsCacheTag(user.id));
  revalidatePath("/espace/pipeline");
  redirect(`/espace/pipeline?message=${encodeURIComponent("Prospect ajouté.")}`);
}
