"use client";

import Link from "next/link";
import { m, useReducedMotion } from "motion/react";

export default function Hero() {
  const shouldReduce = useReducedMotion();

  function fadeUp(delay: number) {
    return {
      initial: shouldReduce ? { opacity: 0 } : { opacity: 0, y: 24 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    };
  }

  return (
    <section className="bg-noir min-h-[100dvh] flex items-center pt-28 pb-20 relative overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-landing-display text-xl font-semibold text-dust tracking-tight hover:text-dust/80 transition-colors duration-200"
            aria-label="Estime - Retour à l'accueil"
          >
            Estime
          </Link>
          <Link
            href="/connexion"
            className="font-landing-sans text-sm text-[#F8F5F2] hover:text-dust/70 transition-colors duration-200"
          >
            Se connecter
          </Link>
        </div>
      </header>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, #C75D3B08 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div className="max-w-4xl mx-auto px-6 w-full text-center relative z-10">
        <m.h1
          {...fadeUp(0)}
          className="font-landing-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-dust leading-[1.1] mb-6"
        >
          Vos chantiers méritent d&apos;être vus.
        </m.h1>

        <m.p
          {...fadeUp(0.1)}
          className="font-landing-sans text-lg sm:text-xl text-dust/70 leading-relaxed mb-10 max-w-[52ch] mx-auto"
        >
          Estime génère vos posts Instagram et vos demandes d&apos;avis Google en
          30 secondes, depuis vos photos de chantier.
        </m.p>

        <m.div
          {...fadeUp(0.2)}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center"
        >
          <a
            href="/inscription"
            className="inline-flex items-center justify-center bg-braise text-white font-semibold text-[1.0625rem] px-7 py-4 rounded-full hover:bg-ambre active:scale-[0.98] transition-all duration-200"
          >
            Essayer gratuitement 14 jours
          </a>
          <a
            href="#solution"
            className="inline-flex items-center justify-center text-dust font-medium text-[1.0625rem] px-7 py-4 rounded-full border border-dust/25 hover:bg-dust/10 active:scale-[0.98] transition-all duration-200"
          >
            Voir comment ça marche
          </a>
        </m.div>

        <m.p {...fadeUp(0.3)} className="text-sm text-dust/45 mt-6">
          Sans carte bancaire. Sans engagement.
        </m.p>

        <m.p {...fadeUp(0.35)} className="font-landing-sans text-sm text-dust/40 mt-3">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="text-[#C75D3B] hover:underline">
            Se connecter →
          </Link>
        </m.p>

        <m.div
          {...fadeUp(0.4)}
          className="flex flex-col sm:flex-row gap-5 justify-center items-center sm:items-stretch mt-7"
        >
          <div
            className="w-full sm:w-72 rounded-2xl border border-[rgba(199,93,59,0.18)] p-5 text-left"
            style={{ backgroundColor: "#221A16", transform: "rotate(-1deg)" }}
          >
            <span className="inline-flex items-center gap-1.5 bg-green-500/15 text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
              ✓ Post généré
            </span>
            <p className="font-landing-sans text-dust text-sm leading-relaxed mb-3">
              Peinture intérieure terminée à Castres 🎨 Un résultat soigné pour
              ce salon...
            </p>
            <p className="font-landing-sans text-ambre text-sm">
              #peintre #castres #artisan
            </p>
          </div>

          <div
            className="w-full sm:w-72 rounded-2xl border border-[rgba(199,93,59,0.18)] p-5 text-left"
            style={{ backgroundColor: "#221A16", transform: "rotate(1deg)" }}
          >
            <span className="inline-flex items-center gap-1.5 bg-green-500/15 text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
              ✓ Email envoyé
            </span>
            <div className="flex gap-1 mb-3" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="#C75D3B"
                >
                  <path d="M12 2.5l2.95 6.46 7.05.78-5.27 4.78 1.5 6.98L12 17.9l-6.23 3.6 1.5-6.98-5.27-4.78 7.05-.78z" />
                </svg>
              ))}
            </div>
            <p className="font-landing-sans text-dust text-sm leading-relaxed mb-1">
              Demande d&apos;avis envoyée à Martin D.
            </p>
            <p className="font-landing-sans text-dust/45 text-xs">
              Il y a 2 minutes
            </p>
          </div>
        </m.div>
      </div>
    </section>
  );
}
