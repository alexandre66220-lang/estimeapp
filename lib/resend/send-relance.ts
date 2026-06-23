import "server-only";
import { Resend } from "resend";

const FROM = `Estime <${process.env.RESEND_FROM_EMAIL || "noreply@estime-app.com"}>`;

export async function sendRelanceAvis(params: {
  clientEmail: string;
  clientNom: string | null;
  chantierTitre: string;
  companyName: string | null;
  lienAvisGoogle: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY n'est pas configurée.");
  }

  const resend = new Resend(apiKey);

  const artisanName = params.companyName?.trim() || "votre artisan";
  const greeting = params.clientNom?.trim()
    ? `Bonjour ${params.clientNom.trim()},`
    : "Bonjour,";
  const chantierMention = params.chantierTitre
    ? ` pour « ${params.chantierTitre} »`
    : "";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color:#F8F5F2; padding: 40px 20px;">
      <div style="max-width: 480px; margin: 0 auto; background-color:#ffffff; border-radius:16px; padding: 40px 32px;">
        <p style="color:#2B2521; font-size:16px; line-height:1.6; margin:0 0 16px;">${greeting}</p>
        <p style="color:#2B2521; font-size:16px; line-height:1.6; margin:0 0 16px;">
          Merci d'avoir fait confiance à ${artisanName}${chantierMention}. Le
          chantier est maintenant terminé, et nous espérons que le résultat
          est à la hauteur de vos attentes.
        </p>
        <p style="color:#2B2521; font-size:16px; line-height:1.6; margin:0 0 28px;">
          Si vous êtes satisfait(e) du travail réalisé, un avis Google ne
          prend qu'une minute et nous aide énormément à nous faire connaître.
        </p>
        <div style="text-align:center; margin: 0 0 28px;">
          <a href="${params.lienAvisGoogle}" style="display:inline-block; background-color:#A64B2E; color:#ffffff; font-weight:600; font-size:15px; text-decoration:none; padding:14px 28px; border-radius:999px;">
            Laisser un avis Google
          </a>
        </div>
        <p style="color:#6B6460; font-size:14px; line-height:1.6; margin:0;">
          N'hésitez pas aussi à nous recommander auprès de votre entourage si
          vous avez aimé le résultat. Encore merci, et à bientôt !
        </p>
        <p style="color:#2B2521; font-size:14px; margin: 24px 0 0;">${artisanName}</p>
      </div>
    </div>
  `;

  const text = `${greeting}

Merci d'avoir fait confiance à ${artisanName}${chantierMention}. Le chantier est maintenant terminé, et nous espérons que le résultat est à la hauteur de vos attentes.

Si vous êtes satisfait(e) du travail réalisé, un avis Google ne prend qu'une minute et nous aide énormément à nous faire connaître : ${params.lienAvisGoogle}

N'hésitez pas aussi à nous recommander auprès de votre entourage si vous avez aimé le résultat. Encore merci, et à bientôt !

${artisanName}`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: params.clientEmail,
    subject: "Merci pour votre confiance !",
    html,
    text,
  });

  if (error) {
    throw new Error(error.message || "Échec de l'envoi de l'email.");
  }
}
