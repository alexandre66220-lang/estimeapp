import "server-only";
import { Resend } from "resend";

const FROM = `Estime <${process.env.RESEND_FROM_EMAIL || "noreply@estime-app.com"}>`;

export async function sendParrainageConverti(params: {
  parrainEmail: string;
  parrainNom: string | null;
  filleulNom: string | null;
  moisGagnes: number;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY n'est pas configurée.");
  }

  const resend = new Resend(apiKey);

  const greeting = params.parrainNom?.trim()
    ? `Bonjour ${params.parrainNom.trim()},`
    : "Bonjour,";
  const filleul = params.filleulNom?.trim() || "Votre filleul";
  const moisLabel = params.moisGagnes === 1 ? "1 mois gratuit" : `${params.moisGagnes} mois gratuits`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color:#F8F5F2; padding: 40px 20px;">
      <div style="max-width: 480px; margin: 0 auto; background-color:#ffffff; border-radius:16px; padding: 40px 32px;">
        <p style="color:#2B2521; font-size:16px; line-height:1.6; margin:0 0 16px;">${greeting}</p>
        <p style="color:#2B2521; font-size:16px; line-height:1.6; margin:0 0 16px;">
          ${filleul} vient de s'abonner à Estime grâce à votre parrainage. Vous
          venez de gagner 1 mois gratuit !
        </p>
        <p style="color:#2B2521; font-size:16px; line-height:1.6; margin:0 0 28px;">
          Au total, vous avez désormais gagné <strong>${moisLabel}</strong>
          grâce à vos parrainages. Merci de faire connaître Estime !
        </p>
        <p style="color:#6B6460; font-size:14px; line-height:1.6; margin:0;">
          Continuez à partager votre lien de parrainage pour gagner encore
          plus de mois gratuits.
        </p>
      </div>
    </div>
  `;

  const text = `${greeting}

${filleul} vient de s'abonner à Estime grâce à votre parrainage. Vous venez de gagner 1 mois gratuit !

Au total, vous avez désormais gagné ${moisLabel} grâce à vos parrainages. Merci de faire connaître Estime !`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: params.parrainEmail,
    subject: "🎉 Vous avez gagné 1 mois gratuit sur Estime !",
    html,
    text,
  });

  if (error) {
    throw new Error(error.message || "Échec de l'envoi de l'email.");
  }
}
