import "server-only";
import { Resend } from "resend";

const FROM = `Estime <${process.env.RESEND_FROM_EMAIL || "noreply@estime-app.com"}>`;
const PORTAL_URL = process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL || "https://estime-app.com/espace/abonnement";

export async function sendPaymentFailedEmail(params: { email: string; prenom: string | null }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY n'est pas configurée.");
  }

  const resend = new Resend(apiKey);
  const prenom = params.prenom?.trim() || "";
  const greeting = prenom ? `Bonjour ${prenom},` : "Bonjour,";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color:#F8F5F2; padding: 40px 20px;">
      <div style="max-width: 480px; margin: 0 auto; background-color:#ffffff; border-radius:16px; padding: 40px 32px;">
        <p style="color:#2B2521; font-size:16px; line-height:1.6; margin:0 0 16px;">${greeting}</p>
        <p style="color:#2B2521; font-size:16px; line-height:1.6; margin:0 0 28px;">
          Votre paiement Estime a échoué. Mettez à jour votre moyen de paiement pour conserver votre accès.
        </p>
        <div style="text-align:center; margin: 0 0 28px;">
          <a href="${PORTAL_URL}" style="display:inline-block; background-color:#A64B2E; color:#ffffff; font-weight:600; font-size:15px; text-decoration:none; padding:14px 28px; border-radius:999px;">
            Mettre à jour mon moyen de paiement
          </a>
        </div>
        <p style="color:#6B6460; font-size:14px; line-height:1.6; margin:0;">
          À très vite,<br />L'équipe Estime
        </p>
      </div>
    </div>
  `;

  const text = `${greeting}

Votre paiement Estime a échoué. Mettez à jour votre moyen de paiement pour conserver votre accès.

Mettre à jour mon moyen de paiement : ${PORTAL_URL}

À très vite,
L'équipe Estime`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: params.email,
    subject: "Échec de votre paiement Estime",
    html,
    text,
  });

  if (error) {
    throw new Error(error.message || "Échec de l'envoi de l'email de paiement échoué.");
  }
}
