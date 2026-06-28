import "server-only";
import { Resend } from "resend";

const FROM = `Estime <${process.env.RESEND_FROM_EMAIL || "noreply@estime-app.com"}>`;
const ALERT_TO = "spark@alcalspark.com";

export async function sendStripeMatchFailureAlert(params: {
  eventType: string;
  eventId: string;
  customerId: string;
  customerEmail: string | null;
  userIdMetadata: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY n'est pas configurée.");
  }

  const resend = new Resend(apiKey);

  const text = `Échec de matching profil Stripe -> Supabase.

Événement : ${params.eventType} (${params.eventId})
Customer Stripe : ${params.customerId}
Email customer : ${params.customerEmail ?? "inconnu"}
user_id (metadata) : ${params.userIdMetadata ?? "absent"}

Aucun profil Supabase n'a pu être identifié pour cet événement : l'abonnement n'a pas été activé/désactivé automatiquement. Intervention manuelle requise.`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: ALERT_TO,
    subject: `[Estime] Échec matching webhook Stripe — ${params.eventType}`,
    text,
  });

  if (error) {
    throw new Error(error.message || "Échec de l'envoi de l'alerte Stripe.");
  }
}
