"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/backoffice/auth";
import { FACTURE_STATUTS } from "@/lib/backoffice/facture-statut";
import { getDevis } from "@/lib/backoffice/devis";
import type { LigneDevis } from "@/lib/backoffice/devis-statut";

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

function totalDe(lignes: LigneDevis[]): number {
  return lignes.reduce((s, l) => s + l.prix_unitaire * l.quantite, 0);
}

export async function creerFacture(formData: FormData) {
  const supabase = await requireAdmin();

  const clientId = formData.get("client_id") as string;
  const lignesRaw = formData.get("lignes") as string;
  const dateEcheance = (formData.get("date_echeance") as string) || null;

  if (!clientId) throw new Error("Client obligatoire.");

  const lignes = parseLignes(lignesRaw);
  const total = totalDe(lignes);

  const { data, error } = await supabase
    .from("admin_factures")
    .insert({
      client_id: clientId,
      lignes,
      total_ht: total,
      total_ttc: total, // TVA non applicable (franchise en base, art. 293 B du CGI)
      date_echeance: dateEcheance,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/backoffice/factures");
  revalidatePath("/backoffice");
  redirect(`/backoffice/factures/${data.id}`);
}

/**
 * Conversion d'un devis accepté en facture, en un clic : reprend les
 * lignes et le total du devis. Ne modifie jamais le devis d'origine.
 */
export async function creerFactureDepuisDevis(devisId: string) {
  const supabase = await requireAdmin();

  const devis = await getDevis(supabase, devisId);
  if (!devis) throw new Error("Devis introuvable.");

  const dateEcheance = new Date();
  dateEcheance.setDate(dateEcheance.getDate() + 30);

  const { data, error } = await supabase
    .from("admin_factures")
    .insert({
      client_id: devis.client_id,
      devis_id: devis.id,
      lignes: devis.lignes,
      total_ht: devis.total_ht,
      total_ttc: devis.total_ht,
      date_echeance: dateEcheance.toISOString().slice(0, 10),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/backoffice/factures");
  revalidatePath("/backoffice");
  revalidatePath(`/backoffice/devis/${devisId}`);
  redirect(`/backoffice/factures/${data.id}`);
}

export async function marquerPayee(factureId: string, datePaiement: string) {
  const supabase = await requireAdmin();

  if (!datePaiement) throw new Error("Date de paiement obligatoire.");

  const { error } = await supabase
    .from("admin_factures")
    .update({ statut: "payee", date_paiement: datePaiement })
    .eq("id", factureId);

  if (error) throw new Error(error.message);

  revalidatePath("/backoffice/factures");
  revalidatePath(`/backoffice/factures/${factureId}`);
  revalidatePath("/backoffice");
}

export async function changerStatutFacture(factureId: string, statut: string) {
  const supabase = await requireAdmin();

  if (!FACTURE_STATUTS.some((s) => s.value === statut)) {
    throw new Error("Statut invalide.");
  }

  const { error } = await supabase.from("admin_factures").update({ statut }).eq("id", factureId);

  if (error) throw new Error(error.message);

  revalidatePath("/backoffice/factures");
  revalidatePath(`/backoffice/factures/${factureId}`);
  revalidatePath("/backoffice");
}
