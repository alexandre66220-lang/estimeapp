/**
 * Utilitaire partagé, alerte email en cas d'échec d'une Netlify Scheduled Function.
 *
 * Toute nouvelle Scheduled Function doit envelopper son handler avec
 * `withErrorNotification(nomFonction, handler)` (voir ci-dessous) afin qu'une
 * exception non catchée déclenche automatiquement un email d'alerte avant
 * d'être re-throw (Netlify continue de marquer l'exécution comme échouée).
 */
import { Resend } from "resend";

const ALERT_TO = "spark@alcalspark.com";

export async function notifyFunctionError(
  nomFonction: string,
  messageErreur: string,
  stack?: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(`[notify-error] RESEND_API_KEY manquante, impossible d'alerter pour ${nomFonction}`);
    return;
  }

  const from = `Estime <${process.env.RESEND_FROM_EMAIL || "alertes@estime-app.com"}>`;
  const dateHeureUTC = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";

  const text = `Fonction : ${nomFonction}
Date et heure (UTC) : ${dateHeureUTC}
Message d'erreur : ${messageErreur}
${stack ? `\nStack trace :\n${stack}` : ""}`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: ALERT_TO,
      subject: `[Estime] Erreur fonction ${nomFonction}`,
      text,
    });
    if (error) {
      console.error(`[notify-error] Échec envoi email pour ${nomFonction}:`, error.message);
    }
  } catch (err) {
    console.error(`[notify-error] Exception lors de l'envoi de l'alerte pour ${nomFonction}:`, err);
  }
}

/**
 * Enveloppe le handler d'une Scheduled Function : en cas d'exception, envoie
 * l'email d'alerte puis re-throw pour que Netlify marque l'exécution comme échouée.
 */
export function withErrorNotification<T extends unknown[], R>(
  nomFonction: string,
  handler: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      await notifyFunctionError(nomFonction, message, stack);
      throw err;
    }
  };
}
