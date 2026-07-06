/**
 * Netlify Scheduled Function — rapport mensuel artisans
 * Se déclenche le 1er de chaque mois à 08h00 UTC
 *
 * Variables d'environnement requises :
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   RAPPORT_SECRET_KEY
 *   RESEND_API_KEY
 *   APP_URL (ex: https://estime-app.com)
 */
import type { Config } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const config: Config = {
  schedule: "0 8 1 * *",
};

const MOIS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function moisPrecedentLabel() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${MOIS_FR[d.getMonth()]} ${d.getFullYear()}`;
}

function emailHtml(prenom: string, moisLabel: string, stats: {
  chantiers: number;
  posts: number;
  avis: number;
}, pdfUrl: string | null): string {
  const btn = pdfUrl
    ? `<a href="${pdfUrl}" style="display:inline-block;background:#C75D3B;color:#fff;font-weight:700;padding:12px 28px;border-radius:50px;text-decoration:none;font-size:14px;margin-top:24px;">Voir mon rapport complet</a>`
    : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8F5F2;font-family:Helvetica,Arial,sans-serif;color:#2C2C2C;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="background:#C75D3B;padding:24px 32px;">
      <p style="margin:0;font-size:20px;font-weight:700;color:#fff;letter-spacing:2px;">ESTIME</p>
    </div>
    <div style="padding:32px;">
      <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#2C2C2C;">
        Votre rapport de ${moisLabel} est prêt 📊
      </h1>
      <p style="color:#7A6E6A;font-size:14px;margin:0 0 24px;">Bonjour ${prenom}, voici votre bilan mensuel Estime.</p>

      <div style="display:flex;gap:12px;margin-bottom:24px;">
        <div style="flex:1;background:#FAF7F5;border-radius:10px;padding:16px;text-align:center;">
          <p style="margin:0;font-size:24px;font-weight:700;color:#C75D3B;">${stats.chantiers}</p>
          <p style="margin:4px 0 0;font-size:11px;color:#7A6E6A;text-transform:uppercase;letter-spacing:0.5px;">Chantiers</p>
        </div>
        <div style="flex:1;background:#FAF7F5;border-radius:10px;padding:16px;text-align:center;">
          <p style="margin:0;font-size:24px;font-weight:700;color:#C75D3B;">${stats.posts}</p>
          <p style="margin:4px 0 0;font-size:11px;color:#7A6E6A;text-transform:uppercase;letter-spacing:0.5px;">Posts générés</p>
        </div>
        <div style="flex:1;background:#FAF7F5;border-radius:10px;padding:16px;text-align:center;">
          <p style="margin:0;font-size:24px;font-weight:700;color:#C75D3B;">${stats.avis}</p>
          <p style="margin:4px 0 0;font-size:11px;color:#7A6E6A;text-transform:uppercase;letter-spacing:0.5px;">Avis reçus</p>
        </div>
      </div>

      <p style="color:#7A6E6A;font-size:13px;margin:0 0 4px;">Votre rapport complet est disponible en pièce jointe et en ligne.</p>
      ${btn}
    </div>
    <div style="background:#F8F5F2;padding:16px 32px;border-top:1px solid #E8E0D8;">
      <p style="margin:0;font-size:11px;color:#7A6E6A;">Créé par <a href="https://alcalspark.com" style="color:#C75D3B;">AlcalSpark</a> · <a href="https://estime-app.com/espace/rapports" style="color:#C75D3B;">Gérer mes préférences</a></p>
    </div>
  </div>
</body>
</html>`;
}

export default async function handler() {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const secret = process.env.RAPPORT_SECRET_KEY!;
  const appUrl = process.env.APP_URL ?? process.env.URL ?? "https://estime-app.com";
  const resendKey = process.env.RESEND_API_KEY!;

  const admin = createClient(supabaseUrl, supabaseKey);
  const resend = new Resend(resendKey);
  const moisLabel = moisPrecedentLabel();

  // Fetch all subscribed artisans
  const { data: artisans, error: artisansError } = await admin
    .from("profiles")
    .select("id, prenom, nom, email")
    .eq("is_subscribed", true)
    .not("email", "is", null);

  if (artisansError || !artisans?.length) {
    console.error("Aucun artisan abonné trouvé", artisansError);
    return { statusCode: 200, body: "Aucun artisan abonné" };
  }

  console.log(`Rapport mensuel : ${artisans.length} artisan(s) à traiter`);

  const results = await Promise.allSettled(
    artisans.map(async (artisan) => {
      try {
        // Generate PDF via API
        const response = await fetch(`${appUrl}/api/rapports/generer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: artisan.id, secret }),
        });

        if (!response.ok) {
          throw new Error(`API erreur ${response.status}`);
        }

        const result = await response.json();
        const { pdfUrl, stats } = result;

        // Fetch PDF as buffer for attachment
        let attachments: Array<{ filename: string; content: Buffer }> = [];
        if (pdfUrl) {
          const pdfResp = await fetch(pdfUrl);
          if (pdfResp.ok) {
            const buf = await pdfResp.arrayBuffer();
            attachments = [{
              filename: `estime-rapport-${moisLabel.replace(" ", "-")}.pdf`,
              content: Buffer.from(buf),
            }];
          }
        }

        // Send email with Resend
        await resend.emails.send({
          from: "Estime <rapports@estime-app.com>",
          to: artisan.email,
          subject: `Votre rapport Estime de ${moisLabel} est prêt`,
          html: emailHtml(artisan.prenom ?? "artisan", moisLabel, stats, pdfUrl),
          attachments,
        });

        // Mark email as sent
        const now = new Date();
        const monthKey = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, "0")}`;
        await admin
          .from("rapport_logs")
          .update({ email_envoye: true })
          .eq("user_id", artisan.id)
          .eq("mois", monthKey);

        console.log(`✓ Rapport envoyé : ${artisan.email}`);
        return { userId: artisan.id, ok: true };
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error(`✗ Erreur artisan ${artisan.id}:`, errMsg);

        const now = new Date();
        const monthKey = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, "0")}`;
        await admin.from("rapport_logs").upsert(
          {
            user_id: artisan.id,
            mois: monthKey,
            statut: "error",
            erreur: errMsg,
          },
          { onConflict: "user_id,mois" }
        );

        return { userId: artisan.id, ok: false, error: errMsg };
      }
    })
  );

  const successes = results.filter((r) => r.status === "fulfilled" && (r.value as any).ok).length;
  const failures = results.length - successes;
  console.log(`Rapport mensuel terminé : ${successes} OK, ${failures} erreurs`);

  return {
    statusCode: 200,
    body: JSON.stringify({ total: results.length, successes, failures }),
  };
}
