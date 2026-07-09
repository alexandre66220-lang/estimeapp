import "server-only";
import { Resend } from "resend";

const FROM = `Estime <${process.env.RESEND_FROM_EMAIL || "noreply@estime-app.com"}>`;

export async function sendWelcomeEmail(params: { email: string; prenom: string | null }) {
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
        <p style="color:#2B2521; font-size:16px; line-height:1.6; margin:0 0 16px;">
          Bienvenue sur Estime ! Votre essai gratuit de 14 jours vient de
          commencer, sans carte bancaire et sans engagement.
        </p>
        <p style="color:#2B2521; font-size:16px; line-height:1.6; margin:0 0 16px;">
          Avec Estime, vous pouvez :
        </p>
        <ul style="color:#2B2521; font-size:16px; line-height:1.6; margin:0 0 28px; padding-left: 20px;">
          <li>Générer un post Instagram en 30 secondes depuis une photo de chantier</li>
          <li>Envoyer automatiquement des demandes d'avis Google à vos clients</li>
          <li>Suivre votre score de réputation en ligne</li>
        </ul>
        <div style="text-align:center; margin: 0 0 28px;">
          <a href="https://estime-app.com/espace" style="display:inline-block; background-color:#A64B2E; color:#ffffff; font-weight:600; font-size:15px; text-decoration:none; padding:14px 28px; border-radius:999px;">
            Accéder à mon espace
          </a>
        </div>
        <p style="color:#6B6460; font-size:14px; line-height:1.6; margin:0;">
          À très vite,<br />L'équipe Estime
        </p>
      </div>
    </div>
  `;

  const text = `${greeting}

Bienvenue sur Estime ! Votre essai gratuit de 14 jours vient de commencer, sans carte bancaire et sans engagement.

Avec Estime, vous pouvez :
- Générer un post Instagram en 30 secondes depuis une photo de chantier
- Envoyer automatiquement des demandes d'avis Google à vos clients
- Suivre votre score de réputation en ligne

Accéder à mon espace : https://estime-app.com/espace

À très vite,
L'équipe Estime`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: params.email,
    subject: "Bienvenue sur Estime, votre essai de 14 jours commence maintenant",
    html,
    text,
  });

  if (error) {
    throw new Error(error.message || "Échec de l'envoi de l'email de bienvenue.");
  }
}
