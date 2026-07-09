/**
 * Netlify Scheduled Function — alertes impayés quotidiennes
 * Se déclenche chaque matin à 08h00 UTC
 *
 * Variables d'environnement requises :
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   RESEND_API_KEY
 *   APP_URL (ex: https://estime-app.com)
 */
import type { Config } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { withErrorNotification } from "./_utils/notify-error";

export const config: Config = {
  schedule: "0 8 * * *",
};

async function handler() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("[alertes-impayes] Missing Supabase env vars");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const resend = resendKey ? new Resend(resendKey) : null;

  const today = new Date().toISOString().slice(0, 10);

  // 1. Passer tous les paiements en_attente dont date_prevue < today → en_retard
  const { data: overdue, error: overdueError } = await supabase
    .from("paiements_chantier")
    .select("id, user_id, montant, chantier_id")
    .eq("statut", "en_attente")
    .lt("date_prevue", today);

  if (overdueError) {
    console.error("[alertes-impayes] Erreur fetch overdue:", overdueError.message);
    return;
  }

  if (overdue && overdue.length > 0) {
    const ids = overdue.map((p) => p.id);
    await supabase
      .from("paiements_chantier")
      .update({ statut: "en_retard" })
      .in("id", ids);

    console.log(`[alertes-impayes] ${ids.length} paiements passés en en_retard`);
  }

  // 2. Mettre à jour est_mauvais_payeur (2+ retards sur un client)
  const { data: allRetards } = await supabase
    .from("paiements_chantier")
    .select("user_id, chantier_id")
    .eq("statut", "en_retard");

  if (allRetards && allRetards.length > 0) {
    // Get chantiers → client_email mapping
    const chantierIds = [...new Set(allRetards.map((p) => p.chantier_id))];
    const { data: chantiers } = await supabase
      .from("chantiers")
      .select("id, client_email, user_id")
      .in("id", chantierIds);

    // Count retards per (user_id, client_email)
    const retardCount: Record<string, number> = {};
    for (const p of allRetards) {
      const ch = (chantiers ?? []).find((c) => c.id === p.chantier_id);
      if (ch?.client_email) {
        const key = `${p.user_id}:${ch.client_email.toLowerCase()}`;
        retardCount[key] = (retardCount[key] ?? 0) + 1;
      }
    }

    // Update clients with 2+ retards
    for (const [key, count] of Object.entries(retardCount)) {
      if (count >= 2) {
        const [userId, email] = key.split(":");
        await supabase
          .from("clients")
          .update({ est_mauvais_payeur: true })
          .eq("user_id", userId)
          .ilike("email", email);
      }
    }
  }

  // 3. Envoyer email de notification par artisan
  const { data: currentRetards } = await supabase
    .from("paiements_chantier")
    .select("user_id, montant")
    .eq("statut", "en_retard");

  if (!currentRetards || currentRetards.length === 0) {
    console.log("[alertes-impayes] Aucun retard actif, pas d'email envoyé");
    return;
  }

  // Group by user_id
  const byUser: Record<string, { count: number; total: number }> = {};
  for (const p of currentRetards) {
    if (!byUser[p.user_id]) byUser[p.user_id] = { count: 0, total: 0 };
    byUser[p.user_id].count++;
    byUser[p.user_id].total += p.montant ?? 0;
  }

  if (!resend) {
    console.log("[alertes-impayes] Resend non configuré, emails non envoyés");
    return;
  }

  for (const [userId, stats] of Object.entries(byUser)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("prenom, email")
      .eq("id", userId)
      .maybeSingle();

    if (!profile?.email) continue;

    const prenom = profile.prenom ?? "Artisan";
    const total = stats.total.toLocaleString("fr-FR", { maximumFractionDigits: 0 });
    const appUrl = process.env.APP_URL ?? "https://estime-app.com";

    try {
      await resend.emails.send({
        from: "Estime <alertes@estime-app.com>",
        to: profile.email,
        subject: `⚠️ ${stats.count} paiement${stats.count > 1 ? "s" : ""} en retard — ${total} €`,
        html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8F5F2;font-family:Helvetica,Arial,sans-serif;color:#2C2C2C;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="background:#C75D3B;padding:24px 32px;">
      <p style="margin:0;font-size:20px;font-weight:700;color:#fff;letter-spacing:2px;">ESTIME</p>
    </div>
    <div style="padding:32px;">
      <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#2C2C2C;">
        ⚠️ Paiements en retard
      </h1>
      <p style="color:#7A6E6A;font-size:14px;margin:0 0 24px;">Bonjour ${prenom},</p>

      <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:28px;font-weight:700;color:#DC2626;">${total} €</p>
        <p style="margin:0;font-size:14px;color:#7F1D1D;">
          ${stats.count} paiement${stats.count > 1 ? "s" : ""} en retard
        </p>
      </div>

      <p style="font-size:14px;color:#7A6E6A;margin:0 0 24px;">
        Pensez à relancer vos clients pour régulariser ces paiements.
      </p>

      <a href="${appUrl}/espace/finances" style="display:inline-block;background:#C75D3B;color:#fff;font-weight:700;padding:12px 28px;border-radius:50px;text-decoration:none;font-size:14px;">
        Voir mes impayés →
      </a>

      <hr style="border:none;border-top:1px solid #E8E0D2;margin:32px 0 16px;" />
      <p style="font-size:12px;color:#9A8F8B;margin:0;">
        Vous recevez cet email car vous avez des paiements en retard sur votre compte Estime.
      </p>
    </div>
  </div>
</body>
</html>`,
      });
      console.log(`[alertes-impayes] Email envoyé à ${profile.email} (${stats.count} retards, ${total}€)`);
    } catch (err) {
      console.error(`[alertes-impayes] Erreur email pour ${profile.email}:`, err);
    }
  }
}

export default withErrorNotification("alertes-impayes", handler);
