const STORAGE_KEY = "estime-cookie-consent";
export const COOKIE_BANNER_REOPEN_EVENT = "estime:reopen-cookie-banner";

export type AnalyticsConsentStatus = "accepted" | "refused";

export function getAnalyticsConsentStatus(): AnalyticsConsentStatus | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "accepted" || value === "refused" ? value : null;
}

export function setAnalyticsConsentStatus(status: AnalyticsConsentStatus) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, status);
}

/**
 * Retourne true uniquement si l'utilisateur a explicitement accepté les
 * cookies de mesure d'audience. A utiliser pour conditionner le chargement
 * de tout script de tracking (Google Analytics, Meta Pixel, etc.).
 */
export function hasAnalyticsConsent(): boolean {
  return getAnalyticsConsentStatus() === "accepted";
}

/** Réaffiche la bannière de consentement (utilisé par le lien "Gérer mes cookies"). */
export function reopenCookieBanner() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(COOKIE_BANNER_REOPEN_EVENT));
}
