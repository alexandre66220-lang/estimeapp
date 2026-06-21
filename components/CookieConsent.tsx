"use client";

import { useEffect, useState } from "react";
import {
  COOKIE_BANNER_REOPEN_EVENT,
  getAnalyticsConsentStatus,
  setAnalyticsConsentStatus,
} from "@/lib/consent/cookies";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // localStorage n'existe pas côté serveur : ce statut ne peut être lu
    // qu'après le montage, d'où l'effet plutôt qu'un calcul au rendu.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(getAnalyticsConsentStatus() === null);

    function onReopen() {
      setVisible(true);
    }
    window.addEventListener(COOKIE_BANNER_REOPEN_EVENT, onReopen);
    return () => window.removeEventListener(COOKIE_BANNER_REOPEN_EVENT, onReopen);
  }, []);

  function respond(status: "accepted" | "refused") {
    setAnalyticsConsentStatus(status);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Gestion des cookies"
      className="fixed inset-x-0 bottom-0 z-[300] bg-dusk border-t border-white/10"
    >
      <div className="lumiere-fin-chantier h-px opacity-60" aria-hidden="true" />
      <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-dust/70 text-sm leading-relaxed flex-1">
          Ce site utilise des cookies essentiels à son fonctionnement (connexion à votre espace).
          Il pourra à l&apos;avenir utiliser des cookies de mesure d&apos;audience : vous pouvez
          accepter ou refuser leur dépôt, ce choix n&apos;affecte pas les cookies essentiels.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => respond("refused")}
            className="inline-flex items-center justify-center text-dust/70 font-medium text-sm px-5 py-2.5 rounded-full border border-dust/20 hover:bg-white/5 hover:text-dust transition-colors duration-200"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => respond("accepted")}
            className="inline-flex items-center justify-center bg-braise text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-ambre transition-colors duration-200"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
