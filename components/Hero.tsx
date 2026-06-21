"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react";

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
    <section className="bg-dust min-h-[100dvh] flex items-center pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">

          {/* Texte */}
          <div>
            <motion.p
              {...fadeUp(0)}
              className="text-xs font-semibold tracking-[0.18em] uppercase text-ambre mb-6"
            >
              Pour peintres, plombiers, maçons et électriciens
            </motion.p>

            <motion.h1
              {...fadeUp(0.1)}
              className="font-display text-5xl lg:text-[3.75rem] font-bold text-dusk leading-[1.1] mb-6"
            >
              Finissez le chantier.
              <br />
              <em className="not-italic text-ambre">L'IA fait le reste.</em>
            </motion.h1>

            <motion.p
              {...fadeUp(0.2)}
              className="text-lg text-dusk/65 leading-relaxed mb-10 max-w-[48ch]"
            >
              Photo avant/après + IA = post réseaux prêt en 30 secondes.
              Relance automatique pour vos avis Google et recommandations.
            </motion.p>

            <motion.div
              {...fadeUp(0.3)}
              className="flex flex-col sm:flex-row gap-4 items-start"
            >
              <a
                href="#liste-attente"
                className="inline-flex items-center gap-2.5 bg-braise text-white font-semibold text-[1.0625rem] px-7 py-4 rounded-full hover:bg-ambre active:scale-[0.98] transition-all duration-200"
              >
                Rejoindre la liste d'attente
                <ArrowRight weight="bold" size={18} aria-hidden="true" />
              </a>
              <a
                href="#comment-ca-marche"
                className="inline-flex items-center gap-2 text-dusk font-medium text-[1.0625rem] px-7 py-4 rounded-full border border-dusk/20 hover:bg-dusk/5 active:scale-[0.98] transition-all duration-200"
              >
                Comment ça marche
              </a>
            </motion.div>

            <motion.div
              {...fadeUp(0.4)}
              className="flex items-center gap-6 mt-10"
            >
              {["Sans engagement", "24,99€/mois", "Support humain"].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-sm text-dusk/55">
                  <CheckCircle weight="fill" size={16} className="text-ambre shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Visuel */}
          <motion.div
            initial={shouldReduce ? { opacity: 0 } : { opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="relative"
          >
            {/* Lueur de fin de chantier */}
            <div
              className="lumiere-fin-chantier absolute -top-14 -right-14 w-80 h-80 rounded-full blur-3xl opacity-40 pointer-events-none"
              aria-hidden="true"
            />

            {/* Photo principale, étalonnée dans la lumière ambre/crépuscule */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-dusk/20 aspect-[4/3]">
              <Image
                src="/images/hero-peintre.jpg"
                alt="Artisan peintre en train de travailler sur un chantier"
                fill
                className="object-cover object-center"
                style={{ filter: "sepia(0.32) saturate(1.35) hue-rotate(-6deg) contrast(1.05) brightness(0.95)" }}
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {/* Voile lumière ambre vers crépuscule, en mode incrustation */}
              <div
                className="lumiere-fin-chantier absolute inset-0 opacity-35 mix-blend-overlay pointer-events-none"
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dusk/35 to-transparent" />
            </div>

            {/* Carte flottante */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl px-4 py-3 shadow-xl shadow-dusk/12 border border-dust-dark max-w-[220px]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-ambre/10 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle weight="fill" size={20} className="text-ambre" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-dusk text-sm leading-tight">Post Instagram prêt</p>
                  <p className="text-dusk/50 text-xs mt-0.5">Généré en 28 secondes</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
