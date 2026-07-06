import "server-only";
import { Resend } from "resend";

const FROM = `Estime <${process.env.RESEND_FROM_EMAIL || "noreply@estime-app.com"}>`;

export async function sendContactVitrine(params: {
  artisanEmail: string;
  artisanNom: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY non configurée.");

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: FROM,
    to: params.artisanEmail,
    replyTo: params.email,
    subject: `Nouveau message de ${params.prenom} ${params.nom} — Estime`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8F5F2;font-family:system-ui,sans-serif;color:#2B2521;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:#C75D3B;padding:32px 40px;">
            <p style="margin:0;color:rgba(255,255,255,0.7);font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Estime — Nouveau message</p>
            <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:700;">Vous avez reçu un message</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 24px;font-size:15px;color:#2B2521;">Bonjour ${params.artisanNom},</p>
            <p style="margin:0 0 24px;font-size:15px;color:#2B2521;">
              Un prospect vous a contacté via votre page vitrine Estime.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F5F2;border-radius:12px;padding:24px;margin-bottom:24px;">
              <tr><td style="padding-bottom:12px;">
                <p style="margin:0;font-size:12px;color:#8a7e78;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Contact</p>
                <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#2B2521;">${params.prenom} ${params.nom}</p>
              </td></tr>
              <tr><td style="padding-bottom:12px;">
                <p style="margin:0;font-size:12px;color:#8a7e78;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Email</p>
                <p style="margin:4px 0 0;font-size:15px;color:#2B2521;"><a href="mailto:${params.email}" style="color:#C75D3B;">${params.email}</a></p>
              </td></tr>
              ${params.telephone ? `<tr><td style="padding-bottom:12px;">
                <p style="margin:0;font-size:12px;color:#8a7e78;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Téléphone</p>
                <p style="margin:4px 0 0;font-size:15px;color:#2B2521;">${params.telephone}</p>
              </td></tr>` : ""}
              <tr><td>
                <p style="margin:0;font-size:12px;color:#8a7e78;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Message</p>
                <p style="margin:4px 0 0;font-size:15px;color:#2B2521;white-space:pre-wrap;">${params.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
              </td></tr>
            </table>
            <p style="margin:0 0 8px;font-size:14px;color:#8a7e78;">
              Répondez directement à cet email pour contacter ${params.prenom}.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #f0ebe4;">
            <p style="margin:0;font-size:12px;color:#a89e98;">
              Message reçu via <a href="https://estime-app.com" style="color:#C75D3B;">Estime</a> — Votre outil de réputation artisan.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  if (error) throw new Error(error.message);
}
