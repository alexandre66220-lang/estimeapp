"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/backoffice/auth";
import { DEVIS_STATUTS, calculerTotalHt, type LigneDevis } from "@/lib/backoffice/devis-statut";

function parseLignes(raw: string): LigneDevis[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Lignes de prestation invalides.");
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Ajoutez au moins une ligne de prestation.");
  }

  return parsed.map((l) => {
    const nom = String((l as { nom?: unknown }).nom ?? "").trim();
    const description = String((l as { description?: unknown }).description ?? "").trim();
    const prixUnitaire = Number((l as { prix_unitaire?: unknown }).prix_unitaire);
    const quantite = Number((l as { quantite?: unknown }).quantite);

    if (!nom) throw new Error("Chaque ligne doit avoir un nom.");
    if (!Number.isFinite(prixUnitaire) || prixUnitaire < 0) throw new Error("Prix unitaire invalide.");
    if (!Number.isFinite(quantite) || quantite <= 0) throw new Error("Quantité invalide.");

    return { nom, description, prix_unitaire: prixUnitaire, quantite };
  });
}

export async function creerDevis(formData: FormData) {
  const supabase = await requireAdmin();

  const clientId = formData.get("client_id") as string;
  const lignesRaw = formData.get("lignes") as string;
  const dateValidite = (formData.get("date_validite") as string) || null;

  if (!clientId) throw new Error("Client obligatoire.");

  const lignes = parseLignes(lignesRaw);
  const totalHt = calculerTotalHt(lignes);

  const { data, error } = await supabase
    .from("admin_devis")
    .insert({
      client_id: clientId,
      lignes,
      total_ht: totalHt,
      date_validite: dateValidite,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/backoffice/devis");
  revalidatePath(`/backoffice/clients/${clientId}`);
  redirect(`/backoffice/devis/${data.id}`);
}

export async function changerStatutDevis(devisId: string, statut: string) {
  const supabase = await requireAdmin();

  if (!DEVIS_STATUTS.some((s) => s.value === statut)) {
    throw new Error("Statut invalide.");
  }

  const { error } = await supabase.from("admin_devis").update({ statut }).eq("id", devisId);

  if (error) throw new Error(error.message);

  revalidatePath("/backoffice/devis");
  revalidatePath(`/backoffice/devis/${devisId}`);
}
