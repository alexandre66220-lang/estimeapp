"use server";

import { getCurrentUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function initPaiementsChantier(
  chantierId: string,
  montantHT: number,
  fetchOnly = false
) {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: "Non authentifié" };

  if (!fetchOnly) {
    // Check if already exists
    const { data: existing } = await supabase
      .from("paiements_chantier")
      .select("id")
      .eq("chantier_id", chantierId)
      .eq("user_id", user.id)
      .limit(1);

    if (!existing || existing.length === 0) {
      const tranches = [
        { type: "acompte", montant: Math.round(montantHT * 0.3 * 100) / 100 },
        { type: "intermediaire", montant: Math.round(montantHT * 0.4 * 100) / 100 },
        { type: "solde", montant: Math.round(montantHT * 0.3 * 100) / 100 },
      ];

      await supabase.from("paiements_chantier").insert(
        tranches.map((t) => ({
          chantier_id: chantierId,
          user_id: user.id,
          type: t.type,
          montant: t.montant,
          statut: "en_attente",
        }))
      );
    }
  }

  // Always fetch current state and auto-update overdue
  const today = new Date().toISOString().slice(0, 10);
  const { data: paiements } = await supabase
    .from("paiements_chantier")
    .select("id, type, montant, statut, date_prevue, date_encaissement")
    .eq("chantier_id", chantierId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  // Auto-pass overdue to en_retard
  const overdue = (paiements ?? []).filter(
    (p) => p.statut === "en_attente" && p.date_prevue && p.date_prevue < today
  );
  if (overdue.length > 0) {
    await supabase
      .from("paiements_chantier")
      .update({ statut: "en_retard" })
      .in("id", overdue.map((p) => p.id));
    // Update in memory
    overdue.forEach((p) => {
      const row = (paiements ?? []).find((x) => x.id === p.id);
      if (row) row.statut = "en_retard";
    });
  }

  revalidatePath(`/espace/chantiers/${chantierId}`);
  return { paiements: paiements ?? [] };
}

export async function marquerPaiementEncaisse(
  paiementId: string,
  dateEncaissement: string
) {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: "Non authentifié" };

  await supabase
    .from("paiements_chantier")
    .update({ statut: "encaisse", date_encaissement: dateEncaissement })
    .eq("id", paiementId)
    .eq("user_id", user.id);

  return { ok: true };
}

export async function envoyerRelanceImpaye(data: {
  chantierId: string;
  clientId: string | null;
  type: "premier" | "deuxieme" | "troisieme";
  email: string;
  sujet: string;
  corps: string;
}) {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: "Non authentifié" };

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return { error: "Resend non configuré" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("prenom, nom, email")
    .eq("id", user.id)
    .maybeSingle();

  const fromName = [profile?.prenom, profile?.nom].filter(Boolean).join(" ") || "Estime";
  const fromEmail = "relances@estime-app.com";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${fromName} via Estime <${fromEmail}>`,
      to: [data.email],
      subject: data.sujet,
      html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#2C2C2C;">
        ${data.corps.split("\n").map((l) => `<p style="margin:0 0 12px;">${l}</p>`).join("")}
        <hr style="border:none;border-top:1px solid #E8E0D2;margin:24px 0;" />
        <p style="font-size:12px;color:#9A8F8B;">Envoyé via Estime — La plateforme des artisans</p>
      </div>`,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[relance] Resend error:", err);
    return { error: "Échec envoi email" };
  }

  // Log relance
  await supabase.from("relances_client").insert({
    client_id: data.clientId,
    chantier_id: data.chantierId,
    user_id: user.id,
    type: data.type,
    date_envoi: new Date().toISOString(),
    statut: "envoyee",
  });

  revalidatePath("/espace/finances");
  return { ok: true };
}
