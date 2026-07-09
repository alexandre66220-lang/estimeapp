import "server-only";
import { Resend } from "resend";

const FROM = `Estime <${process.env.RESEND_FROM_EMAIL || "alertes@estime-app.com"}>`;
const ALERT_TO = "spark@alcalspark.com";

/**
 * Alerte email générique pour une erreur applicative (hors Netlify Scheduled
 * Functions, qui utilisent netlify/functions/_utils/notify-error.ts).
 */
export async function notifyError(
  contexte: string,
  messageErreur: string,
  stack?: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(`[notify-error] RESEND_API_KEY manquante, impossible d'alerter pour ${contexte}`);
    return;
  }

  const dateHeureUTC = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";
  const text = `Contexte : ${contexte}
Date et heure (UTC) : ${dateHeureUTC}
Message d'erreur : ${messageErreur}
${stack ? `\nStack trace :\n${stack}` : ""}`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM,
      to: ALERT_TO,
      subject: `[Estime] Erreur ${contexte}`,
      text,
    });
    if (error) {
      console.error(`[notify-error] Échec envoi email pour ${contexte}:`, error.message);
    }
  } catch (err) {
    console.error(`[notify-error] Exception lors de l'envoi de l'alerte pour ${contexte}:`, err);
  }
}
