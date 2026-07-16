import "server-only";
import { Resend } from "resend";

// Expéditeur dédié ALCALSPARK, volontairement distinct de l'adresse
// Estime (noreply@estime-app.com) utilisée par le reste du produit :
// ces emails partent en toute cohérence avec l'identité pro d'ALCALSPARK.
// Nécessite que le domaine alcalspark.com soit vérifié dans Resend
// (enregistrements DNS SPF/DKIM) — voir note transmise à l'utilisateur.
const FROM = "ALCALSPARK <contact@alcalspark.com>";

export async function sendBackofficeEmail(params: { to: string; sujet: string; corps: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY n'est pas configurée.");
  }

  const resend = new Resend(apiKey);

  const html = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; white-space: pre-wrap; line-height: 1.6; color: #2C2C2C;">${params.corps
    .split("\n")
    .map((l) => l || "&nbsp;")
    .join("<br />")}</div>`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: params.sujet,
    html,
    text: params.corps,
  });

  if (error) {
    throw new Error(error.message || "Échec de l'envoi de l'email.");
  }
}
