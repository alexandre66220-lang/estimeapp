"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Platform = "ios" | "android" | "desktop" | "unknown";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

const STEP_CLASS = "flex items-start gap-4 p-4 rounded-2xl bg-dust/60 border border-dusk/6";
const NUM_CLASS = "w-8 h-8 rounded-full bg-[#C75D3B] text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5";

function IosSteps() {
  return (
    <div className="space-y-3">
      <div className={STEP_CLASS}>
        <div className={NUM_CLASS}>1</div>
        <div>
          <p className="font-semibold text-dusk text-sm">Ouvrez Safari</p>
          <p className="text-dusk/55 text-sm mt-0.5">
            Naviguez vers <span className="font-mono text-xs bg-dusk/8 px-1.5 py-0.5 rounded">estime-app.com</span> dans Safari (pas Chrome ni Firefox).
          </p>
        </div>
        <span className="text-3xl ml-auto">🧭</span>
      </div>
      <div className={STEP_CLASS}>
        <div className={NUM_CLASS}>2</div>
        <div>
          <p className="font-semibold text-dusk text-sm">Appuyez sur Partager</p>
          <p className="text-dusk/55 text-sm mt-0.5">
            Le bouton <strong>partager</strong> se trouve en bas de l&apos;écran Safari — c&apos;est un carré avec une flèche vers le haut.
          </p>
        </div>
        <span className="text-3xl ml-auto">⬆️</span>
      </div>
      <div className={STEP_CLASS}>
        <div className={NUM_CLASS}>3</div>
        <div>
          <p className="font-semibold text-dusk text-sm">Sur l&apos;écran d&apos;accueil</p>
          <p className="text-dusk/55 text-sm mt-0.5">
            Faites défiler le menu vers le bas et appuyez sur <strong>&laquo;&nbsp;Sur l&apos;écran d&apos;accueil&nbsp;&raquo;</strong>.
          </p>
        </div>
        <span className="text-3xl ml-auto">📱</span>
      </div>
      <div className={STEP_CLASS}>
        <div className={NUM_CLASS}>4</div>
        <div>
          <p className="font-semibold text-dusk text-sm">Appuyez sur Ajouter</p>
          <p className="text-dusk/55 text-sm mt-0.5">
            Confirmez en appuyant sur <strong>&laquo;&nbsp;Ajouter&nbsp;&raquo;</strong> en haut à droite.
          </p>
        </div>
        <span className="text-3xl ml-auto">✅</span>
      </div>
    </div>
  );
}

function AndroidSteps() {
  return (
    <div className="space-y-3">
      <div className={STEP_CLASS}>
        <div className={NUM_CLASS}>1</div>
        <div>
          <p className="font-semibold text-dusk text-sm">Ouvrez Chrome</p>
          <p className="text-dusk/55 text-sm mt-0.5">
            Naviguez vers <span className="font-mono text-xs bg-dusk/8 px-1.5 py-0.5 rounded">estime-app.com</span> dans Google Chrome.
          </p>
        </div>
        <span className="text-3xl ml-auto">🌐</span>
      </div>
      <div className={STEP_CLASS}>
        <div className={NUM_CLASS}>2</div>
        <div>
          <p className="font-semibold text-dusk text-sm">Menu 3 points</p>
          <p className="text-dusk/55 text-sm mt-0.5">
            Appuyez sur les <strong>3 points verticaux</strong> en haut à droite de Chrome.
          </p>
        </div>
        <span className="text-3xl ml-auto">⋮</span>
      </div>
      <div className={STEP_CLASS}>
        <div className={NUM_CLASS}>3</div>
        <div>
          <p className="font-semibold text-dusk text-sm">Ajouter à l&apos;écran d&apos;accueil</p>
          <p className="text-dusk/55 text-sm mt-0.5">
            Dans le menu, appuyez sur <strong>&laquo;&nbsp;Ajouter à l&apos;écran d&apos;accueil&nbsp;&raquo;</strong>.
          </p>
        </div>
        <span className="text-3xl ml-auto">📲</span>
      </div>
      <div className={STEP_CLASS}>
        <div className={NUM_CLASS}>4</div>
        <div>
          <p className="font-semibold text-dusk text-sm">Confirmez</p>
          <p className="text-dusk/55 text-sm mt-0.5">
            Appuyez sur <strong>&laquo;&nbsp;Ajouter&nbsp;&raquo;</strong> dans la boîte de dialogue.
          </p>
        </div>
        <span className="text-3xl ml-auto">✅</span>
      </div>
    </div>
  );
}

