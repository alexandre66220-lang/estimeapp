"use client";

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
    <section className="bg-noir min-h-[100dvh] flex items-center pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6 w-full text-center">
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
      </div>
    </section>
  );
}
