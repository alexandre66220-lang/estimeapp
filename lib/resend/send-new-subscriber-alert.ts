import "server-only";
import { Resend } from "resend";

const FROM = `Estime <${process.env.RESEND_FROM_EMAIL || "noreply@estime-app.com"}>`;
const ALERT_TO = "spark@alcalspark.com";

export async function sendNewSubscriberAlert(params: {
  nom: string;
  email: string;
  dateInscription: Date;
  plan: string;
  montant: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY n'est pas configurée.");
  }

  const resend = new Resend(apiKey);

  const dateFormatee = params.dateInscription.toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    dateStyle: "long",
    timeStyle: "short",
  });

  const text = `Nouvel artisan abonné à Estime.

Nom : ${params.nom}
Email : ${params.email}
Date d'inscription : ${dateFormatee}
Plan souscrit : ${params.plan}
Montant mensuel : ${params.montant}`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: ALERT_TO,
    subject: `Nouvel abonné Estime : ${params.email}`,
    text,
  });

  if (error) {
    throw new Error(error.message || "Échec de l'envoi de l'alerte de nouvel abonné.");
  }
}