function DesktopSteps() {
  return (
    <div className="space-y-4">
      <div className={STEP_CLASS}>
        <span className="text-3xl">💻</span>
        <div>
          <p className="font-semibold text-dusk text-sm">Utilisez votre téléphone</p>
          <p className="text-dusk/55 text-sm mt-0.5">
            L&apos;installation sur l&apos;écran d&apos;accueil fonctionne sur iPhone et Android. Ouvrez cette page depuis votre téléphone pour voir les instructions adaptées.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <div className="p-4 rounded-2xl border border-dusk/8 bg-white">
          <p className="font-semibold text-dusk text-sm mb-2">📱 iPhone (Safari)</p>
          <IosSteps />
        </div>
        <div className="p-4 rounded-2xl border border-dusk/8 bg-white">
          <p className="font-semibold text-dusk text-sm mb-2">🤖 Android (Chrome)</p>
          <AndroidSteps />
        </div>
      </div>
    </div>
  );
}

export function InstallGuide() {
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    setInstalled(isStandalone());
  }, []);

  if (installed) {
    return (
      <div className="bg-white rounded-2xl border border-dusk/8 p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="font-display text-xl font-bold text-dusk mb-2">
          Estime est déjà installé !
        </h2>
        <p className="text-dusk/55 text-sm">
          Estime est disponible directement depuis votre écran d&apos;accueil.
        </p>
        <Link
          href="/espace/tableau-de-bord"
          className="mt-6 inline-flex px-5 py-2.5 rounded-full bg-[#C75D3B] text-white text-sm font-semibold hover:bg-[#B8552E] transition-colors"
        >
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Result card */}
      <div className="bg-[#C75D3B]/6 border border-[#C75D3B]/15 rounded-2xl p-5 flex items-center gap-4">
        <span className="text-4xl">🏠</span>
        <div>
          <p className="font-semibold text-dusk text-sm">Une vraie application</p>
          <p className="text-dusk/60 text-xs mt-0.5">
            Lancez Estime depuis votre écran d&apos;accueil, sans ouvrir le navigateur. Accès plus rapide, plein écran.
          </p>
        </div>
      </div>

      {/* Platform tabs */}
      {platform === "desktop" ? (
        <DesktopSteps />
      ) : (
        <div className="space-y-6">
          {platform === "ios" || platform === "unknown" ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🍎</span>
                <h2 className="font-display text-lg font-bold text-dusk">iPhone / iPad (Safari)</h2>
              </div>
              <IosSteps />
            </div>
          ) : null}
          {platform === "android" || platform === "unknown" ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🤖</span>
                <h2 className="font-display text-lg font-bold text-dusk">Android (Chrome)</h2>
              </div>
              <AndroidSteps />
            </div>
          ) : null}
        </div>
      )}

      {/* Result */}
      <div className="bg-dusk/4 rounded-2xl p-5 flex items-center gap-3">
        <span className="text-2xl">🎉</span>
        <p className="text-sm text-dusk/70">
          <strong className="text-dusk">Résultat :</strong> Estime apparaît sur votre écran d&apos;accueil comme une vraie application — en plein écran, sans barre de navigation du navigateur.
        </p>
      </div>

      {/* Shortcuts section — iOS only */}
      {(platform === "ios" || platform === "unknown") && (
        <div className="bg-white rounded-2xl border border-dusk/8 p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">⚡</span>
            <h2 className="font-display text-lg font-bold text-dusk">Raccourcis rapides</h2>
          </div>
          <p className="text-dusk/55 text-sm mb-5">
            Sur iPhone, appuyez <strong>longtemps</strong> sur l&apos;icône Estime pour accéder directement à vos fonctionnalités clés.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji: "🏗️", label: "Nouveau chantier", desc: "Créer un chantier rapidement" },
              { emoji: "⭐", label: "Mon score", desc: "Voir votre score de fidélité" },
              { emoji: "👥", label: "Mes clients", desc: "Accéder à votre carnet" },
              { emoji: "✨", label: "Générer un post", desc: "Créer un post réseaux sociaux" },
            ].map((s) => (
              <div key={s.label} className={`${STEP_CLASS} flex-col gap-2 p-3`}>
                <span className="text-2xl">{s.emoji}</span>
                <div>
                  <p className="font-semibold text-dusk text-xs">{s.label}</p>
                  <p className="text-dusk/50 text-xs mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-dusk/40 text-xs mt-4 text-center">
            Disponible après avoir ajouté Estime à l&apos;écran d&apos;accueil
          </p>
        </div>
      )}
    </div>
  );
}
