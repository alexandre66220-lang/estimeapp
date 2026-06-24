import "server-only";
import { Resend } from "resend";

const FROM = `Estime <${process.env.RESEND_FROM_EMAIL || "noreply@estime-app.com"}>`;

export async function sendTrialReminderEmail(params: {
  email: string;
  prenom: string | null;
  nbChantiers: number;
  nbPosts: number;
}) {
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
          Votre essai gratuit Estime se termine dans 2 jours. Depuis votre
          inscription, vous avez déjà créé <strong>${params.nbChantiers} chantier${params.nbChantiers === 1 ? "" : "s"}</strong>
          et généré <strong>${params.nbPosts} post${params.nbPosts === 1 ? "" : "s"}</strong>.
        </p>
        <p style="color:#2B2521; font-size:16px; line-height:1.6; margin:0 0 28px;">
          Abonnez-vous dès maintenant pour ne perdre aucun accès à la fin de
          votre période d'essai.
        </p>
        <div style="text-align:center; margin: 0 0 28px;">
          <a href="https://estime-app.com/espace/abonnement" style="display:inline-block; background-color:#A64B2E; color:#ffffff; font-weight:600; font-size:15px; text-decoration:none; padding:14px 28px; border-radius:999px;">
            S'abonner maintenant
          </a>
        </div>
        <p style="color:#6B6460; font-size:14px; line-height:1.6; margin:0;">
          À très vite,<br />L'équipe Estime
        </p>
      </div>
    </div>
  `;

  const text = `${greeting}

Votre essai gratuit Estime se termine dans 2 jours. Depuis votre inscription, vous avez déjà créé ${params.nbChantiers} chantier(s) et généré ${params.nbPosts} post(s).

Abonnez-vous dès maintenant pour ne perdre aucun accès à la fin de votre période d'essai : https://estime-app.com/espace/abonnement

À très vite,
L'équipe Estime`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: params.email,
    subject: "Votre essai Estime se termine dans 2 jours",
    html,
    text,
  });

  if (error) {
    throw new Error(error.message || "Échec de l'envoi de l'email de rappel.");
  }
}
